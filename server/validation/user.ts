import { z } from 'zod';

import { passwordSchema } from '@/components/shared/modals/auth-modal/forms/schemas';
import { uaPhoneSchema } from '@/server/validation/phone';

const fullNameSchema = z
  .string()
  .trim()
  .min(2, { message: "Введіть ім'я" })
  .max(100, { message: "Ім'я занадто довге" });

// bcrypt ігнорує все після 72 байтів — довші паролі лише створюють хибне відчуття захисту.
const newPasswordSchema = passwordSchema.max(72, { message: 'Пароль занадто довгий' });

export const updateUserInfoSchema = z.object({
  // Порожній email = «email не вказано» (null у БД), а не помилка валідації.
  email: z.preprocess(
    (value) =>
      value === null || (typeof value === 'string' && value.trim() === '') ? undefined : value,
    z
      .string()
      .trim()
      .email({ message: 'Введіть коректний email' })
      .max(100, { message: 'Email занадто довгий' })
      .optional(),
  ),
  fullName: fullNameSchema,
  password: newPasswordSchema.optional(),
});

export type UpdateUserInfoInput = z.infer<typeof updateUserInfoSchema>;

/** Перший крок реєстрації: дані форми. На них відправляється SMS-код. */
export const registerStartSchema = z.object({
  phone: uaPhoneSchema,
  fullName: fullNameSchema,
  password: newPasswordSchema,
});

export type RegisterStartInput = z.infer<typeof registerStartSchema>;

/**
 * Що зберігається в PhoneVerification.payload між кроками реєстрації. Пароль — лише у вигляді
 * bcrypt-хеша, а користувач створюється тільки після підтвердження коду.
 */
export const registerPayloadSchema = z.object({
  phone: uaPhoneSchema,
  fullName: fullNameSchema,
  passwordHash: z.string().min(1),
});

export type RegisterPayload = z.infer<typeof registerPayloadSchema>;
