// app/api/products/route.ts
import { prisma } from '@/libs/prisma';
import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/libs/withErrorHandling';

async function getAllProducts(req: Request) {
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
