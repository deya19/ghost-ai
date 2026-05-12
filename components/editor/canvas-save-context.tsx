"use client"

import { createContext, useContext, useRef, useState, useCallback } from "react"
import type { SaveStatus } from "@/hooks/use-canvas-autosave"

interface CanvasSaveController {
  status: SaveStatus
  setStatus: (s: SaveStatus) => void
  saveRef: React.MutableRefObject<(() => Promise<void>) | null>
}

const CanvasSaveContext = createContext<CanvasSaveController | null>(null)

export function CanvasSaveProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SaveStatus>("idle")
  const saveRef = useRef<(() => Promise<void>) | null>(null)

  const setStatusWrapped = useCallback((s: SaveStatus) => {
    setStatus(s)
  }, [])

  return (
    <CanvasSaveContext.Provider
      value={{ status, setStatus: setStatusWrapped, saveRef }}
    >
      {children}
    </CanvasSaveContext.Provider>
  )
}

export function useCanvasSaveController(): CanvasSaveController {
  const ctx = useContext(CanvasSaveContext)
  if (!ctx) {
    throw new Error(
      "useCanvasSaveController must be used within CanvasSaveProvider"
    )
  }
  return ctx
}
