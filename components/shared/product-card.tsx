import React from 'react';
import { cn } from '@/lib/utils';
import { Title } from './title';

interface Props {
  groupName: string;
  name: string;
  price: number;
  unitWeight: string;
  count?: number;
  imageUrl?: string;
  className?: string;
}

interface Props {
  className?: string;
}

export const ProductCard: React.FC<Props> = ({
  name,
  price,
  unitWeight,
  count,
  imageUrl,
  className,
}) => {
  return (
    <div
      className={cn('flex w-[350px] flex-col overflow-hidden rounded-lg bg-secondary', className)}
    >
      <div className="flex justify-center">
        <img className="h-[225px] w-96 max-w-full object-cover" src={imageUrl} alt="Logo" />
      </div>
      <span title={name} className="my-4 h-16 overflow-hidden px-4 text-xl font-semibold">
        {name}
      </span>
      <div className="inline-flex items-center gap-4 px-4 py-2 pb-4">
        <p className="m-0 text-2xl font-bold text-primary">{price}</p>
        <p className="m-0 text-xl font-medium">{unitWeight}</p>
      </div>
    </div>
  );
};

{
  /* <div className="flex justify-center p-6 bg-secondary rounded-lg h-[260px]">
        <img className="w-[215px] h-[215px]" src={imageUrl} alt="Logo" />
      </div>
      <Title text={name} size="sm" className="mb-1 mt-3 font-bold" />
      <p className="text-sm text-gray-400">
        Цыпленок, моцарелла, сыры чеддер и пармезан, сырный соус, томаты, соус альфредо, чеснок
      </p>

      <div className="flex justify-between items-center mt-4">
        <span className="text-[20px]">
          от <b>{price} ₽</b>
        </span>

        {count ? (
          <CountButton value={count} size="lg" />
        ) : (
          <Button variant="secondary">
            <Plus className="w-4 h-4 mr-1" />
            Добавить
          </Button>
        )}
      </div> */
}
