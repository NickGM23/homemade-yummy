import { Header } from '@/components/shared/header';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen">
      <Header className="z-[1] bg-white max-sm:sticky max-sm:top-0" />
      {children}
    </main>
  );
}
