"use client"

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import type { Node, Edge } from "@xyflow/react"

export type SaveStatus = "idle" | "saving" | "saved" | "error"

interface UseCanvasAutosaveOptions {
  projectId: string
  nodes: Node[]
  edges: Edge[]
  debounceMs?: number
}

export function useCanvasAutosave({
  projectId,
  nodes,
  edges,
  debounceMs = 3000,
}: UseCanvasAutosaveOptions) {
  const [asyncStatus, setAsyncStatus] = useState<"saving" | "saved" | "error" | null>(null)
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState<string>("")
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const snapshot = useMemo(() => JSON.stringify({ nodes, edges }), [nodes, edges])

  const save = useCallback(async () => {
    setAsyncStatus("saving")
    try {
      const res = await fetch(`/api/projects/${projectId}/canvas`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: snapshot,
      })

      if (!res.ok) {
        const text = await res.text().catch(() => "")
        console.error("[Autosave] Server error:", res.status, "URL:", `/api/projects/${projectId}/canvas`, "Body:", text)
        throw new Error(`Save failed: ${res.status}`)
      }

      setLastSavedSnapshot(snapshot)
      setAsyncStatus("saved")
    } catch (err) {
      console.error("[Autosave] Failed:", err)
      setAsyncStatus("error")
    }
  }, [projectId, snapshot])

  useEffect(() => {
    const dirty = snapshot !== lastSavedSnapshot
    if (!dirty) return
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      save()
    }, debounceMs)
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [snapshot, lastSavedSnapshot, debounceMs, save])

  const isDirty = snapshot !== lastSavedSnapshot

  const status: SaveStatus =
    asyncStatus === "saving"
      ? "saving"
      : asyncStatus === "error"
        ? "error"
        : asyncStatus === "saved" && !isDirty
          ? "saved"
          : "idle"

  return { status, save }
}
