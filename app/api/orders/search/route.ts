// app/api/orders/search/route.ts
import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/libs/withErrorHandling';
import { fetchPaginatedOrders } from '@/libs/orderHelpers';
import { OrderFilters } from '@/@types/order';

async function postOrders(req: Request) {
  const filters: OrderFilters = await req.json();

  const result = await fetchPaginatedOrders(filters);

  return NextResponse.json(result);
}

export const { POST } = withErrorHandling({
  POST: postOrders,
});
