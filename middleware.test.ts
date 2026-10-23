import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('next-auth/jwt', () => ({ getToken: vi.fn() }));

import { getToken } from 'next-auth/jwt';
import { middleware } from './middleware';

const mockedGetToken = vi.mocked(getToken);

const request = (path: string, method = 'GET') =>
  new NextRequest(`http://localhost${path}`, { method });

beforeEach(() => {
  vi.clearAllMocks();
});

describe('middleware: /api/orders is admin-only', () => {
  it('no longer lets anonymous users POST /api/orders (order creation goes via /api/checkout)', async () => {
    mockedGetToken.mockResolvedValue(null);

    const res = await middleware(request('/api/orders', 'POST'));

    expect(res.status).toBe(401);
  });

  it('rejects a non-admin token on /api/orders', async () => {
    mockedGetToken.mockResolvedValue({ role: 'user' } as never);

    const res = await middleware(request('/api/orders', 'POST'));

    expect(res.status).toBe(403);
  });

  it('lets an admin through', async () => {
    mockedGetToken.mockResolvedValue({ role: 'admin' } as never);

    const res = await middleware(request('/api/orders/search', 'POST'));

    expect(res.status).toBe(200);
  });

  it('redirects an anonymous user from the /orders page to /not-auth', async () => {
    mockedGetToken.mockResolvedValue(null);

    const res = await middleware(request('/orders'));

    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost/not-auth');
  });

  it('lets a non-admin open the /orders page (the page itself limits them to own orders)', async () => {
    mockedGetToken.mockResolvedValue({ role: 'user' } as never);

    const res = await middleware(request('/orders'));

    expect(res.status).toBe(200);
  });

  it('does not touch other paths', async () => {
    const res = await middleware(request('/api/checkout/send-code', 'POST'));

    expect(res.status).toBe(200);
    expect(mockedGetToken).not.toHaveBeenCalled();
  });
});
