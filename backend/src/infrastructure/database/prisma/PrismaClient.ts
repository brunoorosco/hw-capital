import { PrismaClient as PrismaClientLib } from '@prisma/client';

export const prisma = new PrismaClientLib({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export class PrismaClient {
  private static instance: PrismaClientLib;

  static getInstance(): PrismaClientLib {
    if (!PrismaClient.instance) {
      PrismaClient.instance = prisma;
    }
    return PrismaClient.instance;
  }
}
