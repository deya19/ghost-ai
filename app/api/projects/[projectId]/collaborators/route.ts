import { auth, clerkClient } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
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
  console.log("[API] GET collaborators for projectId:", projectId, "userId:", userId)

  // Check if user has access to this project
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { collaborators: true },
  })

  if (!project) {
    console.log("[API] Project not found:", projectId)
    return new NextResponse("Not Found", { status: 404 })
  }
  console.log("[API] Found project:", project.id, "owner:", project.ownerId)

  // Get current user's email to check collaborator access
  const client = await clerkClient()
  const clerkUser = await client.users.getUser(userId)
  const userEmail = clerkUser.primaryEmailAddress?.emailAddress?.toLowerCase() ?? ""

  const hasAccess = project.ownerId === userId ||
    project.collaborators.some(c => c.email.toLowerCase() === userEmail)

  if (!hasAccess) {
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

  // Check if already a collaborator
  const existing = await prisma.projectCollaborator.findFirst({
    where: {
      projectId,
      email,
    },
  })

  if (existing) {
    return new NextResponse("Conflict: already a collaborator", { status: 409 })
  }

  const collaborator = await prisma.projectCollaborator.create({
    data: {
      projectId,
      email,
    },
  })

  return NextResponse.json(collaborator, { status: 201 })
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
