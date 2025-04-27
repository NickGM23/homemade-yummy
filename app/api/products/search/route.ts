import { prisma } from '@/libs/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  console.log(req.nextUrl.searchParams.get('query'));

  const query = req.nextUrl.searchParams.get('query') || '';

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
