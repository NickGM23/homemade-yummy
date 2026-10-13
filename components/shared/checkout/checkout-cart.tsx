'use client';

import React from 'react';
import { WhiteBlock } from '../white-block';
import { cn } from '@/lib/utils';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { FullCartItem } from '@/hooks/useCartProducts';
import { CartItemRow } from '../cart-item-row';

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
  className,
}) => {
  return (
    <WhiteBlock title="Ваші вибрані товари" className={cn(className)}>
      <div className="flex flex-col gap-5">
        <TooltipProvider>
          <div className="mt-4 flex flex-1 flex-col gap-4 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-center text-gray-500">Корзина порожня</p>
            ) : (
              cart.map((item) => (
                <CartItemRow
                  key={item.id}
                  item={item}
                  removeFromCart={removeFromCart}
                  updateItemQuantity={updateItemQuantity}
                />
              ))
            )}
          </div>
        </TooltipProvider>
      </div>
    </WhiteBlock>
  );
};
