import { OrdersDataTable } from '@/components/shared/orders/orders-data-table';
import { OrdersScopeTabs } from '@/components/shared/orders/orders-scope-tabs';
import { getOrders } from '@/services/orders';
import { prisma } from '@/server/prisma';
import { getUserSession } from '@/server/get-user-session';
import { resolveOrdersScope } from '@/server/orders-scope';
import { redirect } from 'next/navigation';

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string; scope?: string }>;
}) {
  const session = await getUserSession();
  if (!session) redirect('/not-auth');

  // isAdmin беремо свіжим з БД, а не з JWT: вкладка «Всі» віддає чужі дані.
  const user = await prisma.user.findUnique({
    where: { id: Number(session.id) },
  });

  if (!user) redirect('/not-auth');

  const { page, limit, scope: requestedScope } = await searchParams;

  const scope = resolveOrdersScope(requestedScope, user.isAdmin);

  const currentPage = Number(page) || 1;
  const currentLimit = Number(limit) || 10;

  const ordersResponse = await getOrders({
    page: currentPage,
    limit: currentLimit,
    ...(scope === 'mine' && { userId: user.id }),
  });

  const isEmpty = ordersResponse.total === 0;

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Замовлення</h1>

      {user.isAdmin && <OrdersScopeTabs active={scope} />}

      {isEmpty ? (
        <div className="flex min-h-[50vh] items-center justify-center">
          <p className="text-center text-3xl font-extrabold">
            {scope === 'mine' ? 'Ви ще нічого не замовляли' : 'Замовлень ще немає'}
          </p>
        </div>
      ) : (
        <OrdersDataTable
          data={ordersResponse.data}
          page={ordersResponse.page}
          totalPages={ordersResponse.totalPages}
          limit={ordersResponse.limit}
          scope={scope}
        />
      )}
    </div>
  );
}
