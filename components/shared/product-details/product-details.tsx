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
        className={`cursor-pointer object-cover transition-all duration-300 ${
          isFullScreen
            ? 'fixed left-1/2 top-1/2 z-50 h-full max-h-full w-full max-w-full -translate-x-1/2 -translate-y-1/2'
            : 'h-[225px] w-96 max-w-full'
        }`}
        src={product.imageUrl}
        alt={product.name}
      />
    </div>
  );
};
