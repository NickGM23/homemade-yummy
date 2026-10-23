import Link from 'next/link';

import { cn } from '@/lib/utils';
import type { OrdersScope } from '@/server/orders-scope';

const TABS: { scope: OrdersScope; label: string }[] = [
  { scope: 'all', label: 'Всі' },
  { scope: 'mine', label: 'Свої' },
];

export function OrdersScopeTabs({ active }: { active: OrdersScope }) {
  return (
    <div className="mb-4 flex gap-2" role="tablist">
      {TABS.map(({ scope, label }) => (
        <Link
          key={scope}
          href={`/orders?scope=${scope}`}
          role="tab"
          aria-selected={active === scope}
          className={cn(
            'rounded-md border px-4 py-1.5 font-semibold transition',
            active === scope
              ? 'border-primary bg-primary text-white'
              : 'bg-white hover:border-primary hover:text-primary',
          )}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
