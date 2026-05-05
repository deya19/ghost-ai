import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(projects)
}

export async function POST(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const body: unknown = await request.json().catch(() => ({}))

  const id =
    typeof body === "object" && body !== null && "id" in body && typeof (body as { id: unknown }).id === "string"
      ? (body as { id: string }).id.trim() || undefined
      : undefined

  const name =
    typeof body === "object" && body !== null && "name" in body && typeof (body as { name: unknown }).name === "string"
      ? (body as { name: string }).name.trim() || "Untitled Project"
      : "Untitled Project"

  if (id && !/^[a-z0-9-]+$/i.test(id)) {
    return new NextResponse("Bad Request: invalid id", { status: 400 })
  }
      

  const project = await prisma.project.create({
    data: {
      ...(id ? { id } : {}),
      ownerId: userId,
      name,
    },
  })

  return NextResponse.json(project, { status: 201 })
}
