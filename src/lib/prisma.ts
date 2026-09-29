import { PrismaClient } from '@prisma/client';

/**
 * Prisma is instantiated once and cached on `globalThis` in dev so hot
 * reloads don't exhaust Postgres connections with a fresh client per reload.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
