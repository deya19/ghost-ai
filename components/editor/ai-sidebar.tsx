"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Bot, X, Send, FileText, Download, Sparkles, Loader2, Eye } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import {
  Dialog,
  DialogClose,
  DialogContent,
} from "@/components/ui/dialog"
import { useRealtimeRun } from "@trigger.dev/react-hooks"
import {
  useEventListener,
  useFeedMessages,
  useCreateFeedMessage,
  useSelf,
} from "@liveblocks/react/suspense"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  isValidAiStatusPayload,
  isValidAiChatMessage,
  type AiChatMessagePayload,
} from "@/types/tasks"

interface AiSidebarProps {
  isOpen: boolean
  onClose: () => void
  roomId: string
  nodes?: unknown[]
  edges?: unknown[]
}

const STARTER_CHIPS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
]

const FEED_ID = "ai-chat"

/** Subscribes to a Trigger.dev run and notifies parent on completion / failure. */
function RunTracker({
  runId,
  accessToken,
  onComplete,
}: {
  runId: string
  accessToken: string
  onComplete: (output: unknown, status: string) => void
}) {
  const { run, error } = useRealtimeRun(runId, { accessToken })

  useEffect(() => {
    if (run?.status === "COMPLETED" || run?.status === "FAILED" || run?.status === "CANCELED") {
      onComplete(run.output, run.status)
    }
    if (error) {
      onComplete(null, "FAILED")
    }
  }, [run, error, onComplete])

  return null
}

