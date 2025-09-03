'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart-store';
import React from 'react';
import { ArrowLeft } from 'lucide-react';
interface CartModalProps {
  open: boolean;
  onClose: () => void;
}

export const CartModal: React.FC<CartModalProps> = ({ open, onClose }) => {
  const { cart, removeFromCart, totalItems, totalPrice, clearCart } = useCartStore();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="mt-0 flex h-screen w-full max-w-full flex-col overflow-y-auto rounded-none bg-white p-6 sm:mt-[10vh] sm:h-auto sm:w-[500px] sm:max-w-[500px] sm:rounded-lg sm:p-8">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">🛒 Моя корзина</DialogTitle>
        </DialogHeader>

        <div className="mt-4 flex flex-1 flex-col gap-4">
          {cart.length === 0 ? (
            <p className="text-center text-gray-500">Корзина порожня</p>
          ) : (
            cart.map((item) => (
              <div key={item.productId} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-600">
                    {item.quantity} × {item.price.toFixed(2)} грн
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeFromCart(item.productId)}
                >
                  Видалити
                </Button>
              </div>
            ))
          )}
        </div>

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
                  // TODO: Navigate to checkout or open checkout modal
                  alert('Переходимо до оформлення...(буде реалізовано в наступних версіях)');
                }}
              >
                Оформити замовлення
              </Button>

              <Button className="w-full" variant="outline" onClick={() => clearCart()}>
                Очистити
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
