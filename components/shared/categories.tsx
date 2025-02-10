import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';

interface Props {
  className?: string;
}

const cats = [
  'Вареники',
  'Пельмені',
  'Котлети',
  'Крученики',
  'Фрикадельки',
  'Зрази картопляні',
  'Налисники',
  'Сирники',
  'Тефтелі',
  'Голубці',
  'Готові страви',
];
const activeIndex = 0;

export const Categories: React.FC<Props> = ({ className }) => {
  return (
    <div
      className={cn(
        'flex flex-wrap justify-around gap-1 rounded-2xl bg-gray-50 p-1 max-sm:flex-col',
        className,
      )}
    >
      {cats.map((cat, index) => (
        <Link
          key={index}
          className={cn(
            'flex h-11 items-center rounded-2xl border px-5 font-bold',
            '[@media(any-hover:hover){&:hover}]:border-orange-600 [@media(any-hover:hover){&:hover}]:bg-green-300 [@media(any-hover:hover){&:hover}]:text-primary',
            activeIndex === index && 'bg-white text-primary shadow-md shadow-gray-200',
          )}
          href=""
        >
          {cat}
        </Link>
      ))}
    </div>
  );
};
