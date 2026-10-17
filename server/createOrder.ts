import { Prisma } from '@prisma/client';
import { prisma } from '@/server/prisma';
import { HttpError } from '@/server/withErrorHandling';
import type { CreateOrderInput } from '@/server/validation/order';

type Db = Prisma.TransactionClient | typeof prisma;

/**
 * Ціна/сума кожної позиції рахується на сервері з актуальної ціни продукту в БД,
 * а не з того, що прислав клієнт — щоб виключити підміну суми замовлення.
 * Нічого не пише в БД, тому підходить і для ранньої перевірки кошика (до відправки SMS).
 */
export async function priceOrder(data: CreateOrderInput, db: Db = prisma) {
  const productIds = data.items.map((item) => item.productId);
  const products = await db.product.findMany({
    where: { id: { in: productIds } },
  });
  const productById = new Map(products.map((product) => [product.id, product]));

  const items = data.items.map((item) => {
    const product = productById.get(item.productId);
    if (!product) {
      throw new HttpError(400, `Product ${item.productId} not found`);
    }

    const price = Number(product.price);
    return {
      productId: product.id,
      quantity: item.quantity,
      price,
      // Округлення до копійок: дробова кількість × ціна дає артефакти на кшталт 75.00000000000001.
      amount: Math.round(price * item.quantity * 100) / 100,
    };
  });

  const itemsTotal = items.reduce((sum, item) => sum + item.amount, 0);
  const shippingAmount =
    itemsTotal === 0 ? 0 : data.deliveryType === 'pickup' ? 0 : itemsTotal >= 1000 ? 0 : 75;

  return { items, shippingAmount, totalAmount: itemsTotal + shippingAmount };
}

/** Створює замовлення з уже провалідованих даних. `userId` береться лише з сесії. */
export async function createOrderFromInput(
  data: CreateOrderInput,
  userId: number | undefined,
  db: Db = prisma,
) {
  const { items, shippingAmount, totalAmount } = await priceOrder(data, db);

  return db.order.create({
    data: {
      userId,
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
}
