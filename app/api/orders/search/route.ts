// app/api/orders/search/route.ts
import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/libs/withErrorHandling';
import { fetchPaginatedOrders } from '@/libs/orderHelpers';
import { OrderFilters } from '@/@types/order';
import { requireAdmin } from '@/libs/requireAdmin';

async function postOrders(req: Request) {
  try {
    await requireAdmin();
  } catch (e) {
    return NextResponse.json(
      { error: String(e) },
      { status: String(e) === 'UNAUTHORIZED' ? 401 : 403 },
    );
  }

  const filters: OrderFilters = await req.json();

  const result = await fetchPaginatedOrders(filters);

  return NextResponse.json(result);
}

export const { POST } = withErrorHandling({
  POST: postOrders,
});
