"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { AlertTriangle, ChevronDown, Info, MessageSquareWarning, OctagonAlert } from "lucide-react"
import type { Profile, Severity } from "@/lib/mock-profiles"
import { cn } from "@/lib/utils"

const SEVERITY: Record<Severity, { color: string; icon: typeof Info; label: string }> = {
  critical: { color: "var(--destructive)", icon: OctagonAlert, label: "Critical" },
  warning: { color: "var(--warning)", icon: AlertTriangle, label: "Warning" },
  info: { color: "var(--success)", icon: Info, label: "Info" },
}

function AnomalyFeed({ profile }: { profile: Profile }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-tight">Anomaly Alerts</h3>
        <span className="rounded-md border border-border/70 bg-secondary/40 px-2 py-0.5 font-mono text-[11px] tracking-tight text-muted-foreground">
          {profile.anomalies.length} findings
        </span>
      </div>

      <ul className="mt-5 flex flex-col">
        {profile.anomalies.map((a, i) => {
          const meta = SEVERITY[a.severity]
          const Icon = meta.icon
          return (
            <motion.li
              key={a.id}
              initial={{ opacity: 0, x: -14 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.55, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="group relative flex gap-4 pb-6 last:pb-0"
            >
              {i !== profile.anomalies.length - 1 && (
                <span className="absolute left-[13px] top-7 h-[calc(100%-1.75rem)] w-px bg-border/60" aria-hidden="true" />
              )}
              <span
                className="relative mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg border transition-transform duration-300 group-hover:scale-110"
                style={{ borderColor: `${meta.color}55`, backgroundColor: `${meta.color}14` }}
              >
                <Icon className="size-3.5" style={{ color: meta.color }} />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[13px] font-medium tracking-tight text-foreground">{a.title}</p>
                  <span
                    className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]"
                    style={{ color: meta.color, backgroundColor: `${meta.color}17` }}
                  >
                    {meta.label}
                  </span>
                </div>
                <p className="mt-1.5 text-pretty text-[13px] leading-relaxed text-muted-foreground">{a.detail}</p>
                <p className="mt-2 font-mono text-[11px] tracking-tight text-muted-foreground/70">{a.meta}</p>
              </div>
            </motion.li>
          )
        })}
      </ul>
    </div>
  )
}

function ScreeningQuestions({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 backdrop-blur-xl">
      <div className="flex items-center gap-2">
        <MessageSquareWarning className="size-4 text-accent" />
        <h3 className="text-sm font-semibold tracking-tight">AI Screening Questions</h3>
      </div>
      <p className="mt-1.5 text-[11px] tracking-tight text-muted-foreground">
        Generated from the flagged evidence above — use verbatim in interview.
      </p>

      <div className="mt-4 divide-y divide-border/50 border-t border-border/50">
        {profile.questions.map((q, i) => {
          const isOpen = open === i
          return (
            <div key={q.q}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-start gap-3 py-4 text-left transition-colors duration-300 hover:text-foreground cursor-pointer"
              >
                <span className="mt-0.5 font-mono text-[11px] tabular text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "flex-1 text-pretty text-[13px] leading-relaxed tracking-tight transition-colors",
                    isOpen ? "text-foreground" : "text-foreground/75",
                  )}
                >
                  {q.q}
                </span>
                <ChevronDown
                  className={cn(
                    "mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-300",
                    isOpen && "rotate-180 text-primary",
                  )}
                />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="pb-5 pl-8 pr-6 text-pretty text-[13px] leading-relaxed text-muted-foreground">
                      {q.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function AnomalyPanel({ profile }: { profile: Profile }) {
  return (
    <div className="flex flex-col gap-4">
      <AnomalyFeed profile={profile} />
      <ScreeningQuestions profile={profile} />
    </div>
  )
}
