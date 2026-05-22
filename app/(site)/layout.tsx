import { Header } from '@/components/shared/header';
import { ScrollToTop } from '@/components/ui/scroll-to-top';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header variant="fixed" />

      <main className="flex flex-1 flex-col pt-[125px]">{children}</main>

      <ScrollToTop />
    </div>
  );
}
