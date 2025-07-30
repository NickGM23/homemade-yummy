import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { TFormLoginValues, formLoginSchema } from './schemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import toast from 'react-hot-toast';
import { Title } from '../../../title';
import { FormInput } from '@/components/shared/form/form-input';
import { Button } from '@/components/ui/button';

interface Props {
  onClose?: VoidFunction;
}

export const LoginForm: React.FC<Props> = ({ onClose }) => {
  const form = useForm<TFormLoginValues>({
    resolver: zodResolver(formLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const onSubmit = async (data: TFormLoginValues) => {
    try {
      const resp = await signIn('credentials', {
        ...data,
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
      <form className="flex flex-col gap-5" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex items-center justify-between">
          <div className="mr-2">
            <Title text="Вхід в акаунт" size="md" className="font-bold" />
            <p className="text-gray-400">Введіть свою пошту, щоб увійти в свій акаунт</p>
          </div>
          {/* <img src="/assets/images/phone-icon.png" alt="phone-icon" width={60} height={60} /> */}
        </div>

        <FormInput name="email" label="E-Mail" required />
        <FormInput name="password" label="Пароль" type="password" required />

        <Button loading={form.formState.isSubmitting} className="h-12 text-base" type="submit">
          Увійти
        </Button>
      </form>
    </FormProvider>
  );
};
