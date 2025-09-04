'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart-store';
import React from 'react';
import { ArrowLeft, Trash } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CountButton } from '../..';

interface CartModalProps {
  open: boolean;
  onClose: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({ open, onClose }) => {
  const { cart, removeFromCart, totalItems, totalPrice, clearCart, updateItemQuantity } =
    useCartStore();

  // 👇 Додали перевірку, що компонент змонтовано
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onClickCountButton = (id: number, quantity: number, type: 'plus' | 'minus') => {
    const newQuantity = type === 'plus' ? quantity + 1 : quantity - 1;
    updateItemQuantity(id, newQuantity);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="flex max-h-[90vh] w-full max-w-full flex-col overflow-hidden rounded-none bg-white px-6 py-6 sm:h-auto sm:w-[500px] sm:max-w-[500px] sm:rounded-lg sm:p-8"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">🛒 Моя корзина</DialogTitle>
        </DialogHeader>

        <TooltipProvider>
          <div className="mt-4 flex flex-1 flex-col gap-4 overflow-y-auto">
            {cart.length === 0 ? (
              <p className="text-center text-gray-500">Корзина порожня</p>
            ) : (
              cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between border-b pb-2 pr-2 last:border-b-0"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      {item.quantity} × {item.price.toFixed(2)} ={' '}
                      {(item.quantity * item.price).toFixed(2)} грн
                    </p>
                  </div>

                  <div className="flex items-center gap-3 sm:gap-6">
                    <CountButton
                      size="sm"
                      value={item.quantity}
                      onClick={(type) => onClickCountButton(item.productId, item.quantity, type)}
                    />

                    {/* 👇 Тільки якщо змонтовано */}
                    {isMounted ? (
                      <Tooltip delayDuration={200}>
                        <TooltipTrigger asChild>
                          <Button
                            tabIndex={-1}
                            variant="destructive"
                            size="sm"
                            onClick={() => removeFromCart(item.productId)}
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
                        onClick={() => removeFromCart(item.productId)}
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

        {cart.length > 0 && (
          <div className="mt-4 space-y-3 border-t pt-4">
            <div className="flex justify-between font-medium">
              <span>Товарів:</span>
              <span>{totalItems()}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <span>Сума:</span>
              <span>{totalPrice().toFixed(2)} грн</span>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                className="w-full"
                onClick={() => {
                  alert('Переходимо до оформлення...(буде реалізовано в наступних версіях)');
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

        <Button variant="outline" className="mt-6 w-full" onClick={onClose}>
          <ArrowLeft />
          Продовжити покупки
        </Button>
      </DialogContent>
    </Dialog>
  );
};
