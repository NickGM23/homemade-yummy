'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart-store';
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { TooltipProvider } from '@/components/ui/tooltip';
import { CartItemRow } from '../../cart-item-row';
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
