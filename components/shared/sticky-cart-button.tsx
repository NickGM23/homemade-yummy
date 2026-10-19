'use client';

import React from 'react';

import { cn } from '@/lib/utils';
import { useCartProducts } from '@/hooks/useCartProducts';
import { HeaderCartButton } from './header/header-cart-button';
import { CartModal } from './modals/cart-modal';

/**
 * Кнопка кошика для прилиплої панелі категорій: з'являється, коли header (#site-header)
 * повністю прокрутили за межі екрана, і ховається, щойно він знову стає видимим.
 */
export const StickyCartButton: React.FC = () => {
  const { products, totalPrice } = useCartProducts();
  const [mounted, setMounted] = React.useState(false);
  const [isHeaderHidden, setIsHeaderHidden] = React.useState(false);
  const [openCart, setOpenCart] = React.useState(false);
  // Модалку монтуємо лише після першого відкриття: вона сама завантажує товари кошика.
  const [cartEverOpened, setCartEverOpened] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const header = document.getElementById('site-header');
    if (!header) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsHeaderHidden(!entry.isIntersecting);
    });
    observer.observe(header);

    return () => observer.disconnect();
  }, []);

  const handleOpenCart = () => {
    setCartEverOpened(true);
    setOpenCart(true);
  };

  return (
    <>
      {/* `inert` — поки кнопки не видно, її не можна ні натиснути, ні сфокусувати Tab-ом. */}
      <div
        inert={!isHeaderHidden}
        className={cn(
          'transition-opacity duration-300',
          isHeaderHidden ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      >
        <HeaderCartButton
          mounted={mounted}
          totalPrice={totalPrice}
          countItem={products.length}
          onClick={handleOpenCart}
        />
      </div>

      {cartEverOpened && <CartModal open={openCart} onClose={() => setOpenCart(false)} />}
    </>
  );
};
