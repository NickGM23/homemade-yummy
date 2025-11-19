'use client';

import React from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { auth } from '@/libs/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

import {
  CheckoutCart,
  CheckoutSidebar,
  CheckoutPersonalForm,
  CheckoutDeliveryForm,
  CheckoutCommentForm,
} from '@/components/shared/checkout';
import { useCartStore } from '@/store/cart-store';
import { useCartProducts } from '@/hooks/useCartProducts';
import { useSession } from 'next-auth/react';
import { Api } from '@/services/api-client';
import { CheckoutFormValues, checkoutFormSchema } from '@/components/constants';
import { createOrder } from '@/services/orders';
import { Container } from '@/components/shared/container';
import { Title } from '@/components/shared/title';

export default function CheckoutPage() {
  const router = useRouter();
  const { products, totalPrice } = useCartProducts();
  const { removeFromCart, updateItemQuantity, clearCart } = useCartStore();
  const { data: session } = useSession();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
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

  // reCAPTCHA refs
  const recaptchaRef = React.useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = React.useRef<RecaptchaVerifier | null>(null);

  const [confirmationResult, setConfirmationResult] = React.useState<ConfirmationResult | null>(
    null,
  );
  const [otpSent, setOtpSent] = React.useState(false);
  const [otp, setOtp] = React.useState('');
  const [phoneVerified, setPhoneVerified] = React.useState(false);
  const [phoneError, setPhoneError] = React.useState('');

  const formatPhoneNumber = (phone: string): string => {
    // забираємо всі символи, крім цифр
    const digits = phone.replace(/\D/g, '');
    // якщо номер починається з 380 — додаємо +
    if (digits.startsWith('380')) return `+${digits}`;
    // якщо номер український без коду країни — додаємо +38
    if (digits.startsWith('0')) return `+38${digits}`;
    return `+${digits}`;
  };

  // Ініціалізація reCAPTCHA
  React.useEffect(() => {
    if (!recaptchaRef.current || recaptchaVerifierRef.current) return;

    try {
      recaptchaVerifierRef.current = new RecaptchaVerifier(
        auth, // ✅ Першим параметром іде auth
        recaptchaRef.current as HTMLElement, // ✅ Потім сам контейнер
        {
          size: 'normal',
          callback: () => console.log('reCAPTCHA пройдена ✅'),
        },
      );

      recaptchaVerifierRef.current.render();
    } catch (error) {
      console.error('Помилка ініціалізації reCAPTCHA:', error);
    }
  }, []);

  // Автозаповнення користувача
  React.useEffect(() => {
    if (!session) return;
    (async () => {
      const data = await Api.auth.getMe();
      form.setValue('fullName', data.fullName);
      form.setValue('email', data.email);
    })();
  }, [session]);

  // Відправка OTP
  const handleSendOTP = async () => {
    setPhoneError('');
    const phone = form.getValues('phone');
    if (!phone) {
      setPhoneError('Введіть номер телефону');
      return;
    }

    const formattedPhone = formatPhoneNumber(phone);
    console.log('📞 formattedPhone:', formattedPhone);

    if (!recaptchaVerifierRef.current) {
      setPhoneError('reCAPTCHA не ініціалізована');
      return;
    }

    try {
      const confirmation = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        recaptchaVerifierRef.current,
      );
      setConfirmationResult(confirmation);
      setOtpSent(true);
      toast.success('OTP надіслано на ваш номер ✅');
    } catch (err: any) {
      console.error(err);
      setPhoneError(err.message || 'Помилка при відправці OTP');
      recaptchaVerifierRef.current.clear();
      recaptchaVerifierRef.current = null;
    }
  };

  // Підтвердження OTP
  const handleVerifyOTP = async () => {
    if (!otp) {
      setPhoneError('Введіть OTP для підтвердження номера');
      return;
    }

    if (!confirmationResult) {
      setPhoneError('Спочатку відправте OTP');
      return;
    }

    try {
      await confirmationResult.confirm(otp);
      setPhoneVerified(true);
      toast.success('Телефон підтверджено ✅');
    } catch (err: any) {
      console.error(err);
      setPhoneError(err.message || 'Помилка при підтвердженні OTP');
    }
  };

  // Створення замовлення
  const handleOrderSubmit = async (data: CheckoutFormValues) => {
    if (!phoneVerified) {
      setPhoneError('Будь ласка, підтвердіть телефон перед оформленням замовлення');
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
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Помилка при створенні замовлення');
    }
  };

  return (
    <Container className="mt-2">
      <Title
        text="Оформлення замовлення"
        className="mb-8 text-[22px] font-extrabold lg:text-[32px]"
      />

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleOrderSubmit)}>
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

              {/* reCAPTCHA */}
              <div ref={recaptchaRef} className="mt-2" />

              {/* Кнопка та OTP */}
              {!phoneVerified && (
                <div className="mt-4 flex flex-col gap-2">
                  {!otpSent && (
                    <>
                      <button
                        type="button"
                        onClick={handleSendOTP}
                        className="rounded bg-blue-500 p-3 text-white"
                      >
                        Відправити OTP
                      </button>
                      {phoneError && <p className="text-red-500">{phoneError}</p>}{' '}
                      {/* 👈 додай сюди */}
                    </>
                  )}

                  {otpSent && !phoneVerified && (
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        placeholder="Введіть OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="rounded border p-2"
                      />
                      {phoneError && <p className="text-red-500">{phoneError}</p>}
                      <button
                        type="button"
                        onClick={handleVerifyOTP}
                        className="rounded bg-blue-500 p-2 text-white"
                      >
                        Підтвердити OTP
                      </button>
                    </div>
                  )}
                </div>
              )}

              {phoneVerified && (
                <p className="mt-2 font-semibold text-green-500">Телефон підтверджено ✅</p>
              )}
            </div>

            <div className="order-1 w-full lg:order-2 lg:w-[450px]">
              <CheckoutSidebar
                totalCartAmount={totalPrice}
                countCartItems={products.length}
                phoneVerified={phoneVerified}
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
