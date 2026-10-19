import { createHmac, randomInt, randomUUID, timingSafeEqual } from 'crypto';
import { Prisma, VerificationPurpose } from '@prisma/client';
import { prisma } from '@/server/prisma';
import { sendSms } from '@/server/sms';
import { maskPhone } from '@/server/phone';
import { HttpError } from '@/server/withErrorHandling';

export const CODE_TTL_MS = 5 * 60_000;
export const RESEND_COOLDOWN_MS = 60_000;
export const MAX_ATTEMPTS = 3;

// Ліміти на кількість SMS — головний захист від «SMS-насоса» (кожне SMS коштує грошей).
const MAX_SENDS_PER_PHONE_PER_HOUR = 5;
const MAX_SENDS_PER_IP_PER_HOUR = 20;
const HOUR_MS = 60 * 60_000;

const SMS_TEXT: Record<VerificationPurpose, (code: string) => string> = {
  ORDER: (code) => `Код підтвердження замовлення: ${code}`,
  REGISTER: (code) => `Код підтвердження реєстрації: ${code}`,
};

const INVALID_CODE_MESSAGE = 'Код недійсний або прострочений. Надішліть новий код';

function hashCode(id: string, code: string): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error('NEXTAUTH_SECRET не налаштовано');

  return createHmac('sha256', secret).update(`${id}:${code}`).digest('hex');
}

function codesMatch(expectedHash: string, id: string, code: string): boolean {
  const expected = Buffer.from(expectedHash, 'hex');
  const actual = Buffer.from(hashCode(id, code), 'hex');
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

interface StartParams {
  phone: string;
  purpose: VerificationPurpose;
  payload: Prisma.InputJsonValue;
  ip: string | null;
}

export interface StartedVerification {
  id: string;
  expiresAt: Date;
  resendAvailableAt: Date;
}

/**
 * Створює код, зберігає його хеш разом із `payload` і надсилає SMS. Попередні невикористані
 * коди для цього номера й призначення анулюються — діє лише найновіший.
 */
export async function startVerification({
  phone,
  purpose,
  payload,
  ip,
}: StartParams): Promise<StartedVerification> {
  const now = Date.now();
  const hourAgo = new Date(now - HOUR_MS);

  const [lastForPhone, sentToPhone, sentFromIp] = await Promise.all([
    prisma.phoneVerification.findFirst({
      where: { phone },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    }),
    prisma.phoneVerification.count({ where: { phone, createdAt: { gte: hourAgo } } }),
    ip ? prisma.phoneVerification.count({ where: { ip, createdAt: { gte: hourAgo } } }) : 0,
  ]);

  if (lastForPhone && now - lastForPhone.createdAt.getTime() < RESEND_COOLDOWN_MS) {
    throw new HttpError(429, 'Зачекайте хвилину перед повторною відправкою коду');
  }
  if (sentToPhone >= MAX_SENDS_PER_PHONE_PER_HOUR || sentFromIp >= MAX_SENDS_PER_IP_PER_HOUR) {
    throw new HttpError(429, 'Забагато спроб. Спробуйте через годину');
  }

  const id = randomUUID();
  const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
  const expiresAt = new Date(now + CODE_TTL_MS);

  await prisma.phoneVerification.create({
    data: { id, phone, purpose, codeHash: hashCode(id, code), payload, expiresAt, ip },
  });

  try {
    await sendSms(phone, SMS_TEXT[purpose](code));
  } catch (error) {
    console.error('[SMS_SEND_ERROR]', error);
    // Невдала відправка не повинна з'їдати ліміт користувача.
    await prisma.phoneVerification.delete({ where: { id } });
    throw new HttpError(502, 'Не вдалося надіслати SMS. Спробуйте пізніше');
  }

  await prisma.phoneVerification.updateMany({
    where: { phone, purpose, consumedAt: null, id: { not: id } },
    data: { consumedAt: new Date() },
  });

  return { id, expiresAt, resendAvailableAt: new Date(now + RESEND_COOLDOWN_MS) };
}

/** Тіло відповіді API «код надіслано» — однакове для замовлення та реєстрації. */
export function codeSentResponse(verification: StartedVerification, phone: string) {
  return {
    status: 'code_sent' as const,
    verificationId: verification.id,
    maskedPhone: maskPhone(phone),
    expiresAt: verification.expiresAt,
    resendAvailableAt: verification.resendAvailableAt,
  };
}

/**
 * Перевіряє код. Кожна спроба лічильниться (атомарно, ще до порівняння), тому код не
 * підібрати паралельними запитами. Повертає запис (з `payload`) — сам запис ще НЕ витрачено,
 * для цього викличте `claimVerification` (зазвичай у транзакції разом із діями над payload).
 */
export async function verifyCode(params: {
  id: string;
  code: string;
  purpose: VerificationPurpose;
}) {
  const record = await prisma.phoneVerification.findUnique({ where: { id: params.id } });

  if (
    !record ||
    record.purpose !== params.purpose ||
    record.consumedAt ||
    record.expiresAt.getTime() <= Date.now()
  ) {
    throw new HttpError(400, INVALID_CODE_MESSAGE);
  }

  const { attempts } = await prisma.phoneVerification.update({
    where: { id: record.id },
    data: { attempts: { increment: 1 } },
    select: { attempts: true },
  });

  if (attempts > MAX_ATTEMPTS) {
    throw new HttpError(429, 'Забагато невдалих спроб. Надішліть новий код');
  }

  if (!codesMatch(record.codeHash, record.id, params.code)) {
    if (attempts >= MAX_ATTEMPTS) {
      throw new HttpError(429, 'Невірний код. Спроби вичерпано — надішліть новий код');
    }
    throw new HttpError(400, `Невірний код. Залишилось спроб: ${MAX_ATTEMPTS - attempts}`);
  }

  return record;
}

/** Атомарно «витрачає» перевірений код — повторно використати його не вийде. */
export async function claimVerification(tx: Prisma.TransactionClient, id: string) {
  const { count } = await tx.phoneVerification.updateMany({
    where: { id, consumedAt: null, expiresAt: { gt: new Date() } },
    data: { consumedAt: new Date() },
  });

  if (count !== 1) {
    throw new HttpError(400, INVALID_CODE_MESSAGE);
  }
}

/** Запис для повторної відправки коду (термін дії вже міг скінчитись, але не витрачений). */
export async function getVerificationForResend(id: string, purpose: VerificationPurpose) {
  const record = await prisma.phoneVerification.findUnique({ where: { id } });

  if (!record || record.purpose !== purpose || record.consumedAt) {
    throw new HttpError(400, 'Сесію підтвердження завершено. Почніть спочатку');
  }

  return record;
}

/** IP клієнта за заголовками проксі (Vercel виставляє `x-forwarded-for`). */
export function getClientIp(req: Request): string | null {
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return (forwarded || req.headers.get('x-real-ip'))?.slice(0, 45) || null;
}
