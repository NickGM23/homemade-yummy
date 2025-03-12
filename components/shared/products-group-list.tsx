'use client';

import React from 'react';
import { Title } from './title';
import { ProductCard } from './product-card';
import { PRODUCTS } from '@/data/products';
import { useIntersection } from 'react-use';
import { Categories } from '@/components/shared/categories';
import { useCategoryStore } from '@/store/category';

//import { useEffect } from 'react';

const result = PRODUCTS;

const cats = [
  'Вареники',
  'Пельмені',
  'Котлети',
  'Крученики',
  'Фрикадельки',
  'Зрази картопляні',
  'Налисники',
  'Сирники',
  'Тефтелі',
  'Голубці',
  'Готові страви',
];

const catsInfo = [
  'varenik',
  'pelmen',
  'kotleta',
  'kruchenyk',
  'frykadelka',
  'zrazy',
  'nalysnyky',
  'syrmyky',
  'tefteli',
  'golubzi',
  'gotoviStruvy',
];

interface Props {
  idProductGroup: number;
  className?: string;
}

export const ProductsGroupList: React.FC<Props> = ({ idProductGroup, className }) => {
  const setActiveIdProductGroup = useCategoryStore((state) => state.setActiveId);
  const intersectionRef = React.useRef(null);
  const intersection = useIntersection(intersectionRef, {
    threshold: 0.4,
  });

  React.useEffect(() => {
    if (intersection?.isIntersecting) {
      //console.log(idProductGroup, catsInfo[idProductGroup - 1]);
      setActiveIdProductGroup(idProductGroup);
    }
  });
  return (
    <div className={className} id={catsInfo[idProductGroup - 1]} ref={intersectionRef}>
      <Title
        text={cats[idProductGroup - 1]}
        size="lg"
        className="sticky top-[112px] mb-4 bg-white font-extrabold"
      />
      <div className="relation flex flex-wrap gap-4">
        {result
          .filter((pr) => pr.idProductGroup === idProductGroup)
          //   .sort((a, b) => (a['price'] > b['price'] ? -1 : 1))
          .map((product, index) => (
            <ProductCard
              key={index}
              className="duration-500 hover:-translate-y-2 hover:shadow-2xl"
              groupName={catsInfo[idProductGroup - 1]}
              price={product.price}
              name={product.name}
              unitWeight={product.unitWeight}
              imageUrl={product.imageUrl}
            />
          ))}
      </div>
    </div>
  );
};
