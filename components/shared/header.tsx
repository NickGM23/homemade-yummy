import React from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';

import { Container } from './container';
import { Button } from '../ui';
import { SearchInput } from './search-input';
import { ArrowRight, ShoppingCart, User } from 'lucide-react';
import { CartDrawer } from './cart-drawer';

interface Props {
  className?: string;
}

export const Header: React.FC<Props> = ({ className }) => {
  return (
    <header className={cn('border-b border-gray-100', className)}>
      <Container className="flex items-center justify-between py-8">
        <div className="m-2 flex items-center gap-2">
          <Image src="/logo/80n80_3.png" width={55} height={35} alt="Logo" />

          <Image src="/logo/LogoDS.png" width={155} height={55} alt="Logo" />
        </div>

        {/* <div className="mx-10 flex-1">
                    <SearchInput />
                </div> */}

        <div className="flex items-center gap-3">
          <Button variant="outline" className="flex items-center gap-2 font-bold">
            <User size={16} />
            Увійти
          </Button>
          <Button className="group relative">
            <b>520 ₴</b>
            <span className="mx-3 h-full w-[1px] bg-white/30" />
            <div className="flex items-center gap-1 transition duration-300 group-hover:opacity-0">
              <ShoppingCart size={16} className="relative" strokeWidth={2} />
              <b>3</b>
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
