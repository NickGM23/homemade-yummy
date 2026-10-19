/** Відповідь API, коли SMS-код надіслано (замовлення, реєстрація). */
export interface CodeSentResponse {
  status: 'code_sent';
  verificationId: string;
  maskedPhone: string;
  expiresAt: string;
  resendAvailableAt: string;
}
