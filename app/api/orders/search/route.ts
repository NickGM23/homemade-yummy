// app/api/orders/search/route.ts
import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/server/withErrorHandling';
import { fetchPaginatedOrders } from '@/server/orderHelpers';
import { requireAdmin } from '@/server/requireAdmin';
import { orderFiltersSchema } from '@/server/validation/order';

async function postOrders(req: Request) {
  try {
    await requireAdmin();
  } catch (e) {
    const message = e instanceof Error ? e.message : 'FORBIDDEN';
    return NextResponse.json(
      { error: message },
      { status: message === 'UNAUTHORIZED' ? 401 : 403 },
    );
  }

  const filters = orderFiltersSchema.parse(await req.json());

  const result = await fetchPaginatedOrders(filters);

  return NextResponse.json(result);
}

export const { POST } = withErrorHandling({
  POST: postOrders,
});
