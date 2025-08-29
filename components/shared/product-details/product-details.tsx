'use client';

import { useState } from 'react';
import { ProductWithProductGroup } from '@/@types/prisma';
import { Title } from '../title';

interface Props {
  className?: string;
  product: ProductWithProductGroup;
}

export const ProductDetails: React.FC<Props> = ({ className, product }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleImage = () => {
    setIsFullScreen((prev) => !prev);
  };

  return (
    <div
      className={`relative my-10 flex flex-col items-center justify-center gap-5 px-4 ${
        isFullScreen ? 'fixed inset-0 z-50 bg-black/90' : ''
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
        src={product.imageUrl}
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
