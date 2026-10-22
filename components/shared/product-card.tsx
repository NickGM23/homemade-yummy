'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '../ui';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';

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

export const ProductCard: React.FC<Props> = ({
  productId,
  name,
  price,
  unitWeight,
  imageUrl,
  className,
}) => {
  const { cart, addToCart } = useCartStore();

  // ✅ Перевіряємо, чи є товар у кошику
  const isInCart = cart.some((item) => item.productId === productId);

  const handleAddToCart = () => {
    if (isInCart) return; // захист від повторного кліку

    addToCart({
      productId,
      quantity: 1,
    });

    toast.success(`Товар "${name}" додано в кошик!`, {
      icon: '✅',
    });
  };

  return (
    <div
      className={cn(
        'flex w-[350px] flex-col overflow-hidden rounded-lg bg-secondary max-sm:w-full',
        className,
      )}
    >
      <div className="flex justify-center max-sm:px-3 max-sm:pt-2">
        <a href={`/product/${productId}`} className="block w-96 max-w-full max-sm:w-auto">
          {/* На телефоні фото не кадрується: висота фіксована, ширина за пропорціями кадру,
              тож rounded-lg закруглює саме фото. */}
          <Image
            className="block h-[225px] w-full object-cover max-sm:h-[142px] max-sm:w-auto max-sm:max-w-full max-sm:rounded-lg max-sm:object-contain"
            src={imageUrl}
            alt={name}
            width={700}
            height={467}
            sizes="(max-width: 640px) 300px, 350px"
          />
        </a>
      </div>

      <Link
        href={`/product/${productId}`}
        title={name}
        className="my-4 h-16 overflow-hidden px-4 text-xl font-semibold transition-colors hover:text-primary hover:underline max-sm:mb-1 max-sm:mt-2 max-sm:line-clamp-2 max-sm:h-10 max-sm:px-3 max-sm:text-base max-sm:leading-5"
      >
        {name}
      </Link>

      <div className="flex items-center justify-between gap-4 px-4 py-2 pb-4 max-sm:gap-2 max-sm:px-3 max-sm:pb-2 max-sm:pt-0">
        <div className="inline-flex gap-2">
          <p className="m-0 text-2xl font-bold text-primary max-sm:text-xl">{price.toString()}</p>
          <p className="m-0 text-xl font-medium max-sm:text-base">{unitWeight}</p>
        </div>

        <Button
          className="max-sm:h-9 max-sm:px-3"
          onClick={handleAddToCart}
          /*disabled={isInCart} // ❗ блокуємо, якщо вже в кошику
          variant={isInCart ? 'secondary' : 'default'} // наприклад, змінюємо стиль*/
        >
          {isInCart ? (
            <>
              <span className="mx-1">Вже додано</span>
              <ShoppingCart size={16} className="relative" strokeWidth={2} />
            </>
          ) : (
            <>
              <span className="mx-1">Додати</span>
              <ShoppingCart size={16} className="relative" strokeWidth={2} />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
