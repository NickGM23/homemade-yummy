import { ProductGroup, Product } from '@prisma/client';
import React from 'react';
import { Title } from './title';
import { ProductCard } from './product-card';
import { ProductGroupWithProducts } from '@/services/product-groups';
import { useCategoryStore } from '@/store/category';
import { useIntersection } from 'react-use';

interface Props {
  productGroup: ProductGroupWithProducts;
  className?: string;
}

export const ProductGroupItem: React.FC<Props> = ({ productGroup, className }) => {
  const setActiveIdProductGroup = useCategoryStore((state) => state.setActiveId);
  const intersectionRef = React.useRef(null);
  const intersection = useIntersection(intersectionRef, {
    threshold: 0.2,
  });

  React.useEffect(() => {
    if (intersection?.isIntersecting) {
      //console.log(idProductGroup, catsInfo[idProductGroup - 1]);
      setActiveIdProductGroup(productGroup.id * 100);
    }
  });
  return (
    productGroup && (
      <div className={className} id={productGroup.codeGroup} ref={intersectionRef}>
        <Title
          text={productGroup.name}
          size="lg"
          className="sticky top-[112px] mb-4 bg-white font-extrabold"
        />
        {productGroup.products.length > 0 && (
          <div className="relation flex flex-wrap gap-4">
            {productGroup.products.map((product, index) => (
              <ProductCard
                key={index}
                className="duration-500 hover:-translate-y-2 hover:shadow-2xl"
                groupName={productGroup.codeGroup}
                price={parseFloat(product.price.toString())}
                //price = {0}
                name={product.name}
                unitWeight={product.unitWeight}
                imageUrl={product.imageUrl}
              />
            ))}
          </div>
        )}
      </div>
    )
  );
};
