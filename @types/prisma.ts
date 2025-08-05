import { Product, ProductGroup } from '@prisma/client';

export type ProductWithProductGroup = Product & { productGroup: ProductGroup };
