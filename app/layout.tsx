import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/shared/header';

const nunito = Nunito({
  subsets: ['cyrillic'],
  variable: '--font-nunito',
  weight: ['400', '500', '600', '700', '800', '900', '1000'],
});

export const metadata: Metadata = {
  title: 'Домашні смаколики | Головна',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={nunito.variable}>
        <main className="min-h-screen">
          <Header className="z-[1] bg-white max-sm:sticky max-sm:top-0" />
          {children}
        </main>
      </body>
    </html>
  );
}
