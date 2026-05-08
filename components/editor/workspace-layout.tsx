"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Menu, X, Bot, Pencil } from "lucide-react"
import { Project } from "@/types/project"
import { Button } from "@/components/ui/button"
import { UserButton } from "@clerk/nextjs"
import { ProjectSidebar } from "./project-sidebar"
import { ProjectDialogs } from "./project-dialogs"
import { ShareDialog } from "./share-dialog"
import { useProjectActions } from "@/hooks/use-project-actions"
import { EditorDialogsContext } from "@/context/editor-dialogs-context"
import { cn } from "@/lib/utils"

interface WorkspaceLayoutProps {
  project: Project
  isOwner: boolean
  ownedProjects: Project[]
  sharedProjects: Project[]
  currentProjectId: string
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
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(false)
  const actions = useProjectActions()

  return (
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
          <ShareDialog project={project} isOwner={isOwner} />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsAiSidebarOpen(!isAiSidebarOpen)}
            aria-label="Toggle AI sidebar"
          >
            <Bot className="h-5 w-5" />
          </Button>
          <UserButton />
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
        <main className="relative flex-1 overflow-hidden" style={{ background: "radial-gradient(ellipse at center, #0d1f26 0%, #0a0a0a 50%, #050505 100%)" }}>
          {/* Gradient glow effect */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative">
              {/* Outer glow */}
              <div
                className="absolute inset-0 rounded-full blur-3xl scale-150"
                style={{ background: "radial-gradient(circle, rgba(6,182,212,0.25) 0%, rgba(20,184,166,0.1) 40%, transparent 70%)" }}
              />
              {/* Inner glow */}
              <div
                className="absolute inset-0 rounded-full blur-2xl scale-100"
                style={{ background: "radial-gradient(circle, rgba(34,211,238,0.35) 0%, transparent 60%)" }}
              />
              
            </div>
          </div>
          
          {/* Text content */}
          <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center">
            {/* Center icon container */}
            <div className="relative mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/30 bg-linear-to-br from-cyan-500/20 to-teal-500/10">
              <Pencil className="h-8 w-8 text-cyan-400" />
            </div>
            <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              Workspace Shell
            </p>
            <h2 className="mb-3 text-2xl font-semibold text-foreground">
              Canvas and collaboration tooling land here next.
            </h2>
            <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
              This room is ready for the shared architecture canvas, durable AI workflows, and
              real-time presence. For now, the shell is wired with project context and
              navigation only.
            </p>
          </div>
        </main>

        {/* AI Sidebar */}
        <aside
          className={cn(
            "w-80 flex-col border-l border-border bg-[#0f0f0f] transition-transform duration-300 ease-in-out",
            isAiSidebarOpen ? "flex translate-x-0" : "hidden translate-x-full"
          )}
        >
          {/* Header */}
          <div className="flex h-14 items-center justify-between border-b border-border px-4">
            <h3 className="text-sm font-medium text-foreground">AI Copilot</h3>
            <button
              onClick={() => setIsAiSidebarOpen(false)}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Close AI sidebar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="flex flex-1 flex-col gap-4 p-4">
            <p className="text-xs text-muted-foreground">Placeholder panel</p>
            
            {/* Chat surface pending card */}
            <div className="rounded-xl border border-border bg-[#141414] p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/10">
                  <Bot className="h-4 w-4 text-violet-400" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-foreground">Chat surface pending</h4>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    The toggle is wired. Messaging and generation are intentionally out of scope here.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Future hooks section */}
            <div className="mt-auto rounded-xl border border-border bg-[#141414] p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Future Hooks
              </p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Prompt composer, run status, and architecture guidance will attach to this sidebar.
              </p>
            </div>
          </div>
        </aside>
      </div>

      <ProjectDialogs actions={actions} />

      <EditorDialogsContext.Provider value={{ openCreate: actions.openCreate }}>
        <div />
      </EditorDialogsContext.Provider>
    </div>
  )
}
