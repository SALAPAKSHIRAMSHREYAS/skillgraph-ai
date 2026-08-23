"use client"

import React, { forwardRef, useState } from "react"
import { motion } from "motion/react"
import { MapPin, Radar as RadarIcon, ArrowRightLeft, ShieldCheck, Check, FileDown, Activity } from "lucide-react"
import { Reveal, RevealItem } from "@/components/anim"
import { MetricGrid } from "@/components/dashboard/metric-grid"
import { SkillRadar } from "@/components/dashboard/skill-radar"
import { AnomalyPanel } from "@/components/dashboard/anomaly-panel"
import { RepoTable } from "@/components/dashboard/repo-table"
import { CompareModal } from "@/components/dashboard/compare-modal"
import { ExportModal } from "@/components/dashboard/export-modal"
import { EngineTraceModal } from "@/components/dashboard/engine-trace-modal"
import type { Profile } from "@/lib/mock-profiles"

export const ResultsDashboard = forwardRef<HTMLElement, { profile: Profile }>(function ResultsDashboard(
  { profile },
  ref,
) {
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false)
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false)
  const [isTraceOpen, setIsTraceOpen] = useState<boolean>(false)
  const [copiedBadge, setCopiedBadge] = useState<boolean>(false)

  const handleCopyBadge = () => {
    const badgeMarkdown = `[![SkillGraph Verified: ${profile.score}%](https://img.shields.io/badge/SkillGraph-Verified%20${profile.score}%25-brightgreen)](https://skillgraph.ai)`
    navigator.clipboard.writeText(badgeMarkdown)
    setCopiedBadge(true)
    setTimeout(() => setCopiedBadge(false), 2500)
  }

  return (
    <section id="analytics" ref={ref} className="relative scroll-mt-20 px-6 pb-24 pt-8">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        aria-hidden="true"
      />

      <motion.div
        key={profile.handle}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mx-auto w-full max-w-7xl"
      >
        <Reveal className="flex flex-col gap-4">
          <RevealItem className="flex flex-wrap items-end justify-between gap-4 pb-2">
            <div>
              <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                <RadarIcon className="size-3.5" />
                Results Dashboard
              </span>
              <h2 className="mt-3 font-mono text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
                {profile.handle}
              </h2>
            </div>
            
            <div className="flex flex-col items-start gap-3 sm:items-end">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsTraceOpen(true)}
                  className="flex items-center gap-2 rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-3.5 py-2 text-[12px] font-medium text-emerald-400 transition-all duration-300 hover:scale-105 hover:bg-emerald-500/20"
                >
                  <Activity className="size-4" />
                  <span>Engine Trace</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsExportOpen(true)}
                  className="flex items-center gap-2 rounded-lg border border-indigo-500/50 bg-indigo-500/10 px-3.5 py-2 text-[12px] font-medium text-indigo-400 transition-all duration-300 hover:scale-105 hover:bg-indigo-500/20"
                >
                  <FileDown className="size-4" />
                  <span>Export Brief</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyBadge}
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-[12px] font-medium text-gray-300 transition-all duration-300 hover:scale-105 hover:bg-white/10"
                >
                  {copiedBadge ? (
                    <Check className="size-4 text-emerald-400" />
                  ) : (
                    <ShieldCheck className="size-4" />
                  )}
                  <span>{copiedBadge ? "Badge Copied!" : "Embed Badge"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsCompareOpen(true)}
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-[12px] font-medium text-gray-300 transition-all duration-300 hover:scale-105 hover:bg-white/10"
                >
                  <ArrowRightLeft className="size-4" />
                  Compare Candidate ⇄
                </button>
              </div>

              <div className="flex items-center gap-4 text-[12px] tracking-tight text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3.5" />
                  {profile.location}
                </span>
                <span className="font-mono">
                  audit id · sg-{profile.handle.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4)}-4d2f
                </span>
              </div>
            </div>
          </RevealItem>

          <MetricGrid profile={profile} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <RevealItem>
              <SkillRadar profile={profile} />
            </RevealItem>
            <RevealItem>
              <AnomalyPanel profile={profile} />
            </RevealItem>
          </div>

          <RevealItem>
            <RepoTable profile={profile} />
          </RevealItem>
        </Reveal>
      </motion.div>

      {/* Candidate Comparison Modal */}
      {isCompareOpen && (
        <CompareModal
          currentProfile={profile}
          onClose={() => setIsCompareOpen(false)}
        />
      )}

      {/* Executive Brief Modal */}
      {isExportOpen && (
        <ExportModal
          profile={profile}
          onClose={() => setIsExportOpen(false)}
        />
      )}

      {/* Engine Trace Modal */}
      {isTraceOpen && (
        <EngineTraceModal
          profile={profile}
          onClose={() => setIsTraceOpen(false)}
        />
      )}
    </section>
  )
})