import { prisma } from '@/libs/prisma';
import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/libs/withErrorHandling';
import { productByIdsSchema } from '@/libs/validation/product';

async function postProductsByIds(req: Request) {
  const { ids } = productByIdsSchema.parse(await req.json());

  const products = await prisma.product.findMany({
    where: {
      id: { in: ids },
      isDeleted: false,
    },
    include: { productGroup: true },
  });

  return NextResponse.json(products);
}

// Використовуємо хелпер
export const { POST } = withErrorHandling({
  POST: postProductsByIds,
});
