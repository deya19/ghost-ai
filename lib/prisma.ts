import prismaPkg from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const { PrismaClient } = prismaPkg
type PrismaClientInstance = InstanceType<typeof PrismaClient>

function createClient(): PrismaClientInstance {
  const DATABASE_URL: string = process.env.DATABASE_URL || ""
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Configure it in your environment before starting the app.")
  }

  if (DATABASE_URL.startsWith("prisma+postgres://")) {
    return new PrismaClient()
  }

  const adapter = new PrismaPg({ connectionString: DATABASE_URL })
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0])
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClientInstance }

function getClient(): PrismaClientInstance {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient()
  }
  return globalForPrisma.prisma
}

export const prisma = new Proxy(
  {} as PrismaClientInstance,
  {
    get(_target, prop, receiver) {
      return Reflect.get(getClient(), prop, receiver)
    },
    has(_target, prop) {
      return prop in getClient()
    },
  }
)
