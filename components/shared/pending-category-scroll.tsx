'use client';

import React from 'react';

import { PENDING_CATEGORY_KEY, scrollToCategory } from './category-scroll';

/**
 * Головна сторінка: якщо категорію вибрали в бургер-меню на іншій сторінці (Categories перекинув
 * сюди й залишив селектор у sessionStorage), після монтування прокручує до неї.
 */
export const PendingCategoryScroll: React.FC = () => {
  React.useEffect(() => {
    let selector: string | null = null;
    try {
      selector = sessionStorage.getItem(PENDING_CATEGORY_KEY);
    } catch {
      return;
    }
    if (!selector) return;
    const target = selector;

    // Ключ видаляємо лише після прокрутки: у dev (StrictMode) ефект запускається двічі, і якщо
    // стерти його одразу, другий запуск уже нічого не знайде.
    const clearPending = () => {
      try {
        sessionStorage.removeItem(PENDING_CATEGORY_KEY);
      } catch {
        // нічого не робимо
      }
    };

    // Невелика пауза: Next після переходу сам скролить нагору, це не має перебити нашу прокрутку.
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tryScroll = () => {
      if (scrollToCategory(target, true) || ++attempts >= 20) {
        clearPending();
        return;
      }
      timer = setTimeout(tryScroll, 100);
    };
    timer = setTimeout(tryScroll, 100);

    return () => clearTimeout(timer);
  }, []);

  return null;
};
