'use client';

import { Title } from '@/components/shared/title';
import { Container } from '@/components/shared/container';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import React from 'react';
import { CheckoutCart, CheckoutSidebar } from '@/components/shared/checkout';
import { useCartStore } from '@/store/cart-store';

export default function CheckoutPage() {
  const {
    cart,
    removeFromCart,
    totalItems,
    totalPrice,
    clearCart,
    updateItemQuantity,
    countItems,
  } = useCartStore();
  return (
    <Container className="mt-2">
      <Title
        text="Оформлення замовлення"
        className="mb-8 text-[22px] font-extrabold lg:text-[32px]"
      />

      <form>
        <div className="flex flex-col-reverse gap-2 lg:flex-row lg:gap-10">
          {/* ліва частина */}
          <div className="order-2 mb-10 flex flex-1 flex-col gap-6 lg:order-1">
            <CheckoutCart
              cart={cart}
              removeFromCart={removeFromCart}
              updateItemQuantity={updateItemQuantity}
              clearCart={clearCart}
            />
          </div>

          {/* права частина */}
          <div className="order-1 w-full lg:order-2 lg:w-[450px]">
            <CheckoutSidebar totalCartAmount={totalPrice()} countCartItems={countItems()} />
          </div>
        </div>
      </form>
    </Container>
  );
}
