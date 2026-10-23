import type { DeliveryType } from '@/@types/order';

/* =========================
   Order.deliveryType labels
========================= */
export const DELIVERY_TYPE_LABEL: Record<DeliveryType, string> = {
  ADDRESS: 'Адресна доставка',
  PICKUP: 'Самовивіз',
};

/** Підпис для значення Order.deliveryType. */
export const getDeliveryTypeLabel = (deliveryType: DeliveryType): string =>
  DELIVERY_TYPE_LABEL[deliveryType];
