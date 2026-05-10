"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
} from "@xyflow/react"
import type { EdgeProps } from "@xyflow/react"

export function CanvasEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  data,
}: EdgeProps) {
  const label = (data?.label as string | undefined) ?? ""
  const { updateEdgeData } = useReactFlow()

  const [isHovered, setIsHovered] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(label)
  const inputRef = useRef<HTMLInputElement>(null)

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  })

  const isActive = selected || isHovered
  const strokeColor = isActive ? "#d0d0d0" : "#4a4a4a"
  const markerId = `arrow-${id}`

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

  const saveLabel = useCallback(() => {
    setIsEditing(false)
    const trimmed = editValue.trim()
    updateEdgeData(id, { label: trimmed || undefined })
  }, [editValue, id, updateEdgeData])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        saveLabel()
      } else if (e.key === "Escape") {
        setIsEditing(false)
        setEditValue(label)
      }
    },
    [saveLabel, label]
  )

  return (
    <>
      <g
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <defs>
          <marker
            id={markerId}
            viewBox="0 0 10 10"
            refX={9}
            refY={5}
            markerWidth={6}
            markerHeight={6}
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill={strokeColor} />
          </marker>
        </defs>
        <BaseEdge
          path={edgePath}
          markerEnd={`url(#${markerId})`}
          style={{
            stroke: strokeColor,
            strokeWidth: 2,
            strokeLinecap: "round",
            transition: "stroke 0.2s ease",
          }}
          interactionWidth={20}
        />
      </g>
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan absolute"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
          onDoubleClick={startEditing}
        >
          {isEditing ? (
            <input
              ref={inputRef}
              aria-label="Edge label"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={saveLabel}
              onKeyDown={handleKeyDown}
              className="nodrag nopan rounded-full bg-[#2a2a2a] px-2 py-0.5 text-center text-xs text-white outline-none"
              style={{
                width: `${Math.max(48, editValue.length * 8 + 16)}px`,
                minWidth: 0,
              }}
            />
          ) : label ? (
            <span className="rounded-full bg-[#2a2a2a] px-2 py-0.5 text-xs text-white">
              {label}
            </span>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
