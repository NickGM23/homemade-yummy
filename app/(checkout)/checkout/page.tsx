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
  CheckoutSmsConfirm,
} from '@/components/shared/checkout';
import { useCartStore } from '@/store/cart-store';
import { useCartProducts } from '@/hooks/useCartProducts';
import { useSession } from 'next-auth/react';
import { Api } from '@/services/api-client';
import { checkoutFormSchema, CheckoutFormOutput } from '@/components/constants';
import { formatPhoneForMask } from '@/components/constants/phone-mask';
import type { CodeSentResponse } from '@/services/verification';
import { getApiErrorMessage } from '@/services/errors';
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

  // Дані SMS-підтвердження; поки `null` — вікно з вводом коду закрите.
  const [verification, setVerification] = React.useState<CodeSentResponse | null>(null);

  // `form` — новий об'єкт на кожен рендер, тому в залежності беремо лише стабільні методи
  // react-hook-form (інакше ефект і запит getMe крутилися б у циклі).
  const { setValue, trigger } = form;

  // Залежимо від id користувача (примітив), а не від об'єкта `session`: NextAuth перезапитує сесію
  // при поверненні у вкладку/вікно, і новий об'єкт запускав би автозаповнення знову —
  // зайвий запит getMe і перезапис того, що користувач уже встиг змінити у формі.
  const userId = session?.user?.id;

  // Автозаповнення користувача
  React.useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const data = await Api.auth.getMe();
        // Користувача з сесії могли видалити з БД — тоді сервер повертає null.
        if (!data) return;
        setValue('fullName', data.fullName);
        // email/телефон можуть бути відсутні (реєстрація по телефону / вхід через провайдера).
        setValue('email', data.email ?? '');
        if (data.phone) {
          // Поле телефону — з маскою, тож підставляємо вже у її форматі. Збіг із підтвердженим
          // номером акаунта дозволяє оформити замовлення без SMS.
          setValue('phone', formatPhoneForMask(data.phone));
        }
        // setValue сам не перераховує isValid — без цього кнопка лишилась би неактивною.
        trigger();
      } catch (err) {
        // Автозаповнення — зручність, не обов'язкова умова: форму можна заповнити вручну.
        console.error('Error [CHECKOUT_AUTOFILL]', err);
      }
    })();
  }, [userId, setValue, trigger]);

  const finishOrder = () => {
    clearCart();
    router.push('/checkout/success');
  };

  // Крок 1: надсилаємо замовлення на сервер — той шле SMS-код (замовлення ще не створюється).
  // Ціни й суми сервер рахує сам, тому з клієнта йдуть лише товари й кількість.
  const handleOrderSubmit = async (data: CheckoutFormOutput) => {
    try {
      const res = await Api.checkout.sendOrderCode({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        deliveryType: data.deliveryType,
        address: data.address,
        comment: data.comment,
        items: products.map((p) => ({ productId: p.id, quantity: p.quantity })),
      });

      if (res.status === 'created') {
        // Номер користувача вже підтверджений — SMS не потрібне.
        finishOrder();
      } else {
        setVerification(res);
      }
    } catch (err) {
      console.error(err);
      toast.error(getApiErrorMessage(err, 'Помилка при створенні замовлення'));
    }
  };

  // Крок 2: вірний код з SMS — замовлення створюється й зберігається.
  const handleConfirmCode = async (code: string) => {
    if (!verification) return;

    try {
      await Api.checkout.confirmOrder(verification.verificationId, code);
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Не вдалося підтвердити код'));
    }
    finishOrder();
  };

  const handleResendCode = async () => {
    if (!verification) return;

    try {
      setVerification(await Api.checkout.resendOrderCode(verification.verificationId));
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Не вдалося надіслати код'));
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
            </div>

            <div className="order-1 w-full lg:order-2 lg:w-[450px]">
              <CheckoutSidebar totalCartAmount={totalPrice} countCartItems={products.length} />
            </div>
          </div>
        </form>
      </FormProvider>

      {verification && (
        <CheckoutSmsConfirm
          open
          maskedPhone={verification.maskedPhone}
          resendAvailableAt={verification.resendAvailableAt}
          onConfirm={handleConfirmCode}
          onResend={handleResendCode}
          onClose={() => setVerification(null)}
        />
      )}
    </Container>
  );
}
