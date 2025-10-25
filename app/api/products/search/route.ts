import { prisma } from '@/libs/prisma';
import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/libs/withErrorHandling';

async function searchProducts(req: Request) {
  const url = new URL(req.url);
  const query = url.searchParams.get('query') || '';

  const products = await prisma.product.findMany({
    where: {
      OR: [
        {
          name: {
            contains: query,
            mode: 'insensitive',
          },
        },
        {
          aliasForSearch: {
            contains: query,
            mode: 'insensitive',
          },
        },
      ],
    },
    include: {
      productGroup: true,
    },
  });

  return NextResponse.json(products);
}

// Обгортаємо GET у новий хелпер
export const { GET } = withErrorHandling({
  GET: searchProducts,
});
