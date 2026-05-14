import { NextResponse, type NextRequest } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { getAccessibleProject } from "@/lib/project-access"
import { tasks } from "@trigger.dev/sdk/v3"
import { auth as triggerAuth } from "@trigger.dev/sdk/v3"

export async function POST(request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const body: unknown = await request.json().catch(() => ({}))

  const roomId =
    typeof body === "object" && body !== null && "roomId" in body && typeof (body as { roomId: unknown }).roomId === "string"
      ? (body as { roomId: string }).roomId.trim()
      : undefined

  const chatHistory =
    typeof body === "object" && body !== null && "chatHistory" in body
      ? (body as { chatHistory: unknown }).chatHistory
      : undefined

  const nodes =
    typeof body === "object" && body !== null && "nodes" in body
      ? (body as { nodes: unknown }).nodes
      : undefined

  const edges =
    typeof body === "object" && body !== null && "edges" in body
      ? (body as { edges: unknown }).edges
      : undefined

  if (!roomId) {
    return new NextResponse("Bad Request: roomId is required", { status: 400 })
  }

  // Resolve project access from roomId (roomId === projectId)
  const access = await getAccessibleProject(roomId)
  if (access.status !== "allowed") {
    return new NextResponse(access.status === "unauthenticated" ? "Unauthorized" : "Forbidden", {
      status: access.status === "unauthenticated" ? 401 : 403,
    })
  }

  try {
    const handle = await tasks.trigger("generate-spec", {
      projectId: roomId,
      roomId,
      chatHistory,
      nodes,
      edges,
      userId,
    })

    await prisma.taskRun.create({
      data: {
        runId: handle.id,
        projectId: roomId,
        userId,
      },
    })

    const publicToken = await triggerAuth.createPublicToken({
      scopes: {
        read: {
          runs: [handle.id],
        },
      },
      expirationTime: "1h",
    })

    return NextResponse.json({ runId: handle.id, publicToken })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[spec API] Failed to trigger spec generation task:", message, err)
    return new NextResponse(`Failed to trigger spec generation task: ${message}`, { status: 500 })
  }
}
