"use client"

import { Component, type ReactNode, useEffect, useRef, useState } from "react"
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  MiniMap,
  Panel,
  useReactFlow,
  type ConnectionMode,
} from "@xyflow/react"
import { useLiveblocksFlow } from "@liveblocks/react-flow"
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
  useUpdateMyPresence,
} from "@liveblocks/react/suspense"
import "@xyflow/react/dist/style.css"
import "@liveblocks/react-flow/styles.css"
import { CanvasNodeComponent } from "./canvas-node"
import { CanvasEdgeComponent } from "./canvas-edge"
import { CanvasControlBar } from "./canvas-control-bar"
import { ShapePanel } from "./shape-panel"
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts"
import { useCanvasAutosave } from "@/hooks/use-canvas-autosave"
import { useCanvasSaveController } from "./canvas-save-context"
import { useUndo, useRedo } from "@liveblocks/react/suspense"
import type { CanvasTemplate } from "./starter-templates"
import { PresenceAvatars } from "./presence-avatars"
import { LiveCursors } from "./live-cursors"

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
  roomId,
  templateToLoad,
  onTemplateLoaded,
}: {
  roomId: string
  templateToLoad: CanvasTemplate | null
  onTemplateLoaded: () => void
}) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, onDelete } =
    useLiveblocksFlow({
      suspense: true,
      nodes: { initial: [] },
      edges: { initial: [] },
    })

  const { status: saveStatus, save } = useCanvasAutosave({
    projectId: roomId,
    nodes,
    edges,
    debounceMs: 3000,
  })

  const { setStatus, saveRef } = useCanvasSaveController()

  useEffect(() => {
    saveRef.current = save
  }, [save, saveRef])

  useEffect(() => {
    setStatus(saveStatus)
  }, [saveStatus, setStatus])

  const reactFlowInstance = useReactFlow()
  const { screenToFlowPosition, addNodes, addEdges, fitView } =
    reactFlowInstance
  const undo = useUndo()
  const redo = useRedo()

  const [selectionOn, setSelectionOn] = useState(true)
  const [panOn, setPanOn] = useState(false)
  const pendingFitView = useRef(false)
  const isLoadingTemplate = useRef(false)
  const updateMyPresence = useUpdateMyPresence()

  useKeyboardShortcuts({
    reactFlowInstance,
    onUndo: undo,
    onRedo: redo,
  })

  // Load saved canvas state on mount if room is empty
  const hasLoadedRef = useRef(false)
  useEffect(() => {
    if (hasLoadedRef.current) return
    if (nodes.length > 0 || edges.length > 0) {
      hasLoadedRef.current = true
      return
    }

    async function loadSavedCanvas() {
      try {
        const res = await fetch(`/api/projects/${roomId}/canvas`)
        if (!res.ok) {
          if (res.status === 404) {
            hasLoadedRef.current = true
            return
          }
          throw new Error(`Load failed: ${res.status}`)
        }
        const data = await res.json()
        if (data.nodes?.length || data.edges?.length) {
          addNodes(data.nodes)
          addEdges(data.edges)
          pendingFitView.current = true
        }
      } catch (err) {
        console.error("[Canvas Load] Failed:", err)
      } finally {
        hasLoadedRef.current = true
      }
    }

    loadSavedCanvas()
  }, [roomId, nodes.length, edges.length, addNodes, addEdges])

  useEffect(() => {
    if (!templateToLoad || isLoadingTemplate.current) return
    isLoadingTemplate.current = true
    addNodes(templateToLoad.nodes)
    addEdges(
      templateToLoad.edges.map((edge) => ({
        ...edge,
        id: `${templateToLoad.id}-${edge.id}`,
      }))
    )
    pendingFitView.current = true
    onTemplateLoaded()
    isLoadingTemplate.current = false
  }, [templateToLoad, addNodes, addEdges, fitView, onTemplateLoaded])

  useEffect(() => {
    if (pendingFitView.current && nodes.length > 0) {
      fitView({ duration: 300 })
      pendingFitView.current = false
    }
  }, [nodes, fitView])

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

    const flowPos = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    })

    // Center the node on the cursor
    const position = {
      x: flowPos.x - payload.width / 2,
      y: flowPos.y - payload.height / 2,
    }

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
      className="h-full"
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onDelete={onDelete}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onMouseMove={(event) => {
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        })
        updateMyPresence({ cursor: { x: position.x, y: position.y } })
      }}
      onMouseLeave={() => {
        updateMyPresence({ cursor: null })
      }}
      nodeTypes={{ canvasNode: CanvasNodeComponent }}
      edgeTypes={{ canvasEdge: CanvasEdgeComponent }}
      defaultEdgeOptions={{ type: "canvasEdge" }}
      deleteKeyCode={["Delete", "Backspace"]}
      /* Interaction model (Option B — Space as override):
         - Select mode (default): left-drag on empty canvas = selection box
         - Pan mode (toggle): left-drag = pan canvas
         - Space key: temporary pan override regardless of current mode */
      selectionOnDrag={selectionOn}
      panOnDrag={panOn}
      panActivationKeyCode="Space"
      connectionMode={"loose" as ConnectionMode}
      isValidConnection={() => true}
    >
      <Background gap={16} size={1} color="#2a2a2a" />
      <div className="hidden md:block">
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
      </div>
      <LiveCursors />
      <Panel position="top-right" className="hidden md:block">
        <PresenceAvatars />
      </Panel>
      {/* Phone: centered top */}
      <Panel position="top-center" className="md:hidden">
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
          saveStatus={saveStatus}
        />
      </Panel>
      {/* Desktop: top-left */}
      <Panel position="top-left" className="hidden md:block">
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
          saveStatus={saveStatus}
        />
      </Panel>
      <Panel position="bottom-center">
        <ShapePanel />
      </Panel>
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
        initialPresence={{ cursor: null, thinking: false }}
        initialStorage={{ nodes: [] }}
      >
        <ErrorBoundary fallback={<ErrorFallback />}>
          <ClientSideSuspense fallback={<Loading />}>
            <ReactFlowProvider>
              <CanvasInner
                roomId={roomId}
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
