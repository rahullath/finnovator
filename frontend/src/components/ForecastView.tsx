import { useState } from "react"
import type { CompanyScore, ForecastResult, DriverForecast, MaterialityComparison } from "../types"
import { MaterialityComparisonView } from "./MaterialityComparison"

interface Props {
  score: CompanyScore
  forecast: ForecastResult
  materialityComparison: MaterialityComparison | null
}

function ord(n: number): string {
  if (n >= 11 && n <= 13) return `${n}th`
  const s = ["th", "st", "nd", "rd", "th"]
  return `${n}${s[Math.min(n % 10, 4)]}`
}

type CrowdTab = "investor" | "corporate" | "auditor" | "consensus"

const CROWD_TABS: { id: CrowdTab; label: string; horizon: string }[] = [
  { id: "investor", label: "Investor", horizon: "3-month horizon" },
  { id: "corporate", label: "Corporate CFO", horizon: "12-month horizon" },
  { id: "auditor", label: "Auditor", horizon: "Verification lens" },
  { id: "consensus", label: "Consensus", horizon: "Aggregated signal" },
]

const DIRECTION_CONFIG = {
  leading: { icon: "↑", cls: "text-forest-800 bg-forest-100 border-forest-200" },
  stable:  { icon: "→", cls: "text-gray-600 bg-gray-100 border-gray-200" },
  lagging: { icon: "↓", cls: "text-red-700 bg-red-50 border-red-200" },
}

const INSTABILITY_CONFIG = {
  severe:   { cls: "text-red-700 bg-red-50 border-red-200",     label: "Severe instability" },
  moderate: { cls: "text-amber-700 bg-amber-50 border-amber-200", label: "Moderate instability" },
  low:      { cls: "text-forest-800 bg-forest-50 border-forest-200", label: "Low instability" },
}

