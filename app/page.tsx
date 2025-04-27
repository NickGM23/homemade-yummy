'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Container } from '@/components/shared/container';
import { Title } from '@/components/shared/title';
import { Categories } from '@/components/shared/categories';
import { ProductCard } from '@/components/shared/product-card';
import { SortPopup } from '@/components/shared/sort-popup';
import { PRODUCTS } from '@/data/products';
import React from 'react';
import { ProductsGroupList } from '@/components/shared/products-group-list';
import { useState, useEffect } from 'react';

//import { useEffect } from 'react';

const result = PRODUCTS;

export default function Home() {
  const [isAtTop, setIsAtTop] = useState(true);

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

  // useEffect(() => {
  //   console.log('render');
  // });

  return (
    <section className="mb-4 min-h-screen rounded-3xl bg-white">
      <div className="top-0 z-[1] bg-white py-5 max-sm:hidden max-sm:opacity-0 sm:sticky sm:shadow-lg sm:shadow-black/5">
        <Container className="mt-2">
          <Title text="Всі смаколики" size="lg" className="font-extrabold" />
        </Container>
        <Container className="relative mt-5 flex gap-2">
          <Categories />
          <SortPopup />
        </Container>
      </div>

      <Container className="varenik mt-10 max-sm:mt-6">
        <ProductsGroupList idProductGroup={1} />
      </Container>
      <Container className="pelmen mt-10 max-sm:mt-6">
        <ProductsGroupList idProductGroup={2} />
      </Container>
      <Container className="kotleta mt-10 max-sm:mt-6">
        <ProductsGroupList idProductGroup={3} />
      </Container>
      <Container className="kruchenyk mt-10 max-sm:mt-6">
        <ProductsGroupList idProductGroup={4} />
      </Container>
      <Container className="frykadelka mb-28 mt-10 max-sm:mt-6">
        <ProductsGroupList idProductGroup={5} />
      </Container>

      {/* <Container className="varenik mt-4">
        <Title
          text="Вареники"
          size="lg"
          className="sticky top-[112px] mb-4 bg-white font-extrabold"
        />
        <div className="relation flex flex-wrap gap-4">
          {result
            .filter((pr) => pr.idProductGroup === 1)
            .sort((a, b) => (a['price'] > b['price'] ? -1 : 1))
            .map((product, index) => (
              <ProductCard
                key={index}
                className="duration-500 hover:-translate-y-2 hover:shadow-2xl"
                groupName="Вареники"
                price={product.price}
                name={product.name}
                unitWeight={product.unitWeight}
                imageUrl={product.imageUrl}
              />
            ))}
        </div>
      </Container>
      <Container className="pelmen mt-4">
        <Title
          text="Пельмені"
          size="lg"
          className="sticky top-[112px] mb-4 bg-white font-extrabold"
        />
        <div className="relation flex flex-wrap gap-4">
          {result.map(
            (product, index) =>
              product.idProductGroup === 2 && (
                <ProductCard
                  key={index}
                  className="duration-500 hover:-translate-y-2 hover:shadow-2xl"
                  groupName="Пельмені"
                  price={product.price}
                  name={product.name}
                  unitWeight={product.unitWeight}
                  imageUrl={product.imageUrl}
                />
              ),
          )}
        </div>
      </Container>
      <Container className="kotleta mt-4">
        <Title
          text="Котлети"
          size="lg"
          className="sticky top-[112px] mb-4 bg-white font-extrabold"
        />
        <div className="relation flex flex-wrap gap-4">
          {result.map(
            (product, index) =>
              product.idProductGroup === 3 && (
                <ProductCard
                  key={index}
                  className="duration-500 hover:-translate-y-2 hover:shadow-2xl"
                  groupName="Пельмені"
                  price={product.price}
                  name={product.name}
                  unitWeight={product.unitWeight}
                  imageUrl={product.imageUrl}
                />
              ),
          )}
        </div>
      </Container>
      <Container className="kruchenyk mt-4">
        <Title
          text="Крученики з свинного битка"
          size="lg"
          className="sticky top-[112px] mb-4 bg-white font-extrabold"
        />
        <div className="relation flex flex-wrap gap-4">
          {result.map(
            (product, index) =>
              product.idProductGroup === 4 && (
                <ProductCard
                  key={index}
                  className="duration-500 hover:-translate-y-2 hover:shadow-2xl"
                  groupName="Крученики"
                  price={product.price}
                  name={product.name}
                  unitWeight={product.unitWeight}
                  imageUrl={product.imageUrl}
                />
              ),
          )}
        </div>
      </Container>
      <Container className="frykadelka mt-4">
        <Title
          text="Фрикадельки"
          size="lg"
          className="sticky top-[112px] mb-4 bg-white font-extrabold"
        />
        <div className="relation flex flex-wrap gap-4">
          {result.map(
            (product, index) =>
              product.idProductGroup === 5 && (
                <ProductCard
                  key={index}
                  className="duration-500 hover:-translate-y-2 hover:shadow-2xl"
                  groupName="Фрикадельки"
                  price={product.price}
                  name={product.name}
                  unitWeight={product.unitWeight}
                  imageUrl={product.imageUrl}
                />
              ),
          )}
        </div>
      </Container> */}

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
