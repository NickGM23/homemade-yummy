import { z } from 'zod';

export const checkoutFormSchema = z.object({
  fullName: z.string().min(3, { message: "Ім'я повинно бути не менше 3-х символів" }),
  email: z
    .string()
    .email({ message: 'Введіть коректну email адресу' })
    .optional()
    .or(z.literal('')), // дозволяє порожній рядок без помилки
  phone: z
    .string()
    .transform((val) => val.replace(/\D/g, '')) // залишає лише цифри
    .refine((val) => val.length === 12, { message: 'Введіть коректний номер телефону' }),
  address: z.string().min(5, { message: 'Введіть коректну адресу' }),
  comment: z.string().optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
