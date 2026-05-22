import { CheckoutHeader } from '@/components/shared/checkout';
import { ScrollToTop } from '@/components/ui/scroll-to-top';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col bg-[#F4F1EE]">
      <CheckoutHeader className="bg-white max-sm:sticky max-sm:top-0" />

      <main className="flex flex-1 flex-col">{children}</main>

      <ScrollToTop />
    </div>
  );
}
