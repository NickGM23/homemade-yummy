'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import React, { ReactElement, ReactEventHandler } from 'react';
import { useState } from 'react';
import { useCategoryStore } from '@/store/category';
import { ProductGroupWithProducts } from '@/services/product-groups';
import { useRouter, usePathname } from 'next/navigation';

interface Props {
  className?: string;
  productGroupsWithProducts?: ProductGroupWithProducts[];
  isShowByBurgerMenu?: boolean;
  onChange?: () => void;
}

const productGroups = [
  { id: 1, idGroup: 'varenik', name: 'Вареники' },
  { id: 2, idGroup: 'pelmen', name: 'Пельмені' },
  { id: 3, idGroup: 'kotleta', name: 'Котлети' },
  { id: 4, idGroup: 'kruchenyk', name: 'Крученики' },
  //{ id: 5, idGroup: 'frykadelka', name: 'Фрикадельки' },
  // { id: 6, idGroup: 'zrazy', name: 'Зрази картопляні' },
  // { id: 7, idGroup: 'nalysnyky', name: 'Налисники' },
  //{ id: 8, idGroup: 'syrmyky', name: 'Сирники' },
  //{ id: 9, idGroup: 'tefteli', name: 'Тефтелі' },
  // { id: 10, idGroup: 'golubzi', name: 'Голубці' },
  // { id: 11, idGroup: 'gotoviStruvy', name: 'Готові страви' },
];

const catsInfo = [
  'varenik',
  'pelmen',
  'kotleta',
  'kruchenyk',
  //'frykadelka',
  // 'zrazy',
  //  'nalysnyky',
  //'syrmyky',
  //'tefteli',
  //'golubzi',
  //  'gotoviStruvy',
];

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
  productGroupsWithProducts,
  isShowByBurgerMenu,
  onChange,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const idProductGroup = useCategoryStore((state) => state.activeId);
  const setActiveIdProductGroup = useCategoryStore((state) => state.setActiveId);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isRouting, setIsRouting] = useState(false);

  const categoryOnClick = (e: React.MouseEvent<HTMLElement>, index: number, category: string) => {
    setIsRouting(false);
    if (onChange) {
      // Позначаємо, що треба виконати onChange після переходу
      sessionStorage.setItem('shouldRunOnChange', 'true');
      sessionStorage.setItem('scrollToSelector', category);
    }

    if (pathname !== '/') {
      router.push('/');
      setIsRouting(true);
    }

    e.preventDefault();
    //if ((activeIndex === index || index + 1) === idProductGroup) return;

    const gotoBlock = document.querySelector(category) as HTMLDivElement;

    if (gotoBlock) {
      //const gotoBlockValue = gotoBlock.getBoundingClientRect().top;
      window.scrollTo({
        top: isShowByBurgerMenu ? gotoBlock.offsetTop - 140 : gotoBlock.offsetTop - 240,
        behavior: 'smooth',
      });

      setActiveIndex(index);
      setActiveIdProductGroup(index + 1);

      onChange?.();
    } else {
      setTimeout(() => {
        const retry = document.querySelector(category) as HTMLDivElement;

        if (retry) {
          // const gotoBlockValue1 = retry.getBoundingClientRect().top;
          window.scrollTo({
            top: isShowByBurgerMenu ? retry.offsetTop - 140 : retry.offsetTop - 240,
            behavior: 'smooth',
          });

          setActiveIndex(index);
          setActiveIdProductGroup(index + 1);

          onChange?.();
        }
      }, 200);
    }
  };

  return (
    <div
      className={cn('flex flex-wrap justify-around gap-1 rounded-2xl bg-gray-50 p-1', className)}
    >
      {productGroups.map(({ id, idGroup, name }, index) => (
        <a
          data-goto={'.' + catsInfo[index]}
          key={index}
          className={cn(
            'menu__link',
            'flex h-11 cursor-pointer items-center rounded-2xl border px-5 font-bold',
            '[@media(any-hover:hover){&:hover}]:border-orange-600 [@media(any-hover:hover){&:hover}]:bg-green-300 [@media(any-hover:hover){&:hover}]:text-primary',
            idProductGroup === id && 'bg-white text-primary shadow-md shadow-gray-200',
          )}
          // href={`/#${catsInfo[index]}`}
          onClick={(e) => categoryOnClick(e, index, '.' + catsInfo[index])}
        >
          {name}
        </a>
      ))}

      {productGroupsWithProducts &&
        productGroupsWithProducts.map(
          (productGroup, index) =>
            productGroup.products &&
            productGroup.products.length > 0 && (
              <a
                data-goto={'.' + productGroup.codeGroup}
                key={index}
                className={cn(
                  'menu__link',
                  'flex h-11 cursor-pointer items-center rounded-2xl border px-5 font-bold',
                  '[@media(any-hover:hover){&:hover}]:border-orange-600 [@media(any-hover:hover){&:hover}]:bg-green-300 [@media(any-hover:hover){&:hover}]:text-primary',
                  idProductGroup === productGroup.id * 100 &&
                    'bg-white text-primary shadow-md shadow-gray-200',
                )}
                // href={`/#${catsInfo[index]}`}
                onClick={(e) =>
                  categoryOnClick(e, productGroup.id * 100, '.' + productGroup.codeGroup)
                }
              >
                {productGroup.name}
              </a>
            ),
        )}
    </div>
  );
};
