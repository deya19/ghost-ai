import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const DATABASE_URL = process.env.DATABASE_URL ?? ""

function createClient(): PrismaClient {
  if (DATABASE_URL.startsWith("prisma+postgres://")) {
    // Accelerate connection — no adapter needed, Accelerate handles the pool
    return new PrismaClient()
  }

  const adapter = new PrismaPg({ connectionString: DATABASE_URL })
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0])
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? createClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
