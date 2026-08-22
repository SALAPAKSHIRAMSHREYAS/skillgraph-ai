"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, ArrowRightLeft, ShieldCheck, AlertTriangle, GitCommit, Network, BarChart3, Check } from "lucide-react"
import * as MockProfilesModule from "@/lib/mock-profiles"
import type { Profile } from "@/lib/mock-profiles"

// Safely access profiles array regardless of how it is exported (PROFILES, MOCK_PROFILES, default)
const rawProfiles: any = 
  (MockProfilesModule as any).PROFILES ?? 
  (MockProfilesModule as any).MOCK_PROFILES ?? 
  (MockProfilesModule as any).default ?? 
  []

const availableProfiles: Profile[] = Array.isArray(rawProfiles)
  ? rawProfiles
  : typeof rawProfiles === "object"
  ? Object.values(rawProfiles)
  : []

interface CompareModalProps {
  currentProfile: Profile
  onClose: () => void
}

export function CompareModal({ currentProfile, onClose }: CompareModalProps) {
  // Find a baseline candidate to compare against (defaults to another profile or fallback mock)
  const candidateOptions = availableProfiles.length > 0 
    ? availableProfiles 
    : [
        {
          handle: "tutorial-cloner",
          name: "Tutorial Cloner",
          score: 38,
          cloneAuc: 0.89,
          claimGap: -42,
          totalCommits: 14,
          location: "Remote",
          grade: "C-",
        } as unknown as Profile
      ]

  const defaultBenchmark =
    candidateOptions.find((p) => p.handle !== currentProfile.handle) ?? candidateOptions[0]

  const [benchmarkProfile, setBenchmarkProfile] = useState<Profile>(defaultBenchmark)

  const p1Score = currentProfile.score ?? 85
  const p2Score = benchmarkProfile?.score ?? 40

  const p1Auc = (currentProfile as any).cloneAuc ?? (currentProfile as any).metrics?.cloneDetectionAuc ?? "0.04"
  const p2Auc = (benchmarkProfile as any)?.cloneAuc ?? (benchmarkProfile as any)?.metrics?.cloneDetectionAuc ?? "0.89"

  const p1Gap = (currentProfile as any).claimGap ?? (currentProfile as any).metrics?.claimGapVariance ?? "+4%"
  const p2Gap = (benchmarkProfile as any)?.claimGap ?? (benchmarkProfile as any)?.metrics?.claimGapVariance ?? "-42%"

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/50 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                <ArrowRightLeft className="size-4" />
              </div>
              <div>
                <h3 className="text-base font-semibold tracking-tight text-foreground">
                  Candidate Comparison Matrix
                </h3>
                <p className="text-xs text-muted-foreground">
                  Side-by-side authenticity, entropy, and claim calibration
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

          {/* Select Benchmark Target */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Compare against:</span>
            {candidateOptions.map((p) => (
              <button
                key={p.handle}
                type="button"
                onClick={() => setBenchmarkProfile(p)}
                className={`rounded-lg px-2.5 py-1 font-mono text-xs transition-all ${
                  benchmarkProfile?.handle === p.handle
                    ? "border border-indigo-500/50 bg-indigo-500/20 font-semibold text-indigo-300 shadow-sm"
                    : "border border-border/50 bg-secondary/30 text-muted-foreground hover:bg-secondary/60"
                }`}
              >
                @{p.handle}
              </button>
            ))}
          </div>

          {/* Side-by-Side Grid */}
          <div className="mt-5 grid grid-cols-2 gap-4">
            {/* Candidate 1 (Current) */}
            <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">
                    Active Target
                  </span>
                  <h4 className="font-mono text-lg font-bold text-foreground">@{currentProfile.handle}</h4>
                </div>
                <span className="font-mono text-xl font-extrabold text-emerald-400">{p1Score}%</span>
              </div>

              <div className="mt-4 space-y-2.5 font-mono text-xs">
                <div className="flex items-center justify-between rounded-lg bg-secondary/40 p-2">
                  <span className="text-muted-foreground">Clone Detection AUC:</span>
                  <span className="font-bold text-foreground">{p1Auc}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-secondary/40 p-2">
                  <span className="text-muted-foreground">Claim Gap Variance:</span>
                  <span className="font-bold text-emerald-400">{p1Gap}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-secondary/40 p-2">
                  <span className="text-muted-foreground">Verification Trust:</span>
                  <span className="font-bold text-indigo-300">{p1Score >= 70 ? "Zero-Trust Verified" : "Flagged"}</span>
                </div>
              </div>
            </div>

            {/* Candidate 2 (Benchmark) */}
            <div className="rounded-xl border border-border/60 bg-secondary/20 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Benchmark Baseline
                  </span>
                  <h4 className="font-mono text-lg font-bold text-foreground">@{benchmarkProfile?.handle}</h4>
                </div>
                <span className={`font-mono text-xl font-extrabold ${p2Score >= 70 ? "text-emerald-400" : "text-destructive"}`}>
                  {p2Score}%
                </span>
              </div>

              <div className="mt-4 space-y-2.5 font-mono text-xs">
                <div className="flex items-center justify-between rounded-lg bg-secondary/40 p-2">
                  <span className="text-muted-foreground">Clone Detection AUC:</span>
                  <span className="font-bold text-foreground">{p2Auc}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-secondary/40 p-2">
                  <span className="text-muted-foreground">Claim Gap Variance:</span>
                  <span className={`font-bold ${String(p2Gap).startsWith("-") ? "text-destructive" : "text-emerald-400"}`}>
                    {p2Gap}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-secondary/40 p-2">
                  <span className="text-muted-foreground">Verification Trust:</span>
                  <span className="font-bold text-muted-foreground">{p2Score >= 70 ? "Zero-Trust Verified" : "High Risk / Cloned"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Delta Verdict Banner */}
          <div className="mt-5 flex items-center justify-between rounded-xl border border-border/50 bg-secondary/30 p-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-400" />
              <span className="text-xs text-foreground">
                <strong>Score Delta:</strong> {p1Score - p2Score > 0 ? `+${p1Score - p2Score}% higher` : `${p1Score - p2Score}% lower`} authenticity confidence
              </span>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary/80 transition-colors"
            >
              Close Diff
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}