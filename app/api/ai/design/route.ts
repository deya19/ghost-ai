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

  const prompt =
    typeof body === "object" && body !== null && "prompt" in body && typeof (body as { prompt: unknown }).prompt === "string"
      ? (body as { prompt: string }).prompt.trim()
      : undefined

  const roomId =
    typeof body === "object" && body !== null && "roomId" in body && typeof (body as { roomId: unknown }).roomId === "string"
      ? (body as { roomId: string }).roomId.trim()
      : undefined

  const projectId =
    typeof body === "object" && body !== null && "projectId" in body && typeof (body as { projectId: unknown }).projectId === "string"
      ? (body as { projectId: string }).projectId.trim()
      : undefined

  if (!prompt || !roomId || !projectId) {
    return new NextResponse("Bad Request: prompt, roomId, and projectId are required", { status: 400 })
  }

  const access = await getAccessibleProject(projectId)
  if (access.status !== "allowed") {
    return new NextResponse(access.status === "unauthenticated" ? "Unauthorized" : "Forbidden", {
      status: access.status === "unauthenticated" ? 401 : 403,
    })
  }

  try {
    const handle = await tasks.trigger("design-agent", {
      prompt,
      roomId,
      userId,
    })

    await prisma.taskRun.create({
      data: {
        runId: handle.id,
        projectId,
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
    console.error("[design API] Failed to trigger design task:", message, err)
    return new NextResponse(`Failed to trigger design task: ${message}`, { status: 500 })
  }
}
