"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useProjectActions } from "@/hooks/use-project-actions"

interface ProjectDialogsProps {
  actions: ReturnType<typeof useProjectActions>
}

export function ProjectDialogs({ actions }: ProjectDialogsProps) {
  const {
    dialogOpen,
    name,
    setName,
    target,
    isLoading,
    roomIdPreview,
    close,
    createProject,
    renameProject,
    deleteProject,
  } = actions

  return (
    <>
      {/* Create Project Dialog */}
      <Dialog open={dialogOpen === "create"} onOpenChange={(open) => !open && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create project</DialogTitle>
            <DialogDescription>
              Give your new architecture workspace a name.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <Input
              placeholder="Project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createProject()}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              Room ID: <span className="font-mono">{roomIdPreview}</span>
            </p>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={close} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={createProject} disabled={isLoading}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Project Dialog */}
      <Dialog open={dialogOpen === "rename"} onOpenChange={(open) => !open && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename project</DialogTitle>
            <DialogDescription>
              Renaming &ldquo;{target?.name}&rdquo;
            </DialogDescription>
          </DialogHeader>

          <Input
            autoFocus
            placeholder="New project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && renameProject()}
          />

          <DialogFooter>
            <Button variant="ghost" onClick={close} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={renameProject} disabled={!name.trim() || isLoading}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Project Dialog */}
      <Dialog open={dialogOpen === "delete"} onOpenChange={(open) => !open && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{target?.name}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="ghost" onClick={close} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteProject} disabled={isLoading}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
