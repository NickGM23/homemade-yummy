import { NextResponse } from 'next/server';
import { prisma } from '@/server/prisma';
import { withErrorHandling } from '@/server/withErrorHandling';
import { getUserSession } from '@/server/get-user-session';
import { createOrderSchema } from '@/server/validation/order';
import { createOrderFromInput } from '@/server/createOrder';
import { claimVerification, verifyCode } from '@/server/phone-verification';
import { confirmVerificationSchema } from '@/server/validation/verification';

/** Перевіряє SMS-код і, якщо він вірний, створює замовлення зі збереженої чернетки. */
async function confirm(req: Request) {
  const { verificationId, code } = confirmVerificationSchema.parse(await req.json());

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
