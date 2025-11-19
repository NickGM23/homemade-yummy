'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Order } from '@/@types/order';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

export const orderColumns: ColumnDef<Order>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'fullName',
    header: "Ім'я",
  },
  {
    accessorKey: 'phone',
    header: 'Телефон',
  },
  {
    accessorKey: 'deliveryType',
    header: 'Доставка',
  },
  {
    accessorKey: 'totalAmount',
    header: 'Сума',
    cell: ({ row }) => {
      const total = Number(row.original.totalAmount) || 0;
      return <span>{total.toFixed(2)} ₴</span>;
    },
  },
  {
    accessorKey: 'status',
    header: 'Статус',
    cell: ({ row }) => {
      const status = row.original.status;
      const map = {
        PENDING: 'Очікує',
        SUCCEEDED: 'Виконано',
        CANCELLED: 'Скасовано',
      } as const;

      const variant =
        status === 'SUCCEEDED' ? 'success' : status === 'CANCELLED' ? 'destructive' : 'secondary';

      return <Badge variant={variant}>{map[status]}</Badge>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Дата',
    cell: ({ row }) => <span>{new Date(row.original.createdAt).toLocaleString()}</span>,
  },
  {
    accessorKey: 'items',
    header: 'Товари',
    cell: ({ row }) => {
      const items = row.original.items ?? [];
      const displayLimit = 3;

      const [expanded, setExpanded] = useState(false);
      const visibleItems = expanded ? items : items.slice(0, displayLimit);

      return (
        <div className="max-w-[350px] break-words">
          <ul className="list-disc pl-4">
            {visibleItems.map((item) => {
              const productName = item.product?.name || 'Без назви';
              const quantity = Number(item.quantity) || 0;
              const price = Number(item.price) || 0;
              const amount = Number(item.amount) || 0;

              return (
                <li key={item.id}>
                  {productName} — {quantity} × {price.toFixed(2)}
                  {' '}₴ = {amount.toFixed(2)}
                  {' '}₴
                </li>
              );
            })}
          </ul>
          {items.length > displayLimit && (
            <button className="mt-1 text-sm text-blue-600" onClick={() => setExpanded(!expanded)}>
              {expanded ? 'Сховати' : `Показати ще ${items.length - displayLimit}`}
            </button>
          )}
        </div>
      );
    },
  },
];
