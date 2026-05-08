import { auth, currentUser } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export interface CurrentProjectIdentity {
  userId: string | null
  primaryEmail: string | null
}

export async function getCurrentProjectIdentity(): Promise<CurrentProjectIdentity> {
  const { userId } = await auth()

  if (!userId) {
    return { userId: null, primaryEmail: null }
  }

  const user = await currentUser()

  return {
    userId,
    primaryEmail: user?.primaryEmailAddress?.emailAddress ?? null,
  }
}

export async function getAccessibleProject(projectId: string) {
  const { userId, primaryEmail } = await getCurrentProjectIdentity()

  if (!userId) {
    return { status: "unauthenticated" as const, project: null }
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      collaborators: {
        where: primaryEmail ? { email: primaryEmail } : { email: "__no_email__" },
        select: { id: true },
        take: 1,
      },
    },
  })

  if (!project) {
    return { status: "denied" as const, project: null }
  }

  const hasAccess =
    project.ownerId === userId || project.collaborators.length > 0

  if (!hasAccess) {
    return { status: "denied" as const, project: null }
  }

  return { status: "allowed" as const, project }
}
