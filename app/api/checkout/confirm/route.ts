import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/server/prisma';
import { withErrorHandling } from '@/server/withErrorHandling';
import { getUserSession } from '@/server/get-user-session';
import { createOrderSchema } from '@/server/validation/order';
import { createOrderFromInput } from '@/server/createOrder';
import { claimVerification, verifyCode } from '@/server/phone-verification';

const confirmSchema = z.object({
  verificationId: z.string().uuid(),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, { message: 'Введіть 6-значний код' }),
});

/** Перевіряє SMS-код і, якщо він вірний, створює замовлення зі збереженої чернетки. */
async function confirm(req: Request) {
  const { verificationId, code } = confirmSchema.parse(await req.json());

  const verification = await verifyCode({ id: verificationId, code, purpose: 'ORDER' });
  const data = createOrderSchema.parse(verification.payload);

  const session = await getUserSession();
  const userId = session?.id ? Number(session.id) : undefined;

  // Витрата коду і створення замовлення — в одній транзакції: або обоє, або нічого.
  const order = await prisma.$transaction(async (tx) => {
    await claimVerification(tx, verification.id);
    return createOrderFromInput(data, userId, tx);
  });

  return NextResponse.json({ orderId: order.id });
}

export const { POST } = withErrorHandling({ POST: confirm });
