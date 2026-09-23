import { describe, expect, it } from 'vitest';
import { updateUserInfoSchema } from './user';

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
