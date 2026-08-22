"use client"

import { motion } from "motion/react"
import { Braces, Loader2, Search, Sparkles } from "lucide-react"
import { Reveal, RevealItem } from "@/components/anim"
import { PERSONA_HANDLES } from "@/lib/mock-profiles"
import { cn } from "@/lib/utils"

export function CommandCenter({
  query,
  onQueryChange,
  onAudit,
  loading,
  demoMode,
  activeHandle,
}: {
  query: string
  onQueryChange: (v: string) => void
  onAudit: () => void
  loading: boolean
  demoMode: boolean
  activeHandle: string | null
}) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter" || e.shiftKey) return
    if (e.nativeEvent.isComposing || e.keyCode === 229) return
    e.preventDefault()
    onAudit()
  }

  return (
    <section id="product" className="relative scroll-mt-24 px-6 py-24">
      <Reveal className="mx-auto w-full max-w-3xl">
        <RevealItem className="mb-10 text-center">
          <h2 className="text-balance text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
            Audit any public portfolio
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-pretty text-sm leading-relaxed text-muted-foreground">
            Paste a GitHub handle or profile URL. The engine parses every reachable tree, fingerprints
            authorship, and reconciles claims against shipped code.
          </p>
        </RevealItem>

        <RevealItem>
          <div className="relative">
            <div
              className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-b from-primary/40 via-accent/20 to-transparent opacity-70 blur-[2px]"
              aria-hidden="true"
            />
            <div className="relative rounded-2xl border border-border/60 bg-card p-5 backdrop-blur-xl">
              <div className="mb-3 flex items-center gap-2 border-b border-border/50 pb-3">
                <Braces className="size-4 text-muted-foreground" />
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  target / github.com
                </span>
                <span className="ml-auto flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-[color:var(--success)]" />
                  <span className="text-[11px] tracking-tight text-muted-foreground">engine ready</span>
                </span>
              </div>

              <label htmlFor="audit-target" className="sr-only">
                GitHub handle or profile URL
              </label>
              <textarea
                id="audit-target"
                value={query}
                rows={2}
                onChange={(e) => onQueryChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="@authentic-dev"
                spellCheck={false}
                className="w-full resize-none bg-transparent font-mono text-base leading-relaxed tracking-tight text-foreground outline-none placeholder:text-muted-foreground/60"
              />

              <div className="mt-4 flex flex-col gap-4 border-t border-border/50 pt-4 sm:flex-row sm:items-center">
                {demoMode ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                      Personas
                    </span>
                    {PERSONA_HANDLES.map((handle) => (
                      <button
                        key={handle}
                        type="button"
                        onClick={() => onQueryChange(handle)}
                        className={cn(
                          "rounded-full border px-3 py-1 font-mono text-[11px] tracking-tight transition-all duration-300 hover:scale-[1.03] cursor-pointer",
                          query.trim() === handle
                            ? "border-primary/60 bg-primary/15 text-foreground"
                            : "border-border/70 bg-secondary/40 text-muted-foreground hover:border-primary/40 hover:text-foreground",
                        )}
                      >
                        {handle}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] tracking-tight text-muted-foreground">
                    Demo mode is off — live crawling is disabled in this environment.
                  </p>
                )}

                <button
                  type="button"
                  onClick={onAudit}
                  disabled={loading || !query.trim()}
                  className={cn(
                    "group relative ml-auto inline-flex shrink-0 items-center justify-center gap-2 overflow-hidden rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-300",
                    "bg-primary text-primary-foreground shadow-[0_0_28px_-8px_var(--primary)]",
                    "hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100",
                    !loading && "cursor-pointer",
                  )}
                >
                  {!loading && (
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary-foreground/30 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  )}
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Parsing AST…
                    </>
                  ) : (
                    <>
                      <Search className="size-4" />
                      Audit Profile
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </RevealItem>

        <RevealItem className="mt-6 flex items-center justify-center gap-2 text-[11px] tracking-tight text-muted-foreground">
          <Sparkles className="size-3.5 text-accent" />
          {activeHandle ? (
            <span>
              Last audit: <span className="font-mono text-foreground/80">{activeHandle}</span> — press{" "}
              <kbd className="rounded border border-border/70 bg-secondary/50 px-1 py-0.5 font-mono text-[10px]">
                Enter
              </kbd>{" "}
              to re-run
            </span>
          ) : (
            <span>
              Press{" "}
              <kbd className="rounded border border-border/70 bg-secondary/50 px-1 py-0.5 font-mono text-[10px]">
                Enter
              </kbd>{" "}
              to run the audit
            </span>
          )}
        </RevealItem>
      </Reveal>

      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mx-auto mt-10 max-w-3xl"
        >
          <div className="h-px w-full overflow-hidden rounded-full bg-secondary/60">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
          </div>
          <p className="mt-3 text-center font-mono text-[11px] tracking-tight text-muted-foreground">
            walking repository trees · fingerprinting authorship · reconciling claims
          </p>
        </motion.div>
      )}
    </section>
  )
}
