'use client';

import { OrdersTable } from './orders-table';
import { OrdersTableMobile } from './orders-table-mobile';
import { orderColumns } from './orders-columns';
import { Order } from '@/@types/order';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export function OrdersDataTable({
  data,
  page,
  totalPages,
  limit,
}: {
  data: Order[];
  page: number;
  totalPages: number;
  limit: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedLimit, setSelectedLimit] = useState<number>(limit);

  useEffect(() => {
    setSelectedLimit(limit);
  }, [limit]);

  const goToPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(p));
    params.set('limit', String(selectedLimit));
    router.push(`/orders?${params.toString()}`);
  };

  const handleLimitChange = (newLimit: number) => {
    setSelectedLimit(newLimit);
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', '1'); // при зміні ліміту завжди на першу сторінку
    params.set('limit', String(newLimit));
    router.push(`/orders?${params.toString()}`);
  };

  return (
    <>
      {/* Селектор зверху таблиці */}
      <div className="mb-4 flex justify-end">
        <label className="mr-2 hidden text-gray-700 sm:inline">Показувати по:</label>
        <select
          value={selectedLimit}
          onChange={(e) => handleLimitChange(Number(e.target.value))}
          className="rounded border px-2 py-1"
        >
          {[5, 10, 20, 50].map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      {/* Таблиці */}
      <OrdersTable data={data} columns={orderColumns} />
      <OrdersTableMobile data={data} />

      {/* Пагінація внизу */}
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
