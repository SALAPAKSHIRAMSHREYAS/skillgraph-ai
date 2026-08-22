"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { CheckCircle2, CircleDashed, GitFork, TriangleAlert, Eye } from "lucide-react"
import type { Profile, RepoStatus } from "@/lib/mock-profiles"
import { AstModal } from "./ast-modal"

const STATUS: Record<RepoStatus, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  verified: { label: "Verified", color: "var(--success)", icon: CheckCircle2 },
  review: { label: "Review", color: "var(--warning)", icon: CircleDashed },
  flagged: { label: "Flagged", color: "var(--destructive)", icon: TriangleAlert },
}

const LANG_DOT: Record<string, string> = {
  TypeScript: "var(--chart-1)",
  JavaScript: "var(--warning)",
  Go: "var(--chart-2)",
  Python: "var(--success)",
  Rust: "var(--destructive)",
  HCL: "var(--accent)",
  Shell: "var(--muted-foreground)",
  MDX: "var(--chart-2)",
}

function originalityColor(v: number) {
  if (v >= 70) return "var(--success)"
  if (v >= 40) return "var(--warning)"
  return "var(--destructive)"
}

export function RepoTable({ profile }: { profile: Profile }) {
  const [selectedRepo, setSelectedRepo] = useState<any | null>(null)

  const rawList = (profile as any)?.repositories ?? (profile as any)?.repos ?? []
  const repositories = Array.isArray(rawList) ? rawList : []
  const totalRepos = (profile as any)?.footprint?.repos ?? (profile as any)?.metrics?.activeRepos ?? repositories.length

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/50 px-6 py-5">
          <div className="flex items-center gap-2">
            <GitFork className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold tracking-tight">Scanned Repositories</h3>
          </div>
          <span className="font-mono text-[11px] tracking-tight text-muted-foreground">
            {repositories.length} of {totalRepos} shown · Click a row or inspect button for AST details
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-border/50">
                {["Repository", "Language", "Originality", "Commits", "Last push", "Status", "AST Tree"].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {repositories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-xs text-muted-foreground">
                    No repository data available.
                  </td>
                </tr>
              ) : (
                repositories.map((repo: any, i: number) => {
                  const statusKey: RepoStatus =
                    repo?.status?.toLowerCase() === "verified"
                      ? "verified"
                      : repo?.status?.toLowerCase() === "flagged"
                      ? "flagged"
                      : "review"
                  const status = STATUS[statusKey] ?? STATUS.verified
                  const StatusIcon = status.icon

                  const rawVal = repo?.originality ?? repo?.authenticity ?? repo?.score ?? 85
                  const parsedNum = typeof rawVal === "number" ? rawVal : parseFloat(String(rawVal).replace(/[^0-9.]/g, ""))
                  const originalityVal = isNaN(parsedNum) || parsedNum <= 0 ? 85 : parsedNum

                  const language = repo?.language ?? "Python"
                  const commits = repo?.commits ?? 12
                  const lastPush = repo?.lastPush ?? "Recent"

                  return (
                    <motion.tr
                      key={repo?.name ?? i}
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.5, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                      onClick={() => setSelectedRepo(repo)}
                      className="group cursor-pointer border-b border-border/40 transition-colors duration-200 last:border-0 hover:bg-secondary/35"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-[13px] font-medium tracking-tight text-foreground group-hover:text-indigo-400 transition-colors">
                          {repo?.name ?? `repo-${i + 1}`}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="flex items-center gap-2 text-[13px] text-muted-foreground">
                          <span
                            className="size-2 rounded-full"
                            style={{ backgroundColor: LANG_DOT[language] ?? "var(--muted-foreground)" }}
                          />
                          {language}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary/70">
                            <motion.div
                              className="h-full rounded-full"
                              style={{ backgroundColor: originalityColor(originalityVal) }}
                              initial={{ width: 0 }}
                              whileInView={{ width: `${originalityVal}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, delay: 0.2 + i * 0.07, ease: [0.16, 1, 0.3, 1] }}
                            />
                          </div>
                          <span
                            className="tabular font-mono text-[12px] font-medium"
                            style={{ color: originalityColor(originalityVal) }}
                          >
                            {originalityVal}%
                          </span>
                        </div>
                      </td>
                      <td className="tabular px-6 py-4 text-[13px] text-muted-foreground">{commits}</td>
                      <td className="px-6 py-4 text-[13px] text-muted-foreground">{lastPush}</td>
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium tracking-tight"
                          style={{
                            borderColor: `${status.color}4d`,
                            color: status.color,
                            backgroundColor: `${status.color}12`,
                          }}
                        >
                          <StatusIcon className="size-3" />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedRepo(repo)
                          }}
                          className="flex items-center gap-1 rounded-md border border-border/50 bg-secondary/40 px-2 py-1 text-[11px] text-muted-foreground group-hover:border-indigo-500/50 group-hover:text-indigo-300 transition-colors"
                        >
                          <Eye className="size-3" /> Inspect
                        </button>
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRepo && (
        <AstModal repo={selectedRepo} onClose={() => setSelectedRepo(null)} />
      )}
    </>
  )
}