function DirectionBadge({ dir }: { dir: "leading" | "stable" | "lagging" }) {
  const cfg = DIRECTION_CONFIG[dir]
  return (
    <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-xs font-medium border ${cfg.cls}`}>
      <span>{cfg.icon}</span>
      <span className="capitalize">{dir}</span>
    </span>
  )
}

function DriverRow({ d, rank }: { d: DriverForecast; rank: number }) {
  const matPct = Math.round(d.materiality_score * 100)
  const confidenceColor = d.confidence === "high" ? "text-forest-700" : d.confidence === "medium" ? "text-amber-600" : "text-gray-400"
  return (
    <tr className="border-t border-border hover:bg-gray-50 transition-colors">
      <td className="py-2.5 pr-4">
        <div className="flex items-start gap-2">
          <span className="shrink-0 w-5 h-5 rounded-full bg-purple-500/15 text-purple-400 text-xs flex items-center justify-center font-bold mt-0.5">
            {rank}
          </span>
          <div>
            <p className="text-sm text-gray-800 font-medium leading-tight">{d.factor}</p>
            <p className="text-xs text-gray-500 mt-0.5">{d.note}</p>
          </div>
        </div>
      </td>
      <td className="py-2.5 pr-3 text-center">
        <div className="flex items-center gap-1">
          <div className="h-1 rounded-full bg-purple-500/40" style={{ width: `${matPct * 0.6}px`, minWidth: 8 }} />
          <span className="text-xs text-gray-400 font-mono">{matPct}%</span>
        </div>
      </td>
      <td className="py-2.5 pr-3 text-center">
        <DirectionBadge dir={d.direction_3m} />
      </td>
      <td className="py-2.5 pr-3 text-center">
        <DirectionBadge dir={d.direction_12m} />
      </td>
      <td className="py-2.5 text-center">
        <span className={`text-xs ${confidenceColor}`}>{d.confidence}</span>
      </td>
    </tr>
  )
}

function RankTimeline({ fc }: { fc: ForecastResult }) {
  const rankNodes = [
    { label: "Now", rank: fc.peer_rank_now, ftse: fc.ftse100_percentile_now },
    { label: "3 months", rank: fc.peer_rank_3m, ftse: fc.ftse100_percentile_3m },
    { label: "12 months", rank: fc.peer_rank_12m, ftse: fc.ftse100_percentile_12m },
  ]

  function rankColor(rank: number, total: number) {
    const pos = rank / total
    return pos <= 0.33 ? "text-forest-800 border-forest-200 bg-forest-100" :
      pos <= 0.66 ? "text-amber-700 border-amber-200 bg-amber-50" :
        "text-red-700 border-red-200 bg-red-50"
  }

  function ftseColor(pct: number) {
    return pct >= 65 ? "text-forest-700" : pct >= 35 ? "text-amber-600" : "text-red-600"
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">
        Sector peer group: <span className="text-gray-700 capitalize">{fc.peer_sector}</span> ({fc.peer_count} companies) ·
        FTSE 100 position estimated from WEM score vs 80-company distribution
      </p>
      <div className="flex items-stretch gap-0">
        {rankNodes.map((n, i) => (
          <div key={n.label} className="flex items-center gap-0 flex-1">
            <div className="flex-1 space-y-2">
              <p className="text-xs text-gray-500 font-medium">{n.label}</p>
              <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-sm font-bold font-mono ${rankColor(n.rank, fc.peer_count)}`}>
                {n.rank}<span className="text-xs font-normal opacity-60">/{fc.peer_count}</span>
              </div>
              <p className="text-xs">
                <span className={`font-mono font-medium ${ftseColor(n.ftse)}`}>{ord(n.ftse)}</span>
                <span className="text-gray-400"> pct FTSE 100</span>
              </p>
            </div>
            {i < rankNodes.length - 1 && (
              <div className="flex items-center px-2 text-gray-400 text-lg self-center mt-1">→</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function ThreeBodyPanel({ fc, score }: { fc: ForecastResult; score: CompanyScore }) {
  const tb = fc.three_body
  const instCfg = INSTABILITY_CONFIG[tb.instability_verdict]

  const bodies = [
    {
      label: "Market Label",
      sublabel: "avg ESG score across providers",
      value: tb.body1_esg.toFixed(0),
      unit: "/100",
      color: "text-blue-400",
      bg: "bg-blue-500/10 border-blue-500/30",
      desc: "What investors are told",
    },
    {
      label: "Signal Quality",
      sublabel: `${fc.peer_sector} sector peer rank`,
      value: (tb.body2_peer_normalized).toFixed(0),
      unit: "/100",
      color: "text-violet-400",
      bg: "bg-violet-500/10 border-violet-500/30",
      desc: `Rank vs ${fc.peer_sector} peers (WEM-based)`,
    },
    {
      label: "Material Reality",
      sublabel: "FTSE 100 WEM percentile",
      value: tb.body3_ftse_percentile.toFixed(0),
      unit: "th pct",
      color: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/30",
      desc: "Verifiable harm vs 80 FTSE cos",
    },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-800">The 3 Body Problem</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Three forces evaluate this company simultaneously: <span className="text-blue-400">market label</span> (what investors are told),{" "}
          <span className="text-violet-400">signal quality</span> (how the company ranks vs its sector),{" "}
          <span className="text-amber-400">material reality</span> (where it sits vs the full FTSE 100).
          When these diverge, no stable orbit exists — ESG ratings correlate at only 0.38–0.71 across providers (Berg et al., 2022).
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {bodies.map((b) => (
          <div key={b.label} className={`rounded-lg border p-3.5 space-y-1 ${b.bg}`}>
            <p className={`text-xs font-semibold uppercase tracking-wide ${b.color}`}>{b.label}</p>
            <p className="text-xs text-gray-500">{b.sublabel}</p>
            <div className="flex items-baseline gap-0.5">
              <span className={`text-2xl font-bold font-mono ${b.color}`}>{b.value}</span>
              <span className="text-xs text-gray-500">{b.unit}</span>
            </div>
            <p className="text-xs text-gray-500">{b.desc}</p>
          </div>
        ))}
      </div>

      <div className={`rounded-lg border px-4 py-3 space-y-2 ${instCfg.cls}`}>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${instCfg.cls}`}>
            {instCfg.label}
          </span>
          <span className="text-xs text-gray-500">σ = {tb.instability_score.toFixed(1)} pts spread</span>
        </div>
        <p className="text-xs text-gray-700 leading-relaxed">{tb.instability_note}</p>
      </div>

      <div className="rounded-lg border border-border bg-gray-50 px-4 py-3 space-y-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Our Resolution</p>
        <p className="text-xs text-gray-700 leading-relaxed">{tb.resolution}</p>
      </div>
    </div>
  )
}

function WisdomOfCrowd({ fc }: { fc: ForecastResult }) {
  const [tab, setTab] = useState<CrowdTab>("investor")

  const content: Record<CrowdTab, string> = {
    investor: fc.summary_investor,
    corporate: fc.summary_corporate,
    auditor: fc.summary_auditor,
    consensus: fc.crowd_consensus,
  }

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-gray-800">Wisdom of the Crowd</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Auditors, investors, and corporate managers each see part of the picture.
          Their combined view — averaging independent weighting schemes on the same verifiable data —
          is more informative than any single perspective alone.
        </p>
      </div>

      <div className="flex gap-1 border-b border-border">
        {CROWD_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors -mb-px ${
              tab === t.id
                ? "border-forest-700 text-forest-800"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <p className="text-xs text-gray-500 italic">
          {CROWD_TABS.find((t) => t.id === tab)?.horizon}
        </p>
        <p className="text-sm text-gray-800 leading-relaxed">{content[tab]}</p>
      </div>

      <div className="text-xs text-gray-400 pt-1 border-t border-border">
        Methodology: Jangani, Date & Tucker (SSRN 5618192, 2026) · Maxwell Data FTSE100 Materiality Survey (March 2025) · Berg, Koelbel & Rigobon, "Aggregate Confusion" (Oxford Review of Finance, 2022)
      </div>
    </div>
  )
}

export function ForecastView({ score, forecast, materialityComparison }: Props) {
  return (
    <div className="space-y-6">
      {/* Sustainability Outlook — rank timeline */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Sustainability Outlook</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            ESG momentum — improvement in material KPI trends — is a leading indicator of relative position change.
            Regime window: 26 weeks (3 months) and 52 weeks (12 months) per Jangani et al. (SSRN 5618192).
          </p>
        </div>
        <RankTimeline fc={forecast} />
      </div>

      {/* 8 material driver forecasts */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Material Driver Forecast</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {forecast.driver_forecasts.length} sector-specific material drivers ranked by financial materiality score.
            <span className="text-forest-700 font-medium"> Leading ↑</span> ·
            <span className="text-gray-500 font-medium"> Stable →</span> ·
            <span className="text-red-600 font-medium"> Lagging ↓</span>
          </p>
        </div>
        <div className="overflow-x-auto bg-white rounded-xl border border-border">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-gray-500 border-b border-border bg-gray-50 rounded-t-xl">
                <th className="pb-2.5 pt-3 px-4 font-medium">Driver</th>
                <th className="pb-2.5 pt-3 pr-3 font-medium">Materiality</th>
                <th className="pb-2.5 pt-3 pr-3 font-medium text-center">3 months</th>
                <th className="pb-2.5 pt-3 pr-3 font-medium text-center">12 months</th>
                <th className="pb-2.5 pt-3 pr-4 font-medium text-center">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {forecast.driver_forecasts.map((d, i) => (
                <DriverRow key={d.factor} d={d} rank={i + 1} />
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400">
          Source: Maxwell Data FTSE100 Financial Materiality Survey (March 2025) · SSRN 5618192 methodology
        </p>
      </div>

      {/* Wisdom of the crowd */}
      <div className="space-y-3">
        <WisdomOfCrowd fc={forecast} />
      </div>

      {/* Driver materiality comparison */}
      {materialityComparison && (
        <div className="space-y-3">
          <MaterialityComparisonView comparison={materialityComparison} />
        </div>
      )}
    </div>
  )
}
