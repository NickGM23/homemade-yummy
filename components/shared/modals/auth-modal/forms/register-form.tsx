'use client';

import React from 'react';
import { FormProvider } from 'react-hook-form';
import toast from 'react-hot-toast';
import { signIn } from 'next-auth/react';
import { formRegisterSchema, TFormRegisterValues } from './schemas';
import { FormInput, FormInputWithMask } from '@/components/shared/form';
import { SmsCodeForm } from '@/components/shared/sms-code-form';
import { Title } from '@/components/shared/title';
import { Button } from '@/components/ui';
import { useZodForm } from '@/hooks/useZodForm';
import { useRevalidateField } from '@/hooks/useRevalidateField';
import { Api } from '@/services/api-client';
import { getApiErrorMessage } from '@/services/errors';
import type { CodeSentResponse } from '@/services/verification';

interface Props {
  onClose?: VoidFunction;
  onClickLogin?: VoidFunction;
}

// Реєстрація у два кроки: дані форми -> SMS-код. Користувач створюється на сервері лише після
// підтвердження коду, тож до цього моменту форма просто тримає введені значення.
export const RegisterForm: React.FC<Props> = ({ onClose }) => {
  const form = useZodForm(formRegisterSchema, {
    mode: 'onChange',
    defaultValues: {
      phone: '',
      fullName: '',
      password: '',
      confirmPassword: '',
    },
  });
  useRevalidateField(form, 'password', 'confirmPassword');
  const [verification, setVerification] = React.useState<CodeSentResponse | null>(null);
  // Дані для автоматичного входу одразу після підтвердження коду.
  const [credentials, setCredentials] = React.useState<{ phone: string; password: string } | null>(
    null,
  );

  const onSubmit = async (data: TFormRegisterValues) => {
    try {
      const sent = await Api.auth.startRegistration({
        phone: data.phone,
        fullName: data.fullName,
        password: data.password,
      });

      setCredentials({ phone: data.phone, password: data.password });
      setVerification(sent);
    } catch (err) {
      console.error('Error [REGISTER_START]', err);
      toast.error(getApiErrorMessage(err, 'Не вдалося надіслати код'), { icon: '❌' });
    }
  };

  const handleConfirmCode = async (code: string) => {
    if (!verification || !credentials) return;

    try {
      await Api.auth.confirmRegistration(verification.verificationId, code);
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Не вдалося підтвердити код'));
    }

    const resp = await signIn('credentials', { ...credentials, redirect: false });

    if (resp?.ok) {
      toast.success('Реєстрація успішна. Ви увійшли в акаунт', { icon: '✅' });
    } else {
      toast.success('Реєстрація успішна. Увійдіть в акаунт', { icon: '✅' });
    }

    onClose?.();
  };

  const handleResendCode = async () => {
    if (!verification) return;

    try {
      setVerification(await Api.auth.resendRegistrationCode(verification.verificationId));
    } catch (err) {
      throw new Error(getApiErrorMessage(err, 'Не вдалося надіслати код'));
    }
  };

  if (verification) {
    return (
      <div className="flex flex-col gap-5">
        <div>
          <Title text="Підтвердження номера" size="md" className="font-bold" />
          <p className="text-gray-400">
            Ми надіслали код на номер{' '}
            <span className="font-semibold text-foreground">{verification.maskedPhone}</span>.
            Введіть його, щоб завершити реєстрацію.
          </p>
        </div>

        <SmsCodeForm
          resendAvailableAt={verification.resendAvailableAt}
          submitLabel="Підтвердити і зареєструватись"
          onConfirm={handleConfirmCode}
          onResend={handleResendCode}
        />

        <button
          type="button"
          onClick={() => setVerification(null)}
          className="self-start text-sm text-muted-foreground underline"
        >
          Змінити дані
        </button>
      </div>
    );
  }

  return (
    <FormProvider {...form}>
      <form className="flex flex-col gap-5" onSubmit={form.handleSubmitZod(onSubmit)}>
        <div>
          <Title text="Реєстрація" size="md" className="font-bold" />
          <p className="text-gray-400">Ми надішлемо SMS з кодом на ваш номер телефону</p>
        </div>

        <FormInputWithMask
          name="phone"
          label="Телефон"
          required
          aria-label="Телефон"
          autoComplete="tel"
        />
        <FormInput name="fullName" label="Ім'я" required autoComplete="name" />
        <FormInput
          name="password"
          label="Пароль"
          type="password"
          required
          autoComplete="new-password"
        />
        <FormInput
          name="confirmPassword"
          label="Підтвердіть пароль"
          type="password"
          required
          autoComplete="new-password"
        />

        <Button loading={form.formState.isSubmitting} className="h-12 text-base" type="submit">
          Отримати код
        </Button>
      </form>
    </FormProvider>
  );
};
