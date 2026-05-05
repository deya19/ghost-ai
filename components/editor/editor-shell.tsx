"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { EditorDialogsContext } from "@/context/editor-dialogs-context"
import { useProjectActions } from "@/hooks/use-project-actions"
import { Project } from "@/types/project"

interface EditorShellProps {
  ownedProjects: Project[]
  sharedProjects: Project[]
  children: React.ReactNode
}

export function EditorShell({
  ownedProjects,
  sharedProjects,
  children,
}: EditorShellProps) {
  const router = useRouter()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const actions = useProjectActions()

  return (
    <div className="relative min-h-screen bg-background">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

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
      />

      <ProjectDialogs actions={actions} />

      <EditorDialogsContext.Provider value={{ openCreate: actions.openCreate }}>
        <main className="pt-14">{children}</main>
      </EditorDialogsContext.Provider>
    </div>
  )
}
