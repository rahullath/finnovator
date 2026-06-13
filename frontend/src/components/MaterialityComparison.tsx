import { useState } from "react"
import type { DriverComparison, MaterialityComparison } from "../types"

interface Props {
  comparison: MaterialityComparison
}

const TOPIC_CONFIG = {
  Environment: { abbr: "E", color: "text-emerald-400", bg: "bg-emerald-500/15 border-emerald-500/30" },
  Social:      { abbr: "S", color: "text-orange-400",  bg: "bg-orange-500/15 border-orange-500/30" },
  Governance:  { abbr: "G", color: "text-violet-400",  bg: "bg-violet-500/15 border-violet-500/30" },
}

const UNIQUENESS_BADGE: Record<string, { label: string; cls: string } | null> = {
  company_leading: { label: "↑ co. leading", cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  company_lagging: { label: "↓ co. lagging", cls: "text-red-400 bg-red-500/10 border-red-500/30" },
  company_only:    { label: "unique to co.", cls: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  peer_only:       { label: "gap vs peers", cls: "text-red-400 bg-red-500/10 border-red-500/30" },
  sector_norm:     null,
  absent:          null,
}

const INSTABILITY_CONFIG = {
  high:   { label: "High instability", cls: "text-red-400 bg-red-500/10 border-red-500/30" },
  medium: { label: "Moderate instability", cls: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" },
  low:    { label: "Low instability", cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
}

function instabilityLevel(val: number): "high" | "medium" | "low" {
  return val >= 0.06 ? "high" : val >= 0.03 ? "medium" : "low"
}

function Bar({ score, color, max = 1.0 }: { score: number | null; color: string; max?: number }) {
  if (score === null) {
    return (
      <div className="flex items-center gap-1.5 h-5">
        <div className="flex-1 h-1.5 bg-gray-50 rounded-full border border-border" />
        <span className="text-xs text-gray-400 font-mono w-8 text-right">N/A</span>
      </div>
    )
  }
  const pct = Math.min(100, (score / max) * 100)
  return (
    <div className="flex items-center gap-1.5 h-5">
      <div className="flex-1 h-1.5 bg-gray-50 rounded-full border border-border overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-400 font-mono w-8 text-right">
        {Math.round(score * 100)}%
      </span>
    </div>
  )
}

function DeltaBadge({ delta, label }: { delta: number; label: string }) {
  const pts = Math.round(delta * 100)
  if (pts === 0) return (
    <span className="text-xs text-gray-400 font-mono">±0 {label}</span>
  )
  return (
    <span className={`text-xs font-mono font-medium ${pts > 0 ? "text-emerald-400" : "text-red-400"}`}>
      {pts > 0 ? "+" : ""}{pts}pts {label}
    </span>
  )
}

function DriverRow({ d, rank }: { d: DriverComparison; rank: number }) {
  const [expanded, setExpanded] = useState(false)
  const topicCfg = TOPIC_CONFIG[d.topic as keyof typeof TOPIC_CONFIG] ?? TOPIC_CONFIG.Governance
  const badge = UNIQUENESS_BADGE[d.uniqueness]

  return (
    <div
      className="border-t border-border py-3 cursor-pointer hover:bg-gray-50 transition-colors px-1 -mx-1 rounded"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="grid grid-cols-[auto_1fr_auto] gap-3 items-start">
        {/* Left: rank + topic + name */}
        <div className="flex items-start gap-2 min-w-0">
          <span className="shrink-0 w-5 h-5 rounded-full bg-gray-50 border border-border text-xs text-gray-500 flex items-center justify-center font-mono mt-0.5">
            {rank}
          </span>
          <span className={`shrink-0 w-5 h-5 rounded border text-xs font-bold flex items-center justify-center mt-0.5 ${topicCfg.bg} ${topicCfg.color}`}>
            {topicCfg.abbr}
          </span>
          <div className="min-w-0">
            <p className="text-sm text-gray-800 font-medium leading-tight truncate">{d.driver}</p>
            {badge && (
              <span className={`inline-flex mt-0.5 items-center text-[10px] font-medium px-1.5 py-0.5 rounded border ${badge.cls}`}>
                {badge.label}
              </span>
            )}
          </div>
        </div>

        {/* Middle: three bars */}
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-gray-400 w-11 shrink-0">Company</span>
            <Bar score={d.company_score} color="bg-white/70" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-gray-400 w-11 shrink-0">Peers</span>
            <Bar score={d.peer_median} color="bg-blue-500/60" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-gray-400 w-11 shrink-0">FTSE 100</span>
            <Bar score={d.ftse100_median} color="bg-gray-500/50" />
          </div>
        </div>

        {/* Right: deltas */}
        <div className="text-right space-y-1 shrink-0">
          <DeltaBadge delta={d.divergence_from_peer} label="vs peers" />
          <div />
          <DeltaBadge delta={d.divergence_from_ftse} label="vs FTSE" />
          <p className="text-[10px] text-gray-400">σ={d.spread.toFixed(3)}</p>
        </div>
      </div>

      {/* Expandable: why it differs */}
      {expanded && (
        <div className="mt-2 ml-8 pl-3 border-l border-border">
          <p className="text-xs text-gray-400 leading-relaxed">{d.why}</p>
          <div className="flex gap-3 mt-1.5 text-[10px] text-gray-400">
            {d.peer_n > 0 && <span>{d.peer_n} FTSE peer{d.peer_n > 1 ? "s" : ""} with this driver</span>}
            {d.ftse100_n > 0 && <span>{d.ftse100_n} FTSE100 co. with this driver</span>}
          </div>
        </div>
      )}
    </div>
  )
}

function DriversMatrix({ all26 }: { all26: DriverComparison[] }) {
  const [open, setOpen] = useState(false)
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full text-xs text-gray-500 hover:text-gray-700 border border-border rounded-lg py-2 transition-colors"
      >
        Show all 26 SASB drivers ↓
      </button>
    )
  }

  const byTopic: Record<string, DriverComparison[]> = {}
  for (const d of all26) {
    if (!byTopic[d.topic]) byTopic[d.topic] = []
    byTopic[d.topic].push(d)
  }

  return (
    <div className="space-y-4">
      {Object.entries(byTopic).map(([topic, drivers]) => {
        const cfg = TOPIC_CONFIG[topic as keyof typeof TOPIC_CONFIG] ?? TOPIC_CONFIG.Governance
        return (
          <div key={topic}>
            <p className={`text-xs font-semibold mb-2 ${cfg.color}`}>{topic}</p>
            <div className="space-y-1">
              {drivers.map((d) => {
                const co = d.company_score !== null ? `${Math.round(d.company_score * 100)}%` : "—"
                const pm = d.peer_median !== null ? `${Math.round(d.peer_median * 100)}%` : "—"
                const fm = d.ftse100_median !== null ? `${Math.round(d.ftse100_median * 100)}%` : "—"
                const badge = UNIQUENESS_BADGE[d.uniqueness]
                return (
                  <div key={d.driver} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 text-xs items-center py-1 border-t border-border/50">
                    <span className="text-gray-400 truncate">{d.driver}</span>
                    <span className="font-mono text-gray-900 w-8 text-right">{co}</span>
                    <span className="font-mono text-blue-400 w-8 text-right">{pm}</span>
                    <span className="font-mono text-gray-500 w-8 text-right">{fm}</span>
                    {badge
                      ? <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${badge.cls} whitespace-nowrap`}>{badge.label}</span>
                      : <span className="w-14" />
                    }
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
      <button
        onClick={() => setOpen(false)}
        className="text-xs text-gray-400 hover:text-gray-400 transition-colors"
      >
        Collapse ↑
      </button>
    </div>
  )
}

export function MaterialityComparisonView({ comparison }: Props) {
  const instLevel = instabilityLevel(comparison.three_body_instability)
  const instCfg = INSTABILITY_CONFIG[instLevel]

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-800">Driver Materiality — Three-Body Comparison</h3>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            How <span className="text-gray-900">{comparison.company_name}</span>'s 8 highest-weighted SASB drivers compare against the{" "}
            <span className="text-blue-400">{comparison.ftse_industry}</span> peer group ({comparison.peer_count} FTSE100 co.)
            and the <span className="text-gray-400">full FTSE100 benchmark</span> (79 co.).
            Click any row to see why it diverges.
          </p>
        </div>
        <div className={`shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${instCfg.cls}`}>
          <span>{instCfg.label}</span>
          <span className="opacity-50">·</span>
          <span className="font-mono">σ={comparison.three_body_instability.toFixed(3)}</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-1.5 rounded-full bg-white/70 inline-block" />
          Company score
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-1.5 rounded-full bg-blue-500/60 inline-block" />
          {comparison.ftse_industry} peers
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-1.5 rounded-full bg-gray-500/50 inline-block" />
          FTSE100 avg
        </span>
        <span className="ml-2 text-gray-400">Bars show financial materiality weight (0–100%)</span>
      </div>

      {/* 8 driver rows */}
      <div>
        {comparison.top_8.map((d, i) => (
          <DriverRow key={d.driver} d={d} rank={i + 1} />
        ))}
      </div>

      {/* Unique / gap summary */}
      {(comparison.unique_to_company.length > 0 || comparison.unique_to_peers.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {comparison.unique_to_company.length > 0 && (
            <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 space-y-1">
              <p className="text-xs font-medium text-amber-400">Unique to {comparison.ticker}</p>
              <p className="text-xs text-gray-500">
                Drivers material for this company but absent from FTSE100 {comparison.ftse_industry} peers:
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {comparison.unique_to_company.map((d) => (
                  <span key={d} className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}
          {comparison.unique_to_peers.length > 0 && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 space-y-1">
              <p className="text-xs font-medium text-red-400">Disclosure gap vs peers</p>
              <p className="text-xs text-gray-500">
                Drivers material for FTSE100 peers but absent from {comparison.ticker}:
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {comparison.unique_to_peers.map((d) => (
                  <span key={d} className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-300 px-1.5 py-0.5 rounded">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Instability explanation */}
      <div className="rounded-lg border border-border bg-gray-50 px-4 py-3 space-y-1.5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Why materiality differs within a sector</p>
        <p className="text-xs text-gray-400 leading-relaxed">
          Even companies in the same sector can have radically different driver weights — this is the core of the three-body problem
          applied to ESG materiality. Business model differences (e.g., upstream vs downstream exposure), geographic footprint,
          regulatory jurisdiction, and past controversies all shift which SASB drivers are financially material.
          When a company's driver profile diverges from its peer group, it signals either a unique risk exposure or a
          disclosure gap — both are actionable investment signals.
        </p>
        <p className="text-xs text-gray-400 pt-1 border-t border-border">
          Source: Maxwell Data FTSE100 Financial Materiality Survey (March 2025) ·
          SASB Standards Taxonomy · Berg et al. "Aggregate Confusion" (2022)
        </p>
      </div>

      {/* Full 26-driver matrix (collapsible) */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <p className="text-xs text-gray-500">All 26 SASB Drivers</p>
          <div className="flex gap-3 text-[10px] text-gray-400">
            <span className="text-gray-900">Company</span>
            <span className="text-blue-400">Peers</span>
            <span className="text-gray-500">FTSE100</span>
          </div>
        </div>
        <DriversMatrix all26={comparison.all_26} />
      </div>
    </div>
  )
}
