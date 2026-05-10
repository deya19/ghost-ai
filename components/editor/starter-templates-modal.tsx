"use client"

import { CANVAS_TEMPLATES, type CanvasTemplate } from "./starter-templates"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

function TemplatePreview({ template }: { template: CanvasTemplate }) {
  const nodes = template.nodes
  if (!nodes.length) return null

  const pad = 12
  const vw = 220
  const vh = 130

  const xs = nodes.map((nd) => nd.position.x)
  const ys = nodes.map((nd) => nd.position.y)
  const ws = nodes.map((nd) => (nd.style?.width as number) ?? 100)
  const hs = nodes.map((nd) => (nd.style?.height as number) ?? 60)

  const minX = Math.min(...xs) - pad
  const minY = Math.min(...ys) - pad
  const boundsW = Math.max(...xs.map((x, i) => x + ws[i])) + pad - minX
  const boundsH = Math.max(...ys.map((y, i) => y + hs[i])) + pad - minY

  const scale = Math.min((vw - pad * 2) / boundsW, (vh - pad * 2) / boundsH)
  const ox = (vw - boundsW * scale) / 2 - minX * scale
  const oy = (vh - boundsH * scale) / 2 - minY * scale

  const nodeMap = new Map(nodes.map((nd) => [nd.id, nd]))

  function ncx(nd: typeof nodes[0]) {
    return nd.position.x * scale + ox + ((nd.style?.width as number) ?? 100) * scale / 2
  }
  function ncy(nd: typeof nodes[0]) {
    return nd.position.y * scale + oy + ((nd.style?.height as number) ?? 60) * scale / 2
  }

  function drawNode(nd: typeof nodes[0]) {
    const x = nd.position.x * scale + ox
    const y = nd.position.y * scale + oy
    const w = ((nd.style?.width as number) ?? 100) * scale
    const h = ((nd.style?.height as number) ?? 60) * scale
    const shape = nd.data.shape as string
    const fill = nd.data.bgColor as string

    if (shape === "diamond") {
      return <polygon key={nd.id} points={`${x+w/2},${y} ${x+w},${y+h/2} ${x+w/2},${y+h} ${x},${y+h/2}`} fill={fill} stroke="#3a3a3a" strokeWidth="1" />
    }
    if (shape === "hexagon") {
      const hh = h / 2
      return <polygon key={nd.id} points={`${x+w/2},${y} ${x+w-4},${y+hh/2} ${x+w-4},${y+h-hh/2} ${x+w/2},${y+h} ${x+4},${y+h-hh/2} ${x+4},${y+hh/2}`} fill={fill} stroke="#3a3a3a" strokeWidth="1" />
    }
    if (shape === "cylinder") {
      const ry = h * 0.15
      return (
        <g key={nd.id}>
          <rect x={x} y={y+ry} width={w} height={h-ry*2} fill={fill} />
          <ellipse cx={x+w/2} cy={y+ry} rx={w/2} ry={ry} fill={fill} stroke="#3a3a3a" strokeWidth="1" />
          <ellipse cx={x+w/2} cy={y+h-ry} rx={w/2} ry={ry} fill={fill} stroke="#3a3a3a" strokeWidth="1" />
        </g>
      )
    }
    const r = shape === "circle" || shape === "pill" ? Math.min(w, h) / 2 : 4
    return <rect key={nd.id} x={x} y={y} width={w} height={h} rx={r} ry={r} fill={fill} stroke="#3a3a3a" strokeWidth="1" />
  }

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${vw} ${vh}`} className="rounded-lg bg-[#0d0d0d]">
      {template.edges.map((edge) => {
        const s = nodeMap.get(edge.source)
        const t = nodeMap.get(edge.target)
        if (!s || !t) return null
        return <line key={edge.id} x1={ncx(s)} y1={ncy(s)} x2={ncx(t)} y2={ncy(t)} stroke="#3a3a3a" strokeWidth="1" />
      })}
      {nodes.map(drawNode)}
    </svg>
  )
}

interface StarterTemplatesModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (template: CanvasTemplate) => void
}

export function StarterTemplatesModal({
  open,
  onOpenChange,
  onImport,
}: StarterTemplatesModalProps) {
  function handleImport(template: CanvasTemplate) {
    onImport(template)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="border-[#2a2a2a] bg-[#141414] p-6 text-white shadow-2xl"
        style={{ maxWidth: 1600, width: "calc(100vw - 1rem)" }}
      >
        <DialogHeader>
          <DialogTitle className="text-white" style={{paddingLeft: "10px"}}>Import Template</DialogTitle>
          <DialogDescription  className="text-white/60 pl-1" style={{paddingLeft: "10px"}} >
            Choose a starter template to pre-populate your canvas. Any existing nodes will be replaced — use{" "}
            <kbd className="rounded bg-[#2a2a2a] px-1 py-0.5 text-[10px] font-mono text-white/80">
              ⌘Z
            </kbd>{" "}
            to undo.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[70vh]">
          <div className="grid gap-4 p-3" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {CANVAS_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className="flex flex-col gap-3 rounded-xl border border-[#2a2a2a] bg-[#101010] p-3"
              >
                <div className="h-32 w-full overflow-hidden rounded-lg">
                  <TemplatePreview template={template} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold leading-snug text-white">
                    {template.name}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-white/50">
                    {template.description}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5 border-[#2a2a2a] bg-[#0b0b0b] text-white hover:bg-[#141414] hover:text-white"
                  onClick={() => handleImport(template)}
                >
                  <Download className="h-3.5 w-3.5" />
                  Import
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
