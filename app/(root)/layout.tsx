'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/shared/header';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Блокуємо скрол у body, коли меню відкрите
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Очистка при розмонтуванні
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  return (
    <main className="min-h-screen">
      <Header
        className="z-[1] bg-white max-sm:sticky max-sm:top-0"
        isOpen={isMenuOpen}
        setIsOpen={setIsMenuOpen}
      />
      {children}
    </main>
  );
}
