import { NextResponse } from "next/server"
import { auth, currentUser } from "@clerk/nextjs/server"
import { getLiveblocksClient, getUserColor } from "@/lib/liveblocks"
import { getAccessibleProject } from "@/lib/project-access"

export async function POST(request: Request) {
  const { userId } = await auth()

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  let body: { projectId?: string; room?: string }
  try {
    body = await request.json()
  } catch {
    return new NextResponse("Bad Request: invalid JSON", { status: 400 })
  }

  const projectId = body?.projectId ?? body?.room
  if (!projectId || typeof projectId !== "string") {
    return new NextResponse("Bad Request: projectId required", { status: 400 })
  }

  // Verify project access
  const access = await getAccessibleProject(projectId)
  if (access.status !== "allowed") {
    return new NextResponse("Forbidden", { status: 403 })
  }

  // Ensure room exists (create only if needed)
  const client = getLiveblocksClient()
  const roomId = projectId
  try {
    await client.getRoom(roomId)
  } catch {
    await client.createRoom(roomId, {
      defaultAccesses: ["room:write"],
    })
  }

  // Fetch user info from Clerk
  const user = await currentUser()
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.primaryEmailAddress?.emailAddress ||
    "Unknown"
  const avatar = user?.imageUrl ?? ""
  const color = getUserColor(userId)

  // Prepare session and attach metadata
  const session = client.prepareSession(userId, {
    userInfo: {
      name: displayName,
      avatar,
      color,
    },
  })
  session.allow(roomId, session.FULL_ACCESS)

  const { body: tokenBody, status } = await session.authorize()
  return new NextResponse(tokenBody, { status })
}
