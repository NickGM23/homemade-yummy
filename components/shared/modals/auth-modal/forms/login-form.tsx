'use client';

import React from 'react';
import { FormProvider } from 'react-hook-form';
import { TFormLoginValues, formLoginSchema } from './schemas';
import { signIn } from 'next-auth/react';
import toast from 'react-hot-toast';
import { Title } from '../../../title';
import { FormInput, FormInputWithMask } from '@/components/shared/form';
import { Button } from '@/components/ui/button';
import { useZodForm } from '@/hooks/useZodForm';

interface Props {
  onClose?: VoidFunction;
}

export const LoginForm: React.FC<Props> = ({ onClose }) => {
  const form = useZodForm(formLoginSchema, {
    mode: 'onChange',
    defaultValues: {
      phone: '',
      password: '',
    },
  });
  const onSubmit = async (data: TFormLoginValues) => {
    try {
      // `data.phone` — вже самі цифри (380XXXXXXXXX).
      const resp = await signIn('credentials', {
        phone: data.phone,
        password: data.password,
        redirect: false,
      });

      if (!resp?.ok) {
        throw Error();
      }

      toast.success('Ви успішно увійшли в акаунт', {
        icon: '✅',
      });

      onClose?.();
    } catch (error) {
      console.error('Error [LOGIN]', error);
      toast.error('Не вдалось увійти в акаунт', {
        icon: '❌',
      });
    }
  };

  return (
    <FormProvider {...form}>
      <form
        className="flex flex-col gap-5"
        onSubmit={form.handleSubmitZod(onSubmit)}
        autoComplete="off"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between bg-white pb-1 pr-8">
          <div className="mr-2">
            <Title text="Вхід в акаунт" size="md" className="font-bold" />
            <p className="text-gray-400">Введіть номер телефону, щоб увійти в свій акаунт</p>
          </div>
          {/* <img src="/assets/images/phone-icon.png" alt="phone-icon" width={60} height={60} /> */}
        </div>

        <FormInputWithMask
          name="phone"
          label="Телефон"
          required
          aria-label="Телефон"
          autoComplete="off"
        />
        <FormInput
          name="password"
          label="Пароль"
          type="password"
          required
          // Chrome ігнорує "off" для паролів, але шанує "new-password": так він не пропонує
          // збережені паролі й не показує вікно «Керувати паролями» під полями входу.
          autoComplete="new-password"
        />

        <div className="sticky bottom-0 z-10 bg-white pt-1">
          <Button
            loading={form.formState.isSubmitting}
            className="h-12 w-full text-base"
            type="submit"
          >
            Увійти
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
