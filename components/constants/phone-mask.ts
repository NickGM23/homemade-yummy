/** Маска українського номера в полях введення телефону (`FormInputWithMask`). */
export const PHONE_MASK = '+38(000)000-00-00';

/** `380991234567` -> `+38(099)123-45-67` — формат, який видає поле з цією маскою. */
export const formatPhoneForMask = (phone: string): string =>
  `+${phone.slice(0, 2)}(${phone.slice(2, 5)})${phone.slice(5, 8)}-${phone.slice(8, 10)}-${phone.slice(10, 12)}`;
