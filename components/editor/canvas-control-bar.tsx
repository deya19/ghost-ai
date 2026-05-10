"use client"

import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Undo2,
  Redo2,
} from "lucide-react"
import { useReactFlow } from "@xyflow/react"
import {
  useUndo,
  useRedo,
  useCanUndo,
  useCanRedo,
} from "@liveblocks/react/suspense"

export function CanvasControlBar() {
  const { zoomIn, zoomOut, fitView } = useReactFlow()
  const undo = useUndo()
  const redo = useRedo()
  const canUndo = useCanUndo()
  const canRedo = useCanRedo()

  return (
    <div className="nodrag nopan absolute bottom-20 left-4 z-10 flex items-center rounded-full border border-[#2a2a2a] bg-[#141414] px-2 py-1.5 shadow-lg">
      {/* Zoom controls */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Zoom out"
          onClick={() => zoomOut({ duration: 200 })}
          className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-[#2a2a2a] hover:text-white"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Fit view"
          onClick={() => fitView({ duration: 200 })}
          className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-[#2a2a2a] hover:text-white"
        >
          <Maximize className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Zoom in"
          onClick={() => zoomIn({ duration: 200 })}
          className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-[#2a2a2a] hover:text-white"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
      </div>

      {/* Divider */}
      <div className="mx-2 h-4 w-px bg-[#2a2a2a]" />

      {/* History controls */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Undo"
          disabled={!canUndo}
          onClick={() => undo()}
          className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-[#2a2a2a] hover:text-white disabled:cursor-not-allowed disabled:text-white/20"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="Redo"
          disabled={!canRedo}
          onClick={() => redo()}
          className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-[#2a2a2a] hover:text-white disabled:cursor-not-allowed disabled:text-white/20"
        >
          <Redo2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
