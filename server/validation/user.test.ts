import { describe, expect, it } from 'vitest';
import { registerPayloadSchema, registerStartSchema, updateUserInfoSchema } from './user';

describe('updateUserInfoSchema', () => {
  it('accepts a valid email + fullName without a password', () => {
    const result = updateUserInfoSchema.safeParse({
      email: 'user@example.com',
      fullName: 'Іван Іванов',
    });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid email', () => {
    const result = updateUserInfoSchema.safeParse({
      email: 'not-an-email',
      fullName: 'Іван Іванов',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a fullName shorter than 2 characters', () => {
    const result = updateUserInfoSchema.safeParse({
      email: 'user@example.com',
      fullName: 'І',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a password shorter than 6 characters when provided', () => {
    const result = updateUserInfoSchema.safeParse({
      email: 'user@example.com',
      fullName: 'Іван Іванов',
      password: '123',
    });
    expect(result.success).toBe(false);
  });

  it('accepts a valid password of 6+ characters', () => {
    const result = updateUserInfoSchema.safeParse({
      email: 'user@example.com',
      fullName: 'Іван Іванов',
      password: 'secret123',
    });
    expect(result.success).toBe(true);
  });
});

describe('updateUserInfoSchema: optional email', () => {
  it.each([undefined, '', '   ', null])('treats %j as "no email"', (email) => {
    const result = updateUserInfoSchema.safeParse({ email, fullName: 'Іван Іванов' });
    expect(result.success && result.data.email).toBeUndefined();
  });

  it('rejects a password longer than the bcrypt limit of 72', () => {
    const result = updateUserInfoSchema.safeParse({
      fullName: 'Іван Іванов',
      password: 'x'.repeat(73),
    });
    expect(result.success).toBe(false);
  });
});

describe('registerStartSchema', () => {
  const valid = { phone: '0991234567', fullName: 'Іван Іванов', password: 'secret123' };

  it('accepts valid data and normalizes the phone to 380XXXXXXXXX', () => {
    const result = registerStartSchema.safeParse(valid);
    expect(result.success && result.data.phone).toBe('380991234567');
  });

  it.each([
    ['an invalid phone', { phone: '12345' }],
    ['a landline phone', { phone: '380441234567' }],
    ['a short password', { password: '12345' }],
    ['a short name', { fullName: 'І' }],
    ['an empty name', { fullName: '   ' }],
  ])('rejects %s', (_label, patch) => {
    expect(registerStartSchema.safeParse({ ...valid, ...patch }).success).toBe(false);
  });

  it('ignores client-supplied extra fields such as isAdmin', () => {
    const result = registerStartSchema.safeParse({ ...valid, isAdmin: true, email: 'a@b.co' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).not.toHaveProperty('isAdmin');
    }
  });
});

describe('registerPayloadSchema', () => {
  it('requires a password hash, not a plain password', () => {
    expect(
      registerPayloadSchema.safeParse({ phone: '380991234567', fullName: 'Іван', password: 'x' })
        .success,
    ).toBe(false);
    expect(
      registerPayloadSchema.safeParse({
        phone: '380991234567',
        fullName: 'Іван',
        passwordHash: '$2b$10$hash',
      }).success,
    ).toBe(true);
  });
});
