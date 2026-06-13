/**
 * Shows how each material driver deviates from the peer group median.
 * Positive deviation = company weighs this driver more than peers.
 * Negative deviation = peers weigh this more than the company.
 * Also shows 3m and 12m direction (Leading / Stable / Lagging).
 */

export interface DriverDeviationData {
  driver: string
  category: string
  materiality_score: number
  peer_median: number
  deviation_from_peer: number
  deviation_from_ftse: number
  direction_3m: "leading" | "stable" | "lagging"
  direction_12m: "leading" | "stable" | "lagging"
  layman_explanation: string
  confidence: "high" | "medium" | "low"
}

interface Props {
  drivers: DriverDeviationData[]
  companyName: string
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  Environment: { bg: "bg-green-100", text: "text-green-800", dot: "bg-green-500" },
  Social:      { bg: "bg-blue-100",  text: "text-blue-800",  dot: "bg-blue-500" },
  Governance:  { bg: "bg-purple-100",text: "text-purple-800",dot: "bg-purple-500" },
}

function DirectionBadge({ dir }: { dir: "leading" | "stable" | "lagging" }) {
  if (dir === "leading") return <span className="dir-leading">↑ Leading</span>
  if (dir === "lagging") return <span className="dir-lagging">↓ Lagging</span>
  return <span className="dir-stable">→ Stable</span>
}

function DeviationBar({ value, maxAbs }: { value: number; maxAbs: number }) {
  const pct = Math.abs(value) / maxAbs * 100
  const isPositive = value >= 0
  return (
    <div className="flex items-center gap-2">
      {/* negative side */}
      <div className="flex-1 h-2 flex justify-end">
        {!isPositive && (
          <div
            className="h-full bg-red-400 rounded-l"
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        )}
      </div>
      {/* center line */}
      <div className="w-px h-3 bg-gray-300 shrink-0" />
      {/* positive side */}
      <div className="flex-1 h-2">
        {isPositive && (
          <div
            className="h-full bg-forest-500 rounded-r"
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        )}
      </div>
    </div>
  )
}

export function DriverDeviation({ drivers, companyName }: Props) {
  const maxAbs = Math.max(...drivers.map((d) => Math.abs(d.deviation_from_peer)), 0.01)
  const sorted = [...drivers].sort((a, b) => Math.abs(b.deviation_from_peer) - Math.abs(a.deviation_from_peer))

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-gray-900">Driver Deviation from Peers</h3>
        <p className="text-xs text-gray-500 mt-0.5">
          How {companyName}'s material driver weights compare to industry peer group.
          <span className="text-forest-700 font-medium"> Green bars</span> = company leads peers on this driver.
          <span className="text-red-600 font-medium"> Red bars</span> = peers weight this more.
        </p>
      </div>

      <div className="space-y-1">
        {/* Header */}
        <div className="grid grid-cols-[1fr_90px_80px_64px_64px] gap-2 px-2 text-xs text-gray-400 font-medium pb-1 border-b border-border">
          <span>Driver</span>
          <span className="text-center">vs Peers</span>
          <span className="text-center">Materiality</span>
          <span className="text-center">3m</span>
          <span className="text-center">12m</span>
        </div>

        {sorted.map((d, i) => {
          const cc = CATEGORY_COLORS[d.category] ?? CATEGORY_COLORS.Governance
          const deviationPct = (d.deviation_from_peer * 100).toFixed(1)
          const isPositive = d.deviation_from_peer >= 0

          return (
            <div
              key={d.driver}
              className="group grid grid-cols-[1fr_90px_80px_64px_64px] gap-2 items-center px-2 py-2 rounded-lg hover:bg-gray-50 cursor-default transition-colors"
              title={d.layman_explanation}
            >
              {/* Driver name + category */}
              <div className="flex items-start gap-2 min-w-0">
                <span className={`shrink-0 mt-0.5 text-xs px-1.5 py-0.5 rounded font-medium ${cc.bg} ${cc.text}`}>
                  {d.category[0]}
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-gray-800 font-medium leading-tight truncate">{d.driver}</p>
                  <p className="text-xs text-gray-400 truncate hidden group-hover:block">
                    {d.layman_explanation.slice(0, 60)}…
                  </p>
                </div>
              </div>

              {/* Deviation bar */}
              <div className="space-y-0.5">
                <DeviationBar value={d.deviation_from_peer} maxAbs={maxAbs} />
                <p className={`text-xs text-center font-mono font-medium ${isPositive ? "text-forest-700" : "text-red-600"}`}>
                  {isPositive ? "+" : ""}{deviationPct}%
                </p>
              </div>

              {/* Materiality score */}
              <div className="text-center">
                <span className="text-sm font-mono font-semibold text-gray-800">
                  {(d.materiality_score * 100).toFixed(0)}%
                </span>
              </div>

              {/* Direction badges */}
              <div className="text-center">
                <DirectionBadge dir={d.direction_3m} />
              </div>
              <div className="text-center">
                <DirectionBadge dir={d.direction_12m} />
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-gray-400 pt-1 border-t border-border">
        Deviation = company materiality score minus industry peer median.
        Direction forecast uses 26-week momentum per Jangani et al. (SSRN 5618192, 2026).
      </p>
    </div>
  )
}
