interface Props {
  score: number
  label: string
  color: string
  size?: number
}

const COLOR_MAP: Record<string, { stroke: string; glow: string; text: string }> = {
  green:  { stroke: "#22c55e", glow: "rgba(34,197,94,0.15)",  text: "text-green-400" },
  blue:   { stroke: "#3b82f6", glow: "rgba(59,130,246,0.15)", text: "text-blue-400" },
  yellow: { stroke: "#eab308", glow: "rgba(234,179,8,0.15)",  text: "text-yellow-400" },
  red:    { stroke: "#ef4444", glow: "rgba(239,68,68,0.15)",  text: "text-red-400" },
  gray:   { stroke: "#6b7280", glow: "rgba(107,114,128,0.15)", text: "text-gray-400" },
}

export function ScoreDial({ score, label, color, size = 140 }: Props) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.gray
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.38
  const strokeWidth = size * 0.07

  // Arc spans 240° (from 150° to 390°), starting bottom-left
  const startAngle = 150
  const totalDegrees = 240
  const filledDegrees = (score / 100) * totalDegrees

  function polarToXY(deg: number) {
    const rad = ((deg - 90) * Math.PI) / 180
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    }
  }

  function describeArc(startDeg: number, endDeg: number) {
    const start = polarToXY(startDeg)
    const end = polarToXY(endDeg)
    const largeArc = endDeg - startDeg > 180 ? 1 : 0
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <filter id={`glow-${label}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Track */}
          <path
            d={describeArc(startAngle, startAngle + totalDegrees)}
            fill="none"
            stroke="#21262d"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          {/* Fill */}
          {score > 0 && (
            <path
              d={describeArc(startAngle, startAngle + filledDegrees)}
              fill="none"
              stroke={c.stroke}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              filter={`url(#glow-${label})`}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold ${c.text}`} style={{ fontSize: size * 0.22 }}>
            {Math.round(score)}
          </span>
          <span className="text-gray-500" style={{ fontSize: size * 0.08 }}>/ 100</span>
        </div>
      </div>
      <span className="text-sm font-medium text-gray-300">{label}</span>
    </div>
  )
}
