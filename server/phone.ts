// Український мобільний номер у форматі 380XXXXXXXXX (12 цифр, без «+») — саме так він
// зберігається в Order.phone / User.phone і передається в SMS-шлюз.
const UA_MOBILE_REGEX = /^380(39|50|63|66|67|68|73|9[1-9])\d{7}$/;

/**
 * Приводить введений номер (`+380 99 123 45 67`, `099 123 45 67`, `80991234567` тощо)
 * до формату 380XXXXXXXXX. Повертає `null`, якщо це не український мобільний номер.
 */
export function normalizeUaPhone(input: string): string | null {
  const digits = input.replace(/\D/g, '');

  let normalized: string;
  if (digits.length === 12 && digits.startsWith('380')) normalized = digits;
  else if (digits.length === 11 && digits.startsWith('80')) normalized = `3${digits}`;
  else if (digits.length === 10 && digits.startsWith('0')) normalized = `38${digits}`;
  else return null;

  return UA_MOBILE_REGEX.test(normalized) ? normalized : null;
}

/** `380991234567` -> `+38099•••4567` — для показу користувачеві, куди надіслано код. */
export function maskPhone(phone: string): string {
  return `+${phone.slice(0, 5)}•••${phone.slice(-4)}`;
}
