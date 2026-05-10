"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Handle, Position, NodeResizer, useReactFlow } from "@xyflow/react"
import type { CanvasNodeData } from "@/types/canvas"
import { NODE_COLORS } from "@/types/canvas"

function ShapeSVG({
  shape,
  borderColor,
  bgColor,
}: {
  shape: string
  borderColor: string
  bgColor: string
}) {
  switch (shape) {
    case "diamond":
      return (
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polygon points="50,2 98,50 50,98 2,50" fill={bgColor} stroke={borderColor} strokeWidth="1" />
        </svg>
      )
    case "hexagon":
      return (
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polygon points="50,2 94,26 94,74 50,98 6,74 6,26" fill={bgColor} stroke={borderColor} strokeWidth="1" />
        </svg>
      )
    case "cylinder":
      return (
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <rect x="2" y="15" width="96" height="70" fill={bgColor} />
          <ellipse cx="50" cy="15" rx="48" ry="10" fill={bgColor} stroke={borderColor} strokeWidth="1" />
          <ellipse cx="50" cy="85" rx="48" ry="10" fill={bgColor} stroke={borderColor} strokeWidth="1" />
          <line x1="2" y1="15" x2="2" y2="85" stroke={borderColor} strokeWidth="1" />
          <line x1="98" y1="15" x2="98" y2="85" stroke={borderColor} strokeWidth="1" />
        </svg>
      )
    default:
      return null
  }
}

function ColorToolbar({
  currentBg,
  onSelect,
}: {
  currentBg: string
  onSelect: (bg: string, text: string) => void
}) {
  return (
    <div
      className="nodrag nopan absolute left-1/2 z-10 flex -translate-x-1/2 items-center gap-1 rounded-full border border-[#2a2a2a] bg-[#141414] px-2 py-1.5 shadow-lg"
      style={{ bottom: "calc(100% + 16px)" }}
    >
      {NODE_COLORS.map((pair, i) => {
        const isActive = pair.bg === currentBg
        return (
          <button
            key={i}
            type="button"
            aria-label={`Set color ${i + 1}`}
            onClick={() => onSelect(pair.bg, pair.text)}
            className="relative flex h-4 w-4 items-center justify-center rounded-full transition-transform hover:scale-110"
            style={{
              backgroundColor: pair.bg,
              boxShadow: isActive
                ? `0 0 0 2px ${pair.text}`
                : `inset 0 0 0 1px rgba(255,255,255,0.25)`,
            }}
          />
        )
      })}
    </div>
  )
}

export function CanvasNodeComponent({
  id,
  data,
  selected,
}: {
  id: string
  data: CanvasNodeData
  selected: boolean
}) {
  const label = data.label ?? ""
  const shape = data.shape ?? "rectangle"
  const color = data.color ?? "#00d4aa"
  const borderColor = selected ? color : "#2a2a2a"
  const bgColor = data.bgColor ?? "#1F1F1F"
  const textColor = data.textColor ?? "#EDEDED"
  const isCSS = shape === "rectangle" || shape === "pill" || shape === "circle"

  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(label)
  const inputRef = useRef<HTMLInputElement>(null)
  const { updateNodeData } = useReactFlow()

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const startEditing = useCallback(() => {
    setEditValue(label)
    setIsEditing(true)
  }, [label])

  const stopEditing = useCallback(() => {
    setIsEditing(false)
    updateNodeData(id, { ...data, label: editValue.trim() })
  }, [id, data, editValue, updateNodeData])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Escape") {
        setIsEditing(false)
        setEditValue(label)
      }
    },
    [label]
  )

  return (
    <div className="group relative h-full w-full">
      {selected && (
        <>
          <NodeResizer
            minWidth={60}
            minHeight={40}
            isVisible={selected}
            lineClassName="border-[#2a2a2a] z-20"
            handleClassName="h-2 w-2 bg-[#141414] border rounded-sm z-20"
            handleStyle={{ borderColor: color }}
          />
          <ColorToolbar
            currentBg={bgColor}
            onSelect={(bg, text) => {
              updateNodeData(id, { ...data, bgColor: bg, textColor: text })
            }}
          />
        </>
      )}
      {isCSS ? (
        <div
          className="h-full w-full"
          style={{
            borderRadius: shape === "pill" ? 9999 : shape === "circle" ? "50%" : 4,
            border: `1px solid ${borderColor}`,
            backgroundColor: bgColor,
          }}
        />
      ) : (
        <ShapeSVG shape={shape} borderColor={borderColor} bgColor={bgColor} />
      )}
      <div
        className="absolute inset-0 flex items-center justify-center"
        onDoubleClick={startEditing}
      >
        {isEditing ? (
          <input
            ref={inputRef}
            aria-label="Node label"
            className="nodrag nopan h-full w-full bg-transparent text-center text-xs outline-none"
            style={{ color: textColor }}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={stopEditing}
            onKeyDown={handleKeyDown}
          />
        ) : (
          <span className="text-xs" style={{ color: textColor }}>
            {label || <span className="opacity-50">Label</span>}
          </span>
        )}
      </div>
      <Handle
        type="target"
        position={Position.Top}
        className="h-2! w-2! rounded-full! border! border-[#2a2a2a]! bg-white! opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="h-2! w-2! rounded-full! border! border-[#2a2a2a]! bg-white! opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="h-2! w-2! rounded-full! border! border-[#2a2a2a]! bg-white! opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="h-2! w-2! rounded-full! border! border-[#2a2a2a]! bg-white! opacity-0 transition-opacity duration-200 group-hover:opacity-100"
      />
    </div>
  )
}
