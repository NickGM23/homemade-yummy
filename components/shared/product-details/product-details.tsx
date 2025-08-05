import { ProductWithProductGroup } from '@/@types/prisma';
import { Title } from '../title';

interface Props {
  className?: string;
  product: ProductWithProductGroup;
}

export const ProductDetails: React.FC<Props> = ({ className, product }) => {
  return (
    //md:flex-row
    <div className="px- my-10 flex flex-col items-center justify-center gap-5">
      <Title text={product.name} size="md" className="font-bold" />
      <Title
        text={`Група товарів - "${product.productGroup.name}"`}
        size="sm"
        className="font-bold"
      />
      <img
        className="h-[225px] w-96 max-w-full object-cover"
        src={product.imageUrl}
        alt={product.name}
      />
    </div>
  );
};
