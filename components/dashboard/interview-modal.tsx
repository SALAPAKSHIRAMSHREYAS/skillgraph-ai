// @ts-nocheck
"use client"

import React from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, HelpCircle, CheckCircle2, AlertTriangle, Code2, Sparkles } from "lucide-react"

interface InterviewModalProps {
  question: any
  onClose: () => void
}

export function InterviewModal({ question, onClose }: InterviewModalProps) {
  if (!question) return null

  const qText = typeof question === "string" ? question : question.text || question.q || "Explain architectural trade-offs."
  const context = question.context || "Flagged via AST structural analysis on async batching logic."
  const codeSnippet = question.snippet || `// Line 84 - Flagged Discrepancy\nasync function syncQueue(items: BatchPayload[]) {\n  // AST signature matches public boilerplate\n  return items.map(i => processItem(i)); // Trivial map masquerading as concurrent stream\n}`

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/50 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                <Sparkles className="size-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-tight text-foreground">
                  Recruiter Screening Probe
                </h3>
                <p className="text-[11px] text-muted-foreground">Automated technical interview validation guide</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Question Box */}
          <div className="mt-4 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
            <div className="flex items-start gap-2.5">
              <HelpCircle className="mt-0.5 size-4 shrink-0 text-indigo-400" />
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">Target Question</span>
                <p className="mt-1 text-xs font-medium text-foreground leading-relaxed">{qText}</p>
              </div>
            </div>
          </div>

          {/* Flagged Code Diff */}
          <div className="mt-4">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Code2 className="size-3 text-cyan-400" /> Evidentiary Code AST Context
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">{context}</span>
            </div>
            <div className="mt-2 rounded-xl border border-border/60 bg-secondary/30 p-3 font-mono text-[11px] text-slate-200 overflow-x-auto">
              <pre className="text-cyan-300">{codeSnippet}</pre>
            </div>
          </div>

          {/* Answer Grading Guide */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                <CheckCircle2 className="size-3.5" /> High-Signal Answer
              </span>
              <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                Candidate clearly articulates concurrency limitations, memory overhead of synchronous maps, and how they would refactor using worker threads.
              </p>
            </div>
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3">
              <span className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-400">
                <AlertTriangle className="size-3.5" /> Red-Flag Answer
              </span>
              <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                Candidate gives generic definitions of async/await or cannot explain the flow because the code was copied from an external boilerplate.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-5 flex justify-end border-t border-border/40 pt-4">
            <button
              onClick={onClose}
              className="rounded-xl bg-secondary px-4 py-2 text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors"
            >
              Close Guide
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}