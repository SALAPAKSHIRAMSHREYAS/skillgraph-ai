"use client"

import { useEffect, useState } from "react"
import { FileDown, Hexagon } from "lucide-react"
import { cn } from "@/lib/utils"

const LINKS = [
  { label: "Product", id: "product" },
  { label: "Analytics", id: "analytics" },
  { label: "API Docs", id: "api-docs" },
]

export function SiteNav({
  demoMode,
  onDemoModeChange,
  onExport,
}: {
  demoMode: boolean
  onDemoModeChange: (v: boolean) => void
  onExport: () => void
}) {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState("product")

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter(Boolean) as HTMLElement[]
    if (!sections.length) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: [0.01, 0.2, 0.5] },
    )
    sections.forEach((s) => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <header
      className={cn(
        "no-print fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "border-b border-border/60 glass" : "border-b border-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-6">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="group flex items-center gap-2.5 rounded-lg pr-2 transition-opacity hover:opacity-90 cursor-pointer"
        >
          <span className="relative grid size-8 place-items-center rounded-lg border border-primary/40 bg-primary/10">
            <Hexagon className="size-4 text-primary transition-transform duration-500 group-hover:rotate-90" />
          </span>
          <span className="text-[13px] font-semibold tracking-[0.14em] text-foreground/90">
            SKILLGRAPH<span className="text-primary">.AI</span>
          </span>
        </button>

        <div className="ml-6 hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => scrollTo(link.id)}
              className={cn(
                "relative rounded-md px-3 py-2 text-[13px] tracking-tight transition-all duration-300 cursor-pointer",
                "text-muted-foreground hover:font-semibold hover:text-foreground hover:tracking-normal",
                active === link.id && "font-semibold text-foreground",
              )}
            >
              {link.label}
              <span
                className={cn(
                  "absolute inset-x-3 -bottom-0.5 h-px origin-left scale-x-0 bg-primary transition-transform duration-300",
                  active === link.id && "scale-x-100",
                )}
              />
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <label className="hidden cursor-pointer select-none items-center gap-2.5 sm:flex">
            <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
              Demo Mode
            </span>
            <span className="relative inline-flex">
              <input
                type="checkbox"
                checked={demoMode}
                onChange={(e) => onDemoModeChange(e.target.checked)}
                className="peer sr-only"
              />
              <span
                className={cn(
                  "flex h-5 w-9 items-center rounded-full border p-0.5 transition-colors duration-300",
                  demoMode ? "border-primary/60 bg-primary/25" : "border-border bg-secondary/60",
                )}
              >
                <span
                  className={cn(
                    "size-3.5 rounded-full transition-all duration-300",
                    demoMode ? "translate-x-4 bg-primary shadow-[0_0_10px_var(--primary)]" : "translate-x-0 bg-muted-foreground",
                  )}
                />
              </span>
            </span>
          </label>

          <button
            type="button"
            onClick={onExport}
            className="group flex items-center gap-2 rounded-lg border border-border/70 bg-card px-3.5 py-2 text-[13px] font-medium text-foreground/90 transition-all duration-300 hover:scale-[1.02] hover:border-primary/50 hover:text-foreground cursor-pointer"
          >
            <FileDown className="size-3.5 text-muted-foreground transition-colors group-hover:text-primary" />
            Export PDF
          </button>
        </div>
      </nav>
    </header>
  )
}
