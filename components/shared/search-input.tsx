'use client';

import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import React from 'react';
import { useClickAway, useDebounce } from 'react-use';
import Link from 'next/link';
import { Api } from '@/services/api-client';
import { Product } from '@prisma/client';

interface Props {
  className?: string;
  onAfterSelectItem?: () => void;
}

export const SearchInput: React.FC<Props> = ({ className, onAfterSelectItem }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [focused, setFocused] = React.useState(false);
  const [products, setProducts] = React.useState<Product[]>([]);
  const ref = React.useRef(null);

  useClickAway(ref, () => {
    setFocused(false);
  });

  useDebounce(
    () => {
      Api.products.search(searchQuery).then((items) => setProducts(items));
    },
    400,
    [searchQuery],
  );

  const onClickItem = () => {
    setFocused(false);
    setSearchQuery('');
    setProducts([]);
    onAfterSelectItem?.();
  };

  return (
    <>
      {focused && <div className="fixed bottom-0 left-0 right-0 top-0 z-30 bg-black/50"></div>}
      <div
        ref={ref}
        className={cn('relative z-30 flex h-11 flex-1 justify-between rounded-2xl', className)}
      >
        <Search className="absolute left-3 top-1/2 h-5 translate-y-[-50%] text-gray-400" />
        <input
          className="w-full rounded-2xl bg-gray-50 pl-11 outline-none"
          type="text"
          placeholder="Знайти смаколик..."
          onFocus={() => setFocused(true)}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {products.length > 0 && (
          <div
            className={cn(
              'invisible absolute top-14 z-30 w-full rounded-xl bg-white py-2 opacity-0 shadow-md transition-all duration-200',
              focused && 'visible top-12 opacity-100',
            )}
          >
            {products.map((product) => (
              <Link
                key={product.id}
                className="flex w-full items-center gap-3 px-3 hover:bg-primary/10"
                href={`/product/${product.id}`}
                onClick={onClickItem}
              >
                <div className="cursor-pointer px-3 py-2">{product.name}</div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
