"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useUser } from "@clerk/nextjs"
import { Share, Loader2, Link2, Mail, Trash2 } from "lucide-react"
import { Project } from "@/types/project"
import Image from "next/image"

interface Collaborator {
  id: string
  email: string
  projectId: string
  createdAt: string
}

interface EnrichedCollaborator extends Collaborator {
  displayName?: string
  avatarUrl?: string
}

interface ShareDialogProps {
  project: Project
  isOwner: boolean
}

async function enrichWithClerkData(collaborators: Collaborator[]): Promise<EnrichedCollaborator[]> {
  try {
    const res = await fetch("/api/users/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails: collaborators.map(c => c.email) }),
    })
    if (!res.ok) return collaborators
    const userData: Record<string, { displayName?: string; avatarUrl?: string }> = await res.json()
    
    return collaborators.map(c => ({
      ...c,
      displayName: userData[c.email]?.displayName,
      avatarUrl: userData[c.email]?.avatarUrl,
    }))
  } catch {
    return collaborators
  }
}

export function ShareDialog({ project, isOwner }: ShareDialogProps) {
  const [open, setOpen] = useState(false)
  const [collaborators, setCollaborators] = useState<EnrichedCollaborator[]>([])
  const [loading, setLoading] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviting, setInviting] = useState(false)
  const [copied, setCopied] = useState(false)
  const { user } = useUser()
  const ownerEmail = user?.primaryEmailAddress?.emailAddress ?? ""
  const ownerName = user?.fullName ?? user?.firstName ?? "You"
  const ownerAvatar = user?.imageUrl

  const [error, setError] = useState<string | null>(null)

  const projectUrl = typeof window !== "undefined"
    ? `${window.location.origin}/editor/${project.id}`
    : ""

  async function loadCollaborators() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${project.id}/collaborators`)
      if (!res.ok) {
        const errorText = await res.text().catch(() => "Unknown error")
        console.error(`Failed to load collaborators: ${res.status} ${errorText}`)
        throw new Error(`Failed to load: ${res.status}`)
      }
      const data: Collaborator[] = await res.json()
      
      const enriched = await enrichWithClerkData(data)
      setCollaborators(enriched)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load collaborators")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!open) return
    async function fetch() {
      await loadCollaborators()
    }
    fetch()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, project.id])

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!inviteEmail.trim() || !isOwner) return

    const normalizedInvite = inviteEmail.trim().toLowerCase()
    if (ownerEmail && normalizedInvite === ownerEmail.toLowerCase()) {
      setError("You can't invite yourself")
      return
    }

    setInviting(true)
    setError(null)
    try {
      const res = await fetch(`/api/projects/${project.id}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim() }),
      })
      if (!res.ok) {
        if (res.status === 409) {
          setError("This user is already a collaborator")
          return
        }
        const errorText = await res.text().catch(() => "Unknown error")
        console.error(`Invite failed: ${res.status} ${res.statusText} - ${errorText}`)
        throw new Error(`Failed to invite: ${res.status} ${errorText}`)
      }
      setInviteEmail("")
      loadCollaborators()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to invite")
    } finally {
      setInviting(false)
    }
  }

  async function handleRemove(email: string) {
    if (!isOwner) return
    
    try {
      const res = await fetch(`/api/projects/${project.id}/collaborators?email=${encodeURIComponent(email)}`, {
        method: "DELETE",
      })
      if (!res.ok) throw new Error("Failed to remove collaborator")
      loadCollaborators()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove")
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(projectUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Clipboard write failed:", err)
      // Fallback: temporary textarea selection
      try {
        const textarea = document.createElement("textarea")
        textarea.value = projectUrl
        textarea.style.position = "fixed"
        textarea.style.left = "-9999px"
        document.body.appendChild(textarea)
        textarea.focus()
        textarea.select()
        const success = document.execCommand("copy")
        document.body.removeChild(textarea)
        if (success) {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        }
      } catch (fallbackErr) {
        console.error("Fallback copy failed:", fallbackErr)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon-sm">
            <Share className="h-4 w-4" />
          </Button>
        }
      />
      <DialogContent className="w-[560px] max-w-[95vw] bg-[#111111]! border border-[#2a2a2a] shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">Share project</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Invite collaborators, copy the workspace link, and manage access.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 pt-2">
          {/* Workspace Link Section */}
          <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">Workspace link</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Share a direct link with teammates after you grant them access.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCopyLink}
                className="shrink-0 bg-[#1c1c1e] hover:bg-[#2a2a2c] text-foreground border border-[#2a2a2a]"
              >
                <Link2 className="mr-1.5 h-3.5 w-3.5" />
                {copied ? "Copied!" : "Copy link"}
              </Button>
            </div>
          </div>

          {/* Invite Section (Owner Only) */}
          {isOwner && (
            <div className="rounded-xl border border-[#2a2a2a] bg-[#141414] p-3">
              <form onSubmit={handleInvite} className="flex items-center gap-2">
                <div className="flex h-9 flex-1 min-w-0 items-center gap-2 rounded-lg border border-[#2a2a2a] bg-[#1a1a1c] px-3">
                  <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="teammate@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="h-full flex-1 border-0 bg-transparent! pl-0 py-0 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  disabled={!inviteEmail.trim() || inviting}
                  className="h-9 px-4 shrink-0 bg-[#00d4aa]! hover:bg-[#00b894]! text-black font-medium"
                >
                  {inviting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Invite"
                  )}
                </Button>
              </form>
            </div>
          )}

          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}

          {/* People with access */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-foreground">People with access</h4>
              <span className="text-xs text-muted-foreground">{collaborators.length + 1} total</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {/* Owner row - shown first */}
                <li className="flex items-center justify-between rounded-xl border border-[#2a2a2a] bg-[#141414] px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {ownerAvatar ? (
                      <Image
                        src={ownerAvatar}
                        alt=""
                        width={36}
                        height={36}
                        className="h-9 w-9 rounded-full"
                      />
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-cyan-500/20 to-teal-500/10">
                        <span className="text-sm font-medium text-cyan-400">
                          {ownerName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground truncate">{ownerName}</p>
                        <span className="px-2 py-0.5 rounded-full bg-[#00d4aa]/20 text-[#00d4aa] text-xs font-medium">
                          OWNER
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{ownerEmail || "Owner"}</p>
                    </div>
                  </div>
                </li>

                {/* Collaborators */}
                {collaborators.length === 0 ? (
                  <li className="text-sm text-muted-foreground py-4 text-center">
                    No collaborators yet. Invite someone to get started.
                  </li>
                ) : (
                  collaborators.map((collaborator) => (
                    <li
                      key={collaborator.id}
                      className="flex items-center justify-between rounded-xl border border-[#2a2a2a] bg-[#141414] px-4 py-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {collaborator.avatarUrl ? (
                          <Image
                            src={collaborator.avatarUrl}
                            alt=""
                            width={36}
                            height={36}
                            className="h-9 w-9 rounded-full"
                          />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-violet-500/20 to-purple-500/10">
                            <span className="text-sm font-medium text-violet-400">
                              {collaborator.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground truncate">
                              {collaborator.displayName || collaborator.email}
                            </p>
                            <span className="px-2 py-0.5 rounded-full bg-[#3a3a3a] text-muted-foreground text-xs font-medium">
                              COLLABORATOR
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {collaborator.email}
                          </p>
                        </div>
                      </div>
                      {isOwner && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleRemove(collaborator.email)}
                          className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
