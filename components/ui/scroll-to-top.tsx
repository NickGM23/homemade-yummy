'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export function ScrollToTop() {
  const [isAtTop, setIsAtTop] = useState(true);

  const handleScroll = () => {
    setIsAtTop(window.scrollY === 0);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isAtTop) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Прокрутити вгору"
      className="fixed bottom-16 right-8 z-50 flex h-16 w-16 cursor-pointer items-center justify-center rounded-full bg-slate-200"
    >
      <Image className="z-30" src="/footer/arrow_up.svg" alt="" width={24} height={24} />
    </button>
  );
}
