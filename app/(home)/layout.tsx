import { Header } from '@/components/shared/header';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { fetchActiveProductGroupsWithProducts } from '@/libs/productGroups';

export default async function HomeLayout({ children }: { children: React.ReactNode }) {
  const productGroups = await fetchActiveProductGroupsWithProducts();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header
        variant="autoHide"
        className="bg-white max-sm:sticky max-sm:top-0"
        productGroups={productGroups}
      />

      <main className="flex flex-1 flex-col">{children}</main>

      <ScrollToTop />
    </div>
  );
}
