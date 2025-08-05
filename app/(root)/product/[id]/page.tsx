import { use } from 'react';
import { prisma } from '@/prisma/prisma-client';
import { Container } from '@/components/shared/container';
import { notFound } from 'next/navigation';
import { ProductDetails } from '@/components/shared/product-details';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findFirst({
    where: { id: Number(id) },
    include: {
      productGroup: true,
    },
  });

  if (!product) {
    return notFound();
  }

  return (
    <Container>
      <ProductDetails product={product} />
    </Container>
  );
}
