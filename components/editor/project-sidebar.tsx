"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  X,
  MoreHorizontal,
  Pencil,
  Trash2,
  FolderOpen,
  Folder,
  Users,
  LayoutGrid,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Project } from "@/types/project"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
  ownedProjects: Project[]
  sharedProjects: Project[]
  onSelectProject: (project: Project) => void
  onCreateProject: () => void
  onRenameProject: (project: Project) => void
  onDeleteProject: (project: Project) => void
  activeProjectId?: string | null
  className?: string
}

export function ProjectSidebar({
  isOpen,
  onClose,
  ownedProjects,
  sharedProjects,
  onSelectProject,
  onCreateProject,
  onRenameProject,
  onDeleteProject,
  activeProjectId,
  className,
}: ProjectSidebarProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  const toggleMenu = (id: string) => {
    setActiveMenu((prev) => (prev === id ? null : id))
  }

  const totalProjects = ownedProjects.length + sharedProjects.length

  return (
    <>
      {/* Mobile backdrop scrim */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed top-14 left-0 z-30 flex h-[calc(100vh-3.5rem)] w-72 flex-col border-r border-border/60 bg-[#0d0d0f] transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
              <LayoutGrid className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Projects</h2>
              <p className="text-[11px] text-muted-foreground leading-none">
                {totalProjects} workspace{totalProjects !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted/60"
            aria-label="Close sidebar"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex flex-1 flex-col overflow-hidden px-3">
          <Tabs defaultValue="my-projects" className="flex h-full flex-col">
            <TabsList
              className="w-full h-9 bg-muted/30 p-0.5 rounded-lg"
            >
              <TabsTrigger
                value="my-projects"
                className="flex-1 h-full text-xs font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground"
              >
                My Projects
              </TabsTrigger>
              <TabsTrigger
                value="shared"
                className="flex-1 h-full text-xs font-medium rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground"
              >
                Shared
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto py-3">
              <TabsContent value="my-projects" className="mt-0">
                {ownedProjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-muted/40 border border-border/50">
                      <Folder className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground">No projects yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Create your first workspace to get started
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-0.5">
                    {ownedProjects.map((project) => {
                      const isActive = activeProjectId === project.id
                      return (
                        <li key={project.id} className="relative">
                          <div
                            className={cn(
                              "group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200",
                              isActive
                                ? "bg-primary/8 text-primary"
                                : "hover:bg-muted/40 text-foreground"
                            )}
                          >
                            {/* Active indicator bar */}
                            <div
                              className={cn(
                                "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full transition-all duration-200",
                                isActive
                                  ? "bg-primary opacity-100"
                                  : "bg-transparent opacity-0"
                              )}
                            />

                            {isActive ? (
                              <FolderOpen className="h-4 w-4 shrink-0 text-primary" />
                            ) : (
                              <Folder className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
                            )}

                            <button
                              className="min-w-0 flex-1 truncate text-left text-sm font-medium"
                              onClick={() => onSelectProject(project)}
                              type="button"
                            >
                              {project.name}
                            </button>

                            <div className="relative ml-1 shrink-0">
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-all duration-150 hover:bg-muted/60"
                                onClick={() => toggleMenu(project.id)}
                                aria-label="Project actions"
                              >
                                <MoreHorizontal className="h-3.5 w-3.5" />
                              </Button>
                              {activeMenu === project.id && (
                                <div className="absolute right-0 top-7 z-50 w-40 rounded-xl border border-border/50 bg-[#161618] p-1.5 shadow-2xl">
                                  <button
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-white/[0.04] transition-colors"
                                    onClick={() => {
                                      setActiveMenu(null)
                                      onRenameProject(project)
                                    }}
                                  >
                                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-cyan-500/10">
                                      <Pencil className="h-3.5 w-3.5 text-cyan-400" />
                                    </div>
                                    Rename
                                  </button>
                                  <div className="my-1 h-px bg-border/40" />
                                  <button
                                    className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/5 transition-colors"
                                    onClick={() => {
                                      setActiveMenu(null)
                                      onDeleteProject(project)
                                    }}
                                  >
                                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-red-500/10">
                                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                                    </div>
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </TabsContent>

              <TabsContent value="shared" className="mt-0">
                {sharedProjects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-muted/40 border border-border/50">
                      <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground">No shared projects</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Projects shared with you will appear here
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-0.5">
                    {sharedProjects.map((project) => {
                      const isActive = activeProjectId === project.id
                      return (
                        <li key={project.id}>
                          <button
                            className={cn(
                              "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all duration-200",
                              isActive
                                ? "bg-primary/8 text-primary"
                                : "hover:bg-muted/40 text-foreground"
                            )}
                            onClick={() => onSelectProject(project)}
                            type="button"
                          >
                            {/* Active indicator bar */}
                            <div
                              className={cn(
                                "absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full transition-all duration-200",
                                isActive
                                  ? "bg-primary opacity-100"
                                  : "bg-transparent opacity-0"
                              )}
                            />
                            {isActive ? (
                              <FolderOpen className="h-4 w-4 shrink-0 text-primary" />
                            ) : (
                              <Users className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
                            )}
                            <span className="truncate text-sm font-medium">
                              {project.name}
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* New Project button */}
        <div className="border-t border-border/60 p-4">
          <Button
            className="w-full h-10 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg shadow-primary/20 transition-all duration-200 hover:shadow-primary/30"
            onClick={onCreateProject}
          >
            <Sparkles className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </aside>
    </>
  )
}
