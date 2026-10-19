import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@/server/prisma', () => ({ prisma: {} }));
vi.mock('@/server/phone-verification', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/server/phone-verification')>()),
  startVerification: vi.fn(),
  getVerificationForResend: vi.fn(),
  getClientIp: vi.fn(() => '1.2.3.4'),
}));

import { getVerificationForResend, startVerification } from '@/server/phone-verification';
import { HttpError } from '@/server/withErrorHandling';
import { POST } from './route';

const mockedStart = vi.mocked(startVerification);
const mockedGetPrevious = vi.mocked(getVerificationForResend);

const VERIFICATION_ID = '3f0c9c0e-6f4b-4b1e-9d8a-1b2c3d4e5f60';
const payload = {
  phone: '380991234567',
  fullName: 'Іван Іванов',
  passwordHash: '$2b$10$hash',
};

const request = (body: unknown) =>
  new Request('http://localhost/api/auth/register/resend-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  vi.clearAllMocks();
  mockedGetPrevious.mockResolvedValue({ id: VERIFICATION_ID, payload } as never);
  mockedStart.mockResolvedValue({
    id: 'v2',
    expiresAt: new Date('2026-01-01T00:05:00Z'),
    resendAvailableAt: new Date('2026-01-01T00:01:00Z'),
  });
});

describe('POST /api/auth/register/resend-code', () => {
  it('re-sends a REGISTER code for the same stored registration', async () => {
    const res = await POST(request({ verificationId: VERIFICATION_ID }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(mockedGetPrevious).toHaveBeenCalledWith(VERIFICATION_ID, 'REGISTER');
    expect(mockedStart).toHaveBeenCalledWith(
      expect.objectContaining({ phone: '380991234567', purpose: 'REGISTER', payload }),
    );
    expect(body).toMatchObject({ status: 'code_sent', verificationId: 'v2' });
  });

  it('returns 400 and sends nothing when the registration session is over', async () => {
    mockedGetPrevious.mockRejectedValue(new HttpError(400, 'Сесію підтвердження завершено'));

    const res = await POST(request({ verificationId: VERIFICATION_ID }));

    expect(res.status).toBe(400);
    expect(mockedStart).not.toHaveBeenCalled();
  });

  it('propagates the cooldown limit as 429', async () => {
    mockedStart.mockRejectedValue(new HttpError(429, 'Зачекайте хвилину'));

    const res = await POST(request({ verificationId: VERIFICATION_ID }));

    expect(res.status).toBe(429);
  });

  it('returns 400 for a non-uuid id', async () => {
    const res = await POST(request({ verificationId: 'nope' }));

    expect(res.status).toBe(400);
    expect(mockedGetPrevious).not.toHaveBeenCalled();
  });
});
