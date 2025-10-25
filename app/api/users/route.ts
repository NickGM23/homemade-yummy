// app/api/users/route.ts
import { prisma } from '@/libs/prisma';
import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/libs/withErrorHandling';

async function getUsers(req: Request) {
  const users = await prisma.user.findMany();
  return NextResponse.json(users);
}

async function createUser(req: Request) {
  const data = await req.json();
  const user = await prisma.user.create({ data });
  return NextResponse.json(user);
}

// Обгортаємо одразу всі методи
export const { GET, POST } = withErrorHandling({
  GET: getUsers,
  POST: createUser,
});
