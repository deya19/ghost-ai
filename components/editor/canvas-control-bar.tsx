"use client"

import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Undo2,
  Redo2,
  Trash2,
  MousePointer2,
  Move,
} from "lucide-react"
import { useReactFlow } from "@xyflow/react"
import {
  useUndo,
  useRedo,
  useCanUndo,
  useCanRedo,
} from "@liveblocks/react/suspense"

interface CanvasControlBarProps {
  selectionOn: boolean
  panOn: boolean
  onToggleSelection: () => void
  onTogglePan: () => void
}

export function CanvasControlBar({
  selectionOn,
  panOn,
  onToggleSelection,
  onTogglePan,
}: CanvasControlBarProps) {
  const { zoomIn, zoomOut, fitView, getNodes, getEdges, deleteElements } = useReactFlow()
  const undo = useUndo()
  const redo = useRedo()
  const canUndo = useCanUndo()
  const canRedo = useCanRedo()

  function handleDelete() {
    const selectedNodes = getNodes().filter((n) => n.selected)
    const selectedEdges = getEdges().filter((e) => e.selected)
    if (selectedNodes.length || selectedEdges.length) {
      deleteElements({ nodes: selectedNodes, edges: selectedEdges })
    }
  }

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

      {/* Divider */}
      <div className="mx-2 h-4 w-px bg-[#2a2a2a]" />

      {/* Delete */}
      <button
        type="button"
        aria-label="Delete selected"
        onClick={handleDelete}
        className="flex h-7 w-7 items-center justify-center rounded-full text-white/70 transition-colors hover:bg-[#2a2a2a] hover:text-red-400"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {/* Divider */}
      <div className="mx-2 h-4 w-px bg-[#2a2a2a]" />

      {/* Select toggle — persistent mode; Space is a temporary pan override */}
      <button
        type="button"
        aria-label="Select mode"
        onClick={onToggleSelection}
        className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
          selectionOn
            ? "bg-[#2a2a2a] text-white"
            : "text-white/70 hover:bg-[#2a2a2a] hover:text-white"
        }`}
      >
        <MousePointer2 className="h-4 w-4" />
      </button>

      {/* Pan toggle — persistent mode; Space is a temporary pan override */}
      <button
        type="button"
        aria-label="Pan mode"
        onClick={onTogglePan}
        className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
          panOn
            ? "bg-[#2a2a2a] text-white"
            : "text-white/70 hover:bg-[#2a2a2a] hover:text-white"
        }`}
      >
        <Move className="h-4 w-4" />
      </button>
    </div>
  )
}
