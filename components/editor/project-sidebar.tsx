"use client"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { X, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
  className?: string
}

export function ProjectSidebar({
  isOpen,
  onClose,
  className,
}: ProjectSidebarProps) {

  return (
    <aside
      className={cn(
        "fixed top-14 left-0 z-30 h-[calc(100vh-3.5rem)] w-72 bg-card border-r border-border shadow-lg transition-transform duration-300 ease-in-out",
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
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="my-projects" className="flex h-full flex-col">
          <TabsList className="mx-4 mt-4 w-auto" variant="line">
            <TabsTrigger value="my-projects">My Projects</TabsTrigger>
            <TabsTrigger value="shared">Shared</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto p-4">
            <TabsContent value="my-projects" className="h-full">
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No projects yet
              </div>
            </TabsContent>

            <TabsContent value="shared" className="h-full">
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No shared projects
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* New Project button */}
      <div className="border-t border-border p-4">
        <Button className="w-full" variant="default">
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>
    </aside>
  )
}
