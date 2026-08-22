"use client"

import { useState } from "react"
import { Check, Copy, Terminal } from "lucide-react"
import { Reveal, RevealItem } from "@/components/anim"
import { cn } from "@/lib/utils"

const SNIPPET = `curl https://api.skillgraph.ai/v1/audits \\
  -H "Authorization: Bearer $SKILLGRAPH_KEY" \\
  -d handle="authentic-dev" \\
  -d depth="full" \\
  -d include="ast,cadence,claims"`

const RESPONSE = [
  { key: "authenticity_score", value: "92", tone: "success" },
  { key: "complexity_grade", value: '"A"', tone: "muted" },
  { key: "cadence_risk", value: "0.12", tone: "success" },
  { key: "anomalies", value: "[ 3 ]", tone: "warning" },
  { key: "screening_questions", value: "[ 3 ]", tone: "muted" },
]

const ENDPOINTS = [
  { method: "POST", path: "/v1/audits", desc: "Queue a full portfolio audit" },
  { method: "GET", path: "/v1/audits/:id", desc: "Retrieve scores, anomalies and questions" },
  { method: "GET", path: "/v1/audits/:id/repos", desc: "Per-repository originality breakdown" },
  { method: "POST", path: "/v1/webhooks", desc: "Subscribe to audit.completed events" },
]

export function ApiDocs({
  onCopied,
  onCopyError,
}: {
  onCopied: () => void
  onCopyError: () => void
}) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SNIPPET)
      setCopied(true)
      onCopied()
      setTimeout(() => setCopied(false), 2000)
    } catch {
      onCopyError()
    }
  }

  return (
    <section id="api-docs" className="relative scroll-mt-20 border-t border-border/50 px-6 py-24">
      <Reveal className="mx-auto w-full max-w-7xl">
        <RevealItem className="mb-10 max-w-2xl">
          <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
            <Terminal className="size-3.5" />
            API Docs
          </span>
          <h2 className="mt-3 text-balance text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
            Wire audits into your ATS
          </h2>
          <p className="mt-3 text-pretty text-sm leading-relaxed text-muted-foreground">
            One request per candidate. Results are idempotent and cached for 24 hours, so re-screening
            during a hiring loop costs nothing.
          </p>
        </RevealItem>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <RevealItem className="lg:col-span-2">
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-card backdrop-blur-xl transition-colors duration-500 hover:border-primary/40">
              <div className="flex items-center justify-between border-b border-border/50 px-5 py-3">
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  request
                </span>
                <button
                  type="button"
                  onClick={copy}
                  className="flex items-center gap-1.5 rounded-md border border-border/70 px-2 py-1 text-[11px] text-muted-foreground transition-all duration-300 hover:scale-[1.03] hover:border-primary/50 hover:text-foreground cursor-pointer"
                >
                  {copied ? <Check className="size-3 text-[color:var(--success)]" /> : <Copy className="size-3" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <pre className="overflow-x-auto px-5 py-5 font-mono text-[12.5px] leading-relaxed text-foreground/85">
                <code>{SNIPPET}</code>
              </pre>
              <div className="border-t border-border/50 px-5 py-4">
                <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                  200 · response
                </span>
                <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {RESPONSE.map((r) => (
                    <div key={r.key} className="flex items-baseline justify-between gap-3 border-b border-border/30 pb-2">
                      <dt className="font-mono text-[12px] text-muted-foreground">{r.key}</dt>
                      <dd
                        className={cn(
                          "tabular font-mono text-[12px]",
                          r.tone === "success" && "text-[color:var(--success)]",
                          r.tone === "warning" && "text-[color:var(--warning)]",
                          r.tone === "muted" && "text-foreground/80",
                        )}
                      >
                        {r.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </RevealItem>

          <RevealItem>
            <ul className="flex h-full flex-col gap-3 rounded-2xl border border-border/60 bg-card p-5 backdrop-blur-xl">
              {ENDPOINTS.map((e) => (
                <li
                  key={e.path}
                  className="group rounded-xl border border-transparent px-3 py-3 transition-all duration-300 hover:scale-[1.02] hover:border-border/70 hover:bg-secondary/30 cursor-default"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wide",
                        e.method === "POST"
                          ? "bg-primary/15 text-primary"
                          : "bg-[color:var(--success)]/15 text-[color:var(--success)]",
                      )}
                    >
                      {e.method}
                    </span>
                    <span className="font-mono text-[12px] tracking-tight text-foreground/90">{e.path}</span>
                  </div>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">{e.desc}</p>
                </li>
              ))}
            </ul>
          </RevealItem>
        </div>
      </Reveal>
    </section>
  )
}
