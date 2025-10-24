'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Title } from './title';
import { Button } from '../ui';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { toast } from 'react-hot-toast';

interface Props {
  productId: number;
  groupName: string;
  name: string;
  price: number;
  unitWeight: string;
  count?: number;
  imageUrl: string;
  minPartQuantity: number;
  minQuantity: number;
  className?: string;
}

// interface Props {
//   className?: string;
// }

export const ProductCard: React.FC<Props> = ({
  productId,
  name,
  price,
  unitWeight,
  count,
  imageUrl,
  minPartQuantity,
  minQuantity,
  className,
}) => {
  const { addToCart } = useCartStore();
  return (
    <div
      className={cn('flex w-[350px] flex-col overflow-hidden rounded-lg bg-secondary', className)}
    >
      <div className="flex justify-center">
        <a href={`/product/${productId}`}>
          <img className="h-[225px] w-96 max-w-full object-cover" src={imageUrl} alt={name} />
        </a>
      </div>
      <span title={name} className="my-4 h-16 overflow-hidden px-4 text-xl font-semibold">
        {name}
      </span>
      <div className="flex items-center justify-between gap-4 px-4 py-2 pb-4">
        <div className="inline-flex gap-2">
          <p className="m-0 text-2xl font-bold text-primary">{price.toString()}</p>
          <p className="m-0 text-xl font-medium">{unitWeight}</p>
        </div>
        <Button
          onClick={() => {
            addToCart({
              productId: productId,
              quantity: 1,
            });

            toast.success(`Товар "${name}" додано в кошик!`, {
              icon: '✅',
            });
          }}
        >
          <span className="h-ful mx-1"> Додати </span>
          <ShoppingCart size={16} className="relative" strokeWidth={2} />
        </Button>
      </div>
    </div>
  );
};
