import { z } from 'zod';

import { passwordSchema } from '@/components/shared/modals/auth-modal/forms/schemas';

export const updateUserInfoSchema = z.object({
  email: z
    .string()
    .trim()
    .email({ message: 'Введіть коректний email' })
    .max(100, { message: 'Email занадто довгий' }),
  fullName: z
    .string()
    .trim()
    .min(2, { message: "Введіть ім'я" })
    .max(100, { message: "Ім'я занадто довге" }),
  password: passwordSchema.optional(),
});

export type UpdateUserInfoInput = z.infer<typeof updateUserInfoSchema>;
