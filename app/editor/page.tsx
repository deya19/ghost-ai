import { EditorHomeActions } from "@/components/editor/editor-home-actions"
import { FolderPlus } from "lucide-react"

export default function EditorPage() {
  return (
    <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
      <div className="text-center max-w-sm px-4">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-muted/40">
          <FolderPlus className="h-6 w-6 text-muted-foreground" />
        </div>
        <h1 className="text-lg font-semibold text-foreground tracking-tight">
          Create a project or open an existing one
        </h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Start a new architecture workspace, or choose a project from the sidebar.
        </p>
        <div className="mt-6 flex justify-center">
          <EditorHomeActions />
        </div>
      </div>
    </div>
  )
}
