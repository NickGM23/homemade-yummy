import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@/server/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    product: { findMany: vi.fn() },
    order: { findMany: vi.fn(), count: vi.fn(), create: vi.fn() },
  },
}));

vi.mock('@/server/get-user-session', () => ({
  getUserSession: vi.fn(),
}));

import { prisma } from '@/server/prisma';
import { getUserSession } from '@/server/get-user-session';
import { GET, POST } from './route';

const mockedPrisma = vi.mocked(prisma, true);
const mockedGetUserSession = vi.mocked(getUserSession);

const adminUser = { id: 1, isAdmin: true };
const regularUser = { id: 2, isAdmin: false };

const product = { id: 4, price: 250 };

interface CreateOrderArgs {
  data: {
    userId?: number;
    totalAmount: number;
    items: { create: { price: number }[] };
  };
}

function postRequest(body: unknown) {
  return new Request('http://localhost/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/orders (createOrder)', () => {
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

  it('recomputes price from the DB product and ignores client-submitted price/userId', async () => {
    mockedGetUserSession.mockResolvedValue(null);
    mockedPrisma.product.findMany.mockResolvedValue([product] as never);
    mockedPrisma.order.create.mockResolvedValue({ id: 1 } as never);

    const res = await POST(postRequest(validBody));
    expect(res.status).toBe(200);

    const createCall = mockedPrisma.order.create.mock.calls[0][0] as unknown as CreateOrderArgs;
    expect(createCall.data.userId).toBeUndefined();
    expect(createCall.data.totalAmount).toBe(500); // 250 * 2, not the client's 999999
    expect(createCall.data.items.create[0].price).toBe(250); // not the client's 1
  });

  it('binds userId from the session, not from the request body', async () => {
    mockedGetUserSession.mockResolvedValue({ id: '7' } as never);
    mockedPrisma.product.findMany.mockResolvedValue([product] as never);
    mockedPrisma.order.create.mockResolvedValue({ id: 1 } as never);

    await POST(postRequest(validBody));

    const createCall = mockedPrisma.order.create.mock.calls[0][0] as unknown as CreateOrderArgs;
    expect(createCall.data.userId).toBe(7); // from session, not body's userId: 999
  });

  it('returns 400 for an invalid body', async () => {
    const res = await POST(postRequest({ fullName: 'Test User' })); // missing required fields
    expect(res.status).toBe(400);
    expect(mockedPrisma.order.create).not.toHaveBeenCalled();
  });

  it('returns 500 when a referenced product does not exist', async () => {
    mockedGetUserSession.mockResolvedValue(null);
    mockedPrisma.product.findMany.mockResolvedValue([]); // no matching product

    const res = await POST(postRequest(validBody));
    expect(res.status).toBe(500);
  });
});

describe('GET /api/orders (getOrders)', () => {
  it('returns 401 when there is no session', async () => {
    mockedGetUserSession.mockResolvedValue(null);

    const res = await GET(new Request('http://localhost/api/orders'));
    expect(res.status).toBe(401);
  });

  it('returns 403 when the session user is not an admin', async () => {
    mockedGetUserSession.mockResolvedValue({ id: '2' } as never);
    mockedPrisma.user.findUnique.mockResolvedValue(regularUser as never);

    const res = await GET(new Request('http://localhost/api/orders'));
    expect(res.status).toBe(403);
  });

  it('returns paginated data for an admin', async () => {
    mockedGetUserSession.mockResolvedValue({ id: '1' } as never);
    mockedPrisma.user.findUnique.mockResolvedValue(adminUser as never);
    mockedPrisma.order.findMany.mockResolvedValue([{ id: 1 }] as never);
    mockedPrisma.order.count.mockResolvedValue(1);

    const res = await GET(new Request('http://localhost/api/orders?page=1&limit=20'));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data).toHaveLength(1);
    expect(body.total).toBe(1);
  });
});
