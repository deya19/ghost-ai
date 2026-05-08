"use client"

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { usePathname, useRouter } from "next/navigation"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { EditorDialogsContext } from "@/context/editor-dialogs-context"
import { useProjectActions } from "@/hooks/use-project-actions"
import { cn } from "@/lib/utils"
import { Project } from "@/types/project"

interface EditorWorkspaceChromeContextValue {
  isAiSidebarOpen: boolean
}

const EditorWorkspaceChromeContext =
  createContext<EditorWorkspaceChromeContextValue>({
    isAiSidebarOpen: true,
  })

export function useEditorWorkspaceChrome() {
  return useContext(EditorWorkspaceChromeContext)
}

interface EditorShellProps {
  ownedProjects: Project[]
  sharedProjects: Project[]
  children: ReactNode
}

export function EditorShell({
  ownedProjects,
  sharedProjects,
  children,
}: EditorShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const activeProjectId = pathname?.startsWith("/editor/")
    ? pathname.split("/")[2] ?? null
    : null
  const [isSidebarOpen, setIsSidebarOpen] = useState(Boolean(activeProjectId))
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(true)
  const actions = useProjectActions()
  const activeProject = useMemo(
    () =>
      [...ownedProjects, ...sharedProjects].find(
        (project) => project.id === activeProjectId
      ) ?? null,
    [activeProjectId, ownedProjects, sharedProjects]
  )

  const isWorkspace = Boolean(activeProjectId)

  return (
    <div className="relative min-h-screen bg-background">
      {!isWorkspace && (
        <EditorNavbar
          isSidebarOpen={isSidebarOpen}
          onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          projectName={activeProject?.name}
          isAiSidebarOpen={isAiSidebarOpen}
          onAiSidebarToggle={() => setIsAiSidebarOpen((open) => !open)}
        />
      )}

      {!isWorkspace && (
        <ProjectSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          ownedProjects={ownedProjects}
          sharedProjects={sharedProjects}
          onSelectProject={(project) => {
            router.push(`/editor/${project.id}`)
            setIsSidebarOpen(false)
          }}
          onCreateProject={actions.openCreate}
          onRenameProject={actions.openRename}
          onDeleteProject={actions.openDelete}
          activeProjectId={activeProjectId}
        />
      )}

      <ProjectDialogs actions={actions} />

      <EditorDialogsContext.Provider value={{ openCreate: actions.openCreate }}>
        <EditorWorkspaceChromeContext.Provider value={{ isAiSidebarOpen }}>
          <main
            className={cn(
              !isWorkspace && "pt-14 transition-[padding]",
              !isWorkspace && isSidebarOpen && "lg:pl-72"
            )}
          >
            {children}
          </main>
        </EditorWorkspaceChromeContext.Provider>
      </EditorDialogsContext.Provider>
    </div>
  )
}
