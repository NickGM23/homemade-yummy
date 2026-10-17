import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@/server/prisma', () => ({
  prisma: {
    product: { findMany: vi.fn() },
    order: { create: vi.fn() },
  },
}));

import { prisma } from '@/server/prisma';
import { createOrderSchema } from '@/server/validation/order';
import { createOrderFromInput } from './createOrder';

const mockedPrisma = vi.mocked(prisma, true);

const product = { id: 4, price: 250 };

interface CreateOrderArgs {
  data: {
    userId?: number;
    totalAmount: number;
    shippingAmount: number;
    items: { create: { price: number }[] };
  };
}

// Те, що пройшло б через createOrderSchema: клієнтські userId/price/totalAmount відкидаються.
const parse = (body: unknown) => createOrderSchema.parse(body);

const validBody = {
  fullName: 'Test User',
  phone: '380991234567',
  deliveryType: 'pickup',
  items: [{ productId: 4, quantity: 2 }],
  // client-submitted values that must be ignored by the server:
  userId: 999,
  price: 1,
  totalAmount: 999999,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('createOrderFromInput', () => {
  it('recomputes price from the DB product and ignores client-submitted price/userId', async () => {
    mockedPrisma.product.findMany.mockResolvedValue([product] as never);
    mockedPrisma.order.create.mockResolvedValue({ id: 1 } as never);

    await createOrderFromInput(parse(validBody), undefined);

    const createCall = mockedPrisma.order.create.mock.calls[0][0] as unknown as CreateOrderArgs;
    expect(createCall.data.userId).toBeUndefined();
    expect(createCall.data.totalAmount).toBe(500); // 250 * 2, not the client's 999999
    expect(createCall.data.items.create[0].price).toBe(250); // not the client's 1
  });

  it('uses the userId passed by the caller (session), not the body', async () => {
    mockedPrisma.product.findMany.mockResolvedValue([product] as never);
    mockedPrisma.order.create.mockResolvedValue({ id: 1 } as never);

    await createOrderFromInput(parse(validBody), 7);

    const createCall = mockedPrisma.order.create.mock.calls[0][0] as unknown as CreateOrderArgs;
    expect(createCall.data.userId).toBe(7); // not body's userId: 999
  });

  it('adds shipping for address delivery below the free-shipping threshold', async () => {
    mockedPrisma.product.findMany.mockResolvedValue([product] as never);
    mockedPrisma.order.create.mockResolvedValue({ id: 1 } as never);

    await createOrderFromInput(
      parse({ ...validBody, deliveryType: 'address', address: 'вул. Хрещатик, 1' }),
      undefined,
    );

    const createCall = mockedPrisma.order.create.mock.calls[0][0] as unknown as CreateOrderArgs;
    expect(createCall.data.shippingAmount).toBe(75);
    expect(createCall.data.totalAmount).toBe(575);
  });

  it('rounds fractional-quantity amounts to kopecks', async () => {
    mockedPrisma.product.findMany.mockResolvedValue([{ id: 4, price: 250.1 }] as never);
    mockedPrisma.order.create.mockResolvedValue({ id: 1 } as never);

    await createOrderFromInput(
      parse({ ...validBody, items: [{ productId: 4, quantity: 0.3 }] }),
      undefined,
    );

    const createCall = mockedPrisma.order.create.mock.calls[0][0] as unknown as CreateOrderArgs;
    expect(createCall.data.items.create[0]).toMatchObject({ amount: 75.03 }); // 250.1 * 0.3 = 75.03 (не 75.02999…)
    expect(createCall.data.totalAmount).toBe(75.03);
  });

  it('throws a 400 HttpError when a referenced product does not exist', async () => {
    mockedPrisma.product.findMany.mockResolvedValue([]); // no matching product

    await expect(createOrderFromInput(parse(validBody), undefined)).rejects.toMatchObject({
      status: 400,
    });
    expect(mockedPrisma.order.create).not.toHaveBeenCalled();
  });
});
