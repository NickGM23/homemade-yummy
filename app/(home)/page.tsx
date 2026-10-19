import { Container } from '@/components/shared/container';
import { Title } from '@/components/shared/title';
import { Categories } from '@/components/shared/categories';
import { StickyCartButton } from '@/components/shared/sticky-cart-button';
import React from 'react';
import { ProductGroupItem } from '@/components/shared/product-group-item';
import { fetchActiveProductGroupsWithProducts, toCategories } from '@/server/productGroups';
import { cn } from '@/lib/utils';

export const revalidate = 60;

export default async function Home() {
  const productGroups = await fetchActiveProductGroupsWithProducts();

  return (
    <section className="mb-4 min-h-screen rounded-3xl bg-white">
      <div className="top-0 z-[1] bg-white py-5 max-sm:hidden max-sm:opacity-0 sm:sticky sm:shadow-lg sm:shadow-black/5">
        <Container className="relative mt-2">
          <Title text="Всі смаколики" size="lg" className="font-extrabold" />
          {/* Абсолютно, щоб поява кнопки не змінювала висоту прилиплої панелі. */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <StickyCartButton />
          </div>
        </Container>

        <Container className="relative mt-5 flex gap-2">
          <Categories categories={toCategories(productGroups)} />
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
