"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { AlertCircle, Sparkles } from "lucide-react"
import { InterviewModal } from "./interview-modal"
import type { Profile } from "@/lib/mock-profiles"

export function AnomalyPanel({ profile }: { profile: Profile }) {
  const [activeQuestion, setActiveQuestion] = useState<any | null>(null)

  const anomalies = profile?.anomalies || []
  const questions = (profile as any)?.questions || []

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Anomaly Alerts Section */}
      <div className="flex-1 rounded-2xl border border-border/60 bg-card p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 text-primary" />
            <h3 className="text-sm font-semibold tracking-tight">Anomaly Alerts</h3>
          </div>
          <span className="font-mono text-[11px] text-muted-foreground">
            {anomalies.length} {anomalies.length === 1 ? "finding" : "findings"}
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {anomalies.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No anomalies detected in commit entropy or AST syntax.
            </p>
          ) : (
            anomalies.map((a: any, idx: number) => (
              <motion.div
                key={a.id || idx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-xl border border-border/50 bg-secondary/20 p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground">{a.title}</span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      a.severity === "high" || a.severity === "critical"
                        ? "bg-destructive/15 text-destructive"
                        : "bg-warning/15 text-warning"
                    }`}
                  >
                    {a.severity || "warning"}
                  </span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  {a.description || a.desc}
                </p>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Interactive AI Screening Questions Section */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-indigo-400" />
            <h3 className="text-sm font-semibold tracking-tight">AI Screening Questions</h3>
          </div>
          <span className="rounded bg-indigo-500/10 px-2 py-0.5 font-mono text-[10px] text-indigo-400">
            Interactive Probe
          </span>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Generated from flagged evidence — click any question to simulate interview probe
        </p>

        <div className="mt-3 space-y-2.5">
          {questions.length > 0 ? (
            questions.map((q: any, idx: number) => {
              const qText = typeof q === "string" ? q : q.text || q.q
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveQuestion(q)}
                  className="group flex w-full items-start justify-between rounded-xl border border-border/50 bg-secondary/20 p-3 text-left transition-all hover:border-indigo-500/40 hover:bg-secondary/40"
                >
                  <div className="flex items-start gap-2.5">
                    <span className="font-mono text-[11px] text-muted-foreground group-hover:text-indigo-400">
                      0{idx + 1}
                    </span>
                    <p className="text-xs text-foreground group-hover:text-indigo-200 transition-colors">
                      {qText}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-[10px] text-indigo-400 opacity-80 group-hover:opacity-100">
                    Probe ↗
                  </span>
                </button>
              )
            })
          ) : (
            <button
              type="button"
              onClick={() =>
                setActiveQuestion({
                  text: "Explain your AST parser pipeline and how you handle cyclomatic complexity thresholds across Python and TypeScript.",
                  context: "AST Structural Heuristic Check",
                  snippet: `// FastAPI AST Ingestion Engine\n@app.post("/api/audit")\nasync def audit_stream(req: AuditRequest):\n    tree = ast.parse(fetch_raw_github_code(req.user))\n    return score_ast_complexity(tree)`,
                })
              }
              className="group flex w-full items-start justify-between rounded-xl border border-border/50 bg-secondary/20 p-3 text-left transition-all hover:border-indigo-500/40 hover:bg-secondary/40"
            >
              <div className="flex items-start gap-2.5">
                <span className="font-mono text-[11px] text-muted-foreground group-hover:text-indigo-400">01</span>
                <p className="text-xs text-foreground group-hover:text-indigo-200 transition-colors">
                  Explain the design rationale behind AST parsing and FastAPI backend synchronization.
                </p>
              </div>
              <span className="shrink-0 font-mono text-[10px] text-indigo-400 opacity-80 group-hover:opacity-100">
                Probe ↗
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Probe Modal */}
      {activeQuestion && (
        <InterviewModal question={activeQuestion} onClose={() => setActiveQuestion(null)} />
      )}
    </div>
  )
}