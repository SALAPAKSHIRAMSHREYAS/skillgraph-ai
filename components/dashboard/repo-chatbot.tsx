"use client"

import React, { useState, useRef, useEffect, FormEvent } from "react"
import { Bot, Send, Shield, User, Loader2, X } from "lucide-react"

type MessageRole = "user" | "ai"

interface ChatMessage {
  id: string
  role: MessageRole
  content: string
}

const INITIAL_GREETING =
  "Zero-Trust Engine ready. Ask me about the architectural complexity or repository anomalies."

export function RepoChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "greeting",
      role: "ai",
      content: INITIAL_GREETING,
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [messages, isLoading])

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus()
    }
  }, [isOpen])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      })

      if (!res.ok) {
        throw new Error(`Chat request failed (${res.status})`)
      }

      const data = await res.json()
      const aiContent =
        typeof data?.reply === "string"
          ? data.reply
          : typeof data?.message === "string"
            ? data.message
            : typeof data?.content === "string"
              ? data.content
              : "Unable to parse Zero-Trust response. Please try again."

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: "ai",
          content: aiContent,
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          role: "ai",
          content:
            "Zero-Trust Engine temporarily unavailable. Retry in a moment.",
        },
      ])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="absolute bottom-16 right-0 flex h-[500px] w-[400px] flex-col overflow-hidden rounded-xl border border-white/10 bg-gray-900 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <Shield className="size-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-tight text-white">
                  Zero-Trust AI Chatbot
                </h3>
                <p className="font-mono text-[10px] uppercase tracking-wider text-white/50">
                  Repo intelligence · offline-first audit
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 font-mono text-[10px] font-medium text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-400" aria-hidden />
                Online
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex size-7 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close chat"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Message history */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            role="log"
            aria-live="polite"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg ${
                    msg.role === "ai"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-indigo-500/10 text-indigo-400"
                  }`}
                >
                  {msg.role === "ai" ? (
                    <Bot className="size-3.5" />
                  ) : (
                    <User className="size-3.5" />
                  )}
                </div>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-[13px] leading-relaxed ${
                    msg.role === "ai"
                      ? "border border-white/10 bg-white/5 text-white/90"
                      : "bg-indigo-500/90 text-white"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5">
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Bot className="size-3.5" />
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[12px] text-white/50">
                  <Loader2 className="size-3.5 animate-spin text-emerald-400" />
                  Analyzing repository signals…
                </div>
              </div>
            )}
          </div>

          {/* Composer */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-white/10 bg-white/[0.03] p-3"
          >
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-2.5 py-1.5 focus-within:border-indigo-500/40 focus-within:ring-1 focus-within:ring-indigo-500/20">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about complexity, anomalies, authorship…"
                disabled={isLoading}
                className="min-w-0 flex-1 bg-transparent px-1.5 py-1.5 text-[13px] text-white outline-none placeholder:text-white/40 disabled:opacity-50"
                aria-label="Chat message"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-md transition-colors hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="size-3.5" />
                Send
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_0_28px_-4px_var(--primary)] ring-2 ring-primary/40 transition-all hover:scale-105 hover:shadow-[0_0_36px_-2px_var(--primary)]"
        aria-label={isOpen ? "Close AI chat" : "Open AI chat"}
        aria-expanded={isOpen}
      >
        <Bot className="size-6" />
      </button>
    </div>
  )
}
