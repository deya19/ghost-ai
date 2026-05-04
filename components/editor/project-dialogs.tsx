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
import { useProjectDialogs } from "@/hooks/use-project-dialogs"

type Props = ReturnType<typeof useProjectDialogs>

export function ProjectDialogs({
  dialog,
  form,
  setForm,
  isLoading,
  slug,
  close,
  handleCreate,
  handleRename,
  handleDelete,
}: Props) {

  return (
    <>
      {/* Create Project Dialog */}
      <Dialog open={dialog.open === "create"} onOpenChange={(open) => !open && close()}>
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
              value={form.name}
              onChange={(e) => setForm({ name: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
            {form.name.trim() && (
              <p className="text-xs text-muted-foreground">
                Slug: <span className="font-mono">{slug}</span>
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={close} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!form.name.trim() || isLoading}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Project Dialog */}
      <Dialog open={dialog.open === "rename"} onOpenChange={(open) => !open && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename project</DialogTitle>
            <DialogDescription>
              Renaming &ldquo;{dialog.target?.name}&rdquo;
            </DialogDescription>
          </DialogHeader>

          <Input
            autoFocus
            placeholder="New project name"
            value={form.name}
            onChange={(e) => setForm({ name: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
          />

          <DialogFooter>
            <Button variant="ghost" onClick={close} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={!form.name.trim() || isLoading}>
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Project Dialog */}
      <Dialog open={dialog.open === "delete"} onOpenChange={(open) => !open && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete project</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{dialog.target?.name}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="ghost" onClick={close} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
