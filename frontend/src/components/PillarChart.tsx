// E/S/G pillar comparison chart — company vs sector avg vs FTSE100 avg.
// Uses recharts BarChart horizontal for easy reading by any audience.

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, LabelList, ReferenceLine } from "recharts"
import type { DriverProfile } from "../types"

interface Props {
  drivers:     DriverProfile[]
  ticker:      string
  companyName: string
}

const PILLAR_KEYS = {
  Environment: "E",
  Social:      "S",
  Governance:  "G",
}

const PILLAR_COLOR: Record<string, string> = {
  E: "#2f7d8a",
  S: "#7a5ea8",
  G: "#8a6d2f",
}

function avg(nums: number[]): number {
  if (!nums.length) return 0
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 100)
}

function CustomBar(props: any) {
  const { x, y, width, height, fill } = props
  if (!height || height < 0) return null
  return <rect x={x} y={y} width={Math.max(0, width)} height={Math.max(0, height)} fill={fill} rx={3} />
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-xl p-3 text-xs"
      style={{ background: "#fff", border: "1px solid #ededed", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", minWidth: 160 }}
    >
      <div className="font-semibold mb-2" style={{ color: "#171717" }}>{label} pillar</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-4 mb-1">
          <span style={{ color: "#707070" }}>{p.name}</span>
          <span className="font-mono font-semibold" style={{ color: "#171717" }}>{p.value}</span>
        </div>
      ))}
      <p className="mt-2 pt-2 text-[10.5px]" style={{ borderTop: "1px solid #f0f0f0", color: "#9a9a9a", lineHeight: 1.5 }}>
        Average risk weight across all {label} topics, scored 0 to 100.
      </p>
    </div>
  )
}

export function PillarChart({ drivers, ticker, companyName }: Props) {
  const data = Object.entries(PILLAR_KEYS).map(([cat, key]) => {
    const group = drivers.filter(d => d.category === cat)
    if (!group.length) return null
    return {
      pillar:   key,
      Company:  avg(group.map(d => d.materiality_score)),
      "Sector avg": avg(group.map(d => d.peer_median)),
      "FTSE 100":   avg(group.map(d => d.ftse100_median)),
      color:    PILLAR_COLOR[key],
    }
  }).filter((d): d is NonNullable<typeof d> => d !== null && d.Company > 0)

  if (data.length === 0) return null

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 flex-wrap mb-1">
        <h2 className="text-[19px] font-semibold tracking-tight">Environmental, Social and Governance breakdown</h2>
        <p className="text-[12px]" style={{ color: "#9a9a9a" }}>
          {ticker} vs sector average vs FTSE 100 average
        </p>
      </div>
      <p className="text-[13px] mb-5" style={{ color: "#707070", lineHeight: 1.5 }}>
        Each bar shows how sensitive this company's stock price has historically been to news in that category.
        A higher score means investors react more strongly to stories on that topic.
      </p>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis
            dataKey="pillar"
            tick={{ fontSize: 13, fontWeight: 600, fill: "#171717" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: "#9a9a9a" }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Legend
            wrapperStyle={{ fontSize: 11, color: "#707070", paddingTop: 12 }}
            iconType="circle"
            iconSize={8}
          />
          <ReferenceLine y={50} stroke="#ededed" strokeDasharray="4 2" />
          <Bar dataKey="Company" fill="#171717" shape={<CustomBar />} maxBarSize={36} />
          <Bar dataKey="Sector avg" fill="#2f7d8a" shape={<CustomBar />} maxBarSize={36} />
          <Bar dataKey="FTSE 100" fill="#c7c7c7" shape={<CustomBar />} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>

      {/* Explanatory rule per pillar */}
      <div className="grid gap-3 mt-5" style={{ gridTemplateColumns: `repeat(${data.length}, 1fr)` }}>
        {data.map(d => {
          const diff    = d.Company - d["Sector avg"]
          const absDiff = Math.abs(diff)
          const more    = diff > 0
          const noGap   = absDiff < 5
          const label   = d.pillar === "E" ? "Environmental" : d.pillar === "S" ? "Social" : "Governance"
          const desc = noGap
            ? `${label} is broadly in line with sector peers. Investors react to ${label.toLowerCase()} news here about as much as they do elsewhere in the industry.`
            : more
            ? `${label} is ${absDiff} points above the sector average. Investors react more strongly to ${label.toLowerCase()} news for this company than for most of its peers.`
            : `${label} is ${absDiff} points below the sector average. Investors treat this area as less of a risk here than for typical peers, either because the company has demonstrated good controls or because its exposure is lower.`
          return (
            <div
              key={d.pillar}
              className="rounded-lg p-3"
              style={{ background: "#fafafa", border: "1px solid #ededed" }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className="inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold text-white shrink-0"
                  style={{ background: d.color }}
                >
                  {d.pillar}
                </span>
                <span className="font-mono text-[13px] font-semibold" style={{ color: "#171717" }}>
                  {d.Company}
                  {!noGap && (
                    <span className="font-normal text-[11px] ml-1.5" style={{ color: more ? "#2f7d8a" : "#c0492f" }}>
                      {more ? "+" : "−"}{absDiff} vs sector
                    </span>
                  )}
                </span>
              </div>
              <p className="text-[11.5px] leading-relaxed" style={{ color: "#707070" }}>{desc}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
