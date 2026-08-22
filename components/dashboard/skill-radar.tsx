"use client"

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts"
import type { Profile } from "@/lib/mock-profiles"

export function SkillRadar({ profile }: { profile: Profile }) {
  const gap = Math.round(
    profile.skills.reduce((acc, s) => acc + (s.claimed - s.verified), 0) / profile.skills.length,
  )

  return (
    <div className="flex h-full flex-col rounded-2xl border border-border/60 bg-card p-6 backdrop-blur-xl transition-colors duration-500 hover:border-primary/40">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold tracking-tight">Skill Matrix</h3>
          <p className="mt-1 text-[11px] tracking-tight text-muted-foreground">
            Verified capability vs. profile claims
          </p>
        </div>
        <div className="text-right">
          <div className="tabular text-lg font-semibold tracking-tight text-[color:var(--warning)]">
            +{gap}
          </div>
          <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">mean claim gap</div>
        </div>
      </div>

      <div className="mt-4 h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={profile.skills} outerRadius="72%">
            <PolarGrid stroke="var(--border)" strokeOpacity={0.7} />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "var(--muted-foreground)", fontSize: 11, letterSpacing: "0.02em" }}
            />
            <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
            <Tooltip
              cursor={false}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                fontSize: 12,
                color: "var(--popover-foreground)",
                boxShadow: "0 12px 32px -12px rgba(0,0,0,0.7)",
              }}
              labelStyle={{ color: "var(--foreground)", fontWeight: 600, marginBottom: 4 }}
            />
            <Radar
              name="Claimed"
              dataKey="claimed"
              stroke="var(--warning)"
              strokeWidth={1}
              strokeDasharray="4 4"
              fill="var(--warning)"
              fillOpacity={0.07}
              isAnimationActive
              animationDuration={1200}
            />
            <Radar
              name="Verified"
              dataKey="verified"
              stroke="var(--chart-1)"
              strokeWidth={2}
              fill="var(--chart-1)"
              fillOpacity={0.28}
              isAnimationActive
              animationDuration={1400}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 flex items-center gap-5 border-t border-border/50 pt-4">
        <span className="flex items-center gap-2 text-[11px] tracking-tight text-muted-foreground">
          <span className="h-0.5 w-4 rounded-full bg-[color:var(--chart-1)]" />
          Verified
        </span>
        <span className="flex items-center gap-2 text-[11px] tracking-tight text-muted-foreground">
          <span className="h-0.5 w-4 rounded-full bg-[color:var(--warning)]" />
          Claimed
        </span>
      </div>
    </div>
  )
}
