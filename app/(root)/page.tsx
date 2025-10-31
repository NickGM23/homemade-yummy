'use client';

import { Container } from '@/components/shared/container';
import { Title } from '@/components/shared/title';
import { Categories } from '@/components/shared/categories';
import { ProductCard } from '@/components/shared/product-card';
import { SortPopup } from '@/components/shared/sort-popup';
import { PRODUCTS } from '@/data/products';
import React from 'react';
import { ProductsGroupList } from '@/components/shared/products-group-list';
import { useState, useEffect } from 'react';
import { prisma } from '@/libs/prisma';
import { ProductGroupItem } from '@/components/shared/product-group-item';
import { ProductGroup, Product } from '@prisma/client';
import { Api } from '@/services/api-client';
import { cn } from '@/lib/utils';
import { Header } from '@/components/shared/header';

const result = PRODUCTS;
type ProductGroupWithProducts = ProductGroup & {
  products: Product[];
};

export default function Home() {
  const [isAtTop, setIsAtTop] = useState(true);
  const [isShowSortPopup, setIsShowSortPopup] = useState(false);
  const [productGroups, setProductGroups] = React.useState<ProductGroupWithProducts[]>([]);

  const handleScroll = () => {
    // Перевіряємо, чи находимося в верхній частині вікна
    if (window.scrollY === 0) {
      setIsAtTop(true);
    } else {
      setIsAtTop(false);
    }
  };

  useEffect(() => {
    // Додаємо подію прокрутки
    window.addEventListener('scroll', handleScroll);

    // Очищаємо подію при відмонтованні компонента
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    // Прокручування до верхньої частини сторінки
    window.scrollTo({
      top: 0,
      behavior: 'smooth', // забезпечує плавну анімацію прокрутки
    });
  };

  React.useEffect(() => {
    async function fetchStories() {
      Api.product_groups.GetAllProductGroups().then((items) => setProductGroups(items));
    }

    fetchStories();
  }, []);

  return (
    <section className="mb-4 min-h-screen rounded-3xl bg-white">
      <div className="top-0 z-[1] bg-white py-5 max-sm:hidden max-sm:opacity-0 sm:sticky sm:shadow-lg sm:shadow-black/5">
        <Container className="mt-2">
          <Title text="Всі смаколики" size="lg" className="font-extrabold" />
        </Container>
        <Container className="relative mt-5 flex gap-2">
          <Categories productGroupsWithProducts={productGroups} />
          {isShowSortPopup && <SortPopup />}
        </Container>
      </div>
      {productGroups &&
        productGroups.map(
          (productGroup, index) =>
            productGroup.products &&
            productGroup.products.length > 0 && (
              <Container
                key={productGroup.id}
                className={cn(productGroup.codeGroup, 'mb-10 mt-10 max-sm:mt-6')}
              >
                <ProductGroupItem productGroup={productGroup} />
              </Container>
            ),
        )}
      {isAtTop === false && (
        <div
          onClick={scrollToTop}
          className="fixed bottom-16 right-8 z-50 flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-slate-200"
        >
          <img className="z-30" src="/footer/arrow_up.svg" alt=""></img>
        </div>
      )}
    </section>
  );
}
