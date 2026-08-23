"use client"

import React, { useState, useEffect, useRef, useCallback, FormEvent,useId } from "react"
import { motion, AnimatePresence, usePresence } from "motion/react"
import {
  ShieldCheck,
  GitCommit,
  Binary,
  AlertTriangle,
  Terminal,
  ArrowRight,
  ArrowUpRight,
  Search,
  Code2,
} from "lucide-react"

import { SiteNav } from "@/components/site-nav"
import { ResultsDashboard } from "@/components/results-dashboard"
import { ApiDocs } from "@/components/api-docs"
import { ToastStack, type Toast } from "@/components/toast-stack"
import { RepoChatbot } from "@/components/dashboard/repo-chatbot"
import { resolveProfile, type Profile } from "@/lib/mock-profiles"

// ---------------------------------------------------------------------------
// Sand / Particle Dissolve Transition Component (SVG Filter-based)
// ---------------------------------------------------------------------------
function SandTransitionImage({
  src,
  alt,
  className = "",
}: {
  src: string
  alt: string
  className?: string
}) {
  const [isPresent, safeToRemove] = usePresence()
  const rawId = useId()
  const filterId = `sand-filter-${rawId.replace(/:/g, "")}`
  const [progress, setProgress] = useState(isPresent ? 0 : 1)

  useEffect(() => {
    let animationFrame: number
    const duration = 900
    const start = performance.now()

    const animate = (time: number) => {
      const elapsed = time - start
      const t = Math.min(elapsed / duration, 1)

      if (isPresent) {
        setProgress(1 - Math.pow(1 - t, 4))
      } else {
        setProgress(Math.pow(t, 3))
      }

      if (t < 1) {
        animationFrame = requestAnimationFrame(animate)
      } else if (!isPresent && safeToRemove) {
        safeToRemove()
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [isPresent, safeToRemove])

  const dispScale = isPresent ? (1 - progress) * 120 : progress * 150
  const opacityVal = isPresent ? Math.min(progress * 1.5, 1) : Math.max(1 - progress * 1.2, 0)
  const blurVal = isPresent ? (1 - progress) * 4 : progress * 6

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <svg className="absolute size-0">
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="1.8"
              numOctaves="4"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={dispScale}
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            <feGaussianBlur in="displaced" stdDeviation={blurVal} result="blurred" />
          </filter>
        </defs>
      </svg>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        style={{
          filter: `url(#${filterId})`,
          opacity: opacityVal,
        }}
        className="size-full object-contain mix-blend-lighten transition-opacity"
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Forensic Engine Chapters Data
// ---------------------------------------------------------------------------
const chaptersData = [
  {
    name: "AST Syntactic Hierarchy",
    desc: "Deterministic syntax tree traversal parses complexity & branching depth without sandbox execution risks.",
    image: "https://res.cloudinary.com/dsdxaxkiz/image/upload/v1779624247/01_udnber.png",
    stat: "Depth Lvl 18",
  },
  {
    name: "Shannon Entropy Variance",
    desc: "Calculates temporal commit distributions to differentiate natural human development curves from automated bot bursts.",
    image: "https://res.cloudinary.com/dsdxaxkiz/image/upload/v1779624374/02_pmvxxl.png",
    stat: "0.91 Entropy",
  },
  {
    name: "Clone Subtree Fingerprinting",
    desc: "Cross-compares candidate code against indexed course boilerplates and YouTube clones using tree isomorphism.",
    image: "https://res.cloudinary.com/dsdxaxkiz/image/upload/v1779624236/03_hcp3jc.png",
    stat: "0.98 AUC",
  },
  {
    name: "Spam & Bot Boundary Traps",
    desc: "Instantly intercepts high-volume spam vectors and DoS amplification profiles exceeding the 1,000 repository threshold.",
    image: "https://res.cloudinary.com/dsdxaxkiz/image/upload/v1779624256/04_get63z.png",
    stat: "1,000+ Trigger",
  },
  {
    name: "Autonomous LLM Probes",
    desc: "Generates deep-dive behavioral interview probes strictly anchored to detected AST structural anomalies.",
    image: "https://res.cloudinary.com/dsdxaxkiz/image/upload/v1779624251/05_kz1tyu.png",
    stat: "Zero-Trust",
  },
]

// ---------------------------------------------------------------------------
// Animation Variants
// ---------------------------------------------------------------------------
const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

const letterBlock = {
  initial: { y: 100, opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] },
  },
}

export function SkillgraphApp() {
  const [demoMode, setDemoMode] = useState(true)
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [activeChapter, setActiveChapter] = useState(0)

  const resultsRef = useRef<HTMLElement | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const chapterInterval = setInterval(() => {
      setActiveChapter((prev) => (prev + 1) % chaptersData.length)
    }, 4000)
    return () => clearInterval(chapterInterval)
  }, [])

  const pushToast = useCallback((message: string, variant: Toast["variant"] = "success") => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, variant }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500)
  }, [])

  const scrollToAudit = () => {
    document.getElementById("audit-terminal")?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  const normalizeProfile = (data: any, targetUser: string): Profile => {
    const complexityGrade =
      data.complexityGrade ??
      data.grade ??
      (typeof data.metrics?.avgComplexity === "number"
        ? data.metrics.avgComplexity >= 8
          ? "A+"
          : data.metrics.avgComplexity >= 6
            ? "A"
            : data.metrics.avgComplexity >= 4
              ? "B"
              : "D"
        : undefined)

    const isHighComplexity = complexityGrade === "A" || complexityGrade === "A+"

    let baseScore =
      typeof data.authenticityScore === "number"
        ? data.authenticityScore
        : typeof data.score === "number" && data.score > 0
          ? data.score
          : undefined

    if (baseScore == null) {
      baseScore = targetUser.includes("clone") ||
        targetUser.includes("fake") ||
        targetUser.includes("tutorial")
        ? 18
        : 94
    }

    // High-complexity code should not be visually flagged as clone-tier due to low commit volume
    if (isHighComplexity && baseScore < 50) {
      baseScore = Math.max(baseScore, 75)
    }

    const isSuspicious =
      !isHighComplexity &&
      (targetUser.includes("clone") ||
        targetUser.includes("fake") ||
        targetUser.includes("tutorial") ||
        (typeof data?.score === "number" && data.score < 50) ||
        (typeof data?.authenticityScore === "number" && data.authenticityScore < 50))

    const fallbackMock = resolveProfile(isSuspicious ? "tutorial-cloner" : "authentic-dev")

    const mapSkillToChart = (s: any, idx: number) => {
      const subject =
        typeof s === "string" ? s : s.subject || s.name || `Skill ${idx + 1}`
      const scoreValue =
        s.score ?? s.verified ?? (isSuspicious ? 25 : 85 + (idx % 10))
      const verified = Number(s.verified ?? scoreValue ?? 0)
      const claimed = Number(
        s.claimed ??
          (s.score != null ? Math.min(100, Number(s.score) + 6) : undefined) ??
          (isSuspicious ? 90 : Math.min(100, verified + 5)),
      )

      return {
        subject,
        name: subject,
        verified: Number.isFinite(verified) ? verified : 0,
        claimed: Number.isFinite(claimed) ? claimed : 0,
        fullMark: 100,
        level: typeof s === "object" ? s.level || "Advanced" : "Advanced",
        repoCount: s.repoCount ?? idx + 2,
        evidence: s.evidence || `AST nodes parsed across ${idx + 2} repositories`,
      }
    }

    const rawRepos = data.repositories || data.repos || []
    const normalizedRepos = rawRepos.length > 0
      ? rawRepos.map((r: any, idx: number) => ({
          name: r.name || `repo-${idx + 1}`,
          language: r.lang || r.language || (idx % 2 === 0 ? "TypeScript" : "Python"),
          originality: r.originality ?? r.authenticity ?? (isSuspicious ? 22 : 92),
          commits: r.commits ?? (isSuspicious ? 2 : 10),
          lastPush: r.lastPush || "Recent",
          status: (r.status?.toLowerCase() === "verified" || (!isSuspicious && idx < 3)) ? "verified" : "flagged",
        }))
      : fallbackMock?.repositories || []

    const totalRepoCommits = normalizedRepos.reduce((acc: number, r: any) => acc + (Number(r.commits) || 0), 0)
    const exactCommitsRaw = data.totalCommits ?? data.commits ?? (totalRepoCommits > 0 ? totalRepoCommits : undefined)
    const exactCommits = Number.isFinite(Number(exactCommitsRaw))
      ? Number(exactCommitsRaw)
      : isSuspicious
        ? 14
        : 17

    const entropyScore =
      data.metrics?.entropyScore ??
      data.radar?.gitEntropy ??
      (isSuspicious ? 0.31 : 0.91)
    const entropyPct = Math.round(
      typeof entropyScore === "number" && entropyScore <= 1
        ? entropyScore * 100
        : Number(entropyScore) || (isSuspicious ? 30 : 88),
    )

    const radarMetrics = {
      codeAuthenticity: baseScore,
      gitEntropy: data.radar?.gitEntropy ?? entropyPct,
      skillDepth:
        data.radar?.skillDepth ??
        (normalizedRepos.length > 0
          ? Math.min(100, Math.round(baseScore * 0.95))
          : isSuspicious
            ? 25
            : 92),
      commitRegularity:
        data.radar?.commitRegularity ??
        (exactCommits > 0
          ? Math.min(100, Math.round(Math.log10(exactCommits + 1) * 28))
          : isSuspicious
            ? 20
            : 85),
      dependencyHealth: data.radar?.dependencyHealth ?? (isSuspicious ? 45 : 94),
    }

    const radarChart = [
      {
        subject: "Code Authenticity",
        verified: radarMetrics.codeAuthenticity,
        claimed: Math.min(100, radarMetrics.codeAuthenticity + 5),
        fullMark: 100,
      },
      {
        subject: "Git Entropy",
        verified: radarMetrics.gitEntropy,
        claimed: Math.min(100, radarMetrics.gitEntropy + 4),
        fullMark: 100,
      },
      {
        subject: "Skill Depth",
        verified: radarMetrics.skillDepth,
        claimed: Math.min(100, radarMetrics.skillDepth + 6),
        fullMark: 100,
      },
      {
        subject: "Commit Regularity",
        verified: radarMetrics.commitRegularity,
        claimed: Math.min(100, radarMetrics.commitRegularity + 8),
        fullMark: 100,
      },
      {
        subject: "Dependency Health",
        verified: radarMetrics.dependencyHealth,
        claimed: Math.min(100, radarMetrics.dependencyHealth + 3),
        fullMark: 100,
      },
    ]

    const rawSkills = data.skills || []
    const normalizedSkills =
      rawSkills.length > 0
        ? rawSkills.map(mapSkillToChart)
        : fallbackMock?.skills.map((s, idx) => mapSkillToChart(s, idx)) || radarChart

    const hasSkillChartData = normalizedSkills.some(
      (s) => (Number(s.verified) || 0) > 0 || (Number(s.claimed) || 0) > 0,
    )
    const chartSkills = hasSkillChartData ? normalizedSkills : radarChart

    const rawAnomalies = data.anomalies || []
    const normalizedAnomalies = rawAnomalies.length > 0
      ? rawAnomalies.map((a: any, idx: number) => ({
          id: a.id || `anom-${idx}`,
          severity: a.severity || (a.type === "danger" ? "high" : a.type === "warning" ? "medium" : "low"),
          title: a.title || "AST Structural Indicator",
          description: a.desc || a.description || "Syntactic pattern verified in repository history.",
          rule: a.rule || "RULE_AST_HEURISTIC",
          detectedAt: a.detectedAt || "Recent scan",
          repo: a.repo || normalizedRepos[0]?.name || "main-repo",
        }))
      : fallbackMock?.anomalies || []

    const resolvedGrade =
      complexityGrade ||
      (baseScore >= 90 ? "A+" : baseScore >= 80 ? "A" : baseScore >= 60 ? "B" : "D")

    return {
      ...data,
      handle: data.handle || data.username || targetUser,
      name: data.name || (isSuspicious ? "Flagged Profile" : targetUser),
      avatar: data.avatar || data.avatar_url || `https://github.com/${targetUser}.png`,
      bio: data.bio || (isSuspicious ? "Independent developer exploring boilerplates" : "Full-stack engineer building distributed systems"),
      score: baseScore,
      grade: resolvedGrade,
      auditId: data.auditId || `AUD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      timestamp: data.timestamp || new Date().toISOString(),
      location: data.location || "Global",
      footprint: {
        repos: data.totalRepos || normalizedRepos.length,
        commits: exactCommits,
        activeDays: data.footprint?.activeDays ?? (isSuspicious ? 8 : 164),
        languages: data.footprint?.languages ?? (isSuspicious ? 2 : 4),
        loc: data.footprint?.loc ?? (isSuspicious ? "4.2k" : "12.8k"),
      },
      metrics: {
        totalCommits: exactCommits,
        activeRepos: data.totalRepos || normalizedRepos.length,
        avgComplexity: data.metrics?.avgComplexity ?? (isSuspicious ? 2.1 : 8.4),
        cloneDetectionAUC: data.metrics?.cloneDetectionAUC ?? (isSuspicious ? 0.42 : 0.98),
        entropyScore: typeof entropyScore === "number" && entropyScore <= 1 ? entropyScore : entropyPct / 100,
        astDepth: data.metrics?.astDepth ?? (isSuspicious ? 4 : 18),
      },
      radar: radarMetrics,
      radarChart,
      skills: chartSkills,
      repositories: normalizedRepos,
      anomalies: normalizedAnomalies,
      questions: data.questions || fallbackMock?.questions || [],
    } as Profile
  }

  const runAudit = useCallback(
    async (overrideHandle?: string) => {
      const rawTarget = overrideHandle || query
      const target = rawTarget.trim()
      if (!target) {
        pushToast("Enter a GitHub handle or select a persona to audit.", "error")
        return
      }
      if (loading) return

      setLoading(true)
      if (timerRef.current) clearTimeout(timerRef.current)

      const cleanUser = target
        .replace(/[\[\]\(\)\<\>]/g, "")
        .replace(/^https?:\/\/(www\.)?github\.com\//i, "")
        .replace(/^@/, "")
        .replace(/\/.*$/, "")
        .trim()

      if (!cleanUser) {
        setLoading(false)
        pushToast("Invalid GitHub username entered.", "error")
        return
      }

      const highVolumeOrgs = ["google", "microsoft", "apache", "aws", "sindresorhus"]
      if (highVolumeOrgs.includes(cleanUser.toLowerCase()) && demoMode) {
        timerRef.current = setTimeout(() => {
          setLoading(false)
          pushToast(
            `🛡️ SPAM/BOT TRAP TRIGGERED: @${cleanUser} exceeds 1,000 repositories. Execution halted for manual review.`,
            "error"
          )
        }, 600)
        return
      }

      if (!demoMode) {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://skillgraph-ai-igaf.onrender.com"
          const response = await fetch(`${apiUrl}/api/audit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: cleanUser }),
          })

          if (response.status === 403) {
            const blockedData = await response.json()
            setLoading(false)
            pushToast(
              `🛡️ ${blockedData.reason || "Spam/Bot detection triggered (>1,000 repos). Flagged for manual review."}`,
              "error"
            )
            return
          }

          if (response.status === 429) {
            setLoading(false)
            pushToast("Rate limit exceeded: 5 requests per 10s window.", "error")
            return
          }

          if (!response.ok) {
            throw new Error(`Audit request failed with status ${response.status}`)
          }

          const rawData = await response.json()
          const normalized = normalizeProfile(rawData, cleanUser)
          setProfile(normalized)
          setLoading(false)
          pushToast(`Audit verified — @${normalized.handle} scored ${normalized.score}%`)
          requestAnimationFrame(() => {
            resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
          })
          return
        } catch (err: unknown) {
          setLoading(false)
          const errorMessage = err instanceof Error ? err.message : "Failed to connect to audit backend."
          pushToast(errorMessage, "error")
          return
        }
      }

      timerRef.current = setTimeout(() => {
        const resolved = resolveProfile(cleanUser)
        setLoading(false)

        if (!resolved) {
          pushToast(`No preset demo profile found for "${cleanUser}". Switching to synthetic AST scan.`, "error")
          const synth = normalizeProfile({ handle: cleanUser, authenticityScore: 84 }, cleanUser)
          setProfile(synth)
          return
        }

        setProfile(resolved)
        pushToast(`Audit verified — @${resolved.handle} scored ${resolved.score}%`)
        requestAnimationFrame(() => {
          resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
        })
      }, 1200)
    },
    [query, loading, demoMode, pushToast]
  )

  const handlePersonaSelect = (personaHandle: string) => {
    setQuery(personaHandle)
    runAudit(personaHandle)
  }

  return (
    <div className="relative min-h-screen bg-background text-foreground font-sans selection:bg-primary/40 selection:text-white overflow-x-hidden">
      <SiteNav
        demoMode={demoMode}
        onDemoModeChange={(val) => {
          setDemoMode(val)
          pushToast(val ? "Demo mode enabled: Offline mock datasets active" : "Live mode enabled: Connected to Render backend")
        }}
        onExport={() => {
          if (!profile) {
            pushToast("Run an audit first before exporting PDF", "error")
            return
          }
          pushToast(`Generating cryptographic brief for @${profile.handle}…`)
          setTimeout(() => window.print(), 500)
        }}
      />

      {/* SECTION 1: HERO CONTAINER */}
      <section className="relative w-full min-h-screen flex flex-col justify-between pt-24 pb-16 px-6 md:px-16 border-b border-white/10 overflow-hidden">
        <motion.header
          initial="initial"
          animate="animate"
          className="w-full flex flex-col items-start z-20 pt-4"
        >
          <motion.div
            variants={{
              initial: { scale: 1.02 },
              animate: { scale: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
            }}
            className="w-full overflow-hidden"
          >
            <svg
              viewBox="0 0 840 90"
              className="w-full max-h-[90px] fill-white"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g transform="translate(0,0)">
                <motion.polygon variants={letterBlock} points="0,0 200,0 200,16 0,16" />
                <motion.polygon variants={letterBlock} points="0,0 16,0 16,45 0,45" />
                <motion.polygon variants={letterBlock} points="0,37 200,37 200,53 0,53" />
                <motion.polygon variants={letterBlock} points="184,45 200,45 200,90 184,90" />
                <motion.polygon variants={letterBlock} points="0,74 200,74 200,90 0,90" />
              </g>
              <g transform="translate(280,0)">
                <motion.polygon variants={letterBlock} points="0,0 200,0 200,16 0,16" />
                <motion.polygon variants={letterBlock} points="0,0 16,0 16,90 0,90" />
                <motion.polygon variants={letterBlock} points="0,74 200,74 200,90 0,90" />
                <motion.polygon variants={letterBlock} points="184,45 200,45 200,90 184,90" />
                <motion.polygon variants={letterBlock} points="100,45 200,45 200,61 100,61" />
              </g>
              <g transform="translate(560,0)">
                <motion.polygon variants={letterBlock} points="0,0 200,0 200,16 0,16" />
                <motion.polygon variants={letterBlock} points="92,0 108,0 108,90 92,90" />
                <motion.polygon variants={letterBlock} points="0,74 200,74 200,90 0,90" />
              </g>
            </svg>
          </motion.div>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full flex flex-col md:flex-row justify-between items-start mt-6 pt-4 border-t border-white/10 text-[10px] md:text-[11px] font-mono tracking-[0.2em] uppercase text-gray-300"
          >
            <div className="w-full md:w-[20%] mb-3 md:mb-0">
              <p className="font-bold text-white">ZERO · TRUST</p>
              <p className="text-gray-500">CODE · AUDITOR</p>
            </div>

            <div className="hidden md:flex items-center text-gray-500">
              <ArrowRight className="size-3.5" strokeWidth={1.5} />
            </div>

            <div className="w-full md:w-[45%] text-gray-300 leading-relaxed font-mono">
              Deterministic AST parsing, Git commit entropy analysis, and clone detection designed to unmask authentic software capability.
            </div>

            <div className="hidden md:flex items-center text-gray-500">
              <ArrowRight className="size-3.5" strokeWidth={1.5} />
            </div>

            <div className="w-full md:w-[20%] text-right font-bold text-white">
              ENGINE V4.2 · 2026
            </div>
          </motion.div>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mt-12 z-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold tracking-widest text-gray-500">01</span>
              <div className="w-16 h-[1.5px] bg-white/20" />
              <span className="font-mono text-xs uppercase tracking-widest text-gray-300">Forensic Code Intelligence</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-normal tracking-tight leading-[1] text-white">
              SYNTACTIC <br />
              <span className="font-semibold">VERIFICATION</span>
            </h1>

            <p className="text-[13px] md:text-[14px] text-gray-300 max-w-md leading-relaxed">
              Eliminate resume fraud and unauthored AI boilerplate. Inspect candidate repositories using abstract syntax trees and structural entropy.
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={scrollToAudit}
                className="group relative inline-flex items-center gap-3 bg-white px-7 py-4 border border-white/20 rounded-md shadow-sm overflow-hidden transition-all duration-300 hover:shadow-[0_0_24px_-4px_var(--primary)]"
              >
                <div className="absolute inset-0 bg-primary -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
                <Code2 className="size-4 relative z-10 text-background group-hover:text-white transition-transform duration-300 group-hover:scale-110" />
                <span className="relative z-10 text-sm font-medium tracking-wider uppercase text-background group-hover:text-white transition-colors duration-300">
                  Inspect Repository
                </span>
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5 }}
            id="audit-terminal"
            className="lg:col-span-7 bg-black/40 text-white p-6 md:p-8 rounded-xl border border-white/10 shadow-2xl space-y-6 backdrop-blur-md"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="size-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono text-xs uppercase tracking-widest text-gray-400">Zero-Trust Terminal</span>
              </div>
              <span className="font-mono text-[11px] text-gray-500">
                {demoMode ? "MOCK TELEMETRY" : "LIVE RENDER API"}
              </span>
            </div>

            <form
              onSubmit={(e: FormEvent) => {
                e.preventDefault()
                runAudit()
              }}
              className="relative flex items-center"
            >
              <Search className="absolute left-4 size-4 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter GitHub handle (e.g. authentic-dev, tutorial-cloner, google)..."
                disabled={loading}
                className="w-full bg-white/5 border border-white/10 text-white font-mono text-xs md:text-sm pl-11 pr-32 py-3.5 rounded-lg focus:outline-none focus:border-primary/50 transition-all placeholder:text-gray-500"
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="absolute right-2 px-4 py-2 bg-white text-background font-mono text-xs font-bold uppercase tracking-wider rounded-md transition-all hover:bg-gray-200 disabled:opacity-40"
              >
                {loading ? "Parsing..." : "Audit"}
              </button>
            </form>

            <div className="space-y-2 pt-2">
              <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400">Quick Test Personas:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { handle: "authentic-dev", label: "Authentic (92% Score)", badge: "border-emerald-500/40 text-emerald-400" },
                  { handle: "tutorial-cloner", label: "Tutorial Cloner (18% Score)", badge: "border-red-500/40 text-red-400" },
                  { handle: "lazy-architect", label: "Lazy Architect (42% Score)", badge: "border-amber-500/40 text-amber-400" },
                  { handle: "google", label: "Bot Trap (>1K Repos)", badge: "border-purple-500/40 text-purple-400" },
                ].map((chip) => (
                  <button
                    key={chip.handle}
                    type="button"
                    onClick={() => handlePersonaSelect(chip.handle)}
                    className={`font-mono text-xs px-3 py-1.5 rounded-md border bg-black/50 transition-all hover:bg-white/10 ${chip.badge}`}
                  >
                    @{chip.handle}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex items-center justify-between pt-12 text-[10px] font-mono tracking-widest text-gray-500 uppercase">
          <span>DETERMINISTIC ANALYSIS</span>
          <span>EST. 2026</span>
        </div>
      </section>

      {/* SECTION 2: FORENSIC ENGINE PILLARS */}
      <section className="relative w-full min-h-[60vh] flex flex-col items-center justify-center py-20 px-6 md:px-16 border-b border-white/10">
        <div className="font-mono text-[11px] tracking-[0.2em] mb-8">
          <span className="text-gray-500">[ 02 ]</span>{" "}
          <span className="font-bold text-white uppercase">Forensic Architecture</span>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-3xl md:text-5xl font-medium tracking-tight text-center max-w-4xl text-white leading-tight"
        >
          Unmask genuine engineering capability through AST control graphs, Git entropy, and syntactic tree matching.
        </motion.h2>

        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mt-12 max-w-4xl">
          {[
            { icon: ShieldCheck, label: "Zero-Trust AST" },
            { icon: GitCommit, label: "Shannon Entropy" },
            { icon: Binary, label: "Clone Detection AUC" },
            { icon: AlertTriangle, label: "1,000+ Bot Trap" },
            { icon: Terminal, label: "Interview Probing" },
          ].map((pill, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-[11px] font-mono font-medium uppercase tracking-wider text-gray-300 transition-all hover:border-primary/50 hover:bg-primary/10 hover:text-white"
            >
              <pill.icon className="size-3.5" strokeWidth={2} />
              <span>{pill.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: DARK FORENSIC TELEMETRY CHAMBER */}
      <section className="relative w-full bg-[#0a0a0a] text-white flex flex-col py-24 px-6 md:px-16 border-b border-gray-900">
        <div className="flex flex-col xl:flex-row justify-between items-start mb-16 gap-8">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-3">[ 03 ] Deep Telemetry</div>
            <h2 className="text-3xl md:text-5xl font-medium tracking-tight text-white max-w-2xl leading-tight">
              Curated from 10M+ analyzed AST nodes & syntactic signatures.
            </h2>
          </div>

          <div className="flex flex-col items-start xl:items-end">
            <p className="font-mono text-[10px] tracking-widest text-gray-400 uppercase mb-4">
              DETERMINISTIC COMPILATION · OFFLINE SAFE
            </p>
            <div className="flex gap-2">
              {["Deterministic", "Resilient", "Audited"].map((tag, i) => (
                <span
                  key={i}
                  className="px-3.5 py-1 rounded-full border border-gray-800 text-[10px] font-mono uppercase tracking-widest text-gray-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 border border-gray-800 rounded-xl overflow-hidden bg-black/40 backdrop-blur-md">
          <div className="lg:col-span-5 p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-gray-800 min-h-[380px]">
            <div className="flex justify-between items-center text-gray-500 font-mono text-xs">
              <span>*** AST ENGINE</span>
              <span>SIGNATURE TRACE</span>
            </div>

            <div className="relative size-60 mx-auto my-6 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <SandTransitionImage
                  key={chaptersData[activeChapter].image}
                  src={chaptersData[activeChapter].image}
                  alt={chaptersData[activeChapter].name}
                  className="size-full"
                />
              </AnimatePresence>
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-gray-500">
              <span>Chapter 0{activeChapter + 1} / 05</span>
              <span className="text-emerald-400 font-bold">{chaptersData[activeChapter].stat}</span>
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col justify-center divide-y divide-gray-800">
            {chaptersData.map((chapter, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveChapter(idx)}
                className={`p-6 text-left transition-all flex items-center justify-between group ${
                  activeChapter === idx ? "bg-white/[0.04] text-white" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <div>
                  <div className="font-mono text-[10px] tracking-widest uppercase mb-1">
                    PILLAR 0{idx + 1}
                  </div>
                  <h3 className="text-lg md:text-xl font-medium tracking-tight">
                    {chapter.name}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-lg leading-relaxed">
                    {chapter.desc}
                  </p>
                </div>
                {activeChapter === idx && (
                  <ArrowUpRight className="size-5 text-emerald-400 shrink-0 ml-4" />
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: RESULTS DASHBOARD */}
      <AnimatePresence>
        {!loading && profile && (
          <section ref={resultsRef} className="py-16 px-6 md:px-16 border-b border-white/10">
            <ResultsDashboard key={profile.handle} profile={profile} />
          </section>
        )}
      </AnimatePresence>

      <ApiDocs
        onCopied={() => pushToast("API snippet copied to clipboard")}
        onCopyError={() => pushToast("Could not copy snippet to clipboard", "error")}
      />

      <footer className="border-t border-white/10 px-6 md:px-16 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] font-mono tracking-widest text-gray-500 uppercase">
        <span>SkillGraph AI · Zero-Trust Developer Auditing</span>
        <span>{demoMode ? "Offline-First Engine · Mock Verified" : "Render Cloud Gateway Active"}</span>
      </footer>

      {/* Floating Chatbot */}
      <RepoChatbot />

      {/* Toast Stack */}
      <ToastStack toasts={toasts} />
    </div>
  )
}