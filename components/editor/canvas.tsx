"use client"

import { Component, type ReactNode, useEffect, useState } from "react"
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  MiniMap,
  useReactFlow,
  type ConnectionMode,
} from "@xyflow/react"
import { useLiveblocksFlow, Cursors } from "@liveblocks/react-flow"
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense"
import "@xyflow/react/dist/style.css"
import "@liveblocks/react-flow/styles.css"
import { CanvasNodeComponent } from "./canvas-node"
import { CanvasEdgeComponent } from "./canvas-edge"
import { CanvasControlBar } from "./canvas-control-bar"
import { ShapePanel } from "./shape-panel"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useUndo, useRedo } from "@liveblocks/react/suspense"
import type { CanvasTemplate } from "./starter-templates"

class ErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { fallback: ReactNode; children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }
    return this.props.children
  }
}

function Loading() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#0a0a0a]">
      <p className="text-sm text-muted-foreground">Loading canvas…</p>
    </div>
  )
}

function ErrorFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#0a0a0a]">
      <p className="text-sm text-destructive">
        Canvas connection failed. Please refresh.
      </p>
    </div>
  )
}

let nodeCounter = 0

function CanvasInner({
  templateToLoad,
  onTemplateLoaded,
}: {
  templateToLoad: CanvasTemplate | null
  onTemplateLoaded: () => void
}) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    })

  const reactFlowInstance = useReactFlow()
  const { screenToFlowPosition, addNodes, addEdges, deleteElements, fitView } =
    reactFlowInstance
  const undo = useUndo()
  const redo = useRedo()

  const [selectionOn, setSelectionOn] = useState(true)
  const [panOn, setPanOn] = useState(true)

  useKeyboardShortcuts({
    reactFlowInstance,
    onUndo: undo,
    onRedo: redo,
  })

  useEffect(() => {
    if (!templateToLoad) return
    deleteElements({ nodes, edges })
    window.setTimeout(() => {
      addNodes(templateToLoad.nodes)
      addEdges(templateToLoad.edges)
      window.setTimeout(() => fitView({ duration: 300 }), 120)
    }, 50)
    onTemplateLoaded()
  }, [templateToLoad, deleteElements, addNodes, addEdges, fitView, onTemplateLoaded, nodes, edges])

  function onDragOver(event: React.DragEvent) {
    event.preventDefault()
    event.dataTransfer.dropEffect = "copy"
  }

  function onDrop(event: React.DragEvent) {
    event.preventDefault()

    const raw = event.dataTransfer.getData("application/json")
    if (!raw) return

    let payload: { shape: string; width: number; height: number }
    try {
      payload = JSON.parse(raw)
    } catch {
      return
    }

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    })

    const id = `${payload.shape}-${Date.now()}-${nodeCounter++}`

    addNodes({
      id,
      type: "canvasNode",
      position,
      data: {
        label: "",
        color: "#00d4aa",
        shape: payload.shape,
        bgColor: "#1F1F1F",
        textColor: "#EDEDED",
      },
      style: {
        width: payload.width,
        height: payload.height,
      },
    })
  }

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onDelete={onDelete}
      onDragOver={onDragOver}
      onDrop={onDrop}
      nodeTypes={{ canvasNode: CanvasNodeComponent }}
      edgeTypes={{ canvasEdge: CanvasEdgeComponent }}
      defaultEdgeOptions={{ type: "canvasEdge" }}
      deleteKeyCode={["Delete", "Backspace"]}
      selectionOnDrag={selectionOn}
      panOnDrag={panOn}
      panActivationKeyCode="Space"
      fitView
      connectionMode={"loose" as ConnectionMode}
    >
      <Background gap={16} size={1} color="#2a2a2a" />
      <MiniMap
        style={{
          position: "absolute",
          bottom: 16,
          right: 16,
          borderRadius: 8,
          overflow: "hidden",
          border: "1px solid rgba(42,42,42,0.5)",
        }}
        bgColor="#141414"
        nodeColor="#00d4aa"
        maskColor="rgba(10,10,10,0.7)"
      />
      <Cursors />
      <CanvasControlBar
        selectionOn={selectionOn}
        panOn={panOn}
        onToggleSelection={() => {
          setSelectionOn(true)
          setPanOn(false)
        }}
        onTogglePan={() => {
          setSelectionOn(false)
          setPanOn(true)
        }}
      />
      <ShapePanel />
    </ReactFlow>
  )
}

interface CanvasProps {
  roomId: string
  templateToLoad: CanvasTemplate | null
  onTemplateLoaded: () => void
}

export function Canvas({ roomId, templateToLoad, onTemplateLoaded }: CanvasProps) {
  return (
    <LiveblocksProvider
      authEndpoint={async (room) => {
        const response = await fetch("/api/liveblocks-auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ room }),
        })
        if (!response.ok) {
          const text = await response.text().catch(() => "Unknown error")
          throw new Error(`Liveblocks auth failed: ${response.status} ${response.statusText} — ${text}`)
        }
        return await response.json()
      }}
    >
      <RoomProvider
        id={roomId}
        initialPresence={{ cursor: null, isThinking: false }}
        initialStorage={{ nodes: [] }}
      >
        <ErrorBoundary fallback={<ErrorFallback />}>
          <ClientSideSuspense fallback={<Loading />}>
            <ReactFlowProvider>
              <CanvasInner
                templateToLoad={templateToLoad}
                onTemplateLoaded={onTemplateLoaded}
              />
            </ReactFlowProvider>
          </ClientSideSuspense>
        </ErrorBoundary>
      </RoomProvider>
    </LiveblocksProvider>
  )
}
