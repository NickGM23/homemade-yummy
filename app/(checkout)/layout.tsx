import { CheckoutHeader } from '@/components/shared/checkout';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-[#F4F1EE]">
      <CheckoutHeader className="bg-white max-sm:sticky max-sm:top-0" />
      {children}
    </main>
  );
}
