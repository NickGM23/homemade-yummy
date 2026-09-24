'use client';

import React from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { X } from 'lucide-react';

import { SearchInput } from '../search-input';
import { Categories } from '@/components/shared/categories';
import { ProfileButton } from '../profile-button';
import type { ProductGroupWithProducts } from '@/services/product-groups';
import { HeaderCartButton } from './header-cart-button';

interface Props {
  style: React.CSSProperties;
  onClose: () => void;
  productGroups: ProductGroupWithProducts[];
  mounted: boolean;
  totalPrice: number;
  countItem: number;
  onOpenCart: () => void;
  onOpenAuthModal: () => void;
}

export const MobileMenu: React.FC<Props> = ({
  style,
  onClose,
  productGroups,
  mounted,
  totalPrice,
  countItem,
  onOpenCart,
  onOpenAuthModal,
}) => {
  const { data: session } = useSession();

  return (
    <div
      style={style}
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
          <button
            type="button"
            aria-label="Закрити меню"
            onClick={onClose}
            className="cursor-pointer hover:bg-primary"
          >
            <X size={32} />
          </button>
        </div>

        {/* SEARCH */}
        <div className="border-b border-gray-400 py-4">
          <b>Пошук</b>
          <div className="pt-2">
            <SearchInput onAfterSelectItem={onClose} />
          </div>
        </div>

        {/* CATEGORIES */}
        <div className="border-b border-gray-400 py-4">
          <b>Каталог товарів</b>
          <div className="flex w-full flex-row pt-2">
            <Categories
              isShowByBurgerMenu={true}
              onChange={onClose}
              productGroupsWithProducts={productGroups}
            />
          </div>
        </div>

        {/* CART */}
        <div className="flex items-center gap-5 border-b border-gray-400 py-4">
          <b>Корзина</b>
          <HeaderCartButton
            className="flex"
            mounted={mounted}
            totalPrice={totalPrice}
            countItem={countItem}
            onClick={onOpenCart}
          />
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
                  onClickSignIn={onOpenAuthModal}
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
                  onClickSignIn={onOpenAuthModal}
                  onClickProfile={onClose}
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
            rel="noreferrer"
            className="inline-block cursor-pointer"
            href="https://invite.viber.com/?g2=AQBI%2BqwSzGASd1PReIbHecaMp4g29XjuQbdKW%2FzGL0G9evTj%2FGgqunKZS5Ja%2FybE"
          >
            <Image className="mt-4" src="/logo/viber.svg" width={40} height={40} alt="Logo" />
          </a>
        </div>
      </div>
    </div>
  );
};
