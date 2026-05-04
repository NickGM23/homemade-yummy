import { z } from 'zod';

const emptyToUndefined = (val: string) => {
  const trimmed = val.trim();
  return trimmed === '' ? undefined : trimmed;
};

const phoneOnlyDigits = (val: string) => val.replace(/\D/g, '');

export const checkoutFormSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, { message: "Ім'я повинно бути не менше 3-х символів" })
      .max(50, { message: "Ім'я не може бути довше 50 символів" }),

    email: z
      .string()
      .trim()
      .max(100, { message: 'Email занадто довгий' })
      .transform(emptyToUndefined)
      .refine((val) => !val || z.string().email().safeParse(val).success, {
        message: 'Введіть коректну email адресу',
      }),

    phone: z
      .string()
      .trim()
      .transform(phoneOnlyDigits)
      .refine((val) => val.length === 12, {
        message: 'Введіть коректний номер телефону',
      }),

    deliveryType: z.enum(['pickup', 'address'], {
      required_error: 'Оберіть спосіб доставки',
    }),

    address: z
      .string()
      .trim()
      .transform(emptyToUndefined)
      .refine((val) => val === undefined || val.length >= 5, {
        message: 'Введіть коректну адресу',
      }),

    comment: z
      .string()
      .trim()
      .transform(emptyToUndefined)
      .refine((val) => val === undefined || val.length <= 500, {
        message: 'Коментар занадто довгий',
      }),
  })
  .refine(
    (data) =>
      data.deliveryType === 'address' ? data.address != null && data.address.length >= 5 : true,
    {
      message: 'Введіть коректну адресу',
      path: ['address'],
    },
  );

export type CheckoutFormInput = z.input<typeof checkoutFormSchema>;
export type CheckoutFormOutput = z.output<typeof checkoutFormSchema>;
