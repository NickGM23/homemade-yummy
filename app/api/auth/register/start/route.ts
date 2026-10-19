import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { prisma } from '@/server/prisma';
import { HttpError, withErrorHandling } from '@/server/withErrorHandling';
import { registerStartSchema, type RegisterPayload } from '@/server/validation/user';
import { codeSentResponse, getClientIp, startVerification } from '@/server/phone-verification';

/**
 * Перший крок реєстрації: надсилає SMS-код на номер. Користувача ще НЕ створено — дані форми
 * (з паролем у вигляді хеша) лежать у PhoneVerification.payload до підтвердження коду,
 * тож чужий номер «зайняти» не вийде.
 */
async function start(req: Request) {
  const data = registerStartSchema.parse(await req.json());

  const existing = await prisma.user.findUnique({
    where: { phone: data.phone },
    select: { id: true },
  });
  if (existing) {
    throw new HttpError(409, 'Користувач з таким номером уже зареєстрований. Увійдіть в акаунт');
  }

  const payload: RegisterPayload = {
    phone: data.phone,
    fullName: data.fullName,
    passwordHash: await hash(data.password, 10),
  };

  const verification = await startVerification({
    phone: data.phone,
    purpose: 'REGISTER',
    payload,
    ip: getClientIp(req),
  });

  return NextResponse.json(codeSentResponse(verification, data.phone));
}

export const { POST } = withErrorHandling({ POST: start });
