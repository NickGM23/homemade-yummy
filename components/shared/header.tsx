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
import { ProductGroup, Product } from '@prisma/client';
import { Api } from '@/services/api-client';
import { useSession, signIn } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { ProfileButton } from './profile-button';
import { signOut } from 'next-auth/react';
import { AuthModal } from './modals/auth-modal';
import { useCartStore } from '@/store/cart-store';
import { CartModal } from './modals/cart-modal';

interface Props {
  className?: string;
}

type ProductGroupWithProducts = ProductGroup & {
  products: Product[];
};

export const Header: React.FC<Props> = ({ className }) => {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [hideOrShow, setHideOfShort] = useState({});
  const [productGroups, setProductGroups] = React.useState<ProductGroupWithProducts[]>([]);
  const [openAuthModal, setOpenAuthModal] = React.useState(false);
  const countItem = useCartStore((state) => state.countItems());
  const totalPrice = useCartStore((state) => state.totalPrice());
  const [openCart, setOpenCart] = React.useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  //console.log(session, 991);

  useEffect(() => {
    isOpen ? (document.body.style.overflow = 'hidden') : (document.body.style.overflow = 'auto');
  }, [isOpen]);

  useEffect(() => {
    async function fetchStories() {
      Api.product_groups.GetAllProductGroups().then((items) => setProductGroups(items));
    }

    fetchStories();
  }, []);

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
  const onClickSignOut = () => {
    signOut({
      callbackUrl: '/',
    });
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
          <AuthModal open={openAuthModal} onClose={() => setOpenAuthModal(false)} />
          <CartModal open={openCart} onClose={() => setOpenCart(false)} />
          <ProfileButton onClickSignIn={() => setOpenAuthModal(true)} />
          {/* <Button
            onClick={() => signIn('github', { callbackUrl: '/', redirect: true })}
            variant="outline"
            className="hidden items-center gap-2 font-bold max-sm:hidden lg:flex [@media(any-hover:hover){&:hover}]:border-orange-600 [@media(any-hover:hover){&:hover}]:bg-green-300"
          >
            <User size={16} />
            Увійти
          </Button>

          <Button onClick={onClickSignOut} variant="secondary" className="text-base" type="button">
            Вийти
          </Button> */}

          <Button className="group relative hidden sm:flex" onClick={() => setOpenCart(true)}>
            {mounted && (
              <>
                <b>{totalPrice}</b>
              </>
            )}

            <span className="mx-1 h-full w-[1px] bg-white/30" />
            <div className="flex items-center gap-1 transition duration-300 group-hover:opacity-0">
              <ShoppingCart size={16} className="relative" strokeWidth={2} />
              {mounted && (
                <>
                  <b>{countItem}</b>
                </>
              )}
            </div>
            <ArrowRight
              size={20}
              className="absolute right-5 -translate-x-2 opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100"
            />
          </Button>

          <Button className="group relative flex sm:hidden" onClick={() => setOpenCart(true)}>
            <div className="flex items-center gap-1">
              <ShoppingCart size={16} className="relative" strokeWidth={2} />
              {mounted && (
                <>
                  <b>{countItem}</b>
                </>
              )}
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
                <SearchInput onAfterSelectItem={closeMenu} />
              </div>
            </div>
            <div className="border-b border-gray-400 py-4">
              <b>Каталог товарів</b>
              <div className="flex w-[100%] flex-row pt-2">
                <Categories
                  isShowByBurgerMenu={true}
                  onChange={closeMenu}
                  productGroupsWithProducts={productGroups}
                />
              </div>
            </div>
            <div className="flex items-center gap-5 border-b border-gray-400 py-4">
              <b>Корзина</b>
              <Button className="group relative flex" onClick={() => setOpenCart(true)}>
                {mounted && (
                  <>
                    <b>{totalPrice}</b>
                  </>
                )}
                <span className="mx-1 h-full w-[1px] bg-white/30" />
                <div className="flex items-center gap-1 transition duration-300 group-hover:opacity-0">
                  <ShoppingCart size={16} className="relative" strokeWidth={2} />
                  {mounted && (
                    <>
                      <b>{countItem}</b>
                    </>
                  )}
                </div>
                <ArrowRight
                  size={20}
                  className="absolute right-5 -translate-x-2 opacity-0 transition duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                />
              </Button>
            </div>
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
                      onClickProfile={() => closeMenu()}
                      isVisibleAll={true}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="py-4">
              <b>Ми в соціальних мережах</b>
              <div>
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
        </div>
      </Container>
    </header>
  );
};
