"use client"

import React from "react"
import { ShieldCheck, GitCommit, GitFork, AlertTriangle } from "lucide-react"
import type { Profile } from "@/lib/mock-profiles"

export function MetricGrid({ profile }: { profile: Profile }) {
  const score = profile?.score ?? 85
  const metrics = profile?.metrics ?? {}
  const risk = (profile as any)?.risk ?? {}

  const riskLevel = risk.level || (score >= 80 ? "Low" : score >= 50 ? "Medium" : "High")
  const riskColor =
    riskLevel === "Low"
      ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
      : riskLevel === "Medium"
      ? "text-amber-400 border-amber-500/20 bg-amber-500/10"
      : "text-rose-400 border-rose-500/20 bg-rose-500/10"

  const cards = [
    {
      title: "Authenticity Score",
      value: `${score}%`,
      subtitle: `Grade: ${profile?.grade || (score >= 80 ? "A" : "B")}`,
      icon: ShieldCheck,
      color: score >= 80 ? "text-emerald-400" : score >= 50 ? "text-amber-400" : "text-rose-400",
    },
    {
      title: "Total Commits",
      value: (metrics.totalCommits ?? 120).toLocaleString(),
      subtitle: `${metrics.activeRepos ?? (profile as any)?.repositories?.length ?? 4} active repositories`,
      icon: GitCommit,
      color: "text-indigo-400",
    },
    {
      title: "Clone Detection AUC",
      value: typeof metrics.cloneDetectionAUC === "number" ? metrics.cloneDetectionAUC.toFixed(2) : "0.94",
      subtitle: "AST Structural Similarity",
      icon: GitFork,
      color: "text-cyan-400",
    },
    {
      title: "Risk Assessment",
      value: riskLevel,
      subtitle: `Entropy: ${((metrics.entropyScore ?? 0.88) * 100).toFixed(0)}%`,
      icon: AlertTriangle,
      color: riskColor.split(" ")[0],
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, idx) => {
        const Icon = card.icon
        return (
          <div
            key={idx}
            className="flex flex-col justify-between rounded-xl border border-border/60 bg-card/60 p-5 backdrop-blur-md transition-all hover:border-border"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {card.title}
              </span>
              <Icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold tracking-tight text-foreground">{card.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{card.subtitle}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}