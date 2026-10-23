// Ключ sessionStorage: категорія, до якої треба прокрутити після переходу на головну сторінку.
export const PENDING_CATEGORY_KEY = 'scrollToSelector';

/** Прокручує до блоку категорії; повертає false, якщо блоку (ще) немає на сторінці. */
export const scrollToCategory = (selector: string, isShowByBurgerMenu?: boolean): boolean => {
  const block = document.querySelector<HTMLDivElement>(selector);
  if (!block) return false;

  window.scrollTo({
    top: isShowByBurgerMenu ? block.offsetTop - 140 : block.offsetTop - 240,
    behavior: 'smooth',
  });

  return true;
};
