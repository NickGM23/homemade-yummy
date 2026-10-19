import { describe, expect, it, vi, beforeEach } from 'vitest';
import { hashSync } from 'bcrypt';

vi.mock('@/server/prisma', () => ({
  prisma: { user: { findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn() } },
}));

import { prisma } from '@/server/prisma';
import { authOptions } from './auth-options';

const db = vi.mocked(prisma, true).user;

type Authorize = (credentials: Record<string, string> | undefined) => Promise<unknown>;
const credentialsProvider = authOptions.providers.find(
  (p) => p.type === 'credentials',
) as unknown as { options: { authorize: Authorize } };
const authorize: Authorize = credentialsProvider.options.authorize;

const jwtCallback = authOptions.callbacks!.jwt as (args: Record<string, unknown>) => Promise<{
  id?: string;
  email?: string | null;
  phone?: string | null;
  fullName?: string;
  role?: string;
}>;
const sessionCallback = authOptions.callbacks!.session as unknown as (args: {
  session: { user: Record<string, unknown> };
  token: Record<string, unknown>;
}) => { user: Record<string, unknown> };

const PASSWORD = 'secret123';
const phoneUser = {
  id: 7,
  email: null,
  phone: '380991234567',
  fullName: 'Іван Іванов',
  password: hashSync(PASSWORD, 4),
  isAdmin: false,
};
const emailUser = { ...phoneUser, id: 8, email: 'user@example.com', phone: null }; // напр. GitHub-акаунт

beforeEach(() => {
  vi.clearAllMocks();
  db.findUnique.mockResolvedValue(null);
});

describe('credentials authorize', () => {
  it.each(['380991234567', '+380 99 123 45 67', '099 123 45 67', '0991234567'])(
    'logs in by phone written as "%s"',
    async (phone) => {
      db.findUnique.mockResolvedValue(phoneUser as never);

      const user = await authorize({ phone, password: PASSWORD });

      expect(db.findUnique).toHaveBeenCalledWith({ where: { phone: '380991234567' } });
      expect(user).toMatchObject({ id: '7', email: null, fullName: 'Іван Іванов', role: 'user' });
    },
  );

  it('does not let anyone log in with a password by email (phone-only login)', async () => {
    db.findUnique.mockResolvedValue(emailUser as never);

    expect(await authorize({ phone: 'user@example.com', password: PASSWORD })).toBeNull();
    expect(await authorize({ email: 'user@example.com', password: PASSWORD } as never)).toBeNull();
    expect(db.findUnique).not.toHaveBeenCalled();
  });

  it('returns the admin role for an admin user', async () => {
    db.findUnique.mockResolvedValue({ ...phoneUser, isAdmin: true } as never);

    const user = await authorize({ phone: '0991234567', password: PASSWORD });

    expect(user).toMatchObject({ role: 'admin' });
  });

  it('rejects a wrong password', async () => {
    db.findUnique.mockResolvedValue(phoneUser as never);

    expect(await authorize({ phone: '0991234567', password: 'wrong-password' })).toBeNull();
  });

  it('rejects an unknown user', async () => {
    expect(await authorize({ phone: '0991234567', password: PASSWORD })).toBeNull();
  });

  it.each(['12345', '380441234567', 'abc'])(
    'does not even query the DB for a non-mobile phone "%s"',
    async (phone) => {
      expect(await authorize({ phone, password: PASSWORD })).toBeNull();
      expect(db.findUnique).not.toHaveBeenCalled();
    },
  );

  it.each([undefined, {}, { phone: '0991234567' }, { password: PASSWORD }])(
    'rejects missing credentials %j',
    async (credentials) => {
      expect(await authorize(credentials as never)).toBeNull();
      expect(db.findUnique).not.toHaveBeenCalled();
    },
  );
});

describe('jwt callback', () => {
  it('on credentials sign-in takes our user id from `user` and works without an email', async () => {
    db.findUnique.mockResolvedValue(phoneUser as never);

    const token = await jwtCallback({
      token: { sub: '7' },
      user: { id: '7' },
      account: { provider: 'credentials' },
    });

    expect(db.findUnique).toHaveBeenCalledWith({ where: { id: 7 } });
    expect(token).toMatchObject({
      id: '7',
      email: null,
      phone: '380991234567',
      fullName: 'Іван Іванов',
      role: 'user',
    });
  });

  it('on OAuth sign-in looks the user up by email (provider id is not our id)', async () => {
    db.findUnique.mockResolvedValue(emailUser as never);

    const token = await jwtCallback({
      token: { sub: 'github-123', email: 'user@example.com' },
      user: { id: 'github-123' },
      account: { provider: 'github' },
    });

    expect(db.findUnique).toHaveBeenCalledWith({ where: { email: 'user@example.com' } });
    expect(token).toMatchObject({ id: '8' });
  });

  it('on later requests refreshes by id, so users without an email keep their session', async () => {
    db.findUnique.mockResolvedValue({ ...phoneUser, isAdmin: true } as never);

    const token = await jwtCallback({ token: { id: '7', email: null } });

    expect(db.findUnique).toHaveBeenCalledWith({ where: { id: 7 } });
    expect(token).toMatchObject({ id: '7', role: 'admin' }); // свіжа роль з БД
  });

  it('leaves the token untouched when there is nothing to look up by', async () => {
    const token = await jwtCallback({ token: {} });

    expect(db.findUnique).not.toHaveBeenCalled();
    expect(token).toEqual({});
  });
});

describe('session callback', () => {
  it('exposes a null email and the phone for phone-only users (never the string "undefined")', () => {
    const { user } = sessionCallback({
      session: { user: {} },
      token: { id: '7', role: 'user', fullName: 'Іван', email: null, phone: '380991234567' },
    });

    expect(user).toMatchObject({ id: '7', email: null, phone: '380991234567' });
  });
});
