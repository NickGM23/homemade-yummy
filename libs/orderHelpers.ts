// libs/orderHelpers.ts
import { prisma } from './prisma';
import { Prisma } from '@prisma/client';
import { OrderFilters, Order as FrontOrder, OrderItem as FrontOrderItem } from '@/@types/order';

/**
 * Генерує Prisma.OrderWhereInput з OrderFilters
 */
export function buildOrderWhere(filters: OrderFilters): Prisma.OrderWhereInput {
  const { userId, status, fullName, email, phone, dateFrom, dateTo } = filters;

  const where: Prisma.OrderWhereInput = {};

  if (userId !== undefined) where.userId = userId;
  if (status !== undefined) where.status = status;
  if (fullName) where.fullName = { contains: fullName, mode: 'insensitive' };
  if (email) where.email = { contains: email, mode: 'insensitive' };
  if (phone) where.phone = { contains: phone };
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  return where;
}

/**
 * Мапінг Prisma.Order -> Frontend Order
 */
function mapOrderForFrontend(order: any): FrontOrder {
  return {
    id: order.id,
    userId: order.userId ?? undefined,
    fullName: order.fullName,
    email: order.email ?? undefined,
    phone: order.phone,
    deliveryType: order.deliveryType,
    address: order.address ?? undefined,
    comment: order.comment ?? undefined,
    shippingAmount: Number(order.shippingAmount),
    totalAmount: Number(order.totalAmount),
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    items:
      order.items?.map(
        (item: any): FrontOrderItem => ({
          id: item.id,
          productId: item.productId,
          product: {
            name: item.product.name,
            type: item.product.type,
          },
          quantity: Number(item.quantity),
          price: Number(item.price),
          amount: Number(item.amount),
        }),
      ) ?? [],
  };
}

/**
 * Пошук замовлень із пагінацією
 */
export async function fetchPaginatedOrders(filters: OrderFilters) {
  const { page = 1, limit = 20 } = filters;
  const where = buildOrderWhere(filters);

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        items: { include: { product: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  const mappedOrders = orders.map(mapOrderForFrontend);

  return {
    data: mappedOrders,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
