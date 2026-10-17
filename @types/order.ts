export type OrderStatus = 'PENDING' | 'ACCEPTED' | 'SUCCEEDED' | 'CANCELLED';

export interface OrderFilters {
  userId?: number;
  status?: OrderStatus;
  fullName?: string;
  email?: string;
  phone?: string;
  dateFrom?: string; // 'YYYY-MM-DD'
  dateTo?: string; // 'YYYY-MM-DD'

  // Пагінація
  page?: number; // за замовчуванням 1
  limit?: number; // за замовчуванням 20
}

export interface OrderItem {
  id: number;
  productId: number;
  product: {
    name: string;
    type: string;
  };
  quantity: number;
  price: number;
  amount: number;
}

export interface Order {
  id: number;
  userId: number | null; // <--- додати це
  fullName: string;
  email: string | null;
  phone: string;
  deliveryType: string;
  address: string | null;
  comment: string | null;

  shippingAmount: number;
  totalAmount: number;
  items: OrderItem[];

  status: OrderStatus;

  createdAt: string;
  updatedAt: string;
}
