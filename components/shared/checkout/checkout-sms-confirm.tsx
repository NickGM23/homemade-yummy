'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SmsCodeForm } from '../sms-code-form';

interface Props {
  open: boolean;
  maskedPhone: string;
  /** ISO-час, раніше якого повторна відправка коду недоступна. */
  resendAvailableAt: string;
  /** Має кинути помилку з користувацьким текстом, якщо код невірний. */
  onConfirm: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
  onClose: () => void;
}

export const CheckoutSmsConfirm: React.FC<Props> = ({
  open,
  maskedPhone,
  resendAvailableAt,
  onConfirm,
  onResend,
  onClose,
}) => {
  const [confirming, setConfirming] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && !confirming && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Підтвердження замовлення</DialogTitle>
          <DialogDescription>
            Вам відправлено код для підтвердження замовлення на номер{' '}
            <span className="font-semibold text-foreground">{maskedPhone}</span>. Введіть його
            нижче.
          </DialogDescription>
        </DialogHeader>

        <SmsCodeForm
          resendAvailableAt={resendAvailableAt}
          submitLabel="Підтвердити замовлення"
          onConfirm={onConfirm}
          onResend={onResend}
          onBusyChange={setConfirming}
        />
      </DialogContent>
    </Dialog>
  );
};
