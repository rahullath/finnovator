/**
 * Three-body triangle diagram.
 * Three vertices represent: Market Label (ESG avg) / Signal Quality (peer rank) / Material Reality (FTSE WEM percentile).
 * The weighted centroid shows where "consensus" sits.
 * Distance from centroid to each vertex = instability contribution.
 */
interface Props {
  body1_esg: number          // 0–100 — Market Label
  body2_peer: number         // 0–100 — Signal Quality (peer rank normalised)
  body3_ftse: number         // 0–100 — Material Reality (FTSE 100 percentile)
  instability_score: number
  instability_verdict: "severe" | "moderate" | "low"
  ticker: string
}

const W = 320
const H = 240

// Equilateral triangle vertices
const V1 = { x: W / 2, y: 22 }                // top: Market Label
const V2 = { x: 28, y: H - 20 }               // bottom-left: Signal Quality
const V3 = { x: W - 28, y: H - 20 }           // bottom-right: Material Reality

function lerp(a: { x: number; y: number }, b: { x: number; y: number }, t: number) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
}

function weightedCentroid(b1: number, b2: number, b3: number) {
  const total = b1 + b2 + b3 || 300
  return {
    x: (V1.x * b1 + V2.x * b2 + V3.x * b3) / total,
    y: (V1.y * b1 + V2.y * b2 + V3.y * b3) / total,
  }
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
}

const VERDICT_COLOR = {
  severe: { ring: "#fca5a5", dot: "#dc2626", label: "text-red-700 bg-red-50 border-red-200" },
  moderate: { ring: "#fcd34d", dot: "#d97706", label: "text-amber-700 bg-amber-50 border-amber-200" },
  low: { ring: "#86efac", dot: "#16a34a", label: "text-forest-800 bg-forest-50 border-forest-200" },
}

export function ThreeBodyVenn({ body1_esg, body2_peer, body3_ftse, instability_score, instability_verdict, ticker }: Props) {
  const centroid = weightedCentroid(body1_esg, body2_peer, body3_ftse)
  const vc = VERDICT_COLOR[instability_verdict]

  const bodies = [
    { vertex: V1, score: body1_esg, label: "Market Label", sublabel: "avg ESG score", color: "#3b82f6", fill: "#eff6ff", text: "#1d4ed8" },
    { vertex: V2, score: body2_peer, label: "Signal Quality", sublabel: "peer rank", color: "#8b5cf6", fill: "#f5f3ff", text: "#5b21b6" },
    { vertex: V3, score: body3_ftse, label: "Material Reality", sublabel: "FTSE WEM pct", color: "#d97706", fill: "#fffbeb", text: "#92400e" },
  ]

  // Arm length from centroid to each vertex (shows tension)
  const armLengths = bodies.map((b) => dist(centroid, b.vertex))
  const maxArm = Math.max(...armLengths, 1)

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Signal Convergence</h3>
          <p className="text-xs text-gray-500 mt-0.5 max-w-xs">
            Three forces evaluate {ticker} simultaneously.
            When they diverge, no stable orbit exists — ESG ratings correlate at only 0.38–0.71 across providers.
          </p>
        </div>
        <div className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${vc.label}`}>
          <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: vc.dot }} />
          σ {instability_score.toFixed(1)}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start gap-4">
        {/* Triangle diagram */}
        <svg viewBox={`0 0 ${W} ${H}`} className="w-56 h-auto shrink-0">
          {/* Background triangle fill */}
          <polygon
            points={`${V1.x},${V1.y} ${V2.x},${V2.y} ${V3.x},${V3.y}`}
            fill="#f9fafb"
            stroke="#e5e7eb"
            strokeWidth="1"
          />

          {/* Tension arms from centroid to vertices */}
          {bodies.map((b, i) => (
            <line
              key={i}
              x1={centroid.x} y1={centroid.y}
              x2={b.vertex.x} y2={b.vertex.y}
              stroke={b.color}
              strokeWidth="1.5"
              strokeDasharray="4,3"
              opacity="0.5"
            />
          ))}

          {/* Vertex circles */}
          {bodies.map((b, i) => {
            const r = 14 + (b.score / 100) * 8  // size proportional to score
            return (
              <g key={i}>
                <circle cx={b.vertex.x} cy={b.vertex.y} r={r} fill={b.fill} stroke={b.color} strokeWidth="2" />
                <text
                  x={b.vertex.x} y={b.vertex.y + 1}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize="11" fontWeight="700" fill={b.text}
                >
                  {Math.round(b.score)}
                </text>
              </g>
            )
          })}

          {/* Instability ring around centroid */}
          <circle
            cx={centroid.x} cy={centroid.y}
            r={12 + instability_score * 0.3}
            fill="none" stroke={vc.ring} strokeWidth="2" opacity="0.6"
          />

          {/* Consensus centroid dot */}
          <circle cx={centroid.x} cy={centroid.y} r={6} fill={vc.dot} opacity="0.9" />

          {/* Vertex labels */}
          {bodies.map((b, i) => {
            const labelOffset = { x: 0, y: 0 }
            if (i === 0) labelOffset.y = -24         // top → label above
            else if (i === 1) { labelOffset.x = -8; labelOffset.y = 16 }  // bottom-left
            else { labelOffset.x = 8; labelOffset.y = 16 }                // bottom-right
            const anchor = i === 0 ? "middle" : i === 1 ? "end" : "start"
            return (
              <text
                key={i}
                x={b.vertex.x + labelOffset.x}
                y={b.vertex.y + labelOffset.y}
                textAnchor={anchor}
                fontSize="9"
                fill="#6b7280"
                fontWeight="600"
              >
                {b.label}
              </text>
            )
          })}
        </svg>

        {/* Score breakdown cards */}
        <div className="flex-1 grid grid-cols-3 gap-2 w-full">
          {bodies.map((b) => (
            <div key={b.label} className="rounded-xl border p-3" style={{ borderColor: b.color + "33", background: b.fill }}>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: b.text }}>{b.label}</p>
              <p className="text-xs text-gray-500">{b.sublabel}</p>
              <p className="text-2xl font-bold font-mono mt-1" style={{ color: b.color }}>{Math.round(b.score)}<span className="text-xs font-normal text-gray-400">/100</span></p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
