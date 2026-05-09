"use client"

import { Button } from "@/components/ui/button"
import { UserButton } from "@clerk/nextjs"
import {
  Bot,
  PanelLeftClose,
  PanelLeftOpen,
  Share2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useEditorWorkspaceChrome } from "./editor-shell"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onSidebarToggle: () => void
  projectName?: string
  className?: string
}

export function EditorNavbar({
  isSidebarOpen,
  onSidebarToggle,
  projectName,
  className,
}: EditorNavbarProps) {
  const { isAiSidebarOpen, setIsAiSidebarOpen } = useEditorWorkspaceChrome()
  const isWorkspace = Boolean(projectName)

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

      <div className="min-w-0 flex-1 px-4 text-center">
        {projectName ? (
          <h1 className="truncate text-sm font-medium text-foreground">
            {projectName}
          </h1>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        {isWorkspace && (
          <>
            <Button variant="outline" size="sm" type="button">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button
              variant={isAiSidebarOpen ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setIsAiSidebarOpen(!isAiSidebarOpen)}
              aria-label={
                isAiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"
              }
              aria-pressed={isAiSidebarOpen}
              type="button"
            >
              <Bot className="h-4 w-4" />
            </Button>
          </>
        )}
        <UserButton />
      </div>
    </header>
  )
}
