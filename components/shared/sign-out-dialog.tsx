'use client';

import React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { signOut } from 'next-auth/react';
import { X } from 'lucide-react';

import { Button } from '../ui/button';
import { DialogDescription, DialogOverlay, DialogPortal, DialogTitle } from '../ui/dialog';

interface Props {
  open: boolean;
  onClose: () => void;
}

export const SignOutDialog: React.FC<Props> = ({ open, onClose }) => {
  const [loading, setLoading] = React.useState(false);

  const onConfirm = () => {
    setLoading(true);
    signOut({ callbackUrl: '/' });
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogPortal>
        <DialogOverlay />
        {/* Свій Content замість ui/dialog: той має зашитий прихований заголовок «Edit profile». */}
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-6 shadow-lg outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
          <DialogPrimitive.Close
            aria-label="Закрити"
            className="absolute right-4 top-4 rounded-sm text-primary transition-opacity hover:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-6 w-6" strokeWidth={3} />
          </DialogPrimitive.Close>

          <DialogTitle className="text-3xl font-extrabold leading-tight tracking-normal text-slate-800">
            Вийти з аккаунту
          </DialogTitle>
          <DialogDescription className="mt-4 text-base text-slate-500">
            Ви впевнені що хочете вийти з облікового запису?
          </DialogDescription>

          <div className="mt-6 flex gap-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-secondary text-base font-bold"
            >
              Залишитися
            </Button>
            <Button
              type="button"
              size="lg"
              onClick={onConfirm}
              loading={loading}
              className="flex-1 text-base font-bold"
            >
              Вийти
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </DialogPrimitive.Root>
  );
};
