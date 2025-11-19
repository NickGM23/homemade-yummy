import { z } from 'zod';

// Використовуємо .nullable() або .optional() для необов'язкових полів
export const checkoutFormSchema = z
  .object({
    fullName: z
      .string()
      .min(3, { message: "Ім'я повинно бути не менше 3-х символів" })
      .max(50, { message: "Ім'я не може бути довше 50 символів" }),

    email: z
      .string()
      .max(100, { message: 'Email занадто довгий' })
      .optional()
      .transform((val) => {
        if (!val || val.trim() === '') return undefined; // порожнє поле → undefined
        return val.trim();
      })
      .refine((val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
        message: 'Введіть коректну email адресу',
      }),

    phone: z
      .string()
      .transform((val) => val.replace(/\D/g, '')) // залишаємо тільки цифри
      .refine((val) => val.length === 12, { message: 'Введіть коректний номер телефону' }),

    deliveryType: z.enum(['pickup', 'address'], {
      required_error: 'Оберіть спосіб доставки',
    }),

    address: z
      .string()
      .max(200, { message: 'Адреса занадто довга' })
      .optional()
      .transform((val) => (val?.trim() === '' ? undefined : val)),

    comment: z
      .string()
      .max(500, { message: 'Коментар занадто довгий' })
      .optional()
      .transform((val) => (val?.trim() === '' ? undefined : val)),
  })
  .refine(
    (data) => {
      if (data.deliveryType === 'address') {
        return !!data.address && data.address.trim().length >= 5;
      }
      return true;
    },
    {
      message: 'Введіть коректну адресу',
      path: ['address'],
    },
  );

// Тип для useForm
export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
