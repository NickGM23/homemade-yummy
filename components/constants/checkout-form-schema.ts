import { z } from 'zod';

export const checkoutFormSchema = z
  .object({
    fullName: z.string().min(3, { message: "Ім'я повинно бути не менше 3-х символів" }),
    email: z
      .string()
      .email({ message: 'Введіть коректну email адресу' })
      .optional()
      .or(z.literal('')), // дозволяє порожній рядок
    phone: z
      .string()
      .transform((val) => val.replace(/\D/g, '')) // залишає лише цифри
      .refine((val) => val.length === 12, { message: 'Введіть коректний номер телефону' }),

    deliveryType: z.enum(['pickup', 'address'], {
      required_error: 'Оберіть спосіб доставки',
    }),

    address: z.string().optional(),
    comment: z.string().optional(),
  })
  .refine(
    (data) => {
      // якщо вибрана адресна доставка, адреса обов’язкова
      if (data.deliveryType === 'address') {
        return !!data.address && data.address.trim().length >= 5;
      }
      return true;
    },
    {
      message: 'Введіть коректну адресу',
      path: ['address'], // показує помилку саме біля address
    },
  );

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
