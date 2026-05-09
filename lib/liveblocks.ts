import { Liveblocks } from "@liveblocks/node"

const globalForLiveblocks = globalThis as unknown as {
  liveblocks?: Liveblocks
}

export function getLiveblocksClient(): Liveblocks {
  if (globalForLiveblocks.liveblocks) {
    return globalForLiveblocks.liveblocks
  }
  const secret = process.env.LIVEBLOCKS_SECRET_KEY
  if (!secret) {
    throw new Error("LIVEBLOCKS_SECRET_KEY is not set in environment variables.")
  }
  const client = new Liveblocks({ secret })
  globalForLiveblocks.liveblocks = client
  return client
}

// Deterministic color palette for cursors / user presence
const CURSOR_COLORS = [
  "#00d4aa", // teal
  "#22d3ee", // cyan
  "#a78bfa", // violet
  "#f472b6", // pink
  "#fbbf24", // amber
  "#34d399", // emerald
  "#60a5fa", // blue
  "#f87171", // red
]

export function getUserColor(userId: string): string {
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % CURSOR_COLORS.length
  return CURSOR_COLORS[index]
}
