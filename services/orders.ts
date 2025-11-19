import { ApiRoutes } from './constants';
import { axiosInstance } from './instance';
import { OrderFilters, Order, CreateOrderBody } from '@/@types/order';

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
  const page = filters.page || 1;
  const limit = filters.limit || 20;

  if (typeof window === 'undefined') {
    // сервер → fetch з абсолютним URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/${ApiRoutes.ORDERS}?page=${page}&limit=${limit}`, {
      cache: 'no-store',
    });

    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  } else {
    // клієнт → axios
    const res = await axiosInstance.get<GetOrdersResponse>(ApiRoutes.ORDERS, {
      params: { page, limit },
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

/**
 * Створення нового замовлення
 */
export const createOrder = async (orderData: CreateOrderBody): Promise<Order> => {
  if (typeof window === 'undefined') {
    // сервер
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const res = await fetch(`${baseUrl}/api/${ApiRoutes.ORDERS}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) throw new Error('Failed to create order');
    return res.json();
  } else {
    // клієнт
    const res = await axiosInstance.post<Order>(ApiRoutes.ORDERS, orderData);
    return res.data;
  }
};
