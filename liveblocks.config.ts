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

    RoomEvent: Record<string, never>
    ThreadMetadata: Record<string, never>
    RoomInfo: Record<string, never>
  }
}

export {}
