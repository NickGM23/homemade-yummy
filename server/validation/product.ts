import { z } from 'zod';

export const productByIdsSchema = z.object({
  ids: z.array(z.number().int().positive()).min(1).max(200),
});

export type ProductByIdsInput = z.infer<typeof productByIdsSchema>;
