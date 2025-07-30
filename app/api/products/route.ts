import { prisma } from '@/libs/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
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
