import { z } from 'zod';
import { normalizeUaPhone } from '@/server/phone';

/** Український мобільний номер у будь-якому записі -> нормалізований 380XXXXXXXXX. */
export const uaPhoneSchema = z
  .string()
  .trim()
  .transform((value, ctx) => {
    const phone = normalizeUaPhone(value);
    if (!phone) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Введіть коректний номер телефону' });
      return z.NEVER;
    }
    return phone;
  });
