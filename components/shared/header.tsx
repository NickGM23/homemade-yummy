import React from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';

import { Container } from './container';
import { Button } from '../ui';
import { SearchInput } from './search-input';
import { ArrowRight, ShoppingCart, User, Menu } from 'lucide-react';

interface Props {
  className?: string;
}

export const Header: React.FC<Props> = ({ className }) => {
  return (
    <header className={cn('border-b border-gray-100', className)}>
      <Container className="flex items-center justify-between gap-2 py-8 sm:gap-4">
        <div className="flex flex-1 items-center gap-2">
          <Menu size={32} className="mr-2 sm:mr-6" />
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
      </Container>
    </header>
  );
};
