"use client"

import React from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, Code2, Network, Cpu, ShieldCheck } from "lucide-react"

interface AstModalProps {
  repo: any
  onClose: () => void
}

export function AstModal({ repo, onClose }: AstModalProps) {
  if (!repo) return null

  const isFlagged = repo.status?.toLowerCase() === "flagged"
  const complexityScore = isFlagged ? "2.1 (Trivial)" : "8.7 (High Modularity)"
  const astDepth = isFlagged ? 3 : 14

  const mockNodes = isFlagged
    ? [
        { type: "Module", name: "app.py", detail: "Global Scope" },
        { type: "ImportFrom", name: "express", detail: "Boilerplate pattern" },
        { type: "FunctionDef", name: "main()", detail: "Flattened logic / No nested conditionals" },
        { type: "Return", name: "res.json()", detail: "Static response payload" },
      ]
    : [
        { type: "Module", name: `${repo.name}/core`, detail: "Multi-layered package" },
        { type: "ClassDef", name: "EngineController", detail: "Object-oriented abstraction" },
        { type: "AsyncFunctionDef", name: "process_stream()", detail: "Async execution tree (Depth 8)" },
        { type: "TryExcept", name: "ErrorHandler", detail: "Granular exception handling (Depth 12)" },
        { type: "Return", name: "YieldResult", detail: "Stream transformer AST node" },
      ]

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
              <Code2 className="size-5 text-indigo-400" />
              <div>
                <h3 className="text-base font-semibold tracking-tight text-foreground">
                  AST Syntax Tree & Complexity Inspector
                </h3>
                <p className="font-mono text-xs text-muted-foreground">{repo.name} · {repo.language}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-border/50 bg-secondary/30 p-3">
              <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                <Network className="size-3 text-cyan-400" /> Max Tree Depth
              </span>
              <p className="mt-1 font-mono text-sm font-bold text-foreground">{astDepth} Levels</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-secondary/30 p-3">
              <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                <Cpu className="size-3 text-indigo-400" /> Cyclomatic Depth
              </span>
              <p className="mt-1 font-mono text-sm font-bold text-foreground">{complexityScore}</p>
            </div>
            <div className="rounded-xl border border-border/50 bg-secondary/30 p-3">
              <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                <ShieldCheck className="size-3 text-emerald-400" /> Structural Originality
              </span>
              <p className="mt-1 font-mono text-sm font-bold text-emerald-400">{repo.originality ?? 85}%</p>
            </div>
          </div>

          {/* Syntax Node Hierarchy */}
          <div className="mt-5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Parsed Abstract Syntax Tree Nodes
            </h4>
            <div className="mt-2.5 space-y-2 rounded-xl border border-border/50 bg-secondary/20 p-3 font-mono text-xs">
              {mockNodes.map((node, i) => (
                <div key={i} className="flex items-center gap-3 py-1">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded bg-indigo-500/20 text-[10px] text-indigo-300">
                    {i + 1}
                  </span>
                  <span className="rounded bg-secondary/80 px-2 py-0.5 text-[11px] font-semibold text-cyan-300">
                    {node.type}
                  </span>
                  <span className="text-foreground">{node.name}</span>
                  <span className="ml-auto text-[11px] text-muted-foreground">{node.detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="rounded-xl bg-secondary px-4 py-2 text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors"
            >
              Close Inspector
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}