'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { TFormProfileValues, profileSchema } from './modals/auth-modal/forms/schemas';
import { User } from '@prisma/client';
import toast from 'react-hot-toast';
import { signOut } from 'next-auth/react';
import { Container } from './container';
import { Title } from './title';
import { FormInput, FormInputWithMask } from './form';
import { formatPhoneForMask } from '@/components/constants/phone-mask';
import { Button } from '../ui';
import { updateUserInfo } from '@/app/actions';
import { useRevalidateField } from '@/hooks/useRevalidateField';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface Props {
  data: User;
}

export const ProfileForm: React.FC<Props> = ({ data }) => {
  // Пароль/email змінюють лише користувачі, що зареєструвались самі (не через GitHub/Google).
  const isCredentialsUser = data.provider === 'credentials';
  const provider = data.provider;
  const router = useRouter();

  const form = useForm<TFormProfileValues>({
    resolver: zodResolver(profileSchema),
    // Без цього помилка (напр. після очищення поля) не зникає, поки не натиснути «Зберегти».
    mode: 'onChange',
    defaultValues: {
      phone: data.phone ? formatPhoneForMask(data.phone) : '',
      fullName: data.fullName,
      email: data.email ?? '',
      password: '',
      confirmPassword: '',
    },
  });

  useRevalidateField(form, 'password', 'confirmPassword');

  const onSubmit = async (data: TFormProfileValues) => {
    const result = await updateUserInfo({
      email: data.email || null,
      fullName: data.fullName,
      password: data.password || undefined,
    });

    // ❌ якщо є помилки
    if (!result.success) {
      // помилки полів (email і т.д.)
      if (result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, message]) => {
          form.setError(field as keyof TFormProfileValues, {
            type: 'server',
            message,
          });
        });
      }

      // загальна помилка
      if (result.error) {
        toast.error(result.error, { icon: '❌' });
      }

      return;
    }

    // ✅ success
    toast.success('Дані профілю поновлено 📝', { icon: '✅' });

    router.push('/');
  };

  const onClickSignOut = () => {
    signOut({
      callbackUrl: '/',
    });
  };

  return (
    <Container className="flex min-h-[calc(100vh-8rem)] justify-center px-4">
      <FormProvider {...form}>
        <div className="mt-2 flex w-96 flex-col gap-3 md:mt-6 md:gap-4">
          <Link
            href="/"
            className="flex w-fit items-center gap-1 text-sm text-primary transition hover:brightness-75"
          >
            <ArrowLeft className="h-4 w-4" />
            На головну
          </Link>

          {/*
            Поля пароля навмисно стоять ПОЗА <form> з email: інакше Chrome вважає всю форму
            «формою входу», а email — логіном, і показує вікно керування паролями під цим полем.
            Значення все одно живуть в одному react-hook-form, а кнопка «Зберегти» прив'язана
            до форми через атрибут `form`.
          */}
          <form
            id="profile-form"
            className="flex flex-col gap-3 md:gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            {/*<Title text={`Особисті дані | #${data.id}`} size="md" className="font-bold" />*/}
            <Title text={`Особисті дані`} size="md" className="font-bold" />
            {!isCredentialsUser && (
              <p className="text-sm text-gray-500">
                Email змінити неможливо, бо ви ввійшли через провайдер {provider}.
              </p>
            )}
            {data.phone && <FormInputWithMask name="phone" label="Телефон" notEdit />}
            <FormInput
              name="email"
              label="E-Mail"
              placeholder="необов’язково"
              autoComplete="off"
              notEdit={!isCredentialsUser}
            />
            <FormInput name="fullName" label="Ім'я" required autoComplete="name" />
          </form>

          {isCredentialsUser && (
            <div
              className="flex flex-col gap-3 md:gap-4"
              // Поза <form> Enter сам нічого не надсилає — повертаємо звичну поведінку.
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  form.handleSubmit(onSubmit)();
                }
              }}
            >
              <p className="text-sm text-gray-500">Залиште порожніми, щоб не змінювати пароль.</p>
              <FormInput
                type="password"
                name="password"
                label="Новий пароль"
                autoComplete="new-password"
              />
              <FormInput
                type="password"
                name="confirmPassword"
                label="Повторіть пароль"
                autoComplete="new-password"
              />
            </div>
          )}

          <div className="flex gap-3">
            <Button
              form="profile-form"
              disabled={form.formState.isSubmitting}
              className="flex-1 text-base"
              type="submit"
            >
              Зберегти
            </Button>

            <Button
              onClick={onClickSignOut}
              variant="outline"
              disabled={form.formState.isSubmitting}
              className="flex-1 text-base"
              type="button"
            >
              Вийти
            </Button>
          </div>
        </div>
      </FormProvider>
    </Container>
  );
};
