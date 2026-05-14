import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getAccessibleProject } from "@/lib/project-access"

console.log("[Specs List] Module loaded at", new Date().toISOString())

type RouteContext = {
  params: Promise<{ projectId: string }>
}

export async function GET(
  _request: NextRequest,
  ctx: RouteContext
) {
  try {
    const { projectId } = await ctx.params
    console.log("[Specs List] projectId:", projectId)

    if (!("projectSpec" in prisma)) {
      console.error("[Specs List] Prisma client is missing ProjectSpec model. Run `npx prisma generate` and restart the dev server.")
      return new NextResponse("Prisma client stale — restart dev server", { status: 500 })
    }

    const access = await getAccessibleProject(projectId)

    if (access.status === "unauthenticated") {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    if (access.status === "denied") {
      return new NextResponse("Forbidden", { status: 403 })
    }

    const specs = await prisma.projectSpec.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        projectId: true,
        filePath: true,
        createdAt: true,
      },
    })

    return NextResponse.json(specs)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[Specs List] Error:", message, err)
    return new NextResponse(`Internal Server Error: ${message}`, { status: 500 })
  }
}
