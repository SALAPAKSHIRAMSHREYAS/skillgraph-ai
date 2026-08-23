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

type ChartSkill = {
  subject: string
  verified: number
  claimed: number
  fullMark?: number
}

function resolveChartData(profile: Profile): ChartSkill[] {
  const radarChart = (profile as Profile & { radarChart?: ChartSkill[] }).radarChart
  const skills = profile.skills ?? []

  const hasSkillValues = skills.some(
    (s) => (Number(s.verified) || 0) > 0 || (Number(s.claimed) || 0) > 0,
  )

  const source = hasSkillValues ? skills : radarChart?.length ? radarChart : skills

  return source.map((s) => ({
    subject: s.subject,
    verified: Number(s.verified) || 0,
    claimed: Number(s.claimed) || 0,
    fullMark: 100,
  }))
}

function formatMeanClaimGap(chartData: ChartSkill[]): string {
  if (chartData.length === 0) return "N/A"

  const allZero = chartData.every(
    (s) => (Number(s.verified) || 0) === 0 && (Number(s.claimed) || 0) === 0,
  )
  if (allZero) return "N/A"

  const totalGap = chartData.reduce((acc, s) => {
    const claimed = Number(s.claimed) || 0
    const verified = Number(s.verified) || 0
    return acc + (claimed - verified)
  }, 0)

  const meanGapNum = totalGap / chartData.length
  if (!Number.isFinite(meanGapNum)) return "N/A"

  return `+${meanGapNum.toFixed(1)}`
}

export function SkillRadar({ profile }: { profile: Profile }) {
  const chartData = resolveChartData(profile)
  const meanGapDisplay = formatMeanClaimGap(chartData)
  const hasChartData = meanGapDisplay !== "N/A"

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
          <div
            className={`tabular text-lg font-semibold tracking-tight ${
              hasChartData ? "text-[color:var(--warning)]" : "text-muted-foreground"
            }`}
          >
            {meanGapDisplay}
          </div>
          <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">mean claim gap</div>
        </div>
      </div>

      <div className="mt-4 h-[300px] w-full">
        {hasChartData ? (
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData} outerRadius="72%">
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
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-border/60 bg-secondary/10 px-6 text-center">
            <p className="text-[13px] text-muted-foreground">
              Insufficient skill telemetry for this profile. Run a full audit or switch to demo mode.
            </p>
          </div>
        )}
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
