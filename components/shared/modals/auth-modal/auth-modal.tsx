'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { signIn } from 'next-auth/react';
import React from 'react';
import { LoginForm } from './forms/login-form';
import { RegisterForm } from './forms/register-form';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<Props> = ({ open, onClose }) => {
  // OAuth (GitHub/Google) тимчасово приховано скрізь: зараз вхід і реєстрація лише за телефоном.
  // Код кнопок і провайдерів лишається на майбутнє — достатньо повернути `true`.
  const showOAuth = false;
  const [type, setType] = React.useState<'login' | 'register'>('login');

  const onSwitchType = () => {
    setType(type === 'login' ? 'register' : 'login');
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      {/* Як у модалці корзини: вікно не вище за екран, середина прокручується, а шапка форми,
          кнопка відправки та перемикач «Увійти/Реєстрація» завжди на видноті (важливо в
          горизонтальній орієнтації телефона). */}
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="flex max-h-[90dvh] w-full flex-col gap-3 overflow-hidden bg-white p-4 sm:w-[450px] sm:p-10 [@media(max-height:500px)]:p-4"
      >
        <div className="-mx-1 flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-1">
          {type === 'login' ? (
            <LoginForm onClose={handleClose} />
          ) : (
            <RegisterForm onClose={handleClose} />
          )}

          {showOAuth && (
            <>
              <hr />
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() =>
                    signIn('github', {
                      callbackUrl: '/',
                      redirect: true,
                    })
                  }
                  type="button"
                  className="h-12 flex-1 gap-2 p-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- tiny external icon, not worth next/image's remotePatterns config */}
                  <img
                    className="h-6 w-6"
                    src="https://github.githubassets.com/favicons/favicon.svg"
                    alt="GitHub"
                  />
                  GitHub
                </Button>

                <Button
                  variant="secondary"
                  onClick={() =>
                    signIn('google', {
                      callbackUrl: '/',
                      redirect: true,
                    })
                  }
                  type="button"
                  className="h-12 flex-1 gap-2 p-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- tiny external icon, not worth next/image's remotePatterns config */}
                  <img
                    className="h-6 w-6"
                    src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg"
                    alt="Google"
                  />
                  Google
                </Button>
              </div>
            </>
          )}
        </div>

        <Button
          variant="outline"
          onClick={onSwitchType}
          type="button"
          className="h-12 shrink-0 [@media(any-hover:hover){&:hover}]:border-orange-600 [@media(any-hover:hover){&:hover}]:bg-green-300 [@media(max-height:500px)]:h-10"
        >
          {type !== 'login' ? 'Увійти' : 'Реєстрація'}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
