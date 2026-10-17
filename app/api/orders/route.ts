// app/api/orders/route.ts
import { prisma } from '@/server/prisma';
import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/server/withErrorHandling';
import { requireAdmin } from '@/server/requireAdmin';

async function getOrders(req: Request) {
  try {
    await requireAdmin();
  } catch (e) {
    const message = e instanceof Error ? e.message : 'FORBIDDEN';
    return NextResponse.json(
      { error: message },
      { status: message === 'UNAUTHORIZED' ? 401 : 403 },
    );
  }

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

export const { GET } = withErrorHandling({
  GET: getOrders,
});
