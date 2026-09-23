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
import { POST } from './route';

const mockedPrisma = vi.mocked(prisma, true);
const mockedGetUserSession = vi.mocked(getUserSession);

const adminUser = { id: 1, isAdmin: true };
const regularUser = { id: 2, isAdmin: false };

function postRequest(body: unknown) {
  return new Request('http://localhost/api/orders/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/orders/search', () => {
  it('returns 401 when there is no session', async () => {
    mockedGetUserSession.mockResolvedValue(null);

    const res = await POST(postRequest({}));
    expect(res.status).toBe(401);
  });

  it('returns 403 when the session user is not an admin', async () => {
    mockedGetUserSession.mockResolvedValue({ id: '2' } as never);
    mockedPrisma.user.findUnique.mockResolvedValue(regularUser as never);

    const res = await POST(postRequest({}));
    expect(res.status).toBe(403);
  });

  it('returns 400 for invalid filters from an admin', async () => {
    mockedGetUserSession.mockResolvedValue({ id: '1' } as never);
    mockedPrisma.user.findUnique.mockResolvedValue(adminUser as never);

    const res = await POST(postRequest({ page: -1 }));
    expect(res.status).toBe(400);
  });

  it('returns paginated results for valid filters from an admin', async () => {
    mockedGetUserSession.mockResolvedValue({ id: '1' } as never);
    mockedPrisma.user.findUnique.mockResolvedValue(adminUser as never);
    mockedPrisma.order.findMany.mockResolvedValue([]);
    mockedPrisma.order.count.mockResolvedValue(0);

    const res = await POST(postRequest({ status: 'PENDING', page: 1, limit: 10 }));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.data).toEqual([]);
  });
});
