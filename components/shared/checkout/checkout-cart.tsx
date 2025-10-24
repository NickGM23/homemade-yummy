'use client';

import React, { useEffect, useState } from 'react';
import { WhiteBlock } from '../white-block';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CountButton } from '../count-button';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

type FullCartItem = {
  id: number;
  name: string;
  imageUrl: string;
  price: number;
  minPartQuantity: number;
  minQuantity: number;
  quantity: number;
};

interface Props {
  cart: FullCartItem[];
  removeFromCart: (id: number) => void;
  updateItemQuantity: (id: number, quantity: number) => void;
  clearCart?: () => void;
  loading?: boolean;
  className?: string;
}

export const CheckoutCart: React.FC<Props> = ({
  cart,
  removeFromCart,
  updateItemQuantity,
  clearCart,
  loading,
  className,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onClickCountButton = (
    id: number,
    quantity: number,
    minPartQuantity: number | string, // тимчасово допускаємо string
    type: 'plus' | 'minus',
  ) => {
    const minPart = Number(minPartQuantity);
    const newQuantity = type === 'plus' ? quantity + minPart : quantity - minPart;

    updateItemQuantity(id, newQuantity);
  };

  return (
    <WhiteBlock title="Ваші вибрані товари" className={cn(className)}>
      <div className="flex flex-col gap-5">
        <TooltipProvider>
          <div className="mt-4 flex flex-1 flex-col gap-4 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-center text-gray-500">Корзина порожня</p>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b pb-2 pr-2 last:border-b-0"
                >
                  <div>
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
                      onClick={(type) =>
                        onClickCountButton(item.id, item.quantity, item.minPartQuantity, type)
                      }
                    />

                    {isMounted ? (
                      <Tooltip delayDuration={200}>
                        <TooltipTrigger asChild>
                          <Button
                            tabIndex={-1}
                            variant="destructive"
                            size="sm"
                            onClick={() => removeFromCart(item.id)}
                          >
                            <Trash size={16} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">Видалити</TooltipContent>
                      </Tooltip>
                    ) : (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </TooltipProvider>
      </div>
    </WhiteBlock>
  );
};
