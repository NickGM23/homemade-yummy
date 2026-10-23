export type OrdersScope = 'all' | 'mine';

/**
 * Яку вкладку замовлень показати. «Всі» — лише для адміна (за замовчуванням для нього),
 * будь-хто інший завжди отримує «Свої», навіть якщо руками підставив ?scope=all.
 */
export function resolveOrdersScope(requested: string | undefined, isAdmin: boolean): OrdersScope {
  if (!isAdmin) return 'mine';
  return requested === 'mine' ? 'mine' : 'all';
}
