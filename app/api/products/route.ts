// app/api/products/route.ts
import { prisma } from '@/server/prisma';
import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/server/withErrorHandling';

export const revalidate = 60;

async function getAllProducts(_req: Request) {
  const products = await prisma.product.findMany({
    where: {
      isDeleted: false,
    },
    include: {
      productGroup: true,
    },
  });

  return NextResponse.json(products);
}

// Обгортаємо GET у новий хелпер
export const { GET } = withErrorHandling({
  GET: getAllProducts,
});
