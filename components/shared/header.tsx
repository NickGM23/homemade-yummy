'use client';

import React from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';

import { Container } from './container';
import { Button } from '../ui';
import { SearchInput } from './search-input';
import { ArrowRight, ShoppingCart, User, Menu } from 'lucide-react';
import { Categories } from '@/components/shared/categories';

import { useState, useEffect } from 'react';

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

  const handleChange = () => {
    setIsOpen(false);
    setHideOfShort(() => {
      return {};
    });
  };

  return (
    <header className={cn('border-b border-gray-100', className)}>
      <Container className="flex items-center justify-between gap-2 py-8 sm:gap-4">
        <div className="flex flex-1 items-center gap-2">
          <Menu size={32} className="mr-2 sm:mr-6" onClick={openMenu} />
          <Image src="/logo/80n80_2.png" width={48} height={48} alt="Logo" />
          <Image src="/logo/LogoDS.png" width={220} height={60} alt="Logo" />
        </div>

        {/* <div className="mx-10 flex-1">
                    <SearchInput />
                </div> */}

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2 font-bold max-sm:hidden [@media(any-hover:hover){&:hover}]:border-orange-600 [@media(any-hover:hover){&:hover}]:bg-green-300"
          >
            <User size={16} />
            Увійти
          </Button>
          <Button className="group relative">
            <b>0 ₴</b>
            <span className="mx-3 h-full w-[1px] bg-white/30" />
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
        <div
          style={hideOrShow}
          className="fixed bottom-0 left-0 right-0 top-0 z-20 hidden w-[100%] overflow-auto bg-gray-100/90 p-10 transition-transform delay-1000 duration-1000 ease-in-out sm:max-w-[320px]"
        >
          <div className="left-0 right-0 top-0 flex flex-col">
            <Button onClick={closeMenu}>Close menu</Button>
            <Categories
              isShowByBurgerMenu={true}
              onChange={handleChange}
              className="w-[220px] flex-col sm:opacity-0"
            />
          </div>
        </div>
      </Container>
    </header>
  );
};
