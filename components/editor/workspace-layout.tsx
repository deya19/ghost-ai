"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Menu, Bot, LayoutTemplate, Save } from "lucide-react"
import { AiSidebar } from "./ai-sidebar"
import { Project } from "@/types/project"
import { Button } from "@/components/ui/button"
import { ProjectSidebar } from "./project-sidebar"
import { ProjectDialogs } from "./project-dialogs"
import { ShareDialog } from "./share-dialog"
import { useProjectActions } from "@/hooks/use-project-actions"
import { EditorDialogsContext } from "@/context/editor-dialogs-context"
import { useEditorWorkspaceChrome } from "./editor-shell"
import { Canvas } from "./canvas"
import { StarterTemplatesModal } from "./starter-templates-modal"
import { CanvasSaveProvider, useCanvasSaveController } from "./canvas-save-context"
import { cn } from "@/lib/utils"
import type { CanvasTemplate } from "./starter-templates"

interface WorkspaceLayoutProps {
  project: Project
  isOwner: boolean
  ownedProjects: Project[]
  sharedProjects: Project[]
  currentProjectId: string
}

function SaveButton() {
  const { status, saveRef } = useCanvasSaveController()

  const label =
    status === "saving"
      ? "Saving..."
      : status === "saved"
        ? "Saved"
        : status === "error"
          ? "Error"
          : "Save"

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => saveRef.current?.()}
      disabled={status === "saving"}
      aria-label="Save canvas"
      className="h-8 gap-1.5 rounded-full border border-border bg-background/80 px-3 text-xs font-medium hover:bg-accent"
    >
      <Save className="h-3.5 w-3.5" />
      {label}
    </Button>
  )
}

export function WorkspaceLayout({
  project,
  isOwner,
  ownedProjects,
  sharedProjects,
  currentProjectId,
}: WorkspaceLayoutProps) {
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { isAiSidebarOpen, setIsAiSidebarOpen } = useEditorWorkspaceChrome()
  const actions = useProjectActions()
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false)
  const [templateToLoad, setTemplateToLoad] = useState<CanvasTemplate | null>(null)

  return (
    <CanvasSaveProvider>
      <div className="relative flex h-screen flex-col overflow-hidden bg-background">
      {/* Top Navbar */}
      <header className="flex h-14 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle projects sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-sm font-medium text-foreground">{project.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsTemplatesOpen(true)}
            aria-label="Open starter templates"
            className="h-8 gap-1.5 rounded-full border border-border bg-background/80 px-3 text-xs font-medium hover:bg-accent"
          >
            <LayoutTemplate className="h-3.5 w-3.5" />
            Templates
          </Button>
          <SaveButton />
          <ShareDialog project={project} isOwner={isOwner} />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsAiSidebarOpen(!isAiSidebarOpen)}
            aria-label="Toggle AI sidebar"
            className="h-8 gap-1.5 rounded-full border border-border bg-background/80 px-3 text-xs font-medium hover:bg-accent"
          >
            <Bot className="h-3.5 w-3.5" />
            AI
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Project Sidebar */}
        <ProjectSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          ownedProjects={ownedProjects}
          sharedProjects={sharedProjects}
          activeProjectId={currentProjectId}
          onSelectProject={(p) => {
            router.push(`/editor/${p.id}`)
          }}
          onCreateProject={actions.openCreate}
          onRenameProject={actions.openRename}
          onDeleteProject={actions.openDelete}
          className={cn(
            "fixed top-14 z-30 h-[calc(100vh-3.5rem)] transition-transform duration-300 ease-in-out",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        />

        {/* Canvas Area */}
        <main className="relative flex-1 overflow-hidden bg-[#0a0a0a]">
          <Canvas
            roomId={currentProjectId}
            templateToLoad={templateToLoad}
            onTemplateLoaded={() => setTemplateToLoad(null)}
          />
        </main>

        {/* AI Sidebar */}
        <AiSidebar
          isOpen={isAiSidebarOpen}
          onClose={() => setIsAiSidebarOpen(false)}
        />
      </div>

      <ProjectDialogs actions={actions} />

      <StarterTemplatesModal
        open={isTemplatesOpen}
        onOpenChange={setIsTemplatesOpen}
        onImport={(t) => {
          setTemplateToLoad(t)
          setIsTemplatesOpen(false)
        }}
      />

      <EditorDialogsContext.Provider value={{ openCreate: actions.openCreate }}>
        <div />
      </EditorDialogsContext.Provider>
    </div>
    </CanvasSaveProvider>
  )
}
