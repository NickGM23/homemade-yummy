import { cache } from 'react';
import { prisma } from '@/server/prisma';
import type { ProductGroupWithProducts } from '@/services/product-groups';

export const fetchActiveProductGroupsWithProducts = cache(
  async (): Promise<ProductGroupWithProducts[]> => {
    const productGroups = await prisma.productGroup.findMany({
      where: { isDeleted: false },
      include: {
        products: {
          where: { isDeleted: false },
          orderBy: { positionNumber: 'asc' },
        },
      },
      orderBy: { positionNumber: 'asc' },
    });

    return productGroups.map((group) => ({
      ...group,
      products: group.products.map((product) => ({
        ...product,
        price: product.price.toNumber(),
        minPartQuantity: product.minPartQuantity.toNumber(),
        minQuantity: product.minQuantity.toNumber(),
      })),
    }));
  },
);
