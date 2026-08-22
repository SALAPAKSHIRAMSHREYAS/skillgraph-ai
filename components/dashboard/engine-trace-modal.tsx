"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, Activity, Cpu, GitCommit, Network, CheckCircle2, ShieldCheck } from "lucide-react"
import type { Profile } from "@/lib/mock-profiles"

interface EngineTraceModalProps {
  profile: Profile
  onClose: () => void
}

const PIPELINE_STEPS = [
  {
    id: 1,
    title: "1. GitHub Raw Stream Ingestion",
    icon: Network,
    status: "Completed",
    latency: "142ms",
    desc: "Fetched commit trees, author signatures, and raw blobs across targeted repositories.",
    code: `GET /repos/{owner}/{repo}/commits -> 200 OK\nPayload: 1,482 commits analyzed | 47 PR boundaries`,
  },
  {
    id: 2,
    title: "2. AST Syntax & Cyclomatic Tokenization",
    icon: Cpu,
    status: "Completed",
    latency: "84ms",
    desc: "Decomposed source files into Python/TypeScript AST nodes; computed branching factors.",
    code: `ast.parse(blob)\nDepth: 14 levels | Cyclomatic Complexity: 8.7 (High Modularity)`,
  },
  {
    id: 3,
    title: "3. Commit Entropy & Autostamp Calibration",
    icon: GitCommit,
    status: "Completed",
    latency: "61ms",
    desc: "Analyzed commit intervals, diff burstiness, and temporal regularity.",
    code: `Shannon Entropy: 4.82 bits/byte | Organic author distribution verified`,
  },
  {
    id: 4,
    title: "4. Heuristic Scoring & Question Synthesis",
    icon: ShieldCheck,
    status: "Completed",
    latency: "118ms",
    desc: "Cross-referenced repository complexity against claimed skills to isolate high-signal probe points.",
    code: `Authenticity Score: 94% | Generated 3 AST-backed screening probes`,
  },
]

export function EngineTraceModal({ profile, onClose }: EngineTraceModalProps) {
  const [activeStep, setActiveStep] = useState<number>(0)

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 p-4 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/50 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                <Activity className="size-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-tight text-foreground">
                  SkillGraph Engine Execution Trace
                </h3>
                <p className="text-[11px] font-mono text-muted-foreground">
                  Trace ID: trc-{profile.handle.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4)}-live
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Stepper Tabs */}
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PIPELINE_STEPS.map((step, idx) => {
              const Icon = step.icon
              const isSelected = activeStep === idx
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(idx)}
                  className={`flex flex-col items-start rounded-xl border p-2.5 text-left transition-all ${
                    isSelected
                      ? "border-emerald-500/40 bg-emerald-500/10 text-foreground"
                      : "border-border/50 bg-secondary/20 text-muted-foreground hover:bg-secondary/40"
                  }`}
                >
                  <div className="flex w-full items-center justify-between">
                    <Icon className={`size-3.5 ${isSelected ? "text-emerald-400" : "text-muted-foreground"}`} />
                    <span className="font-mono text-[10px] text-emerald-400">{step.latency}</span>
                  </div>
                  <span className="mt-2 text-[11px] font-semibold leading-tight">{step.title}</span>
                </button>
              )
            })}
          </div>

          {/* Active Step Details */}
          <div className="mt-4 rounded-xl border border-border/60 bg-secondary/25 p-4">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <span className="text-xs font-semibold text-foreground">
                {PIPELINE_STEPS[activeStep].title}
              </span>
              <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-400">
                <CheckCircle2 className="size-3" /> {PIPELINE_STEPS[activeStep].status}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {PIPELINE_STEPS[activeStep].desc}
            </p>

            <div className="mt-3 rounded-lg border border-border/40 bg-black/40 p-3 font-mono text-[11px] text-cyan-300">
              <pre className="overflow-x-auto whitespace-pre-wrap">{PIPELINE_STEPS[activeStep].code}</pre>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-5 flex items-center justify-between border-t border-border/40 pt-4">
            <span className="font-mono text-[10px] text-muted-foreground">
              Total Ingestion Latency: 405ms · All heuristical filters passed
            </span>
            <button
              onClick={onClose}
              className="rounded-xl bg-secondary px-4 py-2 text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors"
            >
              Close Trace
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}