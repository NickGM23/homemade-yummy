/* =========================
   Order.deliveryType labels
========================= */
export const DELIVERY_TYPE_LABEL: Record<string, string> = {
  address: 'Адресна доставка',
  pickup: 'Самовивіз',
};

/** Підпис для значення Order.deliveryType; невідоме значення показуємо як є. */
export const getDeliveryTypeLabel = (deliveryType: string): string =>
  DELIVERY_TYPE_LABEL[deliveryType] ?? deliveryType;
