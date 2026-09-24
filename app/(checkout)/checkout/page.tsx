'use client';

import React from 'react';
import { FormProvider } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

import {
  CheckoutCart,
  CheckoutSidebar,
  CheckoutPersonalForm,
  CheckoutDeliveryForm,
  CheckoutCommentForm,
  CheckoutPhoneVerification,
} from '@/components/shared/checkout';
import { useCartStore } from '@/store/cart-store';
import { useCartProducts } from '@/hooks/useCartProducts';
import { usePhoneVerification } from '@/hooks/usePhoneVerification';
import { useSession } from 'next-auth/react';
import { Api } from '@/services/api-client';
import { checkoutFormSchema, CheckoutFormOutput } from '@/components/constants';
import { createOrder } from '@/services/orders';
import { Container } from '@/components/shared/container';
import { Title } from '@/components/shared/title';
import { useZodForm } from '@/hooks/useZodForm';

export default function CheckoutPage() {
  const router = useRouter();
  const { products, totalPrice } = useCartProducts();
  const { removeFromCart, updateItemQuantity, clearCart } = useCartStore();
  const { data: session } = useSession();

  const form = useZodForm(checkoutFormSchema, {
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      comment: '',
      deliveryType: 'pickup',
    },
  });

  const phoneVerification = usePhoneVerification({ getPhone: () => form.getValues('phone') });

  // Автозаповнення користувача
  React.useEffect(() => {
    if (!session) return;
    (async () => {
      const data = await Api.auth.getMe();
      form.setValue('fullName', data.fullName);
      form.setValue('email', data.email);
    })();
  }, [session]);

  // Створення замовлення
  const handleOrderSubmit = async (data: CheckoutFormOutput) => {
    if (!phoneVerification.phoneVerified) {
      phoneVerification.setPhoneError(
        'Будь ласка, підтвердіть телефон перед оформленням замовлення',
      );
      return;
    }

    const deliveryType = data.deliveryType;
    const shippingAmount =
      totalPrice === 0 ? 0 : deliveryType === 'pickup' ? 0 : totalPrice >= 1000 ? 0 : 75;

    const orderData = {
      userId: session?.user?.id ? Number(session.user.id) : undefined,
      fullName: data.fullName,
      email: data.email || undefined,
      phone: data.phone,
      deliveryType: data.deliveryType,
      address: data.address,
      comment: data.comment,
      shippingAmount,
      totalAmount: totalPrice + shippingAmount,
      items: products.map((p) => ({
        productId: p.id,
        quantity: p.quantity,
        price: p.price,
        amount: p.price * p.quantity,
      })),
    };

    try {
      await createOrder(orderData);
      router.push('/checkout/success');
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : 'Помилка при створенні замовлення');
    }
  };

  return (
    <Container className="mt-2">
      <Title
        text="Оформлення замовлення"
        className="mb-8 text-[22px] font-extrabold lg:text-[32px]"
      />

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmitZod(handleOrderSubmit)}>
          <div className="flex flex-col-reverse gap-2 lg:flex-row lg:gap-10">
            <div className="order-2 mb-10 flex flex-1 flex-col gap-6 lg:order-1">
              <CheckoutCart
                cart={products}
                removeFromCart={removeFromCart}
                updateItemQuantity={updateItemQuantity}
                clearCart={clearCart}
              />

              <CheckoutPersonalForm />
              <CheckoutDeliveryForm />
              <CheckoutCommentForm />

              <CheckoutPhoneVerification {...phoneVerification} />
            </div>

            <div className="order-1 w-full lg:order-2 lg:w-[450px]">
              <CheckoutSidebar
                totalCartAmount={totalPrice}
                countCartItems={products.length}
                phoneVerified={phoneVerification.phoneVerified}
              />
            </div>
          </div>

          {/*<button
            type="submit"
            disabled={!phoneVerified}
            className={`mt-4 w-full rounded p-3 text-white ${
              phoneVerified ? 'bg-orange-500' : 'cursor-not-allowed bg-gray-400'
            }`}
          >
            Підтвердити замовлення
          </button>*/}
        </form>
      </FormProvider>
    </Container>
  );
}
