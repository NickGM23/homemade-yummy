import { isAxiosError } from 'axios';
import { axiosInstance } from './instance';
import { ApiRoutes } from './constants';

/** Дані замовлення, які надсилає клієнт. Ціни й суми сервер рахує сам. */
export interface CheckoutOrderDraft {
  fullName: string;
  email?: string;
  phone: string;
  deliveryType: 'pickup' | 'address';
  address?: string;
  comment?: string;
  items: { productId: number; quantity: number }[];
}

export interface CodeSentResponse {
  status: 'code_sent';
  verificationId: string;
  maskedPhone: string;
  expiresAt: string;
  resendAvailableAt: string;
}

export interface OrderCreatedResponse {
  status: 'created';
  orderId: number;
}

/**
 * Надсилає SMS-код. Для залогіненого користувача з підтвердженим номером, що збігається
 * з номером замовлення, SMS пропускається — тоді замовлення створюється одразу (`created`).
 */
export const sendOrderCode = async (
  draft: CheckoutOrderDraft,
): Promise<CodeSentResponse | OrderCreatedResponse> => {
  const res = await axiosInstance.post<CodeSentResponse | OrderCreatedResponse>(
    ApiRoutes.CHECKOUT_SEND_CODE,
    draft,
  );
  return res.data;
};

export const resendOrderCode = async (verificationId: string): Promise<CodeSentResponse> => {
  const res = await axiosInstance.post<CodeSentResponse>(ApiRoutes.CHECKOUT_RESEND_CODE, {
    verificationId,
  });
  return res.data;
};

export const confirmOrder = async (
  verificationId: string,
  code: string,
): Promise<{ orderId: number }> => {
  const res = await axiosInstance.post<{ orderId: number }>(ApiRoutes.CHECKOUT_CONFIRM, {
    verificationId,
    code,
  });
  return res.data;
};

/** Текст помилки з відповіді API (`{ message }`) або запасний, якщо сервер недоступний. */
export const getCheckoutErrorMessage = (
  error: unknown,
  fallback = 'Щось пішло не так. Спробуйте ще раз',
): string => {
  if (isAxiosError(error) && typeof error.response?.data?.message === 'string') {
    // Для помилок валідації сервер повертає технічне 'Validation error' — показуємо запасний текст.
    return error.response.data.message === 'Validation error'
      ? 'Перевірте правильність введених даних'
      : error.response.data.message;
  }
  return fallback;
};
