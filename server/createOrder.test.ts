import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@/server/prisma', () => ({
  prisma: {
    product: { findMany: vi.fn() },
    order: { create: vi.fn(), count: vi.fn() },
    user: { findUnique: vi.fn() },
  },
}));

import { prisma } from '@/server/prisma';
import { createOrderSchema } from '@/server/validation/order';
import {
  MAX_ORDERS_PER_PHONE_PER_DAY,
  assertOrderLimit,
  createOrderFromInput,
  findUserIdByVerifiedPhone,
} from './createOrder';

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
  deliveryType: 'PICKUP',
  items: [{ productId: 4, quantity: 2 }],
  // client-submitted values that must be ignored by the server:
  userId: 999,
  price: 1,
  totalAmount: 999999,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockedPrisma.order.count.mockResolvedValue(0);
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
      parse({ ...validBody, deliveryType: 'ADDRESS', address: 'вул. Хрещатик, 1' }),
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

describe('daily order limit per phone', () => {
  it('is two orders per day', () => {
    expect(MAX_ORDERS_PER_PHONE_PER_DAY).toBe(2);
  });

  it('allows an order when the phone has fewer than two recent orders', async () => {
    mockedPrisma.order.count.mockResolvedValue(MAX_ORDERS_PER_PHONE_PER_DAY - 1);

    await expect(assertOrderLimit('380991234567')).resolves.toBeUndefined();
  });

  it('rejects with 429 when the phone already has two recent orders', async () => {
    mockedPrisma.order.count.mockResolvedValue(MAX_ORDERS_PER_PHONE_PER_DAY);

    await expect(assertOrderLimit('380991234567')).rejects.toMatchObject({ status: 429 });
  });

  it('counts this phone only, within the last 24 hours, ignoring cancelled orders', async () => {
    const before = Date.now();
    await assertOrderLimit('380991234567');

    const where = mockedPrisma.order.count.mock.calls[0][0]?.where as {
      phone: string;
      status: { not: string };
      createdAt: { gte: Date };
    };
    expect(where.phone).toBe('380991234567');
    expect(where.status).toEqual({ not: 'CANCELLED' });
    const windowMs = before - where.createdAt.gte.getTime();
    expect(windowMs).toBeGreaterThanOrEqual(24 * 60 * 60_000);
    expect(windowMs).toBeLessThan(24 * 60 * 60_000 + 5_000);
  });

  it('createOrderFromInput refuses to create a third order and writes nothing', async () => {
    mockedPrisma.order.count.mockResolvedValue(MAX_ORDERS_PER_PHONE_PER_DAY);
    mockedPrisma.product.findMany.mockResolvedValue([product] as never);

    await expect(createOrderFromInput(parse(validBody), undefined)).rejects.toMatchObject({
      status: 429,
    });
    expect(mockedPrisma.order.create).not.toHaveBeenCalled();
  });
});

describe('findUserIdByVerifiedPhone', () => {
  it('returns the id of an account with this verified phone', async () => {
    mockedPrisma.user.findUnique.mockResolvedValue({ id: 7, phoneVerified: new Date() } as never);

    expect(await findUserIdByVerifiedPhone('380991234567')).toBe(7);
    expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { phone: '380991234567' } }),
    );
  });

  it('returns undefined when there is no such account or its phone is not verified', async () => {
    mockedPrisma.user.findUnique.mockResolvedValueOnce(null);
    expect(await findUserIdByVerifiedPhone('380991234567')).toBeUndefined();

    mockedPrisma.user.findUnique.mockResolvedValueOnce({ id: 7, phoneVerified: null } as never);
    expect(await findUserIdByVerifiedPhone('380991234567')).toBeUndefined();
  });
});
