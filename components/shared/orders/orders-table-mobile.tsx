'use client';

import { Order, OrderStatus } from '@/@types/order';
import { Badge } from '@/components/ui/badge';
import { STATUS_LABEL, STATUS_CLASSES } from '@/shared/order-status';

export function OrdersTableMobile({ data }: { data: Order[] }) {
  return (
    <div className="flex flex-col gap-4 md:hidden">
      {data.map((order) => {
        const totalAmount = Number(order.totalAmount) || 0;
        const status = order.status as OrderStatus;

        return (
          <div key={order.id} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Замовлення #{order.id}</h3>
              <Badge className={`${STATUS_CLASSES[status]} rounded-md px-2 py-1`}>
                {STATUS_LABEL[status]}
              </Badge>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>
                <strong>Ім&apos;я:</strong> {order.fullName}
              </p>
              <p>
                <strong>Телефон:</strong> {order.phone}
              </p>
              <p>
                <strong>Доставка:</strong> {order.deliveryType}
              </p>
              <p>
                <strong>Сума:</strong> {totalAmount.toFixed(2)} ₴
              </p>
              <p>
                <strong>Дата:</strong> {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>

            <details className="mt-3">
              <summary className="cursor-pointer font-medium">Товари</summary>
              <ul className="mt-2 text-sm">
                {order.items?.map((item) => {
                  const productName = item.product?.name || 'Без назви';
                  const quantity = Number(item.quantity) || 0;
                  const price = Number(item.price) || 0;
                  const amount = Number(item.amount) || 0;

                  return (
                    <li key={item.id} className="border-b py-1">
                      {productName} — {quantity} × {price.toFixed(2)} ₴ = {amount.toFixed(2)} ₴
                    </li>
                  );
                })}
              </ul>
            </details>
          </div>
        );
      })}
    </div>
  );
}
