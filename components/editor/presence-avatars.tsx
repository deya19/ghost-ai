"use client"

import { useUser } from "@clerk/nextjs"
import { useOthers } from "@liveblocks/react/suspense"
import { UserButton } from "@clerk/nextjs"

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function mutedTone(hex: string) {
  const tones: Record<string, string> = {
    "#52A8FF": "#0d2137",
    "#BF7AF0": "#1f1530",
    "#62C073": "#0b2613",
    "#FF990A": "#2a1d0a",
    "#F75F8F": "#2a131d",
    "#FF6166": "#2a1516",
    "#0AC7B4": "#0a2421",
    "#EDEDED": "#1F1F1F",
  }
  return tones[hex] || "#1F1F1F"
}

export function PresenceAvatars() {
  const { isLoaded, user } = useUser()
  const others = useOthers()

  const collaborators = isLoaded
    ? others.filter((other) => other.id !== user?.id)
    : []

  const overflow = collaborators.length > 4
  const visible = collaborators.slice(0, 4)

  return (
    <div className="flex items-center gap-2 rounded-full border border-[#2a2a2a] bg-[#141414] px-2 py-1.5 shadow-lg">
      {visible.length > 0 && (
        <div className="flex -space-x-1.5">
          {visible.map((other, i) => (
            <div
              key={other.connectionId}
              className="relative h-7 w-7 overflow-hidden rounded-full border border-[#1a1a1a]"
              style={{ zIndex: visible.length - i }}
              title={other.info.name}
            >
              {other.info.avatar ? (
                <img
                  src={other.info.avatar}
                  alt={other.info.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center text-[9px] font-bold"
                  style={{
                    backgroundColor: mutedTone(other.info.color),
                    color: other.info.color,
                  }}
                >
                  {getInitials(other.info.name)}
                </div>
              )}
            </div>
          ))}
          {overflow && (
            <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#1a1a1a] bg-[#1f1f1f] text-[9px] font-medium text-white/60">
              +{collaborators.length - 4}
            </div>
          )}
        </div>
      )}

      {visible.length > 0 && <div className="h-3.5 w-px bg-[#2a2a2a]" />}

      <div className="h-7 w-7">
        <UserButton
          appearance={{
            elements: {
              userButtonAvatarBox: "h-7 w-7 rounded-full",
              userButtonTrigger: "focus:shadow-none rounded-full",
            },
          }}
        />
      </div>
    </div>
  )
}
