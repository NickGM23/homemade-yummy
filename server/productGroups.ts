import { cache } from 'react';
import { prisma } from '@/server/prisma';
import type { CategoryItem, ProductGroupWithProducts } from '@/services/product-groups';

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

// Категорії для навігації: лише групи, в яких є товари, і лише поля, потрібні клієнту —
// щоб не передавати в Client Components (і RSC-payload) повні дані всіх товарів.
// Обгорнуто в cache(): layout і page викликають її з одним і тим самим (кешованим) масивом груп,
// тож отримують один екземпляр результату, і React серіалізує його в payload один раз.
export const toCategories = cache((productGroups: ProductGroupWithProducts[]): CategoryItem[] =>
  productGroups
    .filter((group) => group.products.length > 0)
    .map(({ id, name, codeGroup }) => ({ id, name, codeGroup })),
);
