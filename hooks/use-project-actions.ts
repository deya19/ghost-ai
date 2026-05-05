"use client"

import { useCallback, useMemo, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Project } from "@/types/project"

type DialogType = "create" | "rename" | "delete" | null

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

function shortSuffix() {
  return Math.random().toString(36).slice(2, 7)
}

export function useProjectActions() {
  const router = useRouter()
  const pathname = usePathname()

  const [dialogOpen, setDialogOpen] = useState<DialogType>(null)
  const [name, setName] = useState("")
  const [target, setTarget] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [suffix, setSuffix] = useState("")

  const roomIdPreview = useMemo(() => {
    const base = slugify(name || "untitled-project")
    const currentSuffix = suffix || shortSuffix()
    return `${base}-${currentSuffix}`
  }, [name, suffix])

  const openCreate = useCallback(() => {
    setName("")
    setTarget(null)
    setSuffix(shortSuffix())
    setDialogOpen("create")
  }, [])

  const openRename = useCallback((project: Project) => {
    setTarget(project)
    setName(project.name)
    setDialogOpen("rename")
  }, [])

  const openDelete = useCallback((project: Project) => {
    setTarget(project)
    setName("")
    setDialogOpen("delete")
  }, [])

  const close = useCallback(() => {
    setDialogOpen(null)
    setTarget(null)
    setName("")
    setSuffix("")
  }, [])

  const createProject = useCallback(async () => {
    setIsLoading(true)
    try {
      const id = roomIdPreview
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, name }),
      })

      if (!res.ok) {
        setIsLoading(false)
        return
      }

      const project = (await res.json()) as Project

      router.push(`/editor/${project.id}`)
      router.refresh()
      close()
    } finally {
      setIsLoading(false)
    }
  }, [name, roomIdPreview, router, close])

  const renameProject = useCallback(async () => {
    if (!target) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/projects/${target.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      })

      if (!res.ok) {
        setIsLoading(false)
        return
      }

      close()
      // Force revalidation of the editor layout data
      await fetch("/api/projects", { method: "HEAD" })
      router.refresh()
    } finally {
      setIsLoading(false)
    }
  }, [target, name, router, close])

  const deleteProject = useCallback(async () => {
    if (!target) return

    setIsLoading(true)
    try {
      const res = await fetch(`/api/projects/${target.id}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        setIsLoading(false)
        return
      }

      const activeWorkspaceId = pathname?.startsWith("/editor/")
        ? pathname.split("/")[2]
        : null

      close()

      if (activeWorkspaceId && activeWorkspaceId === target.id) {
        router.push("/editor")
        router.refresh()
      } else {
        // Force revalidation of the editor layout data
        await fetch("/api/projects", { method: "HEAD" })
        router.refresh()
      }
    } finally {
      setIsLoading(false)
    }
  }, [target, router, pathname, close])

  return {
    dialogOpen,
    name,
    setName,
    target,
    isLoading,
    roomIdPreview,
    openCreate,
    openRename,
    openDelete,
    close,
    createProject,
    renameProject,
    deleteProject,
  }
}
