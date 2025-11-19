import { OrdersDataTable } from '@/components/shared/orders/orders-data-table';
import { getOrders } from '@/services/orders';
import { prisma } from '@/libs/prisma';
import { getUserSession } from '@/components/shared/lib/get-user-session';
import { redirect } from 'next/navigation';

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  // 1. Авторизація
  const session = await getUserSession();
  if (!session) return redirect('/not-auth');

  const user = await prisma.user.findUnique({
    where: { id: Number(session.id) },
  });

  if (!user || !user.isAdmin) return redirect('/not-auth');

  // 2. Чекаємо searchParams
  const params = await searchParams;

  const page = Number(params.page) || 1;
  const limit = 5;

  // 3. Отримуємо дані
  const ordersResponse = await getOrders({ page, limit }); // ✅ передаємо як об'єкт

  return (
    <div className="p-6">
      <h1 className="mb-4 text-2xl font-bold">Замовлення</h1>

      <OrdersDataTable
        data={ordersResponse.data}
        page={ordersResponse.page}
        totalPages={ordersResponse.totalPages}
      />
    </div>
  );
}
