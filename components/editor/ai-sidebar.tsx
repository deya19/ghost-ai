"use client"

import { useState, useRef, useCallback } from "react"
import { Bot, X, Send, FileText, Download, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

interface AiSidebarProps {
  isOpen: boolean
  onClose: () => void
}

const STARTER_CHIPS = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
]

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

const DEMO_MESSAGES: Message[] = [
  {
    id: "1",
    role: "user",
    content: "Design a microservices architecture for an e-commerce platform",
  },
  {
    id: "2",
    role: "assistant",
    content:
      "I'll design a scalable microservices architecture for your e-commerce platform. Here's what I'm thinking:\n\n• API Gateway (Kong/AWS API Gateway)\n• Auth Service (OAuth2/JWT)\n• Product Catalog Service\n• Order Service with Saga pattern\n• Payment Service (Stripe integration)\n• Inventory Service\n• Notification Service (email/SMS)\n• Event Bus (Kafka/RabbitMQ)\n\nLet me generate this on the canvas for you.",
  },
]

export function AiSidebar({ isOpen, onClose }: AiSidebarProps) {
  const [messages, setMessages] = useState<Message[]>(DEMO_MESSAGES)
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = useCallback(() => {
    const text = input.trim()
    if (!text) return
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: text },
    ])
    setInput("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }
  }, [input])

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
    setInput(text)
    if (textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`
    }
  }

  return (
    <aside
      className={cn(
        "absolute right-0 top-0 z-20 flex h-full w-80 flex-col border-l border-border bg-[#0f0f0f]/95 backdrop-blur-sm transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "translate-x-full pointer-events-none"
      )}
    >
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
              {messages.length === 0 && (
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
                        className="rounded-full bg-muted px-3 py-1.5 text-xs text-primary transition-colors hover:bg-muted/80"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Messages */}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex max-w-[90%] flex-col gap-1",
                    msg.role === "user" ? "self-end" : "self-start"
                  )}
                >
                  <div
                    className={cn(
                      "rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-wrap",
                      msg.role === "user"
                        ? "border-2 border-primary/50 bg-primary/10 text-foreground"
                        : "border border-border bg-card text-foreground"
                    )}
                  >
                    {msg.content}
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
                placeholder="Ask Ghost AI to design something..."
                className="min-h-[72px] resize-none bg-muted/30 text-xs"
                rows={1}
              />
              <Button
                size="icon"
                onClick={handleSend}
                disabled={!input.trim()}
                className="h-8 w-8 shrink-0 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
              >
                <Send className="h-3.5 w-3.5" />
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
            <div className="flex flex-col gap-4 p-4">
              {/* Generate button */}
              <Button className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                <Sparkles className="h-4 w-4" />
                Generate Spec
              </Button>

              {/* Demo spec card */}
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground">
                      E-Commerce Platform Spec
                    </h4>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      Microservices architecture with API Gateway, Auth
                      Service, Product Catalog, Order Service, Payment
                      Service, and Event Bus...
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled
                    className="h-7 gap-1.5 px-2 text-xs text-muted-foreground"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </aside>
  )
}
