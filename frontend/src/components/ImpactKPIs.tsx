import type { ImpactKPI } from "../types"

interface Props {
  kpis: ImpactKPI[]
  sector: string
}

const TREND_CONFIG = {
  improving: { icon: "↑", class: "text-green-400" },
  flat:      { icon: "→", class: "text-yellow-400" },
  worsening: { icon: "↓", class: "text-red-400" },
}

function KPIBar({ kpi }: { kpi: ImpactKPI }) {
  const t = TREND_CONFIG[kpi.trend]
  const barColor = kpi.kpi_score >= 70 ? "#22c55e" : kpi.kpi_score >= 40 ? "#eab308" : "#ef4444"

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span className={`font-medium ${t.class}`}>{t.icon}</span>
          <span className="text-gray-700 font-medium">{kpi.kpi_label}</span>
        </div>
        <span className="text-gray-500 font-mono">
          {kpi.kpi_value} {kpi.kpi_unit}
        </span>
      </div>
      <div className="relative h-2 bg-gray-50 rounded-full border border-border overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
          style={{ width: `${kpi.kpi_score}%`, background: barColor }}
        />
        {/* Sector median marker */}
        <div
          className="absolute top-0 h-full w-px bg-gray-400 opacity-50"
          style={{ left: `${kpi.sector_median_score}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <span>0</span>
        <span className="text-gray-500">▲ sector median</span>
        <span>100</span>
      </div>
    </div>
  )
}

export function ImpactKPIs({ kpis, sector }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">Sector Impact KPIs</h3>
        <span className="text-xs text-gray-500 capitalize">{sector} · materiality-weighted</span>
      </div>
      <div className="space-y-4">
        {kpis.map((kpi) => (
          <KPIBar key={kpi.kpi_name} kpi={kpi} />
        ))}
      </div>
    </div>
  )
}
