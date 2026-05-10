import { Node, Edge } from "@xyflow/react"

export interface CanvasNodeData extends Record<string, unknown> {
  label: string
  color: string
  shape: string
  bgColor: string
  textColor: string
}

export interface CanvasEdgeData extends Record<string, unknown> {
  label?: string
}

export type CanvasNode = Node<CanvasNodeData, "canvasNode">
export type CanvasEdge = Edge<CanvasEdgeData, "canvasEdge">

export const NODE_COLORS: Array<{ bg: string; text: string }> = [
  { bg: "#1F1F1F", text: "#EDEDED" }, // neutral dark (default)
  { bg: "#10233D", text: "#52A8FF" }, // blue
  { bg: "#2E1938", text: "#BF7AF0" }, // purple
  { bg: "#331B00", text: "#FF990A" }, // orange
  { bg: "#3C1618", text: "#FF6166" }, // red
  { bg: "#3A1726", text: "#F75F8F" }, // pink
  { bg: "#0F2E18", text: "#62C073" }, // green
  { bg: "#062822", text: "#0AC7B4" }, // teal
]
