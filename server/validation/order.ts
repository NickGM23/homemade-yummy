import { z } from 'zod';

const orderItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive().max(999),
});

export const createOrderSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(3, { message: "Ім'я повинно бути не менше 3-х символів" })
      .max(50, { message: "Ім'я не може бути довше 50 символів" }),
    email: z
      .string()
      .trim()
      .email({ message: 'Введіть коректну email адресу' })
      .max(100, { message: 'Email занадто довгий' })
      .optional(),
    phone: z.string().trim().min(1, { message: 'Введіть номер телефону' }),
    deliveryType: z.enum(['pickup', 'address'], {
      required_error: 'Оберіть спосіб доставки',
    }),
    address: z.string().trim().max(200, { message: 'Адреса занадто довга' }).optional(),
    comment: z.string().trim().max(500, { message: 'Коментар занадто довгий' }).optional(),
    items: z.array(orderItemSchema).min(1, { message: 'Кошик порожній' }),
  })
  .refine((data) => (data.deliveryType === 'address' ? !!data.address : true), {
    message: 'Введіть коректну адресу',
    path: ['address'],
  });

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const orderFiltersSchema = z.object({
  userId: z.number().int().positive().optional(),
  status: z.enum(['PENDING', 'ACCEPTED', 'SUCCEEDED', 'CANCELLED']).optional(),
  fullName: z.string().trim().optional(),
  email: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  dateFrom: z.string().date().optional(),
  dateTo: z.string().date().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
});

export type OrderFiltersInput = z.infer<typeof orderFiltersSchema>;
