import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@/server/prisma', () => ({
  prisma: {
    phoneVerification: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('@/server/sms', () => ({ sendSms: vi.fn(), getSmsDriver: vi.fn(() => 'alphasms') }));

import { prisma } from '@/server/prisma';
import { getSmsDriver, sendSms } from '@/server/sms';
import {
  MAX_ATTEMPTS,
  SEND_LIMITS,
  getSendLimits,
  RESEND_COOLDOWN_MS,
  claimVerification,
  startVerification,
  verifyCode,
} from './phone-verification';

const db = vi.mocked(prisma, true).phoneVerification;
const mockedSendSms = vi.mocked(sendSms);
const mockedGetSmsDriver = vi.mocked(getSmsDriver);

const PHONE = '380991234567';

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('NEXTAUTH_SECRET', 'test-secret');
  db.findFirst.mockResolvedValue(null);
  db.count.mockResolvedValue(0);
  db.create.mockResolvedValue({} as never);
  db.updateMany.mockResolvedValue({ count: 0 });
  mockedSendSms.mockResolvedValue(undefined);
  mockedGetSmsDriver.mockReturnValue('alphasms'); // за замовчуванням — реальні (тісні) ліміти
});

const start = () =>
  startVerification({ phone: PHONE, purpose: 'ORDER', payload: { a: 1 }, ip: '1.2.3.4' });

/** Запускає startVerification і повертає id, код з SMS та збережений запис. */
async function startAndCapture() {
  const result = await start();
  const message = mockedSendSms.mock.calls[0][1];
  const code = message.match(/\d{6}/)![0];
  const stored = db.create.mock.calls[0][0].data;
  return { id: result.id, code, stored };
}

describe('startVerification', () => {
  it('stores only a hash of the code and sends the plain code by SMS', async () => {
    const { code, stored } = await startAndCapture();

    expect(code).toMatch(/^\d{6}$/);
    expect(stored.codeHash).not.toContain(code);
    expect(mockedSendSms).toHaveBeenCalledWith(PHONE, expect.stringContaining(code));
  });

  it('invalidates previously issued codes only after the new SMS went out', async () => {
    await start();

    expect(db.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ phone: PHONE, purpose: 'ORDER', consumedAt: null }),
      }),
    );
    expect(mockedSendSms.mock.invocationCallOrder[0]).toBeLessThan(
      db.updateMany.mock.invocationCallOrder[0],
    );
  });

  it('rejects a resend within the cooldown with 429 and sends nothing', async () => {
    db.findFirst.mockResolvedValue({
      createdAt: new Date(Date.now() - RESEND_COOLDOWN_MS + 5000),
    } as never);

    await expect(start()).rejects.toMatchObject({ status: 429 });
    expect(mockedSendSms).not.toHaveBeenCalled();
    expect(db.create).not.toHaveBeenCalled();
  });

  it('rejects when the per-phone hourly limit is reached', async () => {
    db.count.mockResolvedValueOnce(SEND_LIMITS.real.perPhonePerHour); // sent to this phone in the last hour

    await expect(start()).rejects.toMatchObject({ status: 429 });
    expect(mockedSendSms).not.toHaveBeenCalled();
  });

  it('rejects when the per-IP hourly limit is reached', async () => {
    db.count.mockResolvedValueOnce(0).mockResolvedValueOnce(SEND_LIMITS.real.perIpPerHour);

    await expect(start()).rejects.toMatchObject({ status: 429 });
    expect(mockedSendSms).not.toHaveBeenCalled();
  });

  it('still sends when the phone and the IP are one below their hourly limits', async () => {
    db.count
      .mockResolvedValueOnce(SEND_LIMITS.real.perPhonePerHour - 1)
      .mockResolvedValueOnce(SEND_LIMITS.real.perIpPerHour - 1);

    await expect(start()).resolves.toMatchObject({ id: expect.any(String) });
    expect(mockedSendSms).toHaveBeenCalledTimes(1);
  });

  it('uses the agreed real limits: 2 SMS per hour per phone, 5 per hour per IP', () => {
    expect(SEND_LIMITS.real).toEqual({ perPhonePerHour: 2, perIpPerHour: 5 });
    expect(getSendLimits()).toEqual(SEND_LIMITS.real);
  });

  it('with the console driver (local dev) the looser dev limits apply', async () => {
    mockedGetSmsDriver.mockReturnValue('console');
    expect(getSendLimits()).toEqual({ perPhonePerHour: 5, perIpPerHour: 20 });

    // 2 SMS to this phone already — blocked with real limits, fine with the dev ones
    db.count.mockResolvedValueOnce(SEND_LIMITS.real.perPhonePerHour);
    await expect(start()).resolves.toMatchObject({ id: expect.any(String) });
  });

  it('the dev limits still cap at 5 per phone and 20 per IP', async () => {
    mockedGetSmsDriver.mockReturnValue('console');

    db.count.mockResolvedValueOnce(SEND_LIMITS.dev.perPhonePerHour);
    await expect(start()).rejects.toMatchObject({ status: 429 });

    db.count.mockResolvedValueOnce(0).mockResolvedValueOnce(SEND_LIMITS.dev.perIpPerHour);
    await expect(start()).rejects.toMatchObject({ status: 429 });
  });

  it('never loosens the limits in production, even if SMS_DRIVER=console is set there', () => {
    mockedGetSmsDriver.mockReturnValue('console');
    vi.stubEnv('NODE_ENV', 'production');

    expect(getSendLimits()).toEqual(SEND_LIMITS.real);

    vi.unstubAllEnvs();
  });

  it('removes the record and returns 502 when the SMS gateway fails', async () => {
    mockedSendSms.mockRejectedValue(new Error('gateway down'));
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(start()).rejects.toMatchObject({ status: 502 });
    expect(db.delete).toHaveBeenCalledTimes(1);
    expect(db.updateMany).not.toHaveBeenCalled(); // старий код лишається дійсним

    errorLog.mockRestore();
  });
});

