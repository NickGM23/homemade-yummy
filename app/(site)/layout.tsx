import { Header } from '@/components/shared/header';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { fetchActiveProductGroupsWithProducts } from '@/libs/productGroups';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const productGroups = await fetchActiveProductGroupsWithProducts();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header variant="fixed" productGroups={productGroups} />

      <main className="flex flex-1 flex-col pt-[125px]">{children}</main>

      <ScrollToTop />
    </div>
  );
}
