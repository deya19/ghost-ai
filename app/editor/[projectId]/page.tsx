interface EditorWorkspacePageProps {
  params: Promise<{ projectId: string }>
}

export default async function EditorWorkspacePage({
  params,
}: EditorWorkspacePageProps) {
  const { projectId } = await params

  return (
    <div className="flex h-[calc(100vh-3.5rem)] items-center justify-center">
      <div className="text-lg font-medium text-foreground">Workspace: {projectId}</div>
    </div>
  )
}
