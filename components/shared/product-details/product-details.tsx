'use client';

import { useState } from 'react';
import { SerializedProductWithProductGroup } from '@/@types/prisma';
import { Title } from '../title';

interface Props {
  className?: string;
  product: SerializedProductWithProductGroup;
}

export const ProductDetails: React.FC<Props> = ({ className, product }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Визначаємо чи пристрій великий (через matchMedia)
  const isLargeScreen =
    typeof window !== 'undefined'
      ? window.matchMedia('(min-width: 768px)').matches // Tailwind md breakpoint
      : false;

  const toggleImage = () => {
    if (!isLargeScreen) return; // на мобілці не розгортаємо
    setIsFullScreen((prev) => !prev);
  };

  return (
    <div
      className={`relative my-10 flex flex-col items-center justify-center gap-5 px-4 ${
        isFullScreen ? 'fixed inset-0 z-50 bg-white/80' : ''
      }`}
    >
      {!isFullScreen && (
        <>
          <Title text={product.name} size="md" className="font-bold" />
          <Title
            text={`Група товарів - "${product.productGroup.name}"`}
            size="sm"
            className="font-bold"
          />
        </>
      )}

      <img
        onClick={toggleImage}
        src={product.imageUrl ?? undefined}
        alt={product.name}
        className={`cursor-pointer transition-all duration-300 ${
          isFullScreen
            ? 'max-w-screen h-auto max-h-screen w-auto object-contain p-4'
            : 'h-[225px] w-96 max-w-full object-cover'
        }`}
      />
    </div>
  );
};
