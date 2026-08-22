"use client"

import { motion } from "motion/react"
import { ArrowDown, ShieldCheck } from "lucide-react"
import { HorizonCanvas } from "@/components/horizon-canvas"

const TITLE = "SKILLGRAPH AI"

export function Hero({ onScrollToSearch }: { onScrollToSearch: () => void }) {
  return (
    <section className="relative isolate flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 pt-24">
      <HorizonCanvas />

      {/* horizon wash + vignette, still behind content */}
      <div className="pointer-events-none absolute inset-0 z-0 radial-glow" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-56 bg-gradient-to-t from-background via-background/80 to-transparent"
        aria-hidden="true"
      />

      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-3.5 py-1.5 backdrop-blur-md"
        >
          <ShieldCheck className="size-3.5 text-[color:var(--success)]" />
          <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Zero-Trust Audit Engine · v4.2
          </span>
        </motion.div>

        <h1
          aria-label={TITLE}
          className="flex flex-wrap justify-center text-5xl font-semibold leading-[0.95] tracking-[-0.04em] sm:text-7xl lg:text-8xl"
        >
          {TITLE.split("").map((char, i) => (
            <motion.span
              key={`${char}-${i}`}
              aria-hidden="true"
              initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 0.8,
                delay: 0.15 + i * 0.045,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={char === " " ? "w-4 sm:w-6" : undefined}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="mt-7 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          Zero-Trust Developer Verification. Audit GitHub portfolios with AST and AI.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        >
          <button
            type="button"
            onClick={onScrollToSearch}
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:scale-[1.02] cursor-pointer"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary-foreground/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            Start an audit
            <ArrowDown className="size-4 transition-transform duration-300 group-hover:translate-y-0.5" />
          </button>
          <span className="text-[12px] tracking-tight text-muted-foreground">
            No repo access tokens required · read-only AST parsing
          </span>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 1 }}
        className="relative z-10 mt-20 grid w-full max-w-3xl grid-cols-3 divide-x divide-border/60 border-t border-border/60 pt-6 text-center"
        aria-label="Engine statistics"
      >
        {[
          { k: "1.4B", v: "AST nodes parsed" },
          { k: "310K", v: "portfolios audited" },
          { k: "0.94", v: "clone detection AUC" },
        ].map((s) => (
          <div key={s.v} className="px-3">
            <div className="tabular text-xl font-semibold tracking-tight sm:text-2xl">{s.k}</div>
            <div className="mt-1 text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{s.v}</div>
          </div>
        ))}
      </motion.div>
    </section>
  )
}
