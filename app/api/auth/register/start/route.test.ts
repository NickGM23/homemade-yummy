import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@/server/prisma', () => ({
  prisma: { user: { findUnique: vi.fn() } },
}));
vi.mock('@/server/phone-verification', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/server/phone-verification')>()),
  startVerification: vi.fn(),
  getClientIp: vi.fn(() => '1.2.3.4'),
}));

import { prisma } from '@/server/prisma';
import { startVerification } from '@/server/phone-verification';
import { POST } from './route';

const mockedPrisma = vi.mocked(prisma, true);
const mockedStart = vi.mocked(startVerification);

const validBody = {
  phone: '+38(099)123-45-67'.replace(/\D/g, ''), // клієнт шле лише цифри
  fullName: 'Іван Іванов',
  password: 'secret123',
};

const request = (body: unknown) =>
  new Request('http://localhost/api/auth/register/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

beforeEach(() => {
  vi.clearAllMocks();
  mockedPrisma.user.findUnique.mockResolvedValue(null);
  mockedStart.mockResolvedValue({
    id: 'v1',
    expiresAt: new Date('2026-01-01T00:05:00Z'),
    resendAvailableAt: new Date('2026-01-01T00:01:00Z'),
  });
});

describe('POST /api/auth/register/start', () => {
  it('sends a REGISTER code and stores only a bcrypt hash of the password', async () => {
    const res = await POST(request(validBody));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toMatchObject({
      status: 'code_sent',
      verificationId: 'v1',
      maskedPhone: '+38099•••4567',
    });

    const call = mockedStart.mock.calls[0][0];
    expect(call).toMatchObject({ phone: '380991234567', purpose: 'REGISTER', ip: '1.2.3.4' });

    const payload = call.payload as { passwordHash: string; fullName: string };
    expect(payload.fullName).toBe('Іван Іванов');
    expect(payload.passwordHash).toMatch(/^\$2[aby]\$/); // bcrypt, не відкритий пароль
    expect(JSON.stringify(call.payload)).not.toContain('secret123');
    // відповідь клієнту теж не містить ні пароля, ні хеша
    expect(JSON.stringify(body)).not.toMatch(/secret123|\$2[aby]\$/);
  });

  it('normalizes a locally written phone number', async () => {
    await POST(request({ ...validBody, phone: '099 123 45 67' }));

    expect(mockedStart).toHaveBeenCalledWith(expect.objectContaining({ phone: '380991234567' }));
  });

  it('returns 409 and sends no SMS when the phone is already registered', async () => {
    mockedPrisma.user.findUnique.mockResolvedValue({ id: 5 } as never);

    const res = await POST(request(validBody));

    expect(res.status).toBe(409);
    expect(mockedStart).not.toHaveBeenCalled();
  });

  it.each([
    ['an invalid phone', { phone: '12345' }],
    ['a short password', { password: '123' }],
    ['a too long password', { password: 'x'.repeat(73) }],
    ['a too short name', { fullName: 'І' }],
  ])('returns 400 for %s without sending an SMS', async (_label, patch) => {
    const res = await POST(request({ ...validBody, ...patch }));

    expect(res.status).toBe(400);
    expect(mockedStart).not.toHaveBeenCalled();
  });
});
