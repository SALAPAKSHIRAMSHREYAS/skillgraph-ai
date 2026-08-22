"use client"

import React from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, Printer, FileText, CheckCircle2, AlertTriangle, ShieldCheck } from "lucide-react"
import type { Profile } from "@/lib/mock-profiles"

interface ExportModalProps {
  profile: Profile
  onClose: () => void
}

export function ExportModal({ profile, onClose }: ExportModalProps) {
  if (!profile) return null

  const handlePrint = () => {
    window.print()
  }

  const score = profile.score ?? 85
  const isHighTrust = score >= 70
  const anomalies = profile.anomalies || []

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 p-4 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border/80 bg-card p-6 sm:p-8 shadow-2xl print:border-none print:shadow-none print:bg-white print:text-black"
        >
          {/* Action Header */}
          <div className="flex items-center justify-between border-b border-border/50 pb-4 print:hidden">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
                <FileText className="size-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold tracking-tight text-foreground">
                  Candidate Executive Brief
                </h3>
                <p className="text-[11px] text-muted-foreground">Printable technical evaluation snapshot</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-indigo-600 transition-colors"
              >
                <Printer className="size-3.5" />
                Print / Save PDF
              </button>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Printable Document Body */}
          <div className="mt-6 space-y-6">
            {/* Brief Header */}
            <div className="flex items-start justify-between border-b border-border/40 pb-5">
              <div>
                <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-indigo-400">
                  SkillGraph Zero-Trust Audit
                </span>
                <h2 className="mt-1 font-mono text-2xl font-bold text-foreground print:text-black">
                  {profile.handle}
                </h2>
                <p className="text-xs text-muted-foreground print:text-neutral-600">
                  Audit Ref: sg-{profile.handle.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4)}-4d2f · Location: {profile.location}
                </p>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1">
                  <ShieldCheck className="size-4 text-emerald-400 print:text-emerald-700" />
                  <span className="font-mono text-xs font-bold text-emerald-400 print:text-emerald-700">
                    {score}% Authenticity
                  </span>
                </div>
                <p className="mt-1 font-mono text-[10px] text-muted-foreground print:text-neutral-500">
                  Grade: {profile.grade || "A"} (Zero-Trust Verified)
                </p>
              </div>
            </div>

            {/* Core Metrics */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border/50 bg-secondary/20 p-3 print:bg-neutral-100 print:border-neutral-300">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground print:text-neutral-600">
                  Clone Detection AUC
                </span>
                <p className="mt-1 font-mono text-sm font-bold text-foreground print:text-black">
                  {profile.cloneAuc ?? "0.04"} (Low Risk)
                </p>
              </div>
              <div className="rounded-xl border border-border/50 bg-secondary/20 p-3 print:bg-neutral-100 print:border-neutral-300">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground print:text-neutral-600">
                  Claim Gap Variance
                </span>
                <p className="mt-1 font-mono text-sm font-bold text-foreground print:text-black">
                  +{profile.claimGap ?? 8}% Match
                </p>
              </div>
              <div className="rounded-xl border border-border/50 bg-secondary/20 p-3 print:bg-neutral-100 print:border-neutral-300">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground print:text-neutral-600">
                  Audited Footprint
                </span>
                <p className="mt-1 font-mono text-sm font-bold text-foreground print:text-black">
                  {profile.totalCommits ?? 120} Commits
                </p>
              </div>
            </div>

            {/* Evidence & Findings */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground print:text-neutral-700">
                Key Verification Insights
              </h4>
              <div className="mt-2.5 space-y-2 font-mono text-xs">
                {anomalies.length > 0 ? (
                  anomalies.map((a: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 rounded-lg border border-border/40 bg-secondary/10 p-2.5 print:bg-neutral-50 print:border-neutral-200"
                    >
                      <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-400 print:text-amber-700" />
                      <div>
                        <span className="font-semibold text-foreground print:text-black">{a.title}</span>
                        <p className="text-[11px] text-muted-foreground print:text-neutral-600">{a.description || a.desc}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-emerald-400 print:text-emerald-800">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>No structural anomalies found. Code exhibits genuine iterative authorship.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}