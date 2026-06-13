import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import type { PortfolioView } from "../types"

interface Props {
  portfolio: PortfolioView
}

function TiltChart({ data, title, color, subtitle }: {
  data: { ticker: string; name: string; weight: number }[]
  title: string
  color: string
  subtitle: string
}) {
  return (
    <div className="space-y-2">
      <div>
        <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
          <XAxis type="number" domain={[0, 30]} tick={{ fontSize: 10, fill: "#8b949e" }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
          <YAxis type="category" dataKey="ticker" tick={{ fontSize: 11, fill: "#8b949e" }} axisLine={false} tickLine={false} width={38} />
          <Tooltip
            contentStyle={{ background: "#161b22", border: "1px solid #21262d", borderRadius: 8, fontSize: 12 }}
            formatter={(v: number) => [`${v}%`, "Weight"]}
          />
          <Bar dataKey="weight" radius={[0, 3, 3, 0]}>
            {data.map((_, i) => <Cell key={i} fill={color} opacity={0.85} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function PortfolioTilt({ portfolio }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 text-xs text-gray-400 bg-gray-50 rounded-lg p-3 border border-border">
        <span className="text-blue-400 mt-0.5 shrink-0">ℹ</span>
        <span>
          If you tilt by <span className="text-gray-900">naive ESG score</span>, greenwashed firms get cheap capital.
          If you tilt by <span className="text-gray-900">Integrity × Impact</span>, capital flows to real performers.
          The reallocation difference is the cost of broken ESG signals.
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <TiltChart
          data={portfolio.naive_esg_tilt}
          title="Naive ESG Tilt"
          color="#3b82f6"
          subtitle="Weighted by avg ESG score across providers"
        />
        <TiltChart
          data={portfolio.integrity_impact_tilt}
          title="Integrity × Impact Tilt"
          color="#22c55e"
          subtitle="Weighted by Integrity × Impact / 100"
        />
        <TiltChart
          data={portfolio.wem_tilt}
          title="WEM Tilt"
          color="#a855f7"
          subtitle="Weighted by WEM score — penalises externalised harm"
        />
      </div>
    </div>
  )
}
