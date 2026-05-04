"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { X, Plus, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Project } from "@/types/project"

const MOCK_MY_PROJECTS: Project[] = [
  { id: "1", name: "E-Commerce Platform", slug: "e-commerce-platform", owned: true },
  { id: "2", name: "Auth Service", slug: "auth-service", owned: true },
]

const MOCK_SHARED_PROJECTS: Project[] = [
  { id: "3", name: "Shared Monorepo", slug: "shared-monorepo", owned: false },
]

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
  onCreateProject: () => void
  onRenameProject: (project: Project) => void
  onDeleteProject: (project: Project) => void
  className?: string
}

export function ProjectSidebar({
  isOpen,
  onClose,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
  className,
}: ProjectSidebarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  const toggleMenu = (id: string) => {
    setActiveMenu((prev) => (prev === id ? null : id))
  }

  return (
    <>
      {/* Mobile backdrop scrim */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed top-14 left-0 z-30 flex h-[calc(100vh-3.5rem)] w-72 flex-col bg-card border-r border-border shadow-lg transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-sm font-medium text-card-foreground">Projects</h2>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <Tabs defaultValue="my-projects" className="flex h-full flex-col">
            <TabsList className="mx-4 mt-4 w-auto" variant="line">
              <TabsTrigger value="my-projects">My Projects</TabsTrigger>
              <TabsTrigger value="shared">Shared</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto p-4">
              <TabsContent value="my-projects">
                {MOCK_MY_PROJECTS.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No projects yet
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {MOCK_MY_PROJECTS.map((project) => (
                      <li key={project.id} className="relative">
                        <div className="group flex items-center justify-between rounded-lg px-3 py-2 hover:bg-muted/50">
                          <span className="truncate text-sm text-foreground">
                            {project.name}
                          </span>
                          <div className="relative ml-2 shrink-0">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="opacity-0 group-hover:opacity-100"
                              onClick={() => toggleMenu(project.id)}
                              aria-label="Project actions"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            {activeMenu === project.id && (
                              <div className="absolute right-0 top-8 z-50 w-36 rounded-lg border border-border bg-popover p-1 shadow-md">
                                <button
                                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                                  onClick={() => {
                                    setActiveMenu(null)
                                    onRenameProject(project)
                                  }}
                                >
                                  <Pencil className="h-4 w-4" />
                                  Rename
                                </button>
                                <button
                                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-destructive hover:bg-muted"
                                  onClick={() => {
                                    setActiveMenu(null)
                                    onDeleteProject(project)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>

              <TabsContent value="shared">
                {MOCK_SHARED_PROJECTS.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No shared projects
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {MOCK_SHARED_PROJECTS.map((project) => (
                      <li key={project.id}>
                        <div className="flex items-center rounded-lg px-3 py-2 hover:bg-muted/50">
                          <span className="truncate text-sm text-foreground">
                            {project.name}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* New Project button */}
        <div className="border-t border-border p-4">
          <Button className="w-full" variant="default" onClick={onCreateProject}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  )
}
