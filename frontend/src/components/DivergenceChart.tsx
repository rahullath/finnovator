import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts"
import type { ESGRating } from "../types"

interface Props {
  ratings: ESGRating[]
  ticker: string
}

const SOURCE_COLORS: Record<string, string> = {
  FMP: "#3b82f6",
  OSI: "#a855f7",
}

export function DivergenceChart({ ratings, ticker }: Props) {
  const components = ["environmental", "social", "governance", "total"] as const

  const chartData = components.map((comp) => {
    const entry: Record<string, string | number> = { name: comp.charAt(0).toUpperCase() + comp.slice(1) }
    for (const r of ratings) {
      entry[r.source] = r[comp]
    }
    return entry
  })

  const spread = ratings.length >= 2
    ? Math.abs(ratings[0].total - ratings[1].total).toFixed(1)
    : "N/A"

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">Rating Provider Divergence</h3>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          {ratings.map((r) => (
            <span key={r.source} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: SOURCE_COLORS[r.source] ?? "#6b7280" }} />
              {r.source}: {r.total}
            </span>
          ))}
          {ratings.length >= 2 && (
            <span className="text-yellow-400 font-medium">Spread: {spread} pts</span>
          )}
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-3 border border-border">
        <p className="text-xs text-gray-500 mb-3">
          Same company, {ratings.length} providers, {spread} point gap — Berg et al. (2022) show this is typical across major raters. The gap <em>is</em> the signal.
        </p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={chartData} barGap={4} barCategoryGap="30%">
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#8b949e" }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#8b949e" }} axisLine={false} tickLine={false} width={28} />
            <Tooltip
              contentStyle={{ background: "#ffffff", border: "1px solid #e8e3da", borderRadius: 8, fontSize: 12, color: "#111827" }}
              cursor={{ fill: "rgba(0,0,0,0.03)" }}
            />
            <ReferenceLine y={50} stroke="#d1d5db" strokeDasharray="3 3" />
            {ratings.map((r) => (
              <Bar key={r.source} dataKey={r.source} fill={SOURCE_COLORS[r.source] ?? "#6b7280"} radius={[3, 3, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
