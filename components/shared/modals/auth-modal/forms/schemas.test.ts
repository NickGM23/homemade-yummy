import { describe, expect, it } from 'vitest';
import { formLoginSchema, formRegisterSchema, phoneSchema, profileSchema } from './schemas';

describe('phoneSchema (masked input -> digits)', () => {
  it('turns the value produced by the mask into 380XXXXXXXXX', () => {
    expect(phoneSchema.parse('+38(099)123-45-67')).toBe('380991234567');
  });

  it.each(['', '+38(___)___-__-__', '+38(099)123-45-__', '+38(099)123-45-678', '0991234567'])(
    'rejects "%s" (incomplete or not in the mask format)',
    (value) => {
      expect(phoneSchema.safeParse(value).success).toBe(false);
    },
  );
});

describe('formLoginSchema', () => {
  it('accepts a masked phone and a password', () => {
    const result = formLoginSchema.safeParse({ phone: '+38(099)123-45-67', password: 'secret123' });
    expect(result.success && result.data.phone).toBe('380991234567');
  });

  it('rejects an incomplete phone and a short password', () => {
    expect(
      formLoginSchema.safeParse({ phone: '+38(099)___-__-__', password: 'secret123' }).success,
    ).toBe(false);
    expect(formLoginSchema.safeParse({ phone: '+38(099)123-45-67', password: '123' }).success).toBe(
      false,
    );
  });
});

describe('formRegisterSchema', () => {
  const valid = {
    phone: '+38(099)123-45-67',
    fullName: 'Іван Іванов',
    password: 'secret123',
    confirmPassword: 'secret123',
  };

  it('accepts valid data', () => {
    expect(formRegisterSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects mismatching passwords with the error on confirmPassword', () => {
    const result = formRegisterSchema.safeParse({ ...valid, confirmPassword: 'other123' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['confirmPassword']);
    }
  });
});

describe('profileSchema', () => {
  const valid = { phone: '+38(099)123-45-67', email: '', fullName: 'Іван Іванов' };

  it('accepts an empty email and no password change', () => {
    expect(profileSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects an invalid email but not an empty one', () => {
    expect(profileSchema.safeParse({ ...valid, email: 'not-an-email' }).success).toBe(false);
    expect(profileSchema.safeParse({ ...valid, email: 'user@example.com' }).success).toBe(true);
  });

  it('validates the password only when one is entered', () => {
    expect(
      profileSchema.safeParse({ ...valid, password: '123', confirmPassword: '123' }).success,
    ).toBe(false);
    expect(
      profileSchema.safeParse({ ...valid, password: 'secret123', confirmPassword: 'other' })
        .success,
    ).toBe(false);
    expect(
      profileSchema.safeParse({ ...valid, password: 'secret123', confirmPassword: 'secret123' })
        .success,
    ).toBe(true);
  });
});
