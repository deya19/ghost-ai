export interface AiStatusFeedPayload {
  /** Status type for the AI activity */
  status: "start" | "thinking" | "complete" | "error"
  /** Human-readable status message */
  message: string
  /** Optional additional text (e.g. summary or detail) */
  text?: string
}

export function isValidAiStatusPayload(
  data: unknown
): data is AiStatusFeedPayload {
  if (typeof data !== "object" || data === null) return false
  const d = data as Record<string, unknown>
  if (typeof d.message !== "string") return false
  if (
    d.status !== "start" &&
    d.status !== "thinking" &&
    d.status !== "complete" &&
    d.status !== "error"
  ) {
    return false
  }
  if ("text" in d && d.text !== undefined && typeof d.text !== "string") {
    return false
  }
  return true
}

export interface AiChatMessagePayload {
  /** Display name of the sender */
  sender: string
  /** Message role */
  role: "user" | "assistant"
  /** Message content */
  content: string
  /** Client timestamp in ms */
  timestamp: number
}

export function isValidAiChatMessage(
  data: unknown
): data is AiChatMessagePayload {
  if (typeof data !== "object" || data === null) return false
  const d = data as Record<string, unknown>
  if (typeof d.sender !== "string" || d.sender.length === 0) return false
  if (typeof d.content !== "string" || d.content.length === 0) return false
  if (typeof d.timestamp !== "number") return false
  if (d.role !== "user" && d.role !== "assistant") return false
  return true
}
