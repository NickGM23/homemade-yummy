import { prisma } from '@/server/prisma';
import { getUserSession } from '@/server/get-user-session';
import { NextResponse } from 'next/server';

export async function requireAdmin() {
  const session = await getUserSession();

  if (!session) {
    throw new Error('UNAUTHORIZED');
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(session.id) },
  });

  if (!user?.isAdmin) {
    throw new Error('FORBIDDEN');
  }

  return user;
}
