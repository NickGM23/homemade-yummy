import { Container } from '@/components/shared/container';
import { Title } from '@/components/shared/title';
import { Categories } from '@/components/shared/categories';
import React from 'react';
import { ProductGroupItem } from '@/components/shared/product-group-item';
import { ProductGroup, Product } from '@prisma/client';
import { prisma } from '@/libs/prisma';
import { cn } from '@/lib/utils';
type ProductGroupWithProducts = ProductGroup & {
  products: Product[];
};

export default async function Home() {
  const productGroups: ProductGroupWithProducts[] = await prisma.productGroup.findMany({
    where: {
      isDeleted: false,
    },
    include: {
      products: {
        where: {
          isDeleted: false,
        },
        orderBy: {
          positionNumber: 'asc',
        },
      },
    },
    orderBy: {
      positionNumber: 'asc',
    },
  });

  return (
    <section className="mb-4 min-h-screen rounded-3xl bg-white">
      <div className="top-0 z-[1] bg-white py-5 max-sm:hidden max-sm:opacity-0 sm:sticky sm:shadow-lg sm:shadow-black/5">
        <Container className="mt-2">
          <Title text="Всі смаколики" size="lg" className="font-extrabold" />
        </Container>

        <Container className="relative mt-5 flex gap-2">
          <Categories productGroupsWithProducts={productGroups} />
        </Container>
      </div>

      {productGroups.map(
        (productGroup) =>
          productGroup.products.length > 0 && (
            <Container
              key={productGroup.id}
              className={cn(productGroup.codeGroup, 'mb-10 mt-10 max-sm:mt-6')}
            >
              <ProductGroupItem productGroup={productGroup} />
            </Container>
          ),
      )}
    </section>
  );
}
