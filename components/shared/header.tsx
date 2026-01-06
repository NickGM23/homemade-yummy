'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ArrowRight, ShoppingCart, Menu, X } from 'lucide-react';
import { ProductGroup, Product } from '@prisma/client';

import { cn } from '@/lib/utils';
import { Container } from './container';
import { Button } from '../ui';
import { SearchInput } from './search-input';
import { Categories } from '@/components/shared/categories';
import { BackDrop } from './back-drop';
import { Api } from '@/services/api-client';
import { AuthModal } from './modals/auth-modal';
import { CartModal } from './modals/cart-modal';
import { useCartProducts } from '@/hooks/useCartProducts';
import { ProfileButton } from './profile-button';

type ProductGroupWithProducts = ProductGroup & {
  products: Product[];
};

interface HeaderProps {
  variant: 'fixed' | 'autoHide';
  className?: string;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Header: React.FC<HeaderProps> = ({ className, isOpen, setIsOpen, variant }) => {
  const { data: session } = useSession();
  const [hideOrShow, setHideOfShort] = useState<React.CSSProperties>({});
  const [productGroups, setProductGroups] = useState<ProductGroupWithProducts[]>([]);
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [openCart, setOpenCart] = useState(false);
  const { products, totalPrice } = useCartProducts();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    Api.product_groups.GetAllProductGroups().then((items) => setProductGroups(items));
  }, []);

  const closeMenu = () => {
    setIsOpen(false);
    setHideOfShort({});
  };

  const openMenu = () => {
    setIsOpen(true);
    setHideOfShort({ display: 'block' });
  };

  const handleMenu = () => {
    setIsOpen((prev) => !prev);
    setHideOfShort((prev) => (prev.display ? {} : { display: 'block' }));
  };

  const onClickSignOut = () => {
    signOut({ callbackUrl: '/' });
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
          <Menu
            size={40}
            className="mr-2 cursor-pointer hover:bg-gray-100 sm:mr-6"
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
          <Button className="group relative hidden sm:flex" onClick={() => setOpenCart(true)}>
            {mounted && <b>{totalPrice}</b>}
            <span className="mx-1 h-full w-[1px] bg-white/30" />
            <div className="flex items-center gap-1 transition duration-300 group-hover:opacity-0">
              <ShoppingCart size={16} strokeWidth={2} />
              {mounted && <b>{countItem}</b>}
            </div>
            <ArrowRight
              size={20}
              className="absolute right-5 -translate-x-2 opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100"
            />
          </Button>

          {/* Mobile cart */}
          <Button className="group relative flex sm:hidden" onClick={() => setOpenCart(true)}>
            <div className="flex items-center gap-1">
              <ShoppingCart size={16} strokeWidth={2} />
              {mounted && <b>{countItem}</b>}
            </div>
          </Button>
        </div>

        {/* BURGER BACKDROP */}
        {isOpen && (
          <BackDrop
            handelMenu={handleMenu}
            className="fixed inset-0 z-20 bg-gray-300 opacity-80 max-sm:opacity-100"
          />
        )}

        {/* BURGER MENU */}
        <div
          style={hideOrShow}
          className="fixed inset-0 z-30 hidden w-full overflow-auto bg-gray-100/90 p-6 transition-all duration-300 ease-in-out sm:max-w-[480px]"
        >
          <div className="flex flex-col gap-1">
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
              <X size={32} onClick={closeMenu} className="cursor-pointer hover:bg-[#ffa700]" />
            </div>

            {/* SEARCH */}
            <div className="border-b border-gray-400 py-4">
              <b>Пошук</b>
              <div className="pt-2">
                <SearchInput onAfterSelectItem={closeMenu} />
              </div>
            </div>

            {/* CATEGORIES */}
            <div className="border-b border-gray-400 py-4">
              <b>Каталог товарів</b>
              <div className="flex w-full flex-row pt-2">
                <Categories
                  isShowByBurgerMenu={true}
                  onChange={closeMenu}
                  productGroupsWithProducts={productGroups}
                />
              </div>
            </div>

            {/* CART */}
            <div className="flex items-center gap-5 border-b border-gray-400 py-4">
              <b>Корзина</b>
              <Button className="group relative flex" onClick={() => setOpenCart(true)}>
                {mounted && <b>{totalPrice}</b>}
                <span className="mx-1 h-full w-[1px] bg-white/30" />
                <div className="flex items-center gap-1 transition duration-300 group-hover:opacity-0">
                  <ShoppingCart size={16} strokeWidth={2} />
                  {mounted && <b>{countItem}</b>}
                </div>
                <ArrowRight
                  size={20}
                  className="absolute right-5 -translate-x-2 opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                />
              </Button>
            </div>

            {/* PROFILE */}
            <div className="border-b border-gray-400 py-4">
              <b>Особистий кабінет</b>
              {!session ? (
                <div className="mt-2 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gray-50 p-4">
                  <p className="min-w-[200px] flex-1">
                    Увійдіть, щоб мати можливість переглядати історію ваших заказів. Отримувати
                    рекомендації та персональні знижки.
                  </p>
                  <div className="pt-2">
                    <ProfileButton
                      onClickSignIn={() => setOpenAuthModal(true)}
                      signButtonText="Увійдіть в особистий кабінет"
                      isVisibleAll={true}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center pt-2">
                  <div className="w-full rounded-2xl bg-gray-50 p-4">
                    <p className="font-bold">{session.user?.fullName}</p>
                    <p>{session.user?.email}</p>
                  </div>
                  <div className="m-2">
                    <ProfileButton
                      onClickSignIn={() => setOpenAuthModal(true)}
                      onClickProfile={closeMenu}
                      isVisibleAll={true}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SOCIAL */}
            <div className="py-4">
              <b>Ми в соціальних мережах</b>
              <a
                title="Viber"
                target="_blank"
                className="inline-block cursor-pointer"
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
