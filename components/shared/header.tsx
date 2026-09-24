'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Menu } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Container } from './container';
import { Button } from '../ui';
import { SearchInput } from './search-input';
import { BackDrop } from './back-drop';
import type { ProductGroupWithProducts } from '@/services/product-groups';
import { AuthModal } from './modals/auth-modal';
import { CartModal } from './modals/cart-modal';
import { useCartProducts } from '@/hooks/useCartProducts';
import { ProfileButton } from './profile-button';
import { useMenuStore } from '@/store/menu';
import { HeaderCartButton, MobileMenu } from './header/index';

interface HeaderProps {
  variant: 'fixed' | 'autoHide';
  className?: string;
  productGroups: ProductGroupWithProducts[];
}

export const Header: React.FC<HeaderProps> = ({ className, variant, productGroups }) => {
  const isMenuOpen = useMenuStore((state) => state.isMenuOpen);
  const setIsMenuOpen = useMenuStore((state) => state.setIsMenuOpen);
  const [hideOrShow, setHideOfShort] = useState<React.CSSProperties>({});
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [openCart, setOpenCart] = useState(false);
  const { products, totalPrice } = useCartProducts();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const closeMenu = () => {
    setIsMenuOpen(false);
    setHideOfShort({});
  };

  const openMenu = () => {
    setIsMenuOpen(true);
    setHideOfShort({ display: 'block' });
  };

  const handleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setHideOfShort((prev) => (prev.display ? {} : { display: 'block' }));
  };

  const countItem = products.length;

  return (
    <header
      className={cn(
        'border-b border-gray-100 transition-all duration-300',
        variant === 'fixed'
          ? 'fixed left-0 right-0 top-0 z-50 bg-white' // <- суцільний білий фон
          : 'relative bg-transparent',
        className,
      )}
    >
      <Container className="flex items-center justify-between gap-2 py-8 sm:gap-4">
        {/* LEFT SECTION */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Відкрити меню"
            onClick={openMenu}
            className="mr-2 cursor-pointer hover:bg-gray-100 sm:mr-6"
          >
            <Menu size={40} />
          </button>
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

        {/* CENTER SEARCH */}
        <div className="mx-2 hidden flex-1 sm:block lg:mx-6">
          <SearchInput />
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-3">
          <AuthModal open={openAuthModal} onClose={() => setOpenAuthModal(false)} />
          <CartModal open={openCart} onClose={() => setOpenCart(false)} />
          <ProfileButton onClickSignIn={() => setOpenAuthModal(true)} />

          {/* Desktop cart */}
          <HeaderCartButton
            className="hidden sm:flex"
            mounted={mounted}
            totalPrice={totalPrice}
            countItem={countItem}
            onClick={() => setOpenCart(true)}
          />

          {/* Mobile cart */}
          <Button className="group relative flex sm:hidden" onClick={() => setOpenCart(true)}>
            <div className="flex items-center gap-1">
              <ShoppingCart size={16} strokeWidth={2} />
              {mounted && <b>{countItem}</b>}
            </div>
          </Button>
        </div>

        {/* BURGER BACKDROP */}
        {isMenuOpen && (
          <BackDrop
            handelMenu={handleMenu}
            className="fixed inset-0 z-20 bg-gray-300 opacity-80 max-sm:opacity-100"
          />
        )}

        {/* BURGER MENU */}
        <MobileMenu
          style={hideOrShow}
          onClose={closeMenu}
          productGroups={productGroups}
          mounted={mounted}
          totalPrice={totalPrice}
          countItem={countItem}
          onOpenCart={() => setOpenCart(true)}
          onOpenAuthModal={() => setOpenAuthModal(true)}
        />
      </Container>
    </header>
  );
};
