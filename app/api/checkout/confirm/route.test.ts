import { describe, expect, it, vi, beforeEach } from 'vitest';

const tx = { __tx: true };

vi.mock('@/server/prisma', () => ({
  prisma: { $transaction: vi.fn((fn: (t: unknown) => unknown) => fn(tx)) },
}));
vi.mock('@/server/get-user-session', () => ({ getUserSession: vi.fn() }));
vi.mock('@/server/createOrder', () => ({
  createOrderFromInput: vi.fn(),
  findUserIdByVerifiedPhone: vi.fn(),
}));
vi.mock('@/server/phone-verification', () => ({
  verifyCode: vi.fn(),
  claimVerification: vi.fn(),
}));

import { getUserSession } from '@/server/get-user-session';
import { createOrderFromInput, findUserIdByVerifiedPhone } from '@/server/createOrder';
import { claimVerification, verifyCode } from '@/server/phone-verification';
import { HttpError } from '@/server/withErrorHandling';
import { POST } from './route';

const mockedGetUserSession = vi.mocked(getUserSession);
const mockedVerify = vi.mocked(verifyCode);
const mockedClaim = vi.mocked(claimVerification);
const mockedCreateOrder = vi.mocked(createOrderFromInput);
const mockedFindUserByPhone = vi.mocked(findUserIdByVerifiedPhone);

const VERIFICATION_ID = '3f0c9c0e-6f4b-4b1e-9d8a-1b2c3d4e5f60';

const draft = {
  fullName: 'Test User',
  phone: '380991234567',
  deliveryType: 'pickup',
  items: [{ productId: 4, quantity: 2 }],
};

const request = (body: unknown) =>
  new Request('http://localhost/api/checkout/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  vi.clearAllMocks();
  mockedGetUserSession.mockResolvedValue(null);
  mockedVerify.mockResolvedValue({ id: VERIFICATION_ID, payload: draft } as never);
  mockedClaim.mockResolvedValue(undefined);
  mockedCreateOrder.mockResolvedValue({ id: 42 } as never);
  mockedFindUserByPhone.mockResolvedValue(undefined);
});

describe('POST /api/checkout/confirm', () => {
  it('creates the order from the stored draft after a correct code', async () => {
    const res = await POST(request({ verificationId: VERIFICATION_ID, code: '123456' }));

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ orderId: 42 });
    expect(mockedVerify).toHaveBeenCalledWith({
      id: VERIFICATION_ID,
      code: '123456',
      purpose: 'ORDER',
    });
    // claim і створення замовлення — в одній транзакції
    expect(mockedClaim).toHaveBeenCalledWith(tx, VERIFICATION_ID);
    expect(mockedCreateOrder).toHaveBeenCalledWith(expect.objectContaining(draft), undefined, tx);
  });

  it('binds the order to the logged-in user from the session', async () => {
    mockedGetUserSession.mockResolvedValue({ id: '7' } as never);

    await POST(request({ verificationId: VERIFICATION_ID, code: '123456' }));

    expect(mockedCreateOrder).toHaveBeenCalledWith(expect.anything(), 7, tx);
  });

  it('does not create an order when the code is wrong', async () => {
    mockedVerify.mockRejectedValue(new HttpError(400, 'Невірний код. Залишилось спроб: 4'));

    const res = await POST(request({ verificationId: VERIFICATION_ID, code: '000000' }));

    expect(res.status).toBe(400);
    expect((await res.json()).message).toContain('Невірний код');
    expect(mockedClaim).not.toHaveBeenCalled();
    expect(mockedCreateOrder).not.toHaveBeenCalled();
  });

  it('does not create a second order when the code was already claimed', async () => {
    mockedClaim.mockRejectedValue(new HttpError(400, 'Код недійсний або прострочений'));

    const res = await POST(request({ verificationId: VERIFICATION_ID, code: '123456' }));

    expect(res.status).toBe(400);
    expect(mockedCreateOrder).not.toHaveBeenCalled();
  });

  it.each([
    ['a non-numeric code', { verificationId: VERIFICATION_ID, code: 'abcdef' }],
    ['a short code', { verificationId: VERIFICATION_ID, code: '123' }],
    ['a non-uuid id', { verificationId: 'nope', code: '123456' }],
  ])('returns 400 for %s without touching the DB', async (_label, body) => {
    const res = await POST(request(body));

    expect(res.status).toBe(400);
    expect(mockedVerify).not.toHaveBeenCalled();
  });

  it('attributes a guest order to the account whose verified phone was just confirmed', async () => {
    mockedFindUserByPhone.mockResolvedValue(21);

    await POST(request({ verificationId: VERIFICATION_ID, code: '123456' }));

    expect(mockedFindUserByPhone).toHaveBeenCalledWith('380991234567');
    expect(mockedCreateOrder).toHaveBeenCalledWith(expect.anything(), 21, tx);
  });

  it('keeps the order a guest order when no account owns that phone', async () => {
    await POST(request({ verificationId: VERIFICATION_ID, code: '123456' }));

    expect(mockedCreateOrder).toHaveBeenCalledWith(expect.anything(), undefined, tx);
  });

  it('prefers the logged-in session user over the phone owner', async () => {
    mockedGetUserSession.mockResolvedValue({ id: '7' } as never);
    mockedFindUserByPhone.mockResolvedValue(21);

    await POST(request({ verificationId: VERIFICATION_ID, code: '123456' }));

    expect(mockedCreateOrder).toHaveBeenCalledWith(expect.anything(), 7, tx);
  });

  it('returns 429 when the daily order limit is hit at confirmation', async () => {
    mockedCreateOrder.mockRejectedValue(new HttpError(429, 'Досягнуто ліміт замовлень'));

    const res = await POST(request({ verificationId: VERIFICATION_ID, code: '123456' }));

    expect(res.status).toBe(429);
  });
});
