// app/api/orders/route.ts
import { prisma } from '@/libs/prisma';
import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/libs/withErrorHandling';
import { CreateOrderBody } from '@/@types/order';
import { requireAdmin } from '@/libs/requireAdmin';
import { getUserSession } from '@/components/shared/lib/get-user-session';

async function getOrders(req: Request) {
  try {
    await requireAdmin();
  } catch (e) {
    return NextResponse.json(
      { error: String(e) },
      { status: String(e) === 'UNAUTHORIZED' ? 401 : 403 },
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

async function createOrder(req: Request) {
  const data: CreateOrderBody = await req.json();
  const session = await getUserSession();

  const productIds = data.items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
  });
  const productById = new Map(products.map((product) => [product.id, product]));

  // Ціна/сума кожної позиції рахується на сервері з актуальної ціни продукту в БД,
  // а не з того, що прислав клієнт — щоб виключити підміну суми замовлення.
  const items = data.items.map((item) => {
    const product = productById.get(item.productId);
    if (!product) {
      throw new Error(`Product ${item.productId} not found`);
    }
    if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
      throw new Error(`Invalid quantity for product ${item.productId}`);
    }

    const price = Number(product.price);
    return {
      productId: product.id,
      quantity: item.quantity,
      price,
      amount: price * item.quantity,
    };
  });

  const itemsTotal = items.reduce((sum, item) => sum + item.amount, 0);
  const shippingAmount =
    itemsTotal === 0 ? 0 : data.deliveryType === 'pickup' ? 0 : itemsTotal >= 1000 ? 0 : 75;
  const totalAmount = itemsTotal + shippingAmount;

  const order = await prisma.order.create({
    data: {
      userId: session?.id ? Number(session.id) : undefined,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      deliveryType: data.deliveryType,
      address: data.address,
      comment: data.comment,
      shippingAmount,
      totalAmount,
      status: 'PENDING',
      items: {
        create: items,
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
