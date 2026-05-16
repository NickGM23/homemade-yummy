import type { Metadata } from 'next';
import { Nunito } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/shared/providers';

const nunito = Nunito({
  subsets: ['cyrillic'],
  variable: '--font-nunito',
  weight: ['400', '500', '600', '700', '800', '900', '1000'],
});

export const metadata: Metadata = {
  title: 'Домашні смаколики — напівфабрикати в Черкасах',
  description: 'Домашні напівфабрикати на замовлення в Черкасах',
  other: {
    'google-site-verification': 'ZU-ttPlAdLmln0OmSjPqLcZvVD9Q8DNtqBSfWGH9GVQ',
  },
  openGraph: {
    title: 'Домашні смаколики — напівфабрикати в Черкасах',
    description: 'Домашні напівфабрикати на замовлення в Черкасах',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className={nunito.variable}>
        <main className="min-h-screen">
          <Providers>{children}</Providers>
        </main>
      </body>
    </html>
  );
}
