import { z } from 'zod';

export const verificationIdSchema = z.string().uuid();

export const verificationCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, { message: 'Введіть 6-значний код' });

/** Тіло запитів `confirm` (замовлення, реєстрація). */
export const confirmVerificationSchema = z.object({
  verificationId: verificationIdSchema,
  code: verificationCodeSchema,
});

/** Тіло запитів `resend-code`. */
export const resendVerificationSchema = z.object({
  verificationId: verificationIdSchema,
});
