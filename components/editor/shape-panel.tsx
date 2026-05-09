"use client"

const SHAPES = [
  { name: "rectangle", width: 120, height: 80 },
  { name: "diamond", width: 100, height: 100 },
  { name: "circle", width: 80, height: 80 },
  { name: "pill", width: 120, height: 60 },
  { name: "cylinder", width: 120, height: 80 },
  { name: "hexagon", width: 100, height: 100 },
] as const

function ShapeIcon({ shape }: { shape: string }) {
  const common = "w-5 h-5"

  switch (shape) {
    case "rectangle":
      return (
        <svg viewBox="0 0 20 20" className={common}>
          <rect x="2" y="5" width="16" height="10" rx="2" fill="currentColor" />
        </svg>
      )
    case "diamond":
      return (
        <svg viewBox="0 0 20 20" className={common}>
          <polygon points="10,2 18,10 10,18 2,10" fill="currentColor" />
        </svg>
      )
    case "circle":
      return (
        <svg viewBox="0 0 20 20" className={common}>
          <circle cx="10" cy="10" r="8" fill="currentColor" />
        </svg>
      )
    case "pill":
      return (
        <svg viewBox="0 0 20 20" className={common}>
          <rect x="2" y="6" width="16" height="8" rx="4" fill="currentColor" />
        </svg>
      )
    case "cylinder":
      return (
        <svg viewBox="0 0 20 20" className={common}>
          <rect x="3" y="4" width="14" height="12" rx="3" fill="currentColor" />
          <ellipse cx="10" cy="7" rx="7" ry="3" fill="#2a2a2a" />
        </svg>
      )
    case "hexagon":
      return (
        <svg viewBox="0 0 20 20" className={common}>
          <polygon points="10,2 17,6 17,14 10,18 3,14 3,6" fill="currentColor" />
        </svg>
      )
    default:
      return null
  }
}

export function ShapePanel() {
  function handleDragStart(
    e: React.DragEvent,
    shape: (typeof SHAPES)[number]
  ) {
    e.dataTransfer.setData(
      "application/json",
      JSON.stringify({ shape: shape.name, width: shape.width, height: shape.height })
    )
    e.dataTransfer.effectAllowed = "copy"
  }

  return (
    <div className="absolute bottom-6 left-1/2 z-30 -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-full border border-[#2a2a2a] bg-[#141414] px-3 py-2 shadow-lg">
        {SHAPES.map((s) => (
          <button
            key={s.name}
            type="button"
            draggable
            onDragStart={(e) => handleDragStart(e, s)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-[#1f1f1f] hover:text-foreground"
            aria-label={`Drag ${s.name}`}
            title={s.name}
          >
            <ShapeIcon shape={s.name} />
          </button>
        ))}
      </div>
    </div>
  )
}
