import React from 'react';
import toast from 'react-hot-toast';
import { auth } from '@/server/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

const formatPhoneNumber = (phone: string): string => {
  // забираємо всі символи, крім цифр
  const digits = phone.replace(/\D/g, '');
  // якщо номер починається з 380 — додаємо +
  if (digits.startsWith('380')) return `+${digits}`;
  // якщо номер український без коду країни — додаємо +38
  if (digits.startsWith('0')) return `+38${digits}`;
  return `+${digits}`;
};

interface Params {
  getPhone: () => string;
}

export const usePhoneVerification = ({ getPhone }: Params) => {
  const recaptchaRef = React.useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = React.useRef<RecaptchaVerifier | null>(null);

  const [confirmationResult, setConfirmationResult] = React.useState<ConfirmationResult | null>(
    null,
  );
  const [otpSent, setOtpSent] = React.useState(false);
  const [otp, setOtp] = React.useState('');
  const [phoneVerified, setPhoneVerified] = React.useState(false);
  const [phoneError, setPhoneError] = React.useState('');

  // Ініціалізація reCAPTCHA
  React.useEffect(() => {
    if (!recaptchaRef.current || recaptchaVerifierRef.current) return;

    try {
      recaptchaVerifierRef.current = new RecaptchaVerifier(
        auth, // ✅ Першим параметром іде auth
        recaptchaRef.current as HTMLElement, // ✅ Потім сам контейнер
        {
          size: 'normal',
          callback: () => console.log('reCAPTCHA пройдена ✅'),
        },
      );

      recaptchaVerifierRef.current.render();
    } catch (error) {
      console.error('Помилка ініціалізації reCAPTCHA:', error);
    }
  }, []);

  // Відправка OTP
  const handleSendOTP = async () => {
    setPhoneError('');
    const phone = getPhone();
    if (!phone) {
      setPhoneError('Введіть номер телефону');
      return;
    }

    const formattedPhone = formatPhoneNumber(phone);
    console.log('📞 formattedPhone:', formattedPhone);

    if (!recaptchaVerifierRef.current) {
      setPhoneError('reCAPTCHA не ініціалізована');
      return;
    }

    try {
      const confirmation = await signInWithPhoneNumber(
        auth,
        formattedPhone,
        recaptchaVerifierRef.current,
      );
      setConfirmationResult(confirmation);
      setOtpSent(true);
      toast.success('OTP надіслано на ваш номер ✅');
    } catch (err) {
      console.error(err);
      setPhoneError(err instanceof Error ? err.message : 'Помилка при відправці OTP');
      recaptchaVerifierRef.current.clear();
      recaptchaVerifierRef.current = null;
    }
  };

  // Підтвердження OTP
  const handleVerifyOTP = async () => {
    if (!otp) {
      setPhoneError('Введіть OTP для підтвердження номера');
      return;
    }

    if (!confirmationResult) {
      setPhoneError('Спочатку відправте OTP');
      return;
    }

    try {
      await confirmationResult.confirm(otp);
      setPhoneVerified(true);
      toast.success('Телефон підтверджено ✅');
    } catch (err) {
      console.error(err);
      setPhoneError(err instanceof Error ? err.message : 'Помилка при підтвердженні OTP');
    }
  };

  return {
    recaptchaRef,
    otpSent,
    otp,
    setOtp,
    phoneVerified,
    phoneError,
    setPhoneError,
    handleSendOTP,
    handleVerifyOTP,
  };
};
