"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Project } from "@/types/project"

type DialogType = "create" | "rename" | "delete" | null

interface DialogState {
  open: DialogType
  target: Project | null
}

interface FormState {
  name: string
}

export function useProjectDialogs() {
  const [dialog, setDialog] = useState<DialogState>({ open: null, target: null })
  const [form, setForm] = useState<FormState>({ name: "" })
  const [isLoading, setIsLoading] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) clearTimeout(timeoutRef.current)
    }
  }, [])

  const openCreate = useCallback(() => {
    setForm({ name: "" })
    setDialog({ open: "create", target: null })
  }, [])

  const openRename = useCallback((project: Project) => {
    setForm({ name: project.name })
    setDialog({ open: "rename", target: project })
  }, [])

  const openDelete = useCallback((project: Project) => {
    setDialog({ open: "delete", target: project })
  }, [])

  const close = useCallback(() => {
    setDialog({ open: null, target: null })
    setForm({ name: "" })
  }, [])

  const handleCreate = useCallback(() => {
    if (!form.name.trim()) return
    setIsLoading(true)
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false)
      close()
    }, 300)
  }, [form.name, close])

  const handleRename = useCallback(() => {
    if (!form.name.trim() || !dialog.target) return
    setIsLoading(true)
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false)
      close()
    }, 300)
  }, [form.name, dialog.target, close])

  const handleDelete = useCallback(() => {
    if (!dialog.target) return
    setIsLoading(true)
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false)
      close()
    }, 300)
  }, [dialog.target, close])

  const slug = form.name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")

  return {
    dialog,
    form,
    setForm,
    isLoading,
    slug,
    openCreate,
    openRename,
    openDelete,
    close,
    handleCreate,
    handleRename,
    handleDelete,
  }
}
