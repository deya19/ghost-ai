import { NextResponse, type NextRequest } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { auth as triggerAuth } from "@trigger.dev/sdk/v3"

export async function POST(request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const body: unknown = await request.json().catch(() => ({}))

  const runId =
    typeof body === "object" && body !== null && "runId" in body && typeof (body as { runId: unknown }).runId === "string"
      ? (body as { runId: string }).runId.trim()
      : undefined

  if (!runId) {
    return new NextResponse("Bad Request: runId is required", { status: 400 })
  }

  const taskRun = await prisma.taskRun.findUnique({
    where: { runId },
  })

  if (!taskRun) {
    return new NextResponse("Not Found", { status: 404 })
  }

  if (taskRun.userId !== userId) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  try {
    const publicToken = await triggerAuth.createPublicToken({
      scopes: {
        read: {
          runs: [runId],
        },
      },
      expirationTime: "1h",
    })

    return NextResponse.json({ token: publicToken })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[spec token API] Failed to generate token:", message, err)
    return new NextResponse(`Failed to generate token: ${message}`, { status: 500 })
  }
}
