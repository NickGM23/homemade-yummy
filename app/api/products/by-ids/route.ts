import { prisma } from '@/libs/prisma';
import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/libs/withErrorHandling';

async function postProductsByIds(req: Request) {
  const { ids } = await req.json();

  if (!ids || !Array.isArray(ids)) {
    return NextResponse.json({ message: 'Invalid ids' }, { status: 400 });
  }

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
