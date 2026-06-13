import type { QuadrantColor } from "../types"

interface Props {
  label: string
  color: QuadrantColor
  actionLabel: string
  placeboRisk: boolean
  large?: boolean
}

const STYLES: Record<QuadrantColor, string> = {
  green:  "bg-forest-100 text-forest-800 border-forest-200",
  blue:   "bg-blue-100 text-blue-800 border-blue-200",
  yellow: "bg-amber-100 text-amber-800 border-amber-200",
  red:    "bg-red-100 text-red-800 border-red-200",
}

const ICONS: Record<QuadrantColor, string> = {
  green: "↑", blue: "↔", yellow: "?", red: "⚠",
}

export function QuadrantBadge({ label, color, actionLabel, placeboRisk, large }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border font-medium ${STYLES[color]} ${large ? "text-base" : "text-sm"}`}>
        <span>{ICONS[color]}</span>
        <span>{label}</span>
      </div>
      <p className="text-xs text-gray-500 max-w-xs">{actionLabel}</p>
      {placeboRisk && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 max-w-xs">
          <span className="text-red-600 text-xs mt-0.5">⚠</span>
          <p className="text-xs text-red-700">
            <span className="font-semibold">Placebo Risk:</span> High ESG branding with low measurable impact — the "dangerous placebo" pattern identified by Tariq Fancy.
          </p>
        </div>
      )}
    </div>
  )
}
