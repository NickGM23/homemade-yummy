import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error'] // 🔹 тільки в dev
        : [],
  });
};

export const prisma = prismaClientSingleton();
