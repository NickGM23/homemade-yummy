import { NextResponse } from 'next/server';
import { prisma } from '@/server/prisma';
import { withErrorHandling } from '@/server/withErrorHandling';
import { getUserSession } from '@/server/get-user-session';
import { createOrderSchema } from '@/server/validation/order';
import { assertOrderLimit, createOrderFromInput, priceOrder } from '@/server/createOrder';
import { codeSentResponse, getClientIp, startVerification } from '@/server/phone-verification';

/**
 * Початок оформлення: перевіряє замовлення й надсилає SMS-код на вказаний номер.
 * Саме замовлення створюється лише після введення коду (`/api/checkout/confirm`).
 * Виняток — залогінений користувач, чий підтверджений номер збігається з номером замовлення:
 * для нього SMS пропускається і замовлення створюється одразу.
 */
async function sendCode(req: Request) {
  const data = createOrderSchema.parse(await req.json());
  const session = await getUserSession();
  const userId = session?.id ? Number(session.id) : undefined;

  // Добовий ліміт перевіряємо ДО відправки SMS, щоб не витрачати гроші на замовлення, яке не пройде.
  await assertOrderLimit(data.phone);

  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { phone: true, phoneVerified: true },
    });

    if (user?.phoneVerified && user.phone === data.phone) {
      const order = await createOrderFromInput(data, userId);
      return NextResponse.json({ status: 'created', orderId: order.id });
    }
  }

  // Рання перевірка кошика, щоб не витрачати SMS на замовлення, яке все одно не пройде.
  await priceOrder(data);

  const verification = await startVerification({
    phone: data.phone,
    purpose: 'ORDER',
    payload: data,
    ip: getClientIp(req),
  });

  return NextResponse.json(codeSentResponse(verification, data.phone));
}

export const { POST } = withErrorHandling({ POST: sendCode });
