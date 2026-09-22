'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart-store';
import React from 'react';
import { ArrowLeft, Trash } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CountButton } from '../..';
import { useRouter } from 'next/navigation';
import { useCartProducts } from '@/hooks/useCartProducts';

interface CartModalProps {
  open: boolean;
  onClose: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({ open, onClose }) => {
  const { products, totalPrice } = useCartProducts();
  const { removeFromCart, clearCart, updateItemQuantity } = useCartStore();

  const router = useRouter();

  // 👇 Додали перевірку, що компонент змонтовано
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="sm:px-4lg:w-[600px] flex max-h-[90vh] w-full max-w-full flex-col overflow-hidden rounded-none bg-white sm:h-auto sm:w-[500px] sm:max-w-[500px] sm:rounded-lg sm:px-6 lg:max-w-[600px]"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">🛒 Моя корзина</DialogTitle>
        </DialogHeader>

        <TooltipProvider>
          <div className="mt-2 flex flex-1 flex-col gap-2 overflow-y-auto">
            {products.length === 0 ? (
              <p className="text-center text-gray-500">Корзина порожня</p>
            ) : (
              products.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b pb-2 pr-2 last:border-b-0"
                >
                  <div>
                    {item.imageUrl && (
                      <div className="justify-left flex">
                        <img
                          className="h-[32px] w-[32px] max-w-full object-cover"
                          src={item.imageUrl}
                        ></img>
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
                      onClick={(type) =>
                        onClickCountButton(item.id, item.quantity, item.minPartQuantity, type)
                      }
                    />

                    {/* 👇 Тільки якщо змонтовано */}
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

        {products.length > 0 && (
          <div className="space-y-3 border-t pt-2">
            <div className="flex justify-between font-medium">
              <span>Товарів:</span>
              <span>{products.length}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <span>Сума:</span>
              <span>{totalPrice} грн</span>
            </div>

            <div className="mt-2 flex gap-2">
              <Button
                className="w-full"
                onClick={() => {
                  router.push('/checkout');
                }}
              >
                Оформити замовлення
              </Button>

              <Button className="w-full" variant="outline" onClick={() => clearCart()}>
                Очистити 🛒
              </Button>
            </div>
          </div>
        )}

        <Button variant="outline" className="w-full" onClick={onClose}>
          <ArrowLeft />
          Продовжити покупки
        </Button>
      </DialogContent>
    </Dialog>
  );
};
