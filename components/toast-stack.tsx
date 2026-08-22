"use client"

import { AnimatePresence, motion } from "motion/react"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

export type Toast = { id: number; message: string; variant?: "success" | "error" }

export function ToastStack({ toasts }: { toasts: Toast[] }) {
  return (
    <div
      className="no-print pointer-events-none fixed bottom-6 right-6 z-[60] flex w-full max-w-xs flex-col gap-2"
      role="status"
      aria-live="polite"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const isError = t.variant === "error"
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "flex items-start gap-3 rounded-xl border px-4 py-3 shadow-[0_18px_50px_-20px_rgba(0,0,0,0.9)] backdrop-blur-xl",
                isError
                  ? "border-destructive/50 bg-destructive/10"
                  : "border-border/70 bg-popover/95",
              )}
            >
              {isError ? (
                <AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />
              ) : (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[color:var(--success)]" />
              )}
              <p
                className={cn(
                  "text-[13px] leading-relaxed tracking-tight",
                  isError ? "text-destructive" : "text-foreground/90",
                )}
              >
                {t.message}
              </p>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
