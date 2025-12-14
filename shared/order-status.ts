import { OrderStatus } from '@/@types/order';

/* =========================
   Status labels
========================= */
export const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Очікує обробки',
  ACCEPTED: 'Прийнятий',
  SUCCEEDED: 'Виконано',
  CANCELLED: 'Скасовано',
};

/* =========================
   Tailwind classes for badges
========================= */
export const STATUS_CLASSES: Record<OrderStatus, string> = {
  PENDING: 'bg-gray-200 text-gray-800',
  ACCEPTED: 'bg-yellow-200 text-yellow-800',
  SUCCEEDED: 'bg-green-200 text-green-800',
  CANCELLED: 'bg-red-200 text-red-800',
};
