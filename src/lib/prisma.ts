// C:\Users\Utente\Desktop\quevo\quevo-app\src\lib\prisma.ts
import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

// This is necessary to prevent multiple PrismaClient instances during development
// (due to Next.js hot-reloading). In production, a new instance is created directly.
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // @ts-ignore
  // We attach the PrismaClient instance to the global object
  // to reuse it across hot-reloads in development.
  if (!global.prisma) {
    // @ts-ignore
    global.prisma = new PrismaClient();
  }
  // @ts-ignore
  prisma = global.prisma;
}

export default prisma;