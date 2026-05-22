import { Header } from '@/components/shared/header';
import { ScrollToTop } from '@/components/ui/scroll-to-top';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header variant="autoHide" className="bg-white max-sm:sticky max-sm:top-0" />

      <main className="flex flex-1 flex-col">{children}</main>

      <ScrollToTop />
    </div>
  );
}
