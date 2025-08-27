'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { TFormProfileValues, getProfileSchema } from './modals/auth-modal/forms/schemas';
import { User } from '@prisma/client';
import toast from 'react-hot-toast';
import { signOut } from 'next-auth/react';
import { Container } from './container';
import { Title } from './title';
import { FormInput } from './form';
import { Button } from '../ui';
import { updateUserInfo } from '@/app/actions';

interface Props {
  data: User;
}

export const ProfileForm: React.FC<Props> = ({ data }) => {
  const isCredentialsUser = data.provider === 'credentials';
  const provider = data.provider;

  const form = useForm({
    resolver: zodResolver(getProfileSchema(isCredentialsUser)),
    defaultValues: {
      fullName: data.fullName,
      email: data.email,
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: TFormProfileValues) => {
    try {
      await updateUserInfo({
        email: data.email,
        fullName: data.fullName,
        password: data.password || undefined,
      });

      toast.error('Дані поновлено 📝', {
        icon: '✅',
      });
    } catch (error) {
      return toast.error('Помилка при поновленні даних', {
        icon: '❌',
      });
    }
  };

  const onClickSignOut = () => {
    signOut({
      callbackUrl: '/',
    });
  };

  return (
    <Container className="flex min-h-[calc(100vh-8rem)] justify-center px-4">
      <FormProvider {...form}>
        <form
          className="mt-2 flex w-96 flex-col gap-3 md:mt-10 md:gap-5"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          {/*<Title text={`Особисті дані | #${data.id}`} size="md" className="font-bold" />*/}
          <Title text={`Особисті дані`} size="md" className="font-bold" />
          {!isCredentialsUser && (
            <p className="text-sm text-gray-500">
              Email змінити неможливо, бо ви ввійшли через провайдер {provider}.
            </p>
          )}
          <FormInput name="email" label="E-Mail" required notEdit={!isCredentialsUser} />
          <FormInput name="fullName" label="Ім'я" required />

          {isCredentialsUser && (
            <>
              <FormInput type="password" name="password" label="Новий пароль" required />
              <FormInput type="password" name="confirmPassword" label="Повторіть пароль" required />
            </>
          )}
          <Button
            disabled={form.formState.isSubmitting}
            className="mt-6 text-base md:mt-10"
            type="submit"
          >
            Зберегти
          </Button>

          <Button
            onClick={onClickSignOut}
            variant="secondary"
            disabled={form.formState.isSubmitting}
            className="text-base"
            type="button"
          >
            Вийти
          </Button>
        </form>
      </FormProvider>
    </Container>
  );
};
