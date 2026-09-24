'use client';

import React from 'react';

interface Props {
  recaptchaRef: React.RefObject<HTMLDivElement | null>;
  otpSent: boolean;
  otp: string;
  setOtp: (otp: string) => void;
  phoneVerified: boolean;
  phoneError: string;
  handleSendOTP: () => void;
  handleVerifyOTP: () => void;
}

export const CheckoutPhoneVerification: React.FC<Props> = ({
  recaptchaRef,
  otpSent,
  otp,
  setOtp,
  phoneVerified,
  phoneError,
  handleSendOTP,
  handleVerifyOTP,
}) => {
  return (
    <>
      {/* reCAPTCHA */}
      <div ref={recaptchaRef} className="mt-2" />

      {/* Кнопка та OTP */}
      {!phoneVerified && (
        <div className="mt-4 flex flex-col gap-2">
          {!otpSent && (
            <>
              <button
                type="button"
                onClick={handleSendOTP}
                className="rounded bg-primary p-3 text-primary-foreground"
              >
                Відправити OTP
              </button>
              {phoneError && <p className="text-destructive">{phoneError}</p>}
            </>
          )}

          {otpSent && !phoneVerified && (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Введіть OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="rounded border p-2"
              />
              {phoneError && <p className="text-destructive">{phoneError}</p>}
              <button
                type="button"
                onClick={handleVerifyOTP}
                className="rounded bg-primary p-2 text-primary-foreground"
              >
                Підтвердити OTP
              </button>
            </div>
          )}
        </div>
      )}

      {phoneVerified && (
        <p className="mt-2 font-semibold text-green-500">Телефон підтверджено ✅</p>
      )}
    </>
  );
};
