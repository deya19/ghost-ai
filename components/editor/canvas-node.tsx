"use client"

import { Handle, Position } from "@xyflow/react"
import type { CanvasNode } from "@/types/canvas"

export function CanvasNodeComponent({ data }: { data: CanvasNode["data"] }) {
  const label = (data?.label as string) ?? ""

  return (
    <div className="flex h-full w-full items-center justify-center rounded-md border border-[#2a2a2a] bg-[#1a1a1a] px-3 py-2">
      <Handle type="target" position={Position.Top} className="bg-[#00d4aa]!" />
      <span className="text-xs text-foreground">{label}</span>
      <Handle type="source" position={Position.Bottom} className="bg-[#00d4aa]!" />
    </div>
  )
}
