import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"


const DATABASE_URL: string = process.env.DATABASE_URL || "";
if (!DATABASE_URL || DATABASE_URL === "") {
  throw new Error("DATABASE_URL is not set. Configure it in your environment before starting the app.")
}

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
