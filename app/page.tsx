import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Container } from '@/components/shared/container';
import { Title } from '@/components/shared/title';
import { Categories } from '@/components/shared/categories';
import { ProductCard } from '@/components/shared/product-card';
import { SortPopup } from '@/components/shared/sort-popup';
import { PRODUCTS } from '@/data/products';

// let result = PRODUCTS.sort(function (a, b) {
//   if (a['price'] === b['price']) return 0;
//   if (a['price'] < b['price']) return -1;
// });

const result = PRODUCTS;

export default function Home() {
  return (
    <main className="mb-4 min-h-screen rounded-3xl bg-white">
      <div className="top-0 z-[1] bg-white py-5 max-sm:hidden max-sm:opacity-0 sm:sticky sm:shadow-lg sm:shadow-black/5">
        <Container className="mt-2">
          <Title text="Всі смаколики" size="lg" className="font-extrabold" />
        </Container>
        <Container className="relative mt-5 flex gap-2">
          <Categories />
          <SortPopup />
        </Container>
      </div>

      <Container className="mt-4">
        <Title text="Вареники" size="lg" className="mb-4 font-extrabold" />
        <div className="relation flex flex-wrap gap-4">
          {result
            .filter((pr) => pr.idProductGroup === 1)
            .sort((a, b) => (a['price'] > b['price'] ? -1 : 1))
            .map((product, index) => (
              <ProductCard
                key={index}
                className="duration-500 hover:-translate-y-2 hover:shadow-2xl"
                groupName="Вареники"
                price={product.price}
                name={product.name}
                unitWeight={product.unitWeight}
                imageUrl={product.imageUrl}
              />
            ))}
        </div>
      </Container>
      <Container className="mt-4">
        <Title text="Пельмені" size="lg" className="mb-4 font-extrabold" />
        <div className="relation flex flex-wrap gap-4">
          {result.map(
            (product, index) =>
              product.idProductGroup === 2 && (
                <ProductCard
                  key={index}
                  className="duration-500 hover:-translate-y-2 hover:shadow-2xl"
                  groupName="Пельмені"
                  price={product.price}
                  name={product.name}
                  unitWeight={product.unitWeight}
                  imageUrl={product.imageUrl}
                />
              ),
          )}
        </div>
      </Container>
    </main>
  );
}
