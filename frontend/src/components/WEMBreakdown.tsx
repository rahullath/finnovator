import type { WEMBreakdown as WEMData, WEMInputs } from "../types"

interface Props {
  wem: WEMData
  inputs: WEMInputs
  esgAvg: number
  integrityScore: number
}

interface PenaltyBarProps {
  label: string
  description: string
  value: number
  cap: number
  color: string
}

function PenaltyBar({ label, description, value, cap, color }: PenaltyBarProps) {
  const pct = Math.min((value / cap) * 100, 100)
  const remaining = cap - value
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <div>
          <span className="font-mono font-semibold text-gray-200">{label}</span>
          <span className="text-gray-500 ml-2">{description}</span>
        </div>
        <div className="flex items-center gap-2 font-mono">
          <span className={color}>{value.toFixed(1)}</span>
          <span className="text-gray-600">/ {cap} pts</span>
        </div>
      </div>
      <div className="h-2 bg-surface rounded-full overflow-hidden border border-border">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color.includes("red") ? "#ef4444" : color.includes("orange") ? "#f97316" : "#eab308" }}
        />
      </div>
      <p className="text-xs text-gray-600">{remaining.toFixed(1)} pts remaining before cap</p>
    </div>
  )
}

function fmt(n: number, decimals = 1) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n.toFixed(0)}`
}

export function WEMBreakdown({ wem, inputs, esgAvg, integrityScore }: Props) {
  const totalFines = inputs.labor_fines_usd_5y + inputs.other_fines_usd_5y
  const totalFinesM = totalFines / 1_000_000

  const placeboDelta = Math.round(esgAvg - wem.wem_score)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-200">Worker & Ecological Materiality (WEM)</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Deflationary index. Starts at 100, subtracts penalties for externalised harm — regardless of ESG narrative.
          </p>
        </div>
        <div className="text-right shrink-0">
          <div className="font-mono text-2xl font-bold text-white">{Math.round(wem.wem_score)}</div>
          <div className="text-xs text-gray-500 font-mono">100 − ({wem.d_carbon.toFixed(1)} + {wem.d_labor.toFixed(1)} + {wem.d_theft.toFixed(1)})</div>
        </div>
      </div>

      {/* Penalty bars */}
      <div className="space-y-4">
        <PenaltyBar
          label="D_carbon"
          description="emissions intensity percentile rank across universe"
          value={wem.d_carbon}
          cap={40}
          color="text-orange-400"
        />
        <PenaltyBar
          label="D_labor"
          description="CEO-to-worker pay ratio (threshold 50:1)"
          value={wem.d_labor}
          cap={30}
          color="text-yellow-400"
        />
        <PenaltyBar
          label="D_theft"
          description="5-year total regulatory fines (log-compressed)"
          value={wem.d_theft}
          cap={40}
          color="text-red-400"
        />
      </div>

      {/* Raw inputs */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Raw inputs (auditable)</h4>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {[
            { label: "Revenue (USD)", value: fmt(inputs.revenue_usd) },
            { label: "Emissions", value: `${(inputs.emissions_tco2e / 1_000_000).toFixed(1)}M tCO₂e` },
            { label: "Emissions intensity", value: `${wem.emissions_intensity.toFixed(2)} tCO₂e/$M rev` },
            { label: "CEO pay ratio", value: `${inputs.ceo_pay_ratio}:1 worker` },
            { label: "Labour fines (5yr)", value: fmt(inputs.labor_fines_usd_5y) },
            { label: "Other fines (5yr)", value: fmt(inputs.other_fines_usd_5y) },
            { label: "Total fines (5yr)", value: `${fmt(totalFines)} (${totalFinesM.toFixed(0)}M)` },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between text-xs py-1 border-b border-border/50">
              <span className="text-gray-500">{label}</span>
              <span className="font-mono text-gray-300">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Score comparison */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Score comparison</h4>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "ESG (avg)", value: Math.round(esgAvg), color: "text-blue-400", note: "provider narrative" },
            { label: "WEM", value: Math.round(wem.wem_score), color: wem.wem_score >= 70 ? "text-green-400" : wem.wem_score >= 50 ? "text-yellow-400" : "text-red-400", note: "externalised harm" },
            { label: "Integrity", value: Math.round(integrityScore), color: integrityScore >= 70 ? "text-green-400" : integrityScore >= 50 ? "text-blue-400" : "text-red-400", note: "signal quality" },
          ].map(({ label, value, color, note }) => (
            <div key={label} className="bg-surface border border-border rounded-lg p-3 text-center">
              <div className={`font-bold text-xl font-mono ${color}`}>{value}</div>
              <div className="text-xs font-medium text-gray-300 mt-0.5">{label}</div>
              <div className="text-xs text-gray-600">{note}</div>
            </div>
          ))}
        </div>
        {placeboDelta > 15 && (
          <div className="mt-3 bg-red-500/5 border border-red-500/20 rounded-lg p-3">
            <p className="text-xs text-red-400">
              ESG score is <span className="font-bold">{placeboDelta} points higher</span> than WEM — the gap between narrative and externalised reality. Classic "dangerous placebo" pattern (Tariq Fancy, 2021).
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
