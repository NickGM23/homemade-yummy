'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Trash } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { FullCartItem } from '@/hooks/useCartProducts';
import { CountButton } from './count-button';

interface Props {
  item: FullCartItem;
  removeFromCart: (id: number) => void;
  updateItemQuantity: (id: number, quantity: number) => void;
}

// Має рендеритись всередині <TooltipProvider>.
export const CartItemRow: React.FC<Props> = ({ item, removeFromCart, updateItemQuantity }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onClickCountButton = (type: 'plus' | 'minus') => {
    const minPart = Number(item.minPartQuantity);
    const newQuantity = type === 'plus' ? item.quantity + minPart : item.quantity - minPart;

    updateItemQuantity(item.id, newQuantity);
  };

  const removeButton = (
    <Button
      variant="destructive"
      size="sm"
      aria-label="Видалити товар"
      onClick={() => removeFromCart(item.id)}
    >
      <Trash size={16} />
    </Button>
  );

  return (
    <div className="flex items-center justify-between border-b pb-2 pr-2 last:border-b-0">
      <div>
        {item.imageUrl && (
          <div className="justify-left flex">
            <Image
              className="h-[32px] w-[32px] max-w-full object-cover"
              src={item.imageUrl}
              alt={item.name}
              width={32}
              height={32}
            />
          </div>
        )}
        <p className="font-medium">{item.name}</p>
        <p className="text-sm text-gray-600">
          {item.quantity} × {item.price} = {item.quantity * item.price} грн
        </p>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        <CountButton
          size="sm"
          value={item.quantity}
          minValue={item.minQuantity}
          minPartValue={item.minPartQuantity}
          onClick={onClickCountButton}
        />

        {isMounted ? (
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>{removeButton}</TooltipTrigger>
            <TooltipContent side="top">Видалити</TooltipContent>
          </Tooltip>
        ) : (
          removeButton
        )}
      </div>
    </div>
  );
};