describe('verifyCode', () => {
  const future = () => new Date(Date.now() + 60_000);

  async function issue() {
    const { id, code, stored } = await startAndCapture();
    const record = {
      id,
      purpose: 'ORDER',
      codeHash: stored.codeHash,
      payload: { a: 1 },
      consumedAt: null,
      expiresAt: future(),
    };
    db.findUnique.mockResolvedValue(record as never);
    return { id, code, record };
  }

  it('returns the record for the correct code', async () => {
    const { id, code } = await issue();
    db.update.mockResolvedValue({ attempts: 1 } as never);

    await expect(verifyCode({ id, code, purpose: 'ORDER' })).resolves.toMatchObject({ id });
  });

  it('rejects a wrong code with the number of attempts left', async () => {
    const { id, code } = await issue();
    db.update.mockResolvedValue({ attempts: 1 } as never);
    const wrong = code === '000000' ? '111111' : '000000';

    await expect(verifyCode({ id, code: wrong, purpose: 'ORDER' })).rejects.toMatchObject({
      status: 400,
      message: expect.stringContaining(String(MAX_ATTEMPTS - 1)),
    });
  });

  it('allows exactly three attempts: first miss leaves two, the third miss exhausts them', async () => {
    const { id, code } = await issue();
    const wrong = code === '000000' ? '111111' : '000000';

    db.update.mockResolvedValueOnce({ attempts: 1 } as never);
    await expect(verifyCode({ id, code: wrong, purpose: 'ORDER' })).rejects.toMatchObject({
      status: 400,
      message: 'Невірний код. Залишилось спроб: 2',
    });

    db.update.mockResolvedValueOnce({ attempts: 2 } as never);
    await expect(verifyCode({ id, code: wrong, purpose: 'ORDER' })).rejects.toMatchObject({
      status: 400,
      message: 'Невірний код. Залишилось спроб: 1',
    });

    db.update.mockResolvedValueOnce({ attempts: 3 } as never);
    await expect(verifyCode({ id, code: wrong, purpose: 'ORDER' })).rejects.toMatchObject({
      status: 429,
      message: expect.stringContaining('вичерпано'),
    });
  });

  it('still accepts the correct code on the third attempt', async () => {
    const { id, code } = await issue();
    db.update.mockResolvedValue({ attempts: 3 } as never);

    await expect(verifyCode({ id, code, purpose: 'ORDER' })).resolves.toMatchObject({ id });
  });

  it('rejects even the correct code once the attempt limit is exceeded', async () => {
    const { id, code } = await issue();
    db.update.mockResolvedValue({ attempts: MAX_ATTEMPTS + 1 } as never);

    await expect(verifyCode({ id, code, purpose: 'ORDER' })).rejects.toMatchObject({
      status: 429,
    });
  });

  it('rejects an expired code without counting an attempt', async () => {
    const { id, code, record } = await issue();
    db.findUnique.mockResolvedValue({ ...record, expiresAt: new Date(Date.now() - 1) } as never);

    await expect(verifyCode({ id, code, purpose: 'ORDER' })).rejects.toMatchObject({
      status: 400,
    });
    expect(db.update).not.toHaveBeenCalled();
  });

  it('rejects an already used code', async () => {
    const { id, code, record } = await issue();
    db.findUnique.mockResolvedValue({ ...record, consumedAt: new Date() } as never);

    await expect(verifyCode({ id, code, purpose: 'ORDER' })).rejects.toMatchObject({
      status: 400,
    });
  });

  it('rejects a code issued for a different purpose', async () => {
    const { id, code } = await issue();

    await expect(verifyCode({ id, code, purpose: 'REGISTER' })).rejects.toMatchObject({
      status: 400,
    });
  });

  it('rejects an unknown verification id', async () => {
    db.findUnique.mockResolvedValue(null);

    await expect(
      verifyCode({ id: 'missing', code: '123456', purpose: 'ORDER' }),
    ).rejects.toMatchObject({ status: 400 });
  });
});

describe('claimVerification', () => {
  const tx = { phoneVerification: { updateMany: vi.fn() } };

  it('succeeds when exactly one unused, unexpired record is claimed', async () => {
    tx.phoneVerification.updateMany.mockResolvedValue({ count: 1 });

    await expect(claimVerification(tx as never, 'id')).resolves.toBeUndefined();
  });

  it('fails when the record was already claimed (double submit)', async () => {
    tx.phoneVerification.updateMany.mockResolvedValue({ count: 0 });

    await expect(claimVerification(tx as never, 'id')).rejects.toMatchObject({ status: 400 });
  });
});
