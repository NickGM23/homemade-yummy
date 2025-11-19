'use client';

import { OrdersTable } from './orders-table';
import { OrdersTableMobile } from './orders-table-mobile';
import { orderColumns } from './orders-columns';
import { Order } from '@/@types/order';
import { useRouter } from 'next/navigation';

export function OrdersDataTable({
  data,
  page,
  totalPages,
}: {
  data: Order[];
  page: number;
  totalPages: number;
}) {
  const router = useRouter();

  const goToPage = (p: number) => {
    router.push(`/orders?page=${p}`);
  };

  return (
    <>
      <OrdersTable data={data} columns={orderColumns} />
      <OrdersTableMobile data={data} />

      {/* Пагінація */}
      <div className="mt-4 flex items-center justify-between">
        <button
          disabled={page <= 1}
          onClick={() => goToPage(page - 1)}
          className="rounded bg-gray-200 px-3 py-1 disabled:opacity-50"
        >
          ← Назад
        </button>

        <span>
          Сторінка {page} із {totalPages}
        </span>

        <button
          disabled={page >= totalPages}
          onClick={() => goToPage(page + 1)}
          className="rounded bg-gray-200 px-3 py-1 disabled:opacity-50"
        >
          Вперед →
        </button>
      </div>
    </>
  );
}
