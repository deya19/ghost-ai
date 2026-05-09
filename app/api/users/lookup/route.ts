import { NextResponse, type NextRequest } from "next/server"
import { auth, clerkClient } from "@clerk/nextjs/server"

export async function POST(request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const body: unknown = await request.json().catch(() => ({}))
  const emails =
    typeof body === "object" && body !== null && "emails" in body && Array.isArray((body as { emails: unknown }).emails)
      ? (body as { emails: string[] }).emails.filter(e => typeof e === "string")
      : []

  if (emails.length === 0) {
    return NextResponse.json({})
  }

  try {
    const client = await clerkClient()
    const { data: users } = await client.users.getUserList({ emailAddress: emails })

    const results: Record<string, { displayName?: string; avatarUrl?: string }> = {}

    for (const requestedEmail of emails) {
      const lowerRequested = requestedEmail.toLowerCase()
      const user = users.find(u =>
        u.emailAddresses.some(e => e.emailAddress?.toLowerCase() === lowerRequested)
      )
      if (!user) continue

      const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ") || undefined
      results[requestedEmail] = {
        displayName,
        avatarUrl: user.imageUrl,
      }
    }

    return NextResponse.json(results)
  } catch {
    return NextResponse.json({})
  }
}
