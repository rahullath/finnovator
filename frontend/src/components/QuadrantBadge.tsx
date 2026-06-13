import type { QuadrantColor } from "../types"

interface Props {
  label: string
  color: QuadrantColor
  actionLabel: string
  placeboRisk: boolean
  large?: boolean
}

const STYLES: Record<QuadrantColor, string> = {
  green:  "bg-green-500/10 text-green-400 border-green-500/30",
  blue:   "bg-blue-500/10 text-blue-400 border-blue-500/30",
  yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  red:    "bg-red-500/10 text-red-400 border-red-500/30",
}

const ICONS: Record<QuadrantColor, string> = {
  green: "↑",
  blue: "↔",
  yellow: "?",
  red: "⚠",
}

export function QuadrantBadge({ label, color, actionLabel, placeboRisk, large }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-medium ${STYLES[color]} ${large ? "text-base" : "text-sm"}`}>
        <span>{ICONS[color]}</span>
        <span>{label}</span>
      </div>
      <p className="text-xs text-gray-400 max-w-xs">{actionLabel}</p>
      {placeboRisk && (
        <div className="flex items-start gap-2 bg-red-500/5 border border-red-500/20 rounded-lg px-3 py-2 max-w-xs">
          <span className="text-red-400 text-xs mt-0.5">⚠</span>
          <p className="text-xs text-red-400">
            <span className="font-semibold">Placebo Risk:</span> High ESG branding with low measurable impact — the "dangerous placebo" pattern identified by Tariq Fancy.
          </p>
        </div>
      )}
    </div>
  )
}
