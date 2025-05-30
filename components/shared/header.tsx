'use client';

import React from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';

import { Container } from './container';
import { Button } from '../ui';
import { SearchInput } from './search-input';
import { ArrowRight, ShoppingCart, User, Menu, X } from 'lucide-react';
import { Categories } from '@/components/shared/categories';

import { useState, useEffect } from 'react';
import { BackDrop } from './back-drop';
import Link from 'next/link';

interface Props {
  className?: string;
}

export const Header: React.FC<Props> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hideOrShow, setHideOfShort] = useState({});

  useEffect(() => {
    isOpen ? (document.body.style.overflow = 'hidden') : (document.body.style.overflow = 'auto');
  }, [isOpen]);

  const closeMenu = () => {
    setIsOpen(false);
    setHideOfShort(() => {
      return {};
    });
  };

  const openMenu = () => {
    setIsOpen(true);
    setHideOfShort(() => {
      return { display: 'block' };
    });
  };

  const handleMenu = () => {
    setIsOpen((prev) => !prev);
    if (isOpen) {
      setHideOfShort(() => {
        return {};
      });
    } else {
      setHideOfShort(() => {
        return { display: 'block' };
      });
    }
  };

  return (
    <header className={cn('border-b border-gray-100', className)}>
      <Container className="flex items-center justify-between gap-2 py-8 sm:gap-4">
        <div className="flex items-center gap-2">
          <Menu
            size={40}
            className="mr-2 cursor-pointer sm:mr-6 [@media(any-hover:hover){&:hover}]:bg-gray-100"
            onClick={openMenu}
          />
          <Link href="/">
            <Image src="/logo/80n80_2.png" width={48} height={48} alt="Logo" />
          </Link>
          <Link href="/">
            <Image
              className="max-sm:h-[50px] max-sm:w-[180px]"
              src="/logo/LogoDS.png"
              width={220}
              height={60}
              alt="Logo"
            />
          </Link>
        </div>

        <div className="mx-2 hidden flex-1 sm:block lg:mx-6">
          <SearchInput />
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="hidden items-center gap-2 font-bold max-sm:hidden lg:flex [@media(any-hover:hover){&:hover}]:border-orange-600 [@media(any-hover:hover){&:hover}]:bg-green-300"
          >
            <User size={16} />
            Увійти
          </Button>
          <Button className="group relative hidden sm:flex">
            <b>0 ₴</b>
            <span className="mx-1 h-full w-[1px] bg-white/30" />
            <div className="flex items-center gap-1 transition duration-300 group-hover:opacity-0">
              <ShoppingCart size={16} className="relative" strokeWidth={2} />
              <b>0</b>
            </div>
            <ArrowRight
              size={20}
              className="absolute right-5 -translate-x-2 opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100"
            />
          </Button>

          <Button className="group relative flex sm:hidden">
            <div className="flex items-center gap-1">
              <ShoppingCart size={16} className="relative" strokeWidth={2} />
              <b>0</b>
            </div>
          </Button>
        </div>
        {isOpen ? (
          <BackDrop
            handelMenu={handleMenu}
            className="fixed bottom-0 left-0 right-0 top-0 z-20 bg-gray-300 opacity-80 max-sm:opacity-100"
          />
        ) : null}
        <div
          style={hideOrShow}
          className="fixed bottom-0 left-0 right-0 top-0 z-30 hidden w-[100%] overflow-auto bg-gray-100/90 p-6 transition-transform delay-1000 duration-1000 ease-in-out sm:max-w-[480px]"
        >
          <div className="left-0 right-0 top-0 flex flex-col gap-1">
            <div className="flex items-center justify-between gap-2 border-b border-gray-400 py-4">
              <Image
                className="bg-gray-300"
                src="/logo/80n80_2.png"
                width={40}
                height={40}
                alt="Logo"
              />
              <Image
                className="max-sm:h-[50px] max-sm:w-[180px]"
                src="/logo/LogoDS.png"
                width={220}
                height={60}
                alt="Logo"
              />
              <X
                size={32}
                onClick={closeMenu}
                className="cursor-pointer [@media(any-hover:hover){&:hover}]:bg-[#ffa700]"
              />
            </div>
            <div className="border-b border-gray-400 py-4">
              <b>Пошук</b>
              <div className="pt-2">
                <SearchInput />
              </div>
            </div>
            <div className="border-b border-gray-400 py-4">
              <b>Каталог товарів</b>
              <div className="flex w-[100%] flex-row pt-2">
                <Categories isShowByBurgerMenu={true} onChange={closeMenu} />
              </div>
            </div>
            <div className="flex items-center gap-5 border-b border-gray-400 py-4">
              <b>Корзина</b>
              <Button className="group relative flex">
                <b>0 ₴</b>
                <span className="mx-1 h-full w-[1px] bg-white/30" />
                <div className="flex items-center gap-1 transition duration-300 group-hover:opacity-0">
                  <ShoppingCart size={16} className="relative" strokeWidth={2} />
                  <b>0</b>
                </div>
                <ArrowRight
                  size={20}
                  className="absolute right-5 -translate-x-2 opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                />
              </Button>
            </div>
            <div className="border-b border-gray-400 py-4">
              <b>Особистий кабінет</b>
              <div className="mt-2 flex flex-wrap justify-around gap-1 rounded-2xl bg-gray-50 p-4">
                <p>
                  Увійдіть, щоб мати можливість переглядати історію ваших заказів. Отримувати
                  рекомендації та персональні знижки.
                </p>
                <div className="pt-2">
                  <a
                    className={cn(
                      'menu__link',
                      'flex h-11 cursor-pointer items-center rounded-2xl border px-5 font-bold',
                      '[@media(any-hover:hover){&:hover}]:border-orange-600 [@media(any-hover:hover){&:hover}]:bg-green-300 [@media(any-hover:hover){&:hover}]:text-primary',
                    )}
                    // href={`/#${catsInfo[index]}`}
                    //onClick={(e) => categoryOnClick(e, index, '.' + catsInfo[index])}
                  >
                    Увійдіть в особистий кабінет
                  </a>
                </div>
              </div>
            </div>
            <div className="py-4">
              <b>Ми в соціальних мережах</b>
              <a
                title="Viber"
                target="_blank"
                className="cursor-pointer"
                href="https://invite.viber.com/?g2=AQBI%2BqwSzGASd1PReIbHecaMp4g29XjuQbdKW%2FzGL0G9evTj%2FGgqunKZS5Ja%2FybE"
              >
                <Image className="mt-4" src="/logo/viber.svg" width={40} height={40} alt="Logo" />
              </a>
            </div>
          </div>
        </div>
      </Container>
    </header>
  );
};
