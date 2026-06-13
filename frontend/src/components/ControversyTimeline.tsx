import type { Controversy } from "../types"

interface Props {
  controversies: Controversy[]
}

const SEVERITY_CONFIG = {
  high:   { dot: "bg-red-500",    text: "text-red-400",    label: "High" },
  medium: { dot: "bg-yellow-500", text: "text-yellow-400", label: "Medium" },
  low:    { dot: "bg-gray-500",   text: "text-gray-400",   label: "Low" },
}

export function ControversyTimeline({ controversies }: Props) {
  const sorted = [...controversies].sort(
    (a, b) => new Date(b.incident_date).getTime() - new Date(a.incident_date).getTime()
  )

  if (sorted.length === 0) {
    return (
      <div className="text-sm text-gray-500 py-4 text-center">
        No ESG controversies found in the 36-month lookback window.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-800">Controversy Timeline</h3>
      <div className="relative space-y-0">
        {sorted.map((c, i) => {
          const cfg = SEVERITY_CONFIG[c.severity]
          return (
            <div key={i} className="flex gap-3 relative pb-4">
              <div className="flex flex-col items-center">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${cfg.dot}`} />
                {i < sorted.length - 1 && (
                  <div className="w-px flex-1 bg-border mt-1" />
                )}
              </div>
              <div className="flex-1 min-w-0 pb-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-gray-800 leading-snug">{c.headline}</p>
                  <span className={`shrink-0 text-xs font-medium ${cfg.text}`}>{cfg.label}</span>
                </div>
                <div className="flex gap-2 mt-1 text-xs text-gray-500">
                  <span>{c.incident_date}</span>
                  <span>·</span>
                  <span className="capitalize">{c.esg_category}</span>
                  <span>·</span>
                  <span>{c.source_outlet}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
