import { use } from 'react';
import { prisma } from '@/libs/prisma';
import { Container } from '@/components/shared/container';
import { notFound } from 'next/navigation';
import { ProductDetails } from '@/components/shared/product-details';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productRaw = await prisma.product.findFirst({
    where: { id: Number(id) },
    include: {
      productGroup: true,
    },
  });

  if (!productRaw) {
    return notFound();
  }

  // Сериалізація полів Decimal у number (або string)
  const product = {
    ...productRaw,
    price: productRaw.price.toNumber(),
    minPartQuantity: productRaw.minPartQuantity.toNumber(),
    minQuantity: productRaw.minQuantity.toNumber(), // або toString(), залежно від потреби
    // якщо є інші поля типу Decimal, їх також треба обробити
    productGroup: {
      ...productRaw.productGroup,
      // якщо в productGroup є Decimal — теж оброби
    },
  };

  return (
    <Container>
      <ProductDetails product={product} />
    </Container>
  );
}
