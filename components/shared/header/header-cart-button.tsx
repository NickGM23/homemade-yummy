import React from 'react';
import { ArrowRight, ShoppingCart } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '../../ui';

interface Props {
  mounted: boolean;
  totalPrice: number;
  countItem: number;
  onClick: () => void;
  className?: string;
}

export const HeaderCartButton: React.FC<Props> = ({
  mounted,
  totalPrice,
  countItem,
  onClick,
  className,
}) => {
  return (
    <Button className={cn('group relative', className)} onClick={onClick}>
      {mounted && <b>{totalPrice}</b>}
      <span className="mx-1 h-full w-[1px] bg-white/30" />
      <div className="flex items-center gap-1 transition duration-300 group-hover:opacity-0">
        <ShoppingCart size={16} strokeWidth={2} />
        {mounted && <b>{countItem}</b>}
      </div>
      <ArrowRight
        size={20}
        className="absolute right-5 -translate-x-2 opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100"
      />
    </Button>
  );
};
