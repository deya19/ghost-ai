import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { NextResponse, type NextRequest } from "next/server"

type RouteContext<T extends string> = T extends "/api/projects/[projectId]"
  ? { params: Promise<{ projectId: string }> }
  : never

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/projects/[projectId]">
) {
  const { userId } = await auth()

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { projectId } = await ctx.params

  const existing = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!existing) {
    return new NextResponse("Not Found", { status: 404 })
  }

  if (existing.ownerId !== userId) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  const body: unknown = await request.json().catch(() => ({}))
  const name =
    typeof body === "object" && body !== null && "name" in body && typeof (body as { name: unknown }).name === "string"
      ? (body as { name: string }).name.trim()
      : undefined

  if (!name) {
    return new NextResponse("Bad Request: name is required", { status: 400 })
  }

  const project = await prisma.project.update({
    where: { id: projectId },
    data: { name },
  })

  return NextResponse.json(project)
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/projects/[projectId]">
) {
  const { userId } = await auth()

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { projectId } = await ctx.params

  const existing = await prisma.project.findUnique({
    where: { id: projectId },
  })

  if (!existing) {
    return new NextResponse("Not Found", { status: 404 })
  }

  if (existing.ownerId !== userId) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  await prisma.project.delete({
    where: { id: projectId },
  })

  return new NextResponse(null, { status: 204 })
}
