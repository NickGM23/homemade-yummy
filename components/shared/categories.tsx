'use client';

import { cn } from '@/lib/utils';
import React from 'react';
import { useState } from 'react';
import { useCategoryStore } from '@/store/category';
import type { CategoryItem } from '@/services/product-groups';
import { useRouter, usePathname } from 'next/navigation';
import { PENDING_CATEGORY_KEY, scrollToCategory } from './category-scroll';

interface Props {
  className?: string;
  categories?: CategoryItem[];
  isShowByBurgerMenu?: boolean;
  onChange?: () => void;
}

// function onMenuLinkClick(e) {
//   const menuLink = e.target;
//   if (menuLink.dataset.goto && document.querySelector(menuLink.dataset.goto)) {
//     const gotoBlock = document.querySelector(menuLink.dataset.goto);
//     console.log(gotoBlock);
//     const gotoBlockValue = gotoBlock.getBoundingClientRect().top - 270;
//     console.log('найдено');
//     //gotoBlock.scrollIntoView();
//     window.scrollTo({
//       top: gotoBlockValue,
//       behavior: 'smooth',
//     });
//   } else console.log('что-то пошло не так');
// }

// const categoryOnClick = (index: number, category: string) => {
//   console.log(index);
//   const menuLinks = document.querySelectorAll('.menu__link[data-goto]');
//   if (menuLinks.length > 0) {
//     console.log('ура найдено');
//     //console.log(menuLinks);
//     menuLinks.forEach((menuLink) => {
//       if (document.querySelector(category)) menuLink.addEventListener('click', onMenuLinkClick);
//     });
//   } else {
//     console.log('не найдено');
//   }
// };

export const Categories: React.FC<Props> = ({
  className,
  categories,
  isShowByBurgerMenu,
  onChange,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const idProductGroup = useCategoryStore((state) => state.activeId);
  const setActiveIdProductGroup = useCategoryStore((state) => state.setActiveId);
  const [, setActiveIndex] = useState(0);

  const categoryOnClick = (e: React.MouseEvent<HTMLElement>, index: number, category: string) => {
    e.preventDefault();

    if (pathname !== '/') {
      // Блоків категорій немає на цій сторінці: запам'ятовуємо вибір, закриваємо меню й ідемо
      // на головну — до категорії прокрутить PendingCategoryScroll після завантаження.
      try {
        sessionStorage.setItem(PENDING_CATEGORY_KEY, category);
      } catch {
        // без sessionStorage просто відкриється головна
      }
      onChange?.();
      router.push('/');
      return;
    }

    if (scrollToCategory(category, isShowByBurgerMenu)) {
      setActiveIndex(index);
      setActiveIdProductGroup(index + 1);

      onChange?.();
    }
  };

  return (
    <div
      className={cn('flex flex-wrap justify-around gap-1 rounded-2xl bg-gray-50 p-1', className)}
    >
      {categories &&
        categories.map((category, index) => (
          <button
            type="button"
            data-goto={'.' + category.codeGroup}
            key={index}
            className={cn(
              'menu__link',
              'flex h-11 cursor-pointer select-none items-center rounded-2xl border px-5 font-bold',
              '[@media(any-hover:hover){&:hover}]:border-orange-600 [@media(any-hover:hover){&:hover}]:bg-green-300 [@media(any-hover:hover){&:hover}]:text-primary',
              idProductGroup === category.id * 100 &&
                'bg-white text-primary shadow-md shadow-gray-200',
            )}
            onClick={(e) => categoryOnClick(e, category.id * 100, '.' + category.codeGroup)}
          >
            {category.name}
          </button>
        ))}
    </div>
  );
};
