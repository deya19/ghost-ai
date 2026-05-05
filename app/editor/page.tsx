import { EditorHomeActions } from "@/components/editor/editor-home-actions";


export default function EditorPage() {
  return (
    <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-foreground">
          Create a project or open an existing one
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Start a new architecture workspace, or choose a project from the sidebar.
        </p>
        <div className="mt-6 flex justify-center">
          <EditorHomeActions />
        </div>
      </div>
    </div>
  )
}
