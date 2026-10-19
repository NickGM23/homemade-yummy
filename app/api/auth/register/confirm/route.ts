import { NextResponse } from 'next/server';
import { prisma } from '@/server/prisma';
import { HttpError, withErrorHandling } from '@/server/withErrorHandling';
import { registerPayloadSchema } from '@/server/validation/user';
import { confirmVerificationSchema } from '@/server/validation/verification';
import { claimVerification, verifyCode } from '@/server/phone-verification';

/** Перевіряє SMS-код і, якщо він вірний, створює користувача з підтвердженим номером. */
async function confirm(req: Request) {
  const { verificationId, code } = confirmVerificationSchema.parse(await req.json());

  const verification = await verifyCode({ id: verificationId, code, purpose: 'REGISTER' });
  const data = registerPayloadSchema.parse(verification.payload);

  // Витрата коду і створення користувача — в одній транзакції: або обоє, або нічого.
  await prisma.$transaction(async (tx) => {
    await claimVerification(tx, verification.id);

    // Між відправкою коду й підтвердженням цей номер могли встигнути зареєструвати.
    const taken = await tx.user.findUnique({ where: { phone: data.phone }, select: { id: true } });
    if (taken) {
      throw new HttpError(409, 'Користувач з таким номером уже зареєстрований. Увійдіть в акаунт');
    }

    await tx.user.create({
      data: {
        fullName: data.fullName,
        phone: data.phone,
        phoneVerified: new Date(),
        password: data.passwordHash,
        provider: 'credentials',
      },
    });
  });

  return NextResponse.json({ ok: true });
}

export const { POST } = withErrorHandling({ POST: confirm });
