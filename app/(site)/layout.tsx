'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/shared/header';
import { ScrollToTop } from '@/components/ui/scroll-to-top';

const HEADER_HEIGHT = 125;

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header variant="fixed" isOpen={isMenuOpen} setIsOpen={setIsMenuOpen} />
      {/* paddingTop = висота Header */}
      <main className="pt-[125px]">
        {children}
        <ScrollToTop />
      </main>
    </div>
  );
}
