'use client';

import React, { useState, useEffect } from 'react';
import { auth } from '@/libs/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

export const PhoneAuth: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !recaptchaVerifier) {
      const verifier = new (RecaptchaVerifier as any)(
        'recaptcha-container', // id контейнера
        {
          size: 'invisible',
          callback: (response: any) => {
            console.log('reCAPTCHA verified', response);
          },
        },
        auth,
      );
      verifier.render().then(() => setRecaptchaVerifier(verifier));
    }
  }, [recaptchaVerifier]);

  const sendOTP = async () => {
    setError('');
    setSuccess('');
    if (!recaptchaVerifier) {
      setError('reCAPTCHA не ініціалізовано');
      return;
    }
    try {
      const confirmation = await signInWithPhoneNumber(auth, phone, recaptchaVerifier);
      setConfirmationResult(confirmation);
      setSuccess('OTP відправлено!');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Помилка при відправці OTP');
    }
  };

  const verifyOTP = async () => {
    if (!confirmationResult) return;
    setError('');
    try {
      const result = await confirmationResult.confirm(otp);
      setSuccess('Телефон підтверджено! UID: ' + result.user.uid);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Невірний код OTP');
    }
  };

  return (
    <div className="flex max-w-sm flex-col gap-4">
      <input
        type="tel"
        placeholder="+380XXXXXXXXX"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="rounded border p-2"
      />
      <div id="recaptcha-container" />
      <button onClick={sendOTP} className="rounded bg-blue-500 p-2 text-white" disabled={!phone}>
        Відправити OTP
      </button>

      {confirmationResult && (
        <>
          <input
            type="text"
            placeholder="Введіть OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="rounded border p-2"
          />
          <button
            onClick={verifyOTP}
            className="rounded bg-green-500 p-2 text-white"
            disabled={!otp}
          >
            Підтвердити OTP
          </button>
        </>
      )}

      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
    </div>
  );
};
