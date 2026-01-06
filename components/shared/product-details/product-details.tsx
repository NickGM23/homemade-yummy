'use client';

import React, { useEffect, useState } from 'react';
import { SerializedProductWithProductGroup } from '@/@types/prisma';
import { Button } from '../../ui';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { UNIT_LABELS } from '@/shared/constants/units';

interface Props {
  product: SerializedProductWithProductGroup;
}

export const ProductDetails: React.FC<Props> = ({ product }) => {
  const { cart, addToCart } = useCartStore();
  const isInCart = cart.some((item) => item.productId === product.id);

  const handleAddToCart = () => {
    if (isInCart) return;
    addToCart({ productId: product.id, quantity: 1 });
    toast.success(`Товар "${product.name}" додано в кошик!`, { icon: '✅' });
  };

  const [activeSection, setActiveSection] = useState<'photo' | 'description' | 'specs'>('photo');

  const menuItems: { id: 'photo' | 'description' | 'specs'; label: string }[] = [
    { id: 'photo', label: 'Фото' },
    { id: 'description', label: 'Опис' },
    { id: 'specs', label: 'Характеристики' },
  ];

  const handleMenuClick = (sectionId: 'photo' | 'description' | 'specs') => {
    const sectionElement = document.getElementById(sectionId);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth' });
    }
    setActiveSection(sectionId);
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections: { id: 'photo' | 'description' | 'specs'; el: HTMLElement | null }[] = [
        { id: 'photo', el: document.getElementById('photo') },
        { id: 'description', el: document.getElementById('description') },
        { id: 'specs', el: document.getElementById('specs') },
      ];

      for (const section of sections) {
        if (!section.el) continue;
        const top = section.el.getBoundingClientRect().top;
        if (top <= 150) {
          setActiveSection(section.id);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-1 flex-col gap-6">
      {/* Навігація */}
      <nav className="sticky top-[114px] z-30 rounded-lg border bg-white p-4 shadow-md sm:top-[125px]">
        <div className="flex gap-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={cn(
                'transition-colors hover:text-primary',
                activeSection === item.id && 'font-semibold text-primary',
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Фото + права панель */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        {/* Фото */}
        <section
          id="photo"
          className="order-1 min-h-[260px] scroll-mt-[195px] rounded-lg border bg-white p-6 shadow-md sm:min-h-[340px] md:order-none md:min-h-[480px] md:flex-1"
        >
          <h3 className="mb-4 text-xl font-bold">Фото</h3>

          {product.imageUrl && (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="max-h-[260px] w-full rounded-lg object-contain sm:max-h-[340px] md:max-h-[420px]"
            />
          )}
        </section>

        {/* Права панель */}
        <aside className="order-2 self-start rounded-lg border bg-white p-6 md:order-none md:w-1/3">
          <h2 className="text-lg font-bold">{product.name}</h2>
          <p className="mt-1">Група: {product.productGroup.name}</p>

          <div className="mt-4 inline-flex gap-2">
            <p className="text-xl font-bold text-primary">{product.price}</p>
            <p className="text-xl font-medium">{product.unitWeight}</p>
          </div>

          <Button className="mt-4 w-full" onClick={handleAddToCart} disabled={isInCart}>
            {isInCart ? 'Вже додано' : 'Додати в кошик'}
            <ShoppingCart size={16} className="ml-2" />
          </Button>
        </aside>
      </div>

      {/* Опис */}
      <section
        id="description"
        className="scroll-mt-[195px] rounded-lg border bg-white p-6 shadow-md"
      >
        <h3 className="mb-4 text-xl font-bold">Опис</h3>
        <p>{product.description ?? 'Опис відсутній.'}</p>
      </section>

      {/* Характеристики */}
      <section id="specs" className="scroll-mt-[195px] rounded-lg border bg-white p-6 shadow-md">
        <h3 className="mb-4 text-xl font-bold">Характеристики</h3>
        <ul className="list-disc pl-5">
          <li>
            Мінімальна вага: {product.minQuantity} {UNIT_LABELS[product.unit]}
          </li>
          <li>
            Мінімальна вагова частка: {product.minPartQuantity} {UNIT_LABELS[product.unit]}
          </li>
        </ul>
      </section>
    </div>
  );
};
