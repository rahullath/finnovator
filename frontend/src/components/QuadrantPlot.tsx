import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from "recharts"
import type { PortfolioEntry, QuadrantColor } from "../types"

interface Props {
  companies: PortfolioEntry[]
  selectedTicker?: string
}

const COLOR_MAP: Record<QuadrantColor, string> = {
  green: "#22c55e",
  blue: "#3b82f6",
  yellow: "#eab308",
  red: "#ef4444",
}

const CustomDot = (props: any) => {
  const { cx, cy, payload, selected } = props
  const color = COLOR_MAP[payload.quadrant_color as QuadrantColor] ?? "#6b7280"
  const r = selected ? 10 : 6
  return (
    <g>
      {selected && <circle cx={cx} cy={cy} r={r + 5} fill={color} opacity={0.15} />}
      <circle cx={cx} cy={cy} r={r} fill={color} stroke={selected ? "white" : color} strokeWidth={selected ? 2 : 0} opacity={selected ? 1 : 0.8} />
      <text x={cx} y={cy - r - 5} textAnchor="middle" fontSize={9} fill="#8b949e">{payload.ticker}</text>
    </g>
  )
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as PortfolioEntry
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 text-xs space-y-0.5 shadow-xl">
      <p className="font-semibold text-white">{d.name}</p>
      <p className="text-gray-400">Integrity: <span className="text-white font-mono">{d.integrity_score}</span></p>
      <p className="text-gray-400">Impact: <span className="text-white font-mono">{d.impact_score}</span></p>
      <p className="text-gray-400">Avg ESG: <span className="text-white font-mono">{d.esg_score_avg}</span></p>
    </div>
  )
}

export function QuadrantPlot({ companies, selectedTicker }: Props) {
  const data = companies.map((c) => ({
    ...c,
    x: c.integrity_score,
    y: c.impact_score,
  }))

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-200">Integrity × Impact Quadrant</h3>
        <span className="text-xs text-gray-500">All {companies.length} companies in dataset</span>
      </div>

      <div className="relative card p-4">
        {/* Quadrant labels */}
        <div className="absolute inset-0 pointer-events-none" style={{ padding: "40px 40px 30px 50px" }}>
          <div className="relative h-full w-full">
            <span className="absolute top-2 left-2 text-xs text-green-500/40 font-medium">Preferred Leaders</span>
            <span className="absolute top-2 right-2 text-xs text-blue-500/40 font-medium text-right">Engagement Priority</span>
            <span className="absolute bottom-2 left-2 text-xs text-yellow-500/40 font-medium">Impact Alpha</span>
            <span className="absolute bottom-2 right-2 text-xs text-red-500/40 font-medium text-right">Greenwashing Risk</span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={280}>
          <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
            <XAxis
              type="number"
              dataKey="x"
              name="Integrity"
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "#8b949e" }}
              axisLine={false}
              tickLine={false}
              label={{ value: "Integrity Score →", position: "insideBottomRight", offset: -5, fontSize: 10, fill: "#6b7280" }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Impact"
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: "#8b949e" }}
              axisLine={false}
              tickLine={false}
              label={{ value: "↑ Impact Alignment", angle: -90, position: "insideTopLeft", offset: 5, fontSize: 10, fill: "#6b7280" }}
            />
            <ReferenceLine x={50} stroke="#21262d" strokeWidth={1} strokeDasharray="4 4" />
            <ReferenceLine y={50} stroke="#21262d" strokeWidth={1} strokeDasharray="4 4" />
            <Tooltip content={<CustomTooltip />} />
            <Scatter data={data} shape={(props: any) => (
              <CustomDot {...props} selected={props.payload.ticker === selectedTicker} />
            )} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {[
          { color: "green", label: "Preferred Leader", desc: "High integrity, high impact" },
          { color: "blue", label: "Engagement Priority", desc: "High integrity, low impact" },
          { color: "yellow", label: "Impact Alpha", desc: "Low integrity, high impact" },
          { color: "red", label: "Greenwashing Risk", desc: "Low integrity, low impact" },
        ].map((q) => (
          <div key={q.color} className="flex items-center gap-2 text-gray-500">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: COLOR_MAP[q.color as QuadrantColor] }} />
            <span><span className="text-gray-300">{q.label}</span> — {q.desc}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
