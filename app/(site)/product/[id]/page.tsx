import type { Metadata } from 'next';
import { prisma } from '@/server/prisma';
import { Container } from '@/components/shared/container';
import { notFound } from 'next/navigation';
import { ProductDetails } from '@/components/shared/product-details';

export const revalidate = 60;

export async function generateStaticParams() {
  const products = await prisma.product.findMany({
    where: { isDeleted: false },
    select: { id: true },
  });

  return products.map((product) => ({ id: String(product.id) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const productId = Number(id);

  if (!Number.isInteger(productId) || productId <= 0) {
    notFound();
  }

  const product = await prisma.product.findFirst({
    where: { id: productId },
  });

  if (!product) {
    notFound();
  }

  return {
    title: `${product.name} — домашні напівфабрикати`,
    description: `${product.name} — домашні напівфабрикати на замовлення в Черкасах.`,
    alternates: {
      canonical: `/product/${product.id}`,
    },
    openGraph: {
      title: product.name,
      description: `${product.name} — домашні напівфабрикати на замовлення в Черкасах.`,
      images: [product.imageUrl],
      type: 'website',
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const productId = Number(id);

  if (!Number.isInteger(productId) || productId <= 0) {
    notFound();
  }

  const productRaw = await prisma.product.findFirst({
    where: { id: productId },
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

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || undefined,
    image: `${baseUrl}${product.imageUrl}`,
    offers: {
      '@type': 'Offer',
      url: `${baseUrl}/product/${product.id}`,
      price: product.price,
      priceCurrency: 'UAH',
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <Container className="mt-2 sm:mt-8">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <ProductDetails product={product} />
    </Container>
  );
}
