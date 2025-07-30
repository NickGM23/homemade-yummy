import { prisma } from '@/libs/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
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
