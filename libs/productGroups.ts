import { cache } from 'react';
import { prisma } from '@/libs/prisma';
import type { ProductGroupWithProducts } from '@/services/product-groups';

export const fetchActiveProductGroupsWithProducts = cache(
  async (): Promise<ProductGroupWithProducts[]> => {
    return prisma.productGroup.findMany({
      where: { isDeleted: false },
      include: {
        products: {
          where: { isDeleted: false },
          orderBy: { positionNumber: 'asc' },
        },
      },
      orderBy: { positionNumber: 'asc' },
    });
  },
);
