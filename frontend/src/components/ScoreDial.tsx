interface Props {
  score: number
  label: string
  color: string
  size?: number
  sublabel?: string
}

const COLOR_MAP: Record<string, { stroke: string; glow: string; text: string; track: string }> = {
  green:  { stroke: "#16a34a", glow: "rgba(22,163,74,0.18)",   text: "text-forest-700", track: "#dcfce7" },
  blue:   { stroke: "#2563eb", glow: "rgba(37,99,235,0.18)",   text: "text-blue-700",   track: "#dbeafe" },
  yellow: { stroke: "#d97706", glow: "rgba(217,119,6,0.18)",   text: "text-amber-700",  track: "#fef3c7" },
  red:    { stroke: "#dc2626", glow: "rgba(220,38,38,0.18)",   text: "text-red-700",    track: "#fee2e2" },
  gray:   { stroke: "#6b7280", glow: "rgba(107,114,128,0.15)", text: "text-gray-500",   track: "#f3f4f6" },
}

export function ScoreDial({ score, label, color, size = 140, sublabel }: Props) {
  const c = COLOR_MAP[color] ?? COLOR_MAP.gray
  const cx = size / 2
  const cy = size / 2
  const r = size * 0.38
  const strokeWidth = size * 0.07

  const startAngle = 150
  const totalDegrees = 240
  const filledDegrees = (score / 100) * totalDegrees

  function polarToXY(deg: number) {
    const rad = ((deg - 90) * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  function describeArc(startDeg: number, endDeg: number) {
    const start = polarToXY(startDeg)
    const end = polarToXY(endDeg)
    const largeArc = endDeg - startDeg > 180 ? 1 : 0
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <defs>
            <filter id={`glow-${label.replace(/\s/g, "")}`}>
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
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
            stroke={c.track}
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
              filter={`url(#glow-${label.replace(/\s/g, "")})`}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold font-mono ${c.text}`} style={{ fontSize: size * 0.22 }}>
            {Math.round(score)}
          </span>
          <span className="text-gray-400" style={{ fontSize: size * 0.09 }}>/ 100</span>
        </div>
      </div>
      <div className="text-center">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
      </div>
    </div>
  )
}
