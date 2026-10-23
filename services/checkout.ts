import { axiosInstance } from './instance';
import { ApiRoutes } from './constants';
import type { CodeSentResponse } from './verification';
import type { DeliveryType } from '@/@types/order';

/** Дані замовлення, які надсилає клієнт. Ціни й суми сервер рахує сам. */
export interface CheckoutOrderDraft {
  fullName: string;
  email?: string;
  phone: string;
  deliveryType: DeliveryType;
  address?: string;
  comment?: string;
  items: { productId: number; quantity: number }[];
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