export function AiSidebar({ isOpen, onClose, roomId, nodes = [], edges = [] }: AiSidebarProps) {
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const self = useSelf()
  const { messages: feedMessages } = useFeedMessages(FEED_ID)
  const createFeedMessage = useCreateFeedMessage()

  const [aiStatus, setAiStatus] = useState<{
    message: string
    status: "start" | "thinking" | "complete" | "error"
  } | null>(null)

  const [runId, setRunId] = useState<string | null>(null)
  const [publicToken, setPublicToken] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Specs tab state
  const [specs, setSpecs] = useState<Array<{ id: string; projectId: string; filePath: string; createdAt: string }>>([])
  const [specsLoading, setSpecsLoading] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewSpecId, setPreviewSpecId] = useState<string | null>(null)
  const [previewContent, setPreviewContent] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  const isGenerating =
    isSubmitting ||
    aiStatus?.status === "start" ||
    aiStatus?.status === "thinking"

  useEventListener(({ event }) => {
    if (event.type !== "ai-status") return
    if (!isValidAiStatusPayload(event)) return
    setAiStatus({
      message: event.message,
      status: event.status,
    })
  })

  const pushChatMessage = useCallback(
    async (payload: Omit<AiChatMessagePayload, "timestamp">) => {
      try {
        await createFeedMessage(FEED_ID, {
          ...payload,
          timestamp: Date.now(),
        })
      } catch (err) {
        console.error("Failed to push chat message:", err)
      }
    },
    [createFeedMessage]
  )

  // Fetch specs list for the current project
  const loadSpecs = useCallback(async () => {
    setSpecsLoading(true)
    try {
      const res = await fetch(`/api/projects/${roomId}/specs`)
      if (!res.ok) throw new Error(`Failed to load specs: ${res.status}`)
      const data = await res.json()
      setSpecs(data ?? [])
    } catch (err) {
      console.error("[Specs] Failed to load:", err)
      setSpecs([])
    } finally {
      setSpecsLoading(false)
    }
  }, [roomId])

  useEffect(() => {
    const id = setTimeout(() => {
      void loadSpecs()
    }, 0)
    return () => clearTimeout(id)
  }, [loadSpecs])

  const handleRunComplete = useCallback(
    (output: unknown, status: string) => {
      setIsSubmitting(false)
      setRunId(null)
      setPublicToken(null)

      if (status === "COMPLETED") {
        const summary =
          (output as { summary?: string } | null)?.summary ??
          "Design applied to canvas."
        void pushChatMessage({
          sender: "Ghost AI",
          role: "assistant",
          content: summary,
        })
        // Refresh specs list when any run completes (spec generation will add new specs)
        void loadSpecs()
      } else {
        void pushChatMessage({
          sender: "Ghost AI",
          role: "assistant",
          content: "Ghost AI encountered an error. Please try again.",
        })
      }
    },
    [pushChatMessage, loadSpecs]
  )

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || isGenerating) return

    setIsSubmitting(true)

    try {
      await pushChatMessage({
        sender: self?.info.name ?? "You",
        role: "user",
        content: text,
      })
      setInput("")
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto"
      }
    } catch (err) {
      console.error("Failed to push user message:", err)
      setIsSubmitting(false)
      return
    }

    try {
      const res = await fetch("/api/ai/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: text,
          roomId,
          projectId: roomId,
        }),
      })

      if (!res.ok) {
        const bodyText = await res.text().catch(() => res.statusText)
        throw new Error(bodyText)
      }

      const data = (await res.json()) as {
        runId?: string
        publicToken?: string
      }

      if (!data.runId || !data.publicToken) {
        throw new Error("Invalid response from design API")
      }

      setRunId(data.runId)
      setPublicToken(data.publicToken)
    } catch (err) {
      console.error("Design API error:", err)
      void pushChatMessage({
        sender: "Ghost AI",
        role: "assistant",
        content: `Failed to start design task: ${err instanceof Error ? err.message : "Unknown error"}`,
      })
      setIsSubmitting(false)
    }
  }, [input, isGenerating, pushChatMessage, self, roomId])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget
    target.style.height = "auto"
    target.style.height = `${Math.min(target.scrollHeight, 160)}px`
  }

  const handleChipClick = (text: string) => {
    if (isGenerating) return
    setInput(text)
    if (textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`
    }
  }

  const handleGenerateSpec = useCallback(async () => {
    if (isGenerating) return
    setIsSubmitting(true)

    const chatHistory = feedMessages
      .filter(
        (msg): msg is typeof msg & { data: AiChatMessagePayload } =>
          msg.data !== null && isValidAiChatMessage(msg.data)
      )
      .map((m) => ({
        sender: m.data.sender,
        role: m.data.role,
        content: m.data.content,
        timestamp: m.data.timestamp,
      }))

    try {
      const res = await fetch("/api/ai/spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          chatHistory,
          nodes,
          edges,
        }),
      })

      if (!res.ok) {
        const bodyText = await res.text().catch(() => res.statusText)
        throw new Error(bodyText)
      }

      const data = (await res.json()) as {
        runId?: string
        publicToken?: string
      }

      if (!data.runId || !data.publicToken) {
        throw new Error("Invalid response from spec API")
      }

      setRunId(data.runId)
      setPublicToken(data.publicToken)
    } catch (err) {
      console.error("Spec API error:", err)
      setIsSubmitting(false)
    }
  }, [isGenerating, roomId, nodes, edges, feedMessages])

  const handlePreview = useCallback(async (specId: string) => {
    setPreviewSpecId(specId)
    setPreviewOpen(true)
    setPreviewLoading(true)
    setPreviewContent(null)
    try {
      const res = await fetch(`/api/projects/${roomId}/specs/${specId}/download`)
      if (!res.ok) throw new Error(`Failed to load spec: ${res.status}`)
      const text = await res.text()
      setPreviewContent(text)
    } catch (err) {
      console.error("[Preview] Failed:", err)
      setPreviewContent(`Failed to load preview: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setPreviewLoading(false)
    }
  }, [roomId])

  const handleDownload = useCallback((specId: string) => {
    const url = `/api/projects/${roomId}/specs/${specId}/download`
    const a = document.createElement("a")
    a.href = url
    a.download = `spec-${specId}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }, [roomId])

  const validMessages = feedMessages
    .filter(
      (msg): msg is typeof msg & { data: AiChatMessagePayload } =>
        msg.data !== null && isValidAiChatMessage(msg.data)
    )
    .map((msg) => ({ id: msg.id, data: msg.data }))

  return (
    <aside
      className={cn(
        "absolute right-0 top-0 z-20 flex h-full w-80 flex-col border-l border-border bg-[#0f0f0f]/95 backdrop-blur-sm transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
      )}
    >
      {/* Hidden run tracker */}
      {runId && publicToken && (
        <RunTracker
          runId={runId}
          accessToken={publicToken}
          onComplete={handleRunComplete}
        />
      )}

      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-linear-to-br from-violet-500/20 to-purple-500/10">
            <Bot className="h-3.5 w-3.5 text-violet-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              AI Workspace
            </span>
            <span className="text-[10px] leading-tight text-muted-foreground">
              Collaborate with Ghost AI
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Close AI sidebar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Status strip — only during active runs */}
      {isGenerating && (
        <div className="shrink-0 border-b border-[#62C073]/20 bg-[#0F2E18]/60 px-4 py-2">
          <div className="flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin text-[#62C073]" />
            <span className="text-[11px] text-[#62C073]">
              {aiStatus?.message ?? "Ghost AI is designing…"}
            </span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="architect" className="flex flex-1 flex-col">
        <div className="shrink-0 border-b border-border px-4 pt-3 pb-2">
          <TabsList className="w-full bg-muted/50 p-0.5">
            <TabsTrigger
              value="architect"
              className="flex-1 text-xs data-active:bg-primary data-active:text-primary-foreground"
            >
              AI Architect
            </TabsTrigger>
            <TabsTrigger
              value="specs"
              className="flex-1 text-xs data-active:bg-primary data-active:text-primary-foreground"
            >
              Specs
            </TabsTrigger>
          </TabsList>
        </div>

        {/* AI Architect Tab */}
        <TabsContent value="architect" className="mt-0 flex flex-1 flex-col">
          {/* Chat Area */}
          <ScrollArea className="flex-1">
            <div className="flex flex-col gap-3 p-4">
              {/* Empty state / starter chips shown when no messages */}
              {validMessages.length === 0 && (
                <div className="flex flex-col items-center gap-4 py-8">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-violet-500/20 to-purple-500/10">
                    <Bot className="h-6 w-6 text-violet-400" />
                  </div>
                  <p className="text-center text-xs text-muted-foreground">
                    Describe your system and I will design the architecture
                    on the canvas for you.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {STARTER_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        onClick={() => handleChipClick(chip)}
                        className="rounded-full bg-muted px-3 py-1.5 text-xs text-primary transition-colors hover:bg-muted/80 disabled:opacity-40"
                        disabled={isGenerating}
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              {validMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex max-w-[90%] flex-col gap-1",
                    msg.data.role === "user" ? "self-end" : "self-start"
                  )}
                >
                  <div className="flex items-center gap-1.5 px-1">
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {msg.data.sender}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60">
                      {new Date(msg.data.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div
                    className={cn(
                      "rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap",
                      msg.data.role === "user"
                        ? "bg-[#62C073] text-[#080809]"
                        : "border border-[#2a2a30] bg-[#18181c] text-[#f0f0f4]"
                    )}
                  >
                    {msg.data.content}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="shrink-0 border-t border-border p-3">
            <div className="flex items-end gap-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onInput={handleInput}
                placeholder={
                  isGenerating
                    ? "Ghost AI is designing…"
                    : "Ask Ghost AI to design something…"
                }
                disabled={isGenerating}
                className="min-h-[72px] resize-none bg-muted/30 text-xs disabled:opacity-50"
                rows={1}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || isGenerating}
                className="h-8 w-8 shrink-0 rounded-lg bg-[#62C073] text-[#080809] hover:bg-[#62C073]/90 disabled:opacity-40"
              >
                {isGenerating ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
            <p className="mt-1.5 text-[10px] text-muted-foreground">
              Enter to send, Shift+Enter for new line
            </p>
          </div>
        </TabsContent>

        {/* Specs Tab */}
        <TabsContent value="specs" className="mt-0 flex flex-1 flex-col">
          <ScrollArea className="flex-1">
            <div className="flex flex-col gap-3 p-4">
              {/* Generate button */}
              <Button
                className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleGenerateSpec}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                Generate Spec
              </Button>

              {/* Spec list */}
              {specsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : specs.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-8 text-center">
                  <FileText className="h-8 w-8 text-muted-foreground/40" />
                  <p className="text-xs text-muted-foreground">
                    No specs yet. Generate one from the canvas.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {specs.map((spec) => {
                    const date = new Date(spec.createdAt)
                    const formattedDate = date.toLocaleDateString([], {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                    const formattedTime = date.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                    return (
                      <div
                        key={spec.id}
                        className="group flex items-start gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-muted/30"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground">
                            {`Spec ${formattedDate}`}
                          </p>
                          <p className="mt-0.5 text-[10px] text-muted-foreground">
                            {formattedTime}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => handlePreview(spec.id)}
                            title="Preview"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => handleDownload(spec.id)}
                            title="Download"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent
          showCloseButton={false}
          className="flex max-h-[85vh] max-w-2xl flex-col overflow-hidden rounded-2xl border-border bg-card p-0 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
            <span className="font-mono text-xs text-muted-foreground">
              {previewSpecId ? `spec-${previewSpecId}.md` : "Spec Preview"}
            </span>
            <DialogClose
              render={
                <Button variant="ghost" size="icon-sm" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </Button>
              }
            />
          </div>

          {/* Content */}
          <ScrollArea className="h-[65vh] px-5 py-4">
            {previewLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : previewContent ? (
              <div className="prose prose-invert max-w-none text-sm leading-7">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="mb-4 mt-6 text-lg font-semibold text-foreground first:mt-0">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="mb-3 mt-5 border-b border-border pb-2 text-base font-semibold text-foreground">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="mb-2 mt-4 text-sm font-semibold text-foreground">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="mb-4 text-muted-foreground">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="mb-4 ml-4 list-disc space-y-1.5 text-muted-foreground">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="mb-4 ml-4 list-decimal space-y-1.5 text-muted-foreground">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => (
                      <li className="pl-1 leading-6">{children}</li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-foreground">{children}</strong>
                    ),
                    code: ({ children }) => (
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-foreground">
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <pre className="mb-4 overflow-x-auto rounded-lg bg-[#0d0d0f] p-4 text-xs">
                        {children}
                      </pre>
                    ),
                    hr: () => <hr className="my-6 border-border" />,
                  }}
                >
                  {previewContent}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="py-12 text-center text-xs text-muted-foreground">
                No content to preview.
              </p>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="flex items-center justify-end border-t border-border px-5 py-3">
            <Button
              size="sm"
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => previewSpecId && handleDownload(previewSpecId)}
              disabled={!previewSpecId}
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </aside>
  )
}
