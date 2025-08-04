// C:\Users\Utente\Desktop\quevo\quevo-app\src\lib\prisma.ts
import { PrismaClient } from '@prisma/client';

// OPTIMIZED: Add connection pooling for better performance on free tier
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  // OPTIMIZED: Connection pooling for free tier limitations
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Add connection pool settings for better performance
  __internal: {
    engine: {
      connectionLimit: 1, // Conservative for free tier
      pool: {
        min: 0,
        max: 1,
      },
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;