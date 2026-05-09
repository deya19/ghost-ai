import { auth, clerkClient } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { NextResponse, type NextRequest } from "next/server"

type RouteContext = {
  params: Promise<{ projectId: string }>
}

// GET - List collaborators (owners and collaborators can view)
export async function GET(
  _request: NextRequest,
  ctx: RouteContext
) {
  const { userId } = await auth()

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { projectId } = await ctx.params

  // Check if user has access to this project
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { collaborators: true },
  })

  if (!project) {
    console.log("[API] Project not found")
    return new NextResponse("Not Found", { status: 404 })
  }
  console.log("[API] Project found")

  // Short-circuit: owner has access without Clerk lookup
  if (project.ownerId === userId) {
    return NextResponse.json(project.collaborators)
  }

  // Non-owners: verify via collaborator email match
  const client = await clerkClient()
  const clerkUser = await client.users.getUser(userId)
  const userEmail = clerkUser.primaryEmailAddress?.emailAddress?.toLowerCase() ?? ""

  const isCollaborator = project.collaborators.some(
    c => c.email.toLowerCase() === userEmail
  )

  if (!isCollaborator) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  return NextResponse.json(project.collaborators)
}

// POST - Invite collaborator (owner only)
export async function POST(
  request: NextRequest,
  ctx: RouteContext
) {
  const { userId } = await auth()

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { projectId } = await ctx.params

  // Verify ownership
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!project) {
    return new NextResponse("Not Found", { status: 404 })
  }

  if (project.ownerId !== userId) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  const body: unknown = await request.json().catch(() => ({}))
  const email =
    typeof body === "object" && body !== null && "email" in body && typeof (body as { email: unknown }).email === "string"
      ? (body as { email: string }).email.trim().toLowerCase()
      : undefined

  if (!email) {
    return new NextResponse("Bad Request: email is required", { status: 400 })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return new NextResponse("Bad Request: invalid email", { status: 400 })
  }

  // Prevent inviting the project owner
  const ownerClient = await clerkClient()
  const owner = await ownerClient.users.getUser(project.ownerId)
  const ownerEmail = owner.primaryEmailAddress?.emailAddress?.toLowerCase() ?? ""
  if (ownerEmail && email === ownerEmail) {
    return new NextResponse("Conflict: cannot invite the project owner", { status: 409 })
  }

  try {
    const collaborator = await prisma.projectCollaborator.create({
      data: {
        projectId,
        email,
      },
    })

    return NextResponse.json(collaborator, { status: 201 })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return new NextResponse("Conflict: already a collaborator", { status: 409 })
    }
    throw error
  }
}

// DELETE - Remove collaborator (owner only)
export async function DELETE(
  request: NextRequest,
  ctx: RouteContext
) {
  const { userId } = await auth()

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { projectId } = await ctx.params

  // Verify ownership
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!project) {
    return new NextResponse("Not Found", { status: 404 })
  }

  if (project.ownerId !== userId) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")

  if (!email) {
    return new NextResponse("Bad Request: email is required", { status: 400 })
  }

  await prisma.projectCollaborator.deleteMany({
    where: {
      projectId,
      email: email.toLowerCase(),
    },
  })

  return new NextResponse(null, { status: 204 })
}
