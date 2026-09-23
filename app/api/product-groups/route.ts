import { prisma } from '@/libs/prisma';
import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/libs/withErrorHandling';

export const revalidate = 60;

async function getProductGroups() {
  const productGroups = await prisma.productGroup.findMany({
    where: {
      isDeleted: false,
    },
    include: {
      products: {
        where: {
          isDeleted: false,
        },
        orderBy: {
          positionNumber: 'asc',
        },
      },
    },
    orderBy: {
      positionNumber: 'asc',
    },
  });

  return NextResponse.json(productGroups);
}

// Обгортка через хелпер
export const { GET } = withErrorHandling({
  GET: getProductGroups,
});
