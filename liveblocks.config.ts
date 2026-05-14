declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null
      thinking: boolean
    }

    UserMeta: {
      id: string
      info: {
        name: string
        avatar: string
        color: string
      }
    }

    RoomEvent:
      | {
          type: "ai-status"
          message: string
          status: "start" | "thinking" | "complete" | "error"
          text?: string
        }
      | { type: "ai-cursor"; x: number; y: number }
    ThreadMetadata: Record<string, never>
    RoomInfo: Record<string, never>
  }
}

export {}
