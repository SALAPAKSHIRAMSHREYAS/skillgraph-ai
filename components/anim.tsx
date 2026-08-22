"use client"

import { motion, useInView, type Variants } from "motion/react"
import { useEffect, useRef, useState, type ReactNode } from "react"
import { cn } from "@/lib/utils"

const EASE = [0.16, 1, 0.3, 1] as const

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.75, ease: EASE },
  },
}

/** Section-level scroll reveal that staggers its direct children. */
export function Reveal({
  children,
  className,
  delay = 0,
  once = true,
  amount = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
  once?: boolean
  /** Fraction of the container that must be visible. Keep near 0 for tall containers. */
  amount?: number
}) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 + delay } },
      }}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount, margin: "0px 0px -80px 0px" }}
    >
      {children}
    </motion.div>
  )
}

export function RevealItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode
  className?: string
  as?: "div" | "li" | "tr" | "span" | "p" | "h2" | "h3"
}) {
  const Comp = motion[as] as typeof motion.div
  return (
    <Comp variants={fadeUp} className={className}>
      {children}
    </Comp>
  )
}

/** Counts a number up from 0 once the element is scrolled into view. */
export function useCountUp(target: number, duration = 1500, active = true) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView || !active) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValue(target)
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(target * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, target, duration, active])

  return { ref, value }
}

export function CountUp({
  value,
  decimals = 0,
  suffix = "",
  prefix = "",
  className,
  duration = 1500,
}: {
  value: number
  decimals?: number
  suffix?: string
  prefix?: string
  className?: string
  duration?: number
}) {
  const { ref, value: current } = useCountUp(value, duration)
  return (
    <span ref={ref} className={cn("tabular", className)}>
      {prefix}
      {current.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  )
}
