import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { AccessDenied } from "@/components/editor/access-denied"
import { WorkspaceLayout } from "@/components/editor/workspace-layout"
import { getAccessibleProject } from "@/lib/project-access"
import { getEditorProjects } from "@/lib/project-data"

interface EditorWorkspacePageProps {
  params: Promise<{ roomId: string }>
}

export default async function EditorWorkspacePage({
  params,
}: EditorWorkspacePageProps) {
  const { roomId } = await params
  const access = await getAccessibleProject(roomId)

  if (access.status === "unauthenticated") {
    redirect("/sign-in")
  }

  if (access.status === "denied") {
    return <AccessDenied />
  }

  const { userId } = await auth()
  const isOwner = access.project.ownerId === userId

  // Fetch projects for sidebar
  const { owned, shared } = await getEditorProjects()

  return (
    <WorkspaceLayout
      project={access.project}
      isOwner={isOwner}
      ownedProjects={owned}
      sharedProjects={shared}
      currentProjectId={roomId}
    />
  )
}
