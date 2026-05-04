"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useEditorDialogs } from "@/context/editor-dialogs-context"

export default function EditorPage() {
  const { openCreate } = useEditorDialogs()

  return (
    <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-foreground">
          Create a project or open an existing one
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Start a new architecture workspace, or choose a project from the sidebar.
        </p>
        <Button className="mt-6" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>
    </div>
  )
}
