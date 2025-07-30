import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(6, { message: 'Пароль повинен бути не менше 6 символів' });

export const formLoginSchema = z.object({
  email: z.string().email({ message: 'Введіть коректний email' }),
  password: passwordSchema,
});

export const formRegisterSchema = formLoginSchema
  .merge(
    z.object({
      fullName: z.string().min(2, { message: "Введіть ім'я" }),
      confirmPassword: passwordSchema,
    }),
  )
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Паролі не співпадають',
    path: ['confirmPassword'],
  });

export type TFormLoginValues = z.infer<typeof formLoginSchema>;
export type TFormRegisterValues = z.infer<typeof formRegisterSchema>;
