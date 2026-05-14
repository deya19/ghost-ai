import { put } from "@vercel/blob"
import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAccessibleProject } from "@/lib/project-access"

type RouteContext = {
  params: Promise<{ projectId: string }>
}

// PUT - Save canvas JSON to Vercel Blob and store URL in Prisma
export async function PUT(
  request: NextRequest,
  ctx: RouteContext
) {
  console.log("[Canvas PUT] Route hit")
  const { projectId } = await ctx.params
  console.log("[Canvas PUT] projectId:", projectId)

  const access = await getAccessibleProject(projectId)

  if (access.status === "unauthenticated") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  if (access.status === "denied") {
    return new NextResponse("Forbidden", { status: 403 })
  }

  const body: unknown = await request.json().catch(() => ({}))

  if (
    typeof body !== "object" ||
    body === null ||
    !("nodes" in body) ||
    !("edges" in body)
  ) {
    return new NextResponse("Bad Request: nodes and edges required", { status: 400 })
  }

  const canvasJson = JSON.stringify(body)
  const blobPath = `projects/${projectId}/canvas.json`

  try {
    const blob = await put(blobPath, canvasJson, {
      access: "private",
      contentType: "application/json",
      allowOverwrite: true,
    })

    await prisma.project.update({
      where: { id: projectId },
      data: { canvasJsonPath: blob.url },
    })

    return NextResponse.json({ url: blob.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[Canvas Save] Error:", message, err)
    return NextResponse.json({ error: "Failed to save canvas", detail: message }, { status: 500 })
  }
}

// GET - Load canvas JSON from Vercel Blob via stored URL
export async function GET(
  _request: NextRequest,
  ctx: RouteContext
) {
  const { projectId } = await ctx.params

  const access = await getAccessibleProject(projectId)

  if (access.status === "unauthenticated") {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  if (access.status === "denied") {
    return new NextResponse("Forbidden", { status: 403 })
  }

  const project = access.project

  if (!project?.canvasJsonPath) {
    return new NextResponse("No saved canvas found", { status: 404 })
  }

  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN
    const response = await fetch(project.canvasJsonPath, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!response.ok) {
      throw new Error(`Blob fetch failed: ${response.status}`)
    }

    const canvasData: unknown = await response.json()
    return NextResponse.json(canvasData)
  } catch (err) {
    console.error("[Canvas Load] Blob fetch failed:", err)
    return new NextResponse("Failed to load canvas", { status: 500 })
  }
}
