"use client"

const SHAPES = [
  { name: "rectangle", width: 120, height: 80 },
  { name: "diamond", width: 100, height: 100 },
  { name: "circle", width: 80, height: 80 },
  { name: "pill", width: 120, height: 60 },
  { name: "cylinder", width: 120, height: 80 },
  { name: "hexagon", width: 100, height: 100 },
] as const

function GhostShape({
  shape,
  width,
  height,
}: {
  shape: string
  width: number
  height: number
}) {
  const borderColor = "#2a2a2a"
  const bgColor = "#1a1a1a"

  switch (shape) {
    case "rectangle":
      return (
        <div
          style={{
            width,
            height,
            borderRadius: 4,
            border: `1px solid ${borderColor}`,
            backgroundColor: bgColor,
          }}
        />
      )
    case "pill":
      return (
        <div
          style={{
            width,
            height,
            borderRadius: 9999,
            border: `1px solid ${borderColor}`,
            backgroundColor: bgColor,
          }}
        />
      )
    case "circle":
      return (
        <div
          style={{
            width,
            height,
            borderRadius: "50%",
            border: `1px solid ${borderColor}`,
            backgroundColor: bgColor,
          }}
        />
      )
    case "diamond":
      return (
        <svg width={width} height={height} viewBox="0 0 100 100" preserveAspectRatio="none">
          <polygon points="50,2 98,50 50,98 2,50" fill={bgColor} stroke={borderColor} strokeWidth="1" />
        </svg>
      )
    case "hexagon":
      return (
        <svg width={width} height={height} viewBox="0 0 100 100" preserveAspectRatio="none">
          <polygon points="50,2 94,26 94,74 50,98 6,74 6,26" fill={bgColor} stroke={borderColor} strokeWidth="1" />
        </svg>
      )
    case "cylinder":
      return (
        <svg width={width} height={height} viewBox="0 0 100 100" preserveAspectRatio="none">
          <rect x="2" y="15" width="96" height="70" fill={bgColor} />
          <ellipse cx="50" cy="15" rx="48" ry="10" fill={bgColor} stroke={borderColor} strokeWidth="1" />
          <ellipse cx="50" cy="85" rx="48" ry="10" fill={bgColor} stroke={borderColor} strokeWidth="1" />
          <line x1="2" y1="15" x2="2" y2="85" stroke={borderColor} strokeWidth="1" />
          <line x1="98" y1="15" x2="98" y2="85" stroke={borderColor} strokeWidth="1" />
        </svg>
      )
    default:
      return (
        <div
          style={{
            width,
            height,
            borderRadius: 4,
            border: `1px solid ${borderColor}`,
            backgroundColor: bgColor,
          }}
        />
      )
  }
}

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

    const ghostEl = document.getElementById(`ghost-${shape.name}`)
    if (ghostEl) {
      e.dataTransfer.setDragImage(ghostEl, shape.width / 2, shape.height / 2)
    }
  }

  return (
    <>
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
      <div aria-hidden="true" style={{ position: "fixed", top: -9999, left: -9999 }}>
        {SHAPES.map((s) => (
          <div key={s.name} id={`ghost-${s.name}`}>
            <GhostShape shape={s.name} width={s.width} height={s.height} />
          </div>
        ))}
      </div>
    </>
  )
}
