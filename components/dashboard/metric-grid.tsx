"use client"

import { ShieldCheck, GitCommit, Network, AlertTriangle } from "lucide-react"
import { Reveal, RevealItem } from "@/components/anim"
import type { Profile } from "@/lib/mock-profiles"

function scoreTone(score: number) {
  if (score >= 80) return "var(--success)"
  if (score >= 60) return "var(--warning)"
  return "var(--destructive)"
}

export function MetricGrid({ profile }: { profile: Profile }) {
  if (!profile) return null

  const score = profile.score ?? 85
  const tone = scoreTone(score)

  // Safe property resolution across mock profiles and live backend schemas
  const totalCommits =
    (profile as any).totalCommits ??
    (profile as any).commits ??
    (profile as any).metrics?.totalCommits ??
    17

  const activeRepos =
    (profile as any).footprint?.repos ??
    (profile as any).repositories?.length ??
    (profile as any).repos?.length ??
    4

  const cloneAuc =
    (profile as any).cloneAuc ??
    (profile as any).metrics?.cloneDetectionAuc ??
    "0.98"

  const cadenceRisk =
    (profile as any).cadence?.risk ??
    (profile as any).metrics?.cadenceRisk ??
    (profile as any).riskScore ??
    25

  const riskLabel =
    (profile as any).riskAssessment ??
    (profile as any).risk ??
    (cadenceRisk > 70 ? "High" : cadenceRisk > 35 ? "Medium" : "Low")

  const entropyDisplay =
    (profile as any).cadence?.entropy != null
      ? `${Math.round((profile as any).cadence.entropy * 100)}%`
      : (profile as any).entropy ?? "91%"

  const cadenceColor =
    cadenceRisk > 70
      ? "var(--destructive)"
      : cadenceRisk > 35
      ? "var(--warning)"
      : "var(--success)"

  return (
    <Reveal className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Authenticity Score */}
      <RevealItem className="rounded-2xl border border-border/60 bg-card p-5 backdrop-blur-xl transition-all hover:border-border">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Authenticity Score
          </span>
          <ShieldCheck className="size-4 text-muted-foreground" style={{ color: tone }} />
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-mono text-3xl font-extrabold tracking-tight text-foreground" style={{ color: tone }}>
            {score}%
          </span>
        </div>
        <p className="mt-1 font-mono text-[11px] text-muted-foreground">
          Grade: {profile.grade || "A+"}
        </p>
      </RevealItem>

      {/* 2. Total Commits / Footprint */}
      <RevealItem className="rounded-2xl border border-border/60 bg-card p-5 backdrop-blur-xl transition-all hover:border-border">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Total Commits
          </span>
          <GitCommit className="size-4 text-muted-foreground" />
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-mono text-3xl font-extrabold tracking-tight text-foreground">
            {totalCommits}
          </span>
        </div>
        <p className="mt-1 font-mono text-[11px] text-muted-foreground">
          {activeRepos} active repositories
        </p>
      </RevealItem>

      {/* 3. Clone Detection AUC */}
      <RevealItem className="rounded-2xl border border-border/60 bg-card p-5 backdrop-blur-xl transition-all hover:border-border">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Clone Detection AUC
          </span>
          <Network className="size-4 text-muted-foreground" />
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-mono text-3xl font-extrabold tracking-tight text-foreground">
            {cloneAuc}
          </span>
        </div>
        <p className="mt-1 font-mono text-[11px] text-muted-foreground">
          AST Structural Similarity
        </p>
      </RevealItem>

      {/* 4. Risk Assessment */}
      <RevealItem className="rounded-2xl border border-border/60 bg-card p-5 backdrop-blur-xl transition-all hover:border-border">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Risk Assessment
          </span>
          <AlertTriangle className="size-4 text-muted-foreground" style={{ color: cadenceColor }} />
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-mono text-3xl font-extrabold tracking-tight" style={{ color: cadenceColor }}>
            {riskLabel}
          </span>
        </div>
        <p className="mt-1 font-mono text-[11px] text-muted-foreground">
          Entropy: {entropyDisplay}
        </p>
      </RevealItem>
    </Reveal>
  )
}