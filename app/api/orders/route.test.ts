import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@/server/prisma', () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    order: { findMany: vi.fn(), count: vi.fn() },
  },
}));

vi.mock('@/server/get-user-session', () => ({
  getUserSession: vi.fn(),
}));

import { prisma } from '@/server/prisma';
import { getUserSession } from '@/server/get-user-session';
import { GET } from './route';

const mockedPrisma = vi.mocked(prisma, true);
const mockedGetUserSession = vi.mocked(getUserSession);

const adminUser = { id: 1, isAdmin: true };
const regularUser = { id: 2, isAdmin: false };

beforeEach(() => {
  vi.clearAllMocks();
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
