import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(6, { message: 'Пароль повинен бути не менше 6 символів' });

export const formLoginSchema = z.object({
  email: z.string().email({ message: 'Введіть коректний email' }),
  password: passwordSchema,
});

export const formProfileSchemaWithoutPassword = z.object({
  email: z.string().email({ message: 'Введіть коректний email' }),
  fullName: z.string().min(2, { message: "Введіть ім'я" }),
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

export const getProfileSchema = (isCredentialsUser: boolean) => {
  if (isCredentialsUser) {
    return z
      .object({
        email: z.string().email({ message: 'Введіть коректний email' }),
        fullName: z.string().min(2, { message: "Введіть ім'я" }),
        password: passwordSchema,
        confirmPassword: passwordSchema,
      })
      .refine((data) => data.password === data.confirmPassword, {
        message: 'Паролі не співпадають',
        path: ['confirmPassword'],
      });
  } else {
    return z.object({
      email: z.string().email({ message: 'Введіть коректний email' }),
      fullName: z.string().min(2, { message: "Введіть ім'я" }),
      password: z.string().optional(),
      confirmPassword: z.string().optional(),
    });
  }
};

export type TFormLoginValues = z.infer<typeof formLoginSchema>;
export type TFormRegisterValues = z.infer<typeof formRegisterSchema>;
export type TFormProfileValues = z.infer<ReturnType<typeof getProfileSchema>>;
