import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(6, { message: 'Пароль повинен бути не менше 6 символів' });

// Поле маски дає `+38(099)123-45-67`; для сервера лишаються самі цифри (380XXXXXXXXX).
export const phoneSchema = z
  .string()
  .trim()
  .transform((val) => val.replace(/\D/g, ''))
  .refine((val) => val.length === 12 && val.startsWith('380'), {
    message: 'Введіть коректний номер телефону',
  });

export const formLoginSchema = z.object({
  phone: phoneSchema,
  password: passwordSchema,
});

export const formRegisterSchema = z
  .object({
    phone: phoneSchema,
    fullName: z.string().trim().min(2, { message: "Введіть ім'я" }),
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Паролі не співпадають',
    path: ['confirmPassword'],
  });

// Email необов'язковий (користувач, що зареєструвався по телефону, може його не мати);
// пароль — лише якщо його хочуть змінити.
export const profileSchema = z
  .object({
    phone: z.string().optional(),
    email: z
      .string()
      .trim()
      .refine((val) => val === '' || z.string().email().safeParse(val).success, {
        message: 'Введіть коректний email',
      }),
    fullName: z.string().trim().min(2, { message: "Введіть ім'я" }),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.password) return;

    if (data.password.length < 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Пароль повинен бути не менше 6 символів',
        path: ['password'],
      });
    }
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Паролі не співпадають',
        path: ['confirmPassword'],
      });
    }
  });

export type TFormLoginValues = z.output<typeof formLoginSchema>;
export type TFormRegisterInput = z.input<typeof formRegisterSchema>;
export type TFormRegisterValues = z.output<typeof formRegisterSchema>;
export type TFormProfileValues = z.infer<typeof profileSchema>;
