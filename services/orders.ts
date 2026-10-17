// services/orders.ts
import { axiosInstance } from './instance';
import { ApiRoutes } from './constants';
import { OrderFilters, Order } from '@/@types/order';
import { fetchPaginatedOrders } from '@/server/orderHelpers';

export interface GetOrdersResponse {
  data: Order[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Отримання замовлень (сервер/клієнт)
 */
export const getOrders = async (
  filters: OrderFilters = { page: 1, limit: 20 },
): Promise<GetOrdersResponse> => {
  if (typeof window === 'undefined') {
    // --- SERVER SIDE: використовуємо хелпер ---
    return fetchPaginatedOrders(filters);
  } else {
    // --- CLIENT SIDE: axios запит до API ---
    const res = await axiosInstance.get<GetOrdersResponse>(ApiRoutes.ORDERS, {
      params: filters,
    });
    return res.data;
  }
};

/**
 * Пошук замовлень із фільтрами
 */
export const searchOrders = async (filters: OrderFilters): Promise<Order[]> => {
  const result = await getOrders(filters);
  return result.data;
};
