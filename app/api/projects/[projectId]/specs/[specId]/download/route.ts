import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAccessibleProject } from "@/lib/project-access"

type RouteContext = {
  params: Promise<{ projectId: string; specId: string }>
}

export async function GET(
  _request: NextRequest,
  ctx: RouteContext
) {
  const { projectId, specId } = await ctx.params

  const access = await getAccessibleProject(projectId)

  if (access.status === "unauthenticated") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  if (access.status === "denied") {
    return new NextResponse("Forbidden", { status: 403 })
  }

  const spec = await prisma.projectSpec.findUnique({
    where: { id: specId },
  })

  if (!spec) {
    return new NextResponse("Not Found", { status: 404 })
  }

  if (spec.projectId !== projectId) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN
    const response = await fetch(spec.filePath, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })

    if (!response.ok) {
      throw new Error(`Blob fetch failed: ${response.status}`)
    }

    const content = await response.text()

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/markdown",
        "Content-Disposition": `attachment; filename="spec-${specId}.md"`,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[Spec Download] Failed:", message, err)
    return new NextResponse(`Failed to download spec: ${message}`, { status: 500 })
  }
}
