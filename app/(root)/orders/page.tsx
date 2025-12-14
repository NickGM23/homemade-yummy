import { OrdersDataTable } from '@/components/shared/orders/orders-data-table';
import { getOrders } from '@/services/orders';
import { prisma } from '@/libs/prisma';
import { getUserSession } from '@/components/shared/lib/get-user-session';
import { redirect } from 'next/navigation';

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string }>;
}) {
  const session = await getUserSession();
  if (!session) redirect('/not-auth');

  const user = await prisma.user.findUnique({
    where: { id: Number(session.id) },
  });

  if (!user || !user.isAdmin) redirect('/not-auth');

  const { page, limit } = await searchParams;

  const currentPage = Number(page) || 1;
  const currentLimit = Number(limit) || 10;

  const ordersResponse = await getOrders({
    page: currentPage,
    limit: currentLimit,
  });

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Замовлення</h1>

      <OrdersDataTable
        data={ordersResponse.data}
        page={ordersResponse.page}
        totalPages={ordersResponse.totalPages}
        limit={ordersResponse.limit}
      />
    </div>
  );
}
