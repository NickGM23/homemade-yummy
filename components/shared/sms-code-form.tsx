'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
  /** ISO-час, раніше якого повторна відправка коду недоступна. */
  resendAvailableAt: string;
  submitLabel: string;
  /** Має кинути помилку з користувацьким текстом, якщо код невірний. */
  onConfirm: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
  /** Повідомляє батька, що йде запит підтвердження (щоб, наприклад, не закривати діалог). */
  onBusyChange?: (busy: boolean) => void;
}

const secondsUntil = (iso: string) =>
  Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 1000));

/** Поле вводу 6-значного SMS-коду з кнопкою підтвердження і повторною відправкою за таймером. */
export const SmsCodeForm: React.FC<Props> = ({
  resendAvailableAt,
  submitLabel,
  onConfirm,
  onResend,
  onBusyChange,
}) => {
  const [code, setCode] = React.useState('');
  const [error, setError] = React.useState('');
  const [confirming, setConfirming] = React.useState(false);
  const [resending, setResending] = React.useState(false);
  const [secondsLeft, setSecondsLeft] = React.useState(() => secondsUntil(resendAvailableAt));

  React.useEffect(() => {
    onBusyChange?.(confirming);
  }, [confirming, onBusyChange]);

  // Новий код (повторна відправка) — таймер стартує заново, поле вводу очищується.
  React.useEffect(() => {
    setCode('');
    setSecondsLeft(secondsUntil(resendAvailableAt));

    const timer = setInterval(() => setSecondsLeft(secondsUntil(resendAvailableAt)), 1000);
    return () => clearInterval(timer);
  }, [resendAvailableAt]);

  const handleConfirm = async (e: React.FormEvent) => {
    // Форма може бути вкладена в інший <form> (React-портал) — не даємо події «підняти» submit.
    e.preventDefault();
    e.stopPropagation();
    if (code.length !== 6 || confirming) return;

    setError('');
    setConfirming(true);
    try {
      await onConfirm(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося підтвердити код');
    } finally {
      setConfirming(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setResending(true);
    try {
      await onResend();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося надіслати код');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={handleConfirm} className="flex flex-col gap-3">
        <Input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="Код з SMS"
          aria-label="Код з SMS"
          maxLength={6}
          autoFocus
          className="h-12 text-center text-xl tracking-[0.5em] md:text-xl"
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" loading={confirming} disabled={code.length !== 6} className="h-12">
          {submitLabel}
        </Button>
      </form>

      <div className="flex items-center text-sm">
        <button
          type="button"
          onClick={handleResend}
          disabled={secondsLeft > 0 || resending || confirming}
          className="text-primary underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
        >
          {secondsLeft > 0 ? `Надіслати код повторно (${secondsLeft} с)` : 'Надіслати код повторно'}
        </button>
      </div>
    </div>
  );
};
