interface Props {
  score: number
  label: string
  color: string
  size?: number
  sublabel?: string
}

const COLOR_MAP: Record<string, { stroke: string; text: string }> = {
  green:  { stroke: "#2f7d8a", text: "#2f7d8a" },
  blue:   { stroke: "#2f7d8a", text: "#2f7d8a" },
  yellow: { stroke: "#8a6d2f", text: "#8a6d2f" },
  red:    { stroke: "#c0492f", text: "#c0492f" },
  gray:   { stroke: "#c7c7c7", text: "#9a9a9a" },
}

export function ScoreDial({ score, label, color, size = 140, sublabel }: Props) {
  const c  = COLOR_MAP[color] ?? COLOR_MAP.gray
  const cx = size / 2
  const cy = size / 2
  const r  = size * 0.38
  const sw = size * 0.07

  const startAngle    = 150
  const totalDegrees  = 240
  const filledDegrees = (score / 100) * totalDegrees

  function polarToXY(deg: number) {
    const rad = ((deg - 90) * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  function describeArc(startDeg: number, endDeg: number) {
    const start    = polarToXY(startDeg)
    const end      = polarToXY(endDeg)
    const largeArc = endDeg - startDeg > 180 ? 1 : 0
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <path d={describeArc(startAngle, startAngle + totalDegrees)} fill="none" stroke="#f0f0f0" strokeWidth={sw} strokeLinecap="round" />
          {score > 0 && (
            <path d={describeArc(startAngle, startAngle + filledDegrees)} fill="none" stroke={c.stroke} strokeWidth={sw} strokeLinecap="round" />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-bold font-mono" style={{ fontSize: size * 0.22, color: c.text }}>{Math.round(score)}</span>
          <span style={{ fontSize: size * 0.09, color: "#9a9a9a" }}>/ 100</span>
        </div>
      </div>
      <div className="text-center">
        <span className="text-sm font-semibold text-ink">{label}</span>
        {sublabel && <p className="text-xs text-faint mt-0.5">{sublabel}</p>}
      </div>
    </div>
  )
}
