import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@/server/prisma', () => ({
  prisma: {
    product: { findMany: vi.fn() },
  },
}));

import { prisma } from '@/server/prisma';
import { POST } from './route';

const mockedPrisma = vi.mocked(prisma, true);

function postRequest(body: unknown) {
  return new Request('http://localhost/api/products/by-ids', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /api/products/by-ids', () => {
  it('returns matching products for valid ids', async () => {
    mockedPrisma.product.findMany.mockResolvedValue([{ id: 1, name: 'Test product' }] as never);

    const res = await POST(postRequest({ ids: [1] }));
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toEqual([{ id: 1, name: 'Test product' }]);
  });

  it('returns 400 for an invalid body shape', async () => {
    const res = await POST(postRequest({ ids: 'not-an-array' }));
    expect(res.status).toBe(400);
    expect(mockedPrisma.product.findMany).not.toHaveBeenCalled();
  });
});
