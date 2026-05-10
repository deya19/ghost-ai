"use client"

import { useEffect } from "react"
import type { ReactFlowInstance } from "@xyflow/react"

export function useKeyboardShortcuts({
  reactFlowInstance,
  onUndo,
  onRedo,
}: {
  reactFlowInstance: ReactFlowInstance | null
  onUndo: () => void
  onRedo: () => void
}) {
  useEffect(() => {
    function isTypingInEditable(el: EventTarget | null): boolean {
      if (!(el instanceof HTMLElement)) return false
      const tag = el.tagName.toLowerCase()
      const editable =
        el.isContentEditable ||
        tag === "input" ||
        tag === "textarea" ||
        tag === "select"
      return editable
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (isTypingInEditable(event.target)) return

      const key = event.key
      const ctrlOrCmd = event.ctrlKey || event.metaKey

      if (key === "+" || key === "=") {
        event.preventDefault()
        reactFlowInstance?.zoomIn({ duration: 200 })
        return
      }

      if (key === "-") {
        event.preventDefault()
        reactFlowInstance?.zoomOut({ duration: 200 })
        return
      }

      if (ctrlOrCmd && key.toLowerCase() === "z") {
        event.preventDefault()
        if (event.shiftKey) {
          onRedo()
        } else {
          onUndo()
        }
        return
      }

      if (ctrlOrCmd && key.toLowerCase() === "y") {
        event.preventDefault()
        onRedo()
        return
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [reactFlowInstance, onUndo, onRedo])
}
