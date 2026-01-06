'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/shared/header';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header
        variant="autoHide"
        isOpen={isMenuOpen}
        setIsOpen={setIsMenuOpen}
        className="bg-white max-sm:sticky max-sm:top-0"
      />
      <main className="flex flex-col">{children}</main>
    </div>
  );
}
