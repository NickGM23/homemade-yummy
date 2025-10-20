'use client';

import React from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';

import { Container } from '@/components/shared/container';
import Link from 'next/link';

interface Props {
  className?: string;
}

export const CheckoutHeader: React.FC<Props> = ({ className }) => {
  return (
    <header className={cn('border-b border-gray-100', className)}>
      <Container className="flex items-center justify-between gap-2 py-8 sm:gap-4">
        <div className="flex items-center gap-2">
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
      </Container>
    </header>
  );
};
