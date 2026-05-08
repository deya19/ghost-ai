import { NextResponse, type NextRequest } from "next/server"
import { auth } from "@clerk/nextjs/server"

// Clerk Backend API base URL
const CLERK_API_BASE = "https://api.clerk.com/v1"

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

  // Get Clerk secret key from env
  const clerkSecretKey = process.env.CLERK_SECRET_KEY
  if (!clerkSecretKey) {
    // Return empty data if no API key
    return NextResponse.json({})
  }

  try {
    // Look up users by email using Clerk Backend API
    const results: Record<string, { displayName?: string; avatarUrl?: string }> = {}

    for (const email of emails) {
      try {
        const res = await fetch(
          `${CLERK_API_BASE}/users?email_address=${encodeURIComponent(email)}`,
          {
            headers: {
              Authorization: `Bearer ${clerkSecretKey}`,
              "Content-Type": "application/json",
            },
          }
        )

        if (!res.ok) continue

        const data: unknown = await res.json()
        const users = Array.isArray(data) ? data : []
        
        if (users.length > 0) {
          const user = users[0] as {
            first_name?: string
            last_name?: string
            image_url?: string
          }
          const displayName = [user.first_name, user.last_name].filter(Boolean).join(" ") || undefined
          results[email] = {
            displayName,
            avatarUrl: user.image_url,
          }
        }
      } catch {
        // Ignore lookup failures for individual emails
      }
    }

    return NextResponse.json(results)
  } catch {
    return NextResponse.json({})
  }
}
