import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function getEditorProjects() {
  const { userId } = await auth()

  if (!userId) {
    return { owned: [], shared: [] }
  }

  const user = await currentUser()
  const emails = user?.emailAddresses.map((e) => e.emailAddress) ?? []

  const owned = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
  })

  const shared = emails.length
    ? await prisma.project.findMany({
        where: {
          ownerId: { not: userId },
          collaborators: {
            some: {
              email: { in: emails },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    : []

  return { owned, shared }
}
