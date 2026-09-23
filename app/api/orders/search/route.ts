// app/api/orders/search/route.ts
import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/libs/withErrorHandling';
import { fetchPaginatedOrders } from '@/libs/orderHelpers';
import { requireAdmin } from '@/libs/requireAdmin';
import { orderFiltersSchema } from '@/libs/validation/order';

async function postOrders(req: Request) {
  try {
    await requireAdmin();
  } catch (e) {
    const message = e instanceof Error ? e.message : 'FORBIDDEN';
    return NextResponse.json({ error: message }, { status: message === 'UNAUTHORIZED' ? 401 : 403 });
  }

  const filters = orderFiltersSchema.parse(await req.json());

  const result = await fetchPaginatedOrders(filters);

  return NextResponse.json(result);
}

export const { POST } = withErrorHandling({
  POST: postOrders,
});
