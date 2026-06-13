/**
 * Radar/spider chart comparing company vs peer group vs FTSE 100 across top-8 material drivers.
 * Uses Recharts RadarChart.
 */
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Legend, Tooltip,
} from "recharts"

export interface RadarDriver {
  driver: string
  company: number      // materiality score 0–1
  peer: number         // peer median 0–1
  ftse100: number      // FTSE 100 median 0–1
}

interface Props {
  drivers: RadarDriver[]
  companyName: string
  industry: string
}

function shortenLabel(label: string): string {
  const MAP: Record<string, string> = {
    "GHG Emissions": "GHG",
    "Physical Impacts of Climate Change": "Climate Risk",
    "Employee Health & Safety": "H&S",
    "Human Rights & Community Relations": "Human Rights",
    "Management of the Legal & Regulatory Environment": "Regulatory",
    "Product Quality & Safety": "Product Safety",
    "Supply Chain Management": "Supply Chain",
    "Business Model Resilience": "Biz Resilience",
    "Customer Privacy": "Privacy",
    "Data Security": "Data Security",
    "Systemic Risk Management": "Systemic Risk",
    "Business Ethics": "Ethics",
    "Energy Management": "Energy Mgmt",
    "Ecological Impacts": "Ecology",
    "Waste & Hazardous Materials Management": "Waste Mgmt",
    "Water & Wastewater Management": "Water",
    "Labour Practices": "Labour",
    "Employee Engagement": "Engagement",
    "Materials Sourcing & Efficiency": "Materials",
    "Competitive Behaviour": "Competition",
  }
  return MAP[label] ?? (label.length > 16 ? label.slice(0, 14) + "…" : label)
}

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }> }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-border rounded-xl shadow-card p-3 text-xs space-y-1">
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          <span className="text-gray-600">{p.name}:</span>
          <span className="font-mono font-semibold text-gray-900">{(p.value * 100).toFixed(0)}%</span>
        </div>
      ))}
    </div>
  )
}

export function PeerRadar({ drivers, companyName, industry }: Props) {
  const data = drivers.map((d) => ({
    subject: shortenLabel(d.driver),
    full: d.driver,
    Company: parseFloat(d.company.toFixed(3)),
    Peers: parseFloat(d.peer.toFixed(3)),
    "FTSE 100": parseFloat(d.ftse100.toFixed(3)),
  }))

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Materiality Radar</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          How {companyName}'s top material drivers compare to <span className="font-medium">{industry}</span> peers and the FTSE 100 average.
          Higher = greater financial materiality weight.
        </p>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
            <PolarGrid stroke="#e8e3da" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#6b7280", fontSize: 10 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 1]}
              tick={{ fill: "#9ca3af", fontSize: 9 }}
              tickCount={4}
            />
            <Radar
              name="FTSE 100"
              dataKey="FTSE 100"
              stroke="#9ca3af"
              fill="#9ca3af"
              fillOpacity={0.08}
              strokeWidth={1.5}
              strokeDasharray="4 2"
            />
            <Radar
              name="Peers"
              dataKey="Peers"
              stroke="#6b7280"
              fill="#6b7280"
              fillOpacity={0.12}
              strokeWidth={1.5}
            />
            <Radar
              name="Company"
              dataKey="Company"
              stroke="#166534"
              fill="#166534"
              fillOpacity={0.18}
              strokeWidth={2}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-gray-400">
        Source: Maxwell Data FTSE100 Financial Materiality Survey (March 2025) · Jangani, Date & Tucker (SSRN 5618192, 2026)
      </p>
    </div>
  )
}
