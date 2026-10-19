import { describe, expect, it, vi, beforeEach } from 'vitest';

const tx = {
  user: { findUnique: vi.fn(), create: vi.fn() },
  order: { updateMany: vi.fn() },
};

vi.mock('@/server/prisma', () => ({
  prisma: { $transaction: vi.fn((fn: (t: unknown) => unknown) => fn(tx)) },
}));
vi.mock('@/server/phone-verification', () => ({
  verifyCode: vi.fn(),
  claimVerification: vi.fn(),
}));

import { claimVerification, verifyCode } from '@/server/phone-verification';
import { HttpError } from '@/server/withErrorHandling';
import { POST } from './route';

const mockedVerify = vi.mocked(verifyCode);
const mockedClaim = vi.mocked(claimVerification);

const VERIFICATION_ID = '3f0c9c0e-6f4b-4b1e-9d8a-1b2c3d4e5f60';

const payload = {
  phone: '380991234567',
  fullName: 'Іван Іванов',
  passwordHash: '$2b$10$abcdefghijklmnopqrstuuabcdefghijklmnopqrstuvwxyz01234',
};

const request = (body: unknown) =>
  new Request('http://localhost/api/auth/register/confirm', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  vi.clearAllMocks();
  mockedVerify.mockResolvedValue({ id: VERIFICATION_ID, payload } as never);
  mockedClaim.mockResolvedValue(undefined);
  tx.user.findUnique.mockResolvedValue(null);
  tx.user.create.mockResolvedValue({ id: 1 });
  tx.order.updateMany.mockResolvedValue({ count: 0 });
});

describe('POST /api/auth/register/confirm', () => {
  it('creates a verified phone user from the stored payload after a correct code', async () => {
    const res = await POST(request({ verificationId: VERIFICATION_ID, code: '123456' }));

    expect(res.status).toBe(200);
    expect(mockedVerify).toHaveBeenCalledWith({
      id: VERIFICATION_ID,
      code: '123456',
      purpose: 'REGISTER',
    });
    expect(mockedClaim).toHaveBeenCalledWith(tx, VERIFICATION_ID);

    const data = tx.user.create.mock.calls[0][0].data;
    expect(data).toMatchObject({
      fullName: 'Іван Іванов',
      phone: '380991234567',
      password: payload.passwordHash,
      provider: 'credentials',
    });
    expect(data.phoneVerified).toBeInstanceOf(Date);
    expect(data).not.toHaveProperty('email'); // email необов'язковий
  });

  it('does not create a user when the code is wrong', async () => {
    mockedVerify.mockRejectedValue(new HttpError(400, 'Невірний код. Залишилось спроб: 2'));

    const res = await POST(request({ verificationId: VERIFICATION_ID, code: '000000' }));

    expect(res.status).toBe(400);
    expect(mockedClaim).not.toHaveBeenCalled();
    expect(tx.user.create).not.toHaveBeenCalled();
  });

  it('does not create a user when the code was already claimed (double submit)', async () => {
    mockedClaim.mockRejectedValue(new HttpError(400, 'Код недійсний або прострочений'));

    const res = await POST(request({ verificationId: VERIFICATION_ID, code: '123456' }));

    expect(res.status).toBe(400);
    expect(tx.user.create).not.toHaveBeenCalled();
  });

  it('returns 409 when the phone got registered between the SMS and the confirmation', async () => {
    tx.user.findUnique.mockResolvedValue({ id: 9 });

    const res = await POST(request({ verificationId: VERIFICATION_ID, code: '123456' }));

    expect(res.status).toBe(409);
    expect(tx.user.create).not.toHaveBeenCalled();
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

  it("links the phone's earlier guest orders to the new account, and only unowned ones", async () => {
    tx.user.create.mockResolvedValue({ id: 33 });

    await POST(request({ verificationId: VERIFICATION_ID, code: '123456' }));

    expect(tx.order.updateMany).toHaveBeenCalledWith({
      where: { userId: null, phone: '380991234567' }, // чужі (з userId) не чіпаємо
      data: { userId: 33 },
    });
  });

  it('links nothing when the registration fails', async () => {
    tx.user.findUnique.mockResolvedValue({ id: 9 }); // номер уже зайнятий

    await POST(request({ verificationId: VERIFICATION_ID, code: '123456' }));

    expect(tx.order.updateMany).not.toHaveBeenCalled();
  });
});
