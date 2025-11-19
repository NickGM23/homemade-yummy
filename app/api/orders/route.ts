// app/api/orders/route.ts
import { prisma } from '@/libs/prisma';
import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/libs/withErrorHandling';
import { CreateOrderBody } from '@/@types/order';

async function getOrders(req: Request) {
  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  const limit = parseInt(url.searchParams.get('limit') || '20', 10);

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { product: true }, // <-- тут підтягуємо продукт
        },
      },
    }),
    prisma.order.count(),
  ]);

  return NextResponse.json({
    data: orders,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

async function createOrder(req: Request) {
  const data: CreateOrderBody = await req.json();

  const order = await prisma.order.create({
    data: {
      ...data,
      status: data.status || 'PENDING',
      items: {
        create: data.items,
      },
    },
    include: { items: true },
  });

  return NextResponse.json(order);
}

export const { GET, POST } = withErrorHandling({
  GET: getOrders,
  POST: createOrder,
});
