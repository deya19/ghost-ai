"use client"

import { useStore } from "@xyflow/react"
import { useOthers } from "@liveblocks/react/suspense"

export function LiveCursors() {
  const transform = useStore((state) => ({
    x: state.transform[0],
    y: state.transform[1],
    zoom: state.transform[2],
  }))
  const others = useOthers()

  return (
    <div className="pointer-events-none absolute inset-0" style={{ zIndex: 9999 }}>
      {others.map((other) => {
        const cursor = other.presence.cursor
        if (!cursor) return null

        const screenX = cursor.x * transform.zoom + transform.x
        const screenY = cursor.y * transform.zoom + transform.y

        return (
          <div
            key={other.connectionId}
            className="absolute"
            style={{
              left: screenX,
              top: screenY,
            }}
          >
            {/* Small cursor arrow */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              style={{
                filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.4))",
              }}
            >
              <path
                d="M3 3L10 20L13 13L20 10L3 3Z"
                fill={other.info.color}
                stroke="white"
                strokeWidth="1.5"
              />
            </svg>
            {/* Name badge */}
            <div
              className="ml-3 -mt-2 whitespace-nowrap rounded-full px-1.5 py-[2px] text-[10px] font-medium text-white shadow-sm"
              style={{
                backgroundColor: other.info.color,
                boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
              }}
            >
              {other.info.name}
            </div>
          </div>
        )
      })}
    </div>
  )
}
