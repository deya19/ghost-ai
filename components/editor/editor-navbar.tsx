"use client"

import { Button } from "@/components/ui/button"
import { UserButton } from "@clerk/nextjs"
import { PanelLeftOpen, PanelLeftClose } from "lucide-react"
import { cn } from "@/lib/utils"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onSidebarToggle: () => void
  className?: string
}

export function EditorNavbar({
  isSidebarOpen,
  onSidebarToggle,
  className,
}: EditorNavbarProps) {
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background px-4",
        className
      )}
    >
      {/* Left section - Sidebar toggle */}
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={onSidebarToggle}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {isSidebarOpen ? (
            <PanelLeftClose className="h-5 w-5" />
          ) : (
            <PanelLeftOpen className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Center section - Empty for now */}
      <div className="flex items-center" />

      {/* Right section - User menu */}
      <div className="flex items-center">
        <UserButton />
      </div>
    </header>
  )
}
