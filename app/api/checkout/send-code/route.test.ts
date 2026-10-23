import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@/server/prisma', () => ({
  prisma: { user: { findUnique: vi.fn() } },
}));
vi.mock('@/server/get-user-session', () => ({ getUserSession: vi.fn() }));
vi.mock('@/server/createOrder', () => ({
  assertOrderLimit: vi.fn(),
  priceOrder: vi.fn(),
  createOrderFromInput: vi.fn(),
}));
vi.mock('@/server/phone-verification', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/server/phone-verification')>()),
  startVerification: vi.fn(),
  getClientIp: vi.fn(() => '1.2.3.4'),
}));

import { prisma } from '@/server/prisma';
import { getUserSession } from '@/server/get-user-session';
import { assertOrderLimit, createOrderFromInput, priceOrder } from '@/server/createOrder';
import { startVerification } from '@/server/phone-verification';
import { HttpError } from '@/server/withErrorHandling';
import { POST } from './route';

const mockedPrisma = vi.mocked(prisma, true);
const mockedGetUserSession = vi.mocked(getUserSession);
const mockedStart = vi.mocked(startVerification);
const mockedCreateOrder = vi.mocked(createOrderFromInput);
const mockedPriceOrder = vi.mocked(priceOrder);
const mockedAssertOrderLimit = vi.mocked(assertOrderLimit);

const validBody = {
  fullName: 'Test User',
  phone: '+380 99 123 45 67',
  deliveryType: 'PICKUP',
  items: [{ productId: 4, quantity: 2 }],
};

const request = (body: unknown) =>
  new Request('http://localhost/api/checkout/send-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  vi.clearAllMocks();
  mockedGetUserSession.mockResolvedValue(null);
  mockedPriceOrder.mockResolvedValue(undefined as never);
  mockedAssertOrderLimit.mockResolvedValue(undefined);
  mockedStart.mockResolvedValue({
    id: 'v1',
    expiresAt: new Date('2026-01-01T00:05:00Z'),
    resendAvailableAt: new Date('2026-01-01T00:01:00Z'),
  });
});

describe('POST /api/checkout/send-code', () => {
  it('sends a code to the normalized phone and does NOT create the order', async () => {
    const res = await POST(request(validBody));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toMatchObject({
      status: 'code_sent',
      verificationId: 'v1',
      maskedPhone: '+38099•••4567',
    });
    expect(mockedStart).toHaveBeenCalledWith(
      expect.objectContaining({ phone: '380991234567', purpose: 'ORDER' }),
    );
    expect(mockedCreateOrder).not.toHaveBeenCalled();
  });

  it('returns 400 for an invalid phone and sends nothing', async () => {
    const res = await POST(request({ ...validBody, phone: '12345' }));

    expect(res.status).toBe(400);
    expect(mockedStart).not.toHaveBeenCalled();
  });

  it('validates the cart before spending an SMS', async () => {
    mockedPriceOrder.mockRejectedValue(new HttpError(400, 'Product 4 not found'));

    const res = await POST(request(validBody));

    expect(res.status).toBe(400);
    expect(mockedStart).not.toHaveBeenCalled();
  });

  it('skips the SMS when the logged-in user has this exact phone verified', async () => {
    mockedGetUserSession.mockResolvedValue({ id: '7' } as never);
    mockedPrisma.user.findUnique.mockResolvedValue({
      phone: '380991234567',
      phoneVerified: new Date(),
    } as never);
    mockedCreateOrder.mockResolvedValue({ id: 42 } as never);

    const res = await POST(request(validBody));

    expect(await res.json()).toEqual({ status: 'created', orderId: 42 });
    expect(mockedCreateOrder).toHaveBeenCalledWith(expect.anything(), 7);
    expect(mockedStart).not.toHaveBeenCalled();
  });

  it.each([
    ['a different phone', { phone: '380501112233', phoneVerified: new Date() }],
    ['an unverified phone', { phone: '380991234567', phoneVerified: null }],
  ])('still sends an SMS when the user has %s', async (_label, user) => {
    mockedGetUserSession.mockResolvedValue({ id: '7' } as never);
    mockedPrisma.user.findUnique.mockResolvedValue(user as never);

    const res = await POST(request(validBody));

    expect((await res.json()).status).toBe('code_sent');
    expect(mockedCreateOrder).not.toHaveBeenCalled();
  });

  it('rejects with 429 and sends no SMS when the phone reached the daily order limit', async () => {
    mockedAssertOrderLimit.mockRejectedValue(new HttpError(429, 'Досягнуто ліміт замовлень'));

    const res = await POST(request(validBody));

    expect(res.status).toBe(429);
    expect(mockedAssertOrderLimit).toHaveBeenCalledWith('380991234567');
    expect(mockedStart).not.toHaveBeenCalled();
    expect(mockedCreateOrder).not.toHaveBeenCalled();
  });

  it('applies the daily limit to the no-SMS path of a verified logged-in user too', async () => {
    mockedGetUserSession.mockResolvedValue({ id: '7' } as never);
    mockedPrisma.user.findUnique.mockResolvedValue({
      phone: '380991234567',
      phoneVerified: new Date(),
    } as never);
    mockedAssertOrderLimit.mockRejectedValue(new HttpError(429, 'Досягнуто ліміт замовлень'));

    const res = await POST(request(validBody));

    expect(res.status).toBe(429);
    expect(mockedCreateOrder).not.toHaveBeenCalled();
  });
});
