import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@/server/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('@/server/get-user-session', () => ({
  getUserSession: vi.fn(),
}));

import { prisma } from '@/server/prisma';
import { getUserSession } from '@/server/get-user-session';
import { updateUserInfo } from './actions';

const mockedPrisma = vi.mocked(prisma, true);
const mockedGetUserSession = vi.mocked(getUserSession);

const existingUser = {
  id: 1,
  email: 'user@example.com',
  fullName: 'Old Name',
  password: 'hashed-old-password',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('updateUserInfo', () => {
  it('returns an error when there is no session', async () => {
    mockedGetUserSession.mockResolvedValue(null);

    const result = await updateUserInfo({ email: 'user@example.com', fullName: 'New Name' });

    expect(result).toEqual({ success: false, error: 'Сесія закінчилась. Увійдіть знову' });
    expect(mockedPrisma.user.update).not.toHaveBeenCalled();
  });

  it('returns an error when the session user no longer exists in the DB', async () => {
    mockedGetUserSession.mockResolvedValue({ id: '1' } as never);
    mockedPrisma.user.findUnique.mockResolvedValue(null);

    const result = await updateUserInfo({ email: 'user@example.com', fullName: 'New Name' });

    expect(result).toEqual({ success: false, error: 'Користувача не знайдено' });
  });

  it('returns fieldErrors for an invalid body instead of hitting the DB update', async () => {
    mockedGetUserSession.mockResolvedValue({ id: '1' } as never);
    mockedPrisma.user.findUnique.mockResolvedValue(existingUser as never);

    const result = await updateUserInfo({ email: 'not-an-email', fullName: 'New Name' });

    expect(result.success).toBe(false);
    expect((result as { fieldErrors?: Record<string, string> }).fieldErrors).toHaveProperty(
      'email',
    );
    expect(mockedPrisma.user.update).not.toHaveBeenCalled();
  });

  it('updates the user when the email is unchanged', async () => {
    mockedGetUserSession.mockResolvedValue({ id: '1' } as never);
    mockedPrisma.user.findUnique.mockResolvedValue(existingUser as never);

    const result = await updateUserInfo({ email: existingUser.email, fullName: 'New Name' });

    expect(result).toEqual({ success: true });
    expect(mockedPrisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { fullName: 'New Name' },
    });
  });

  it('rejects the email change when it is already used by another user', async () => {
    mockedGetUserSession.mockResolvedValue({ id: '1' } as never);
    mockedPrisma.user.findUnique
      .mockResolvedValueOnce(existingUser as never) // findUser by id
      .mockResolvedValueOnce({ id: 2, email: 'taken@example.com' } as never); // findUnique by email

    const result = await updateUserInfo({ email: 'taken@example.com', fullName: 'New Name' });

    expect(result).toEqual({
      success: false,
      fieldErrors: { email: 'Цей email вже використовується' },
    });
    expect(mockedPrisma.user.update).not.toHaveBeenCalled();
  });

  it('hashes the password rather than storing it in plaintext', async () => {
    mockedGetUserSession.mockResolvedValue({ id: '1' } as never);
    mockedPrisma.user.findUnique.mockResolvedValue(existingUser as never);

    const result = await updateUserInfo({
      email: existingUser.email,
      fullName: 'New Name',
      password: 'newpassword123',
    });

    expect(result).toEqual({ success: true });
    const call = mockedPrisma.user.update.mock.calls[0][0];
    expect(call.data.password).toBeDefined();
    expect(call.data.password).not.toBe('newpassword123');
  });
});
