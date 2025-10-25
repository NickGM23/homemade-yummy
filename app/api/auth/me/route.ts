import { prisma } from '@/libs/prisma';
import { authOptions } from '@/shared/constants/auth-options';
import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/libs/withErrorHandling';

export const dynamic = 'force-dynamic';

async function getUser() {
  const user = await getServerSession(authOptions);

  if (!user) {
    return NextResponse.json({ message: 'Ви не авторизовані' }, { status: 401 });
  }

  const data = await prisma.user.findUnique({
    where: {
      id: Number(user.user.id),
    },
    select: {
      fullName: true,
      email: true,
      password: false,
    },
  });

  return NextResponse.json(data);
}

// Обгортка у хелпер
export const { GET } = withErrorHandling({
  GET: getUser,
});
