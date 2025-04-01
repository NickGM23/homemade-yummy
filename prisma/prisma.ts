import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  return new PrismaClient({
    // log: ['query', 'info', 'warn', 'error'],
    log: [],
  });
};

export const prisma = prismaClientSingleton();

// const prismaClientSingleton = () => {
//   return new PrismaClient();
// };

// declare global {
//   var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
// }

// export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

// if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
