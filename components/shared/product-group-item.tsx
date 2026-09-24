'use client';

import React from 'react';
import { Title } from './title';
import { ProductCard } from './product-card';
import { ProductGroupWithProducts } from '@/services/product-groups';
import { useCategoryStore } from '@/store/category';
import { useMenuStore } from '@/store/menu';
import { cn } from '@/lib/utils';

interface Props {
  productGroup: ProductGroupWithProducts;
  className?: string;
}

export const ProductGroupItem: React.FC<Props> = ({ productGroup, className }) => {
  const setActiveIdProductGroup = useCategoryStore((state) => state.setActiveId);
  const isMenuOpen = useMenuStore((state) => state.isMenuOpen);
  const intersectionRef = React.useRef(null);

  React.useEffect(() => {
    const el = intersectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActiveIdProductGroup(productGroup.id * 100);
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
    };
  }, [productGroup.id, setActiveIdProductGroup]);
  return (
    productGroup && (
      <div className={className} id={productGroup.codeGroup} ref={intersectionRef}>
        <Title
          text={productGroup.name}
          size="lg"
          className={cn('mb-4 bg-white font-extrabold', !isMenuOpen && 'sticky top-[112px]')}
        />
        {productGroup.products.length > 0 && (
          <div className="relation flex flex-wrap gap-4">
            {productGroup.products.map((product) => (
              <ProductCard
                key={product.id}
                className="duration-500 hover:-translate-y-2 hover:shadow-2xl"
                groupName={productGroup.codeGroup}
                price={parseFloat(product.price.toString())}
                //price = {0}
                name={product.name}
                unitWeight={product.unitWeight}
                imageUrl={product.imageUrl}
                productId={product.id}
                minQuantity={parseFloat(product.minQuantity.toString())}
                minPartQuantity={parseFloat(product.minPartQuantity.toString())}
              />
            ))}
          </div>
        )}
      </div>
    )
  );
};
