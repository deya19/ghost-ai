"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useEditorDialogs } from "@/context/editor-dialogs-context"

export function EditorHomeActions() {
  const { openCreate } = useEditorDialogs()

  return (
    <Button onClick={openCreate}>
      <Plus className="h-4 w-4" />
      New Project
    </Button>
  )
}
