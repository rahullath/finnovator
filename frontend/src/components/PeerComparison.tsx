// Full pairwise driver comparison panel — shows when a peer card is clicked.
// Displays common drivers (side-by-side bars), unique drivers, auto explanation, and score summary.

import type { PairComparison } from "../data/embedded"

interface Props {
  pair:      PairComparison
  onClose:   () => void
}

const PILLAR_BG: Record<string, string> = { E: "#2f7d8a", S: "#7a5ea8", G: "#8a6d2f" }
const PILLAR_FG: Record<string, string> = { E: "#ffffff", S: "#ffffff", G: "#ffffff" }

function ScoreChip({ label, value, max = 100 }: { label: string; value: number; max?: number }) {
  const color = value >= 70 ? "#2f7d8a" : value >= 50 ? "#8a6d2f" : "#c0492f"
  const bg    = value >= 70 ? "rgba(47,125,138,0.10)" : value >= 50 ? "rgba(138,109,47,0.10)" : "rgba(192,73,47,0.10)"
  return (
    <div className="text-center" style={{ minWidth: 56 }}>
      <div className="font-mono text-[17px] font-bold" style={{ color }}>{value}</div>
      <div className="font-mono text-[9px] uppercase tracking-wider mt-0.5" style={{ color: "#9a9a9a" }}>{label}</div>
      <div className="h-1 rounded-full mt-1.5 overflow-hidden" style={{ background: "#f0f0f0" }}>
        <div className="h-full rounded-full" style={{ width: `${(value / max) * 100}%`, background: color }} />
      </div>
    </div>
  )
}

export function PeerComparison({ pair, onClose }: Props) {
  const { companyA, companyB, common, onlyA, onlyB, overlapCount, divergenceScore, explanation } = pair

  const sameSector = companyA.sector === companyB.sector

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ border: "1px solid #ededed", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}
    >

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ padding: "20px 26px 18px", borderBottom: "1px solid #ededed" }}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="label-upper mb-2">Head-to-head driver comparison</div>
            <h2 className="text-[20px] font-semibold tracking-tight leading-tight">
              {companyA.name} <span style={{ color: "#9a9a9a" }}>vs</span> {companyB.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 text-[11px] font-medium px-3 py-1.5 rounded-lg"
            style={{ background: "#f4f4f4", color: "#707070", border: "1px solid #ededed" }}
          >
            Close
          </button>
        </div>

        {/* Score comparison row */}
        <div className="flex items-center gap-6 mt-4 pt-4 flex-wrap" style={{ borderTop: "1px solid #f0f0f0" }}>
          {/* Company A scores */}
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs font-semibold px-2 py-1 rounded-md" style={{ background: "#fafafa", border: "1px solid #ededed", color: "#171717" }}>{companyA.ticker}</span>
            <div className="flex gap-3">
              <ScoreChip label="Integrity" value={companyA.integrity} />
              <ScoreChip label="Impact"    value={companyA.impact} />
              <ScoreChip label="WEM"       value={companyA.wem} />
            </div>
          </div>

          {/* Divergence score */}
          <div className="flex-1 flex justify-center">
            <div className="text-center px-5">
              <div className="font-mono text-[22px] font-bold" style={{ color: divergenceScore > 60 ? "#c0492f" : divergenceScore > 30 ? "#8a6d2f" : "#2f7d8a" }}>
                {divergenceScore}%
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-wider mt-0.5" style={{ color: "#9a9a9a" }}>
                driver divergence
              </div>
              <div className="text-[10px] mt-1" style={{ color: "#b2b2b2" }}>
                {overlapCount}/8 overlap
                {sameSector ? " · same sector" : " · cross-sector"}
              </div>
            </div>
          </div>

          {/* Company B scores */}
          <div className="flex items-center gap-4 flex-row-reverse">
            <span className="font-mono text-xs font-semibold px-2 py-1 rounded-md" style={{ background: "#fafafa", border: "1px solid #ededed", color: "#171717" }}>{companyB.ticker}</span>
            <div className="flex gap-3 flex-row-reverse">
              <ScoreChip label="Integrity" value={companyB.integrity} />
              <ScoreChip label="Impact"    value={companyB.impact} />
              <ScoreChip label="WEM"       value={companyB.wem} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Common drivers ─────────────────────────────────────────────── */}
      {common.length > 0 && (
        <div style={{ padding: "20px 26px" }}>
          <h3 className="text-[13px] font-semibold mb-0.5">
            {overlapCount} risk topic{overlapCount !== 1 ? "s" : ""} in both top 8s
          </h3>
          <p className="text-[11.5px] mb-4" style={{ color: "#9a9a9a" }}>
            Dark bar = {companyA.ticker} · Lighter bar = {companyB.ticker} · Sorted by divergence
          </p>

          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #f0f0f0" }}>
            {common.map((d, i) => {
              const aW  = Math.round(d.scoreA * 100)
              const bW  = Math.round((d.scoreB ?? 0) * 100)
              const more = d.diff > 0 ? companyA.ticker : companyB.ticker
              const diffAbs = Math.round(Math.abs(d.diff) * 100)
              const diffColor = Math.abs(d.diff) > 0.05 ? "#c0492f" : "#9a9a9a"
              return (
                <div
                  key={d.driver}
                  style={{
                    padding: "13px 16px",
                    borderTop: i === 0 ? "none" : "1px solid #f4f4f4",
                  }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="inline-flex items-center justify-center rounded shrink-0"
                      style={{ width: 18, height: 18, fontSize: 9.5, fontWeight: 700, background: PILLAR_BG[d.pillar], color: PILLAR_FG[d.pillar] }}
                    >
                      {d.pillar}
                    </span>
                    <span className="text-[13px] font-medium" style={{ color: "#171717" }}>{d.driver}</span>
                    {diffAbs > 0 && (
                      <span className="font-mono text-[10.5px] font-semibold ml-auto" style={{ color: diffColor }}>
                        {more} +{diffAbs} pts
                      </span>
                    )}
                  </div>

                  {/* Stacked bars */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-10 font-mono text-[10px] text-right shrink-0" style={{ color: "#707070" }}>{companyA.ticker}</span>
                      <div className="flex-1 relative h-4 rounded-md overflow-hidden" style={{ background: "#f6f6f6" }}>
                        <div className="absolute inset-y-0 left-0 rounded-md" style={{ width: `${aW}%`, background: "#171717" }} />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px]" style={{ color: aW > 45 ? "#fff" : "#707070" }}>{aW}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="w-10 font-mono text-[10px] text-right shrink-0" style={{ color: "#707070" }}>{companyB.ticker}</span>
                      <div className="flex-1 relative h-4 rounded-md overflow-hidden" style={{ background: "#f6f6f6" }}>
                        <div className="absolute inset-y-0 left-0 rounded-md" style={{ width: `${bW}%`, background: "#c7c7c7" }} />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10px]" style={{ color: bW > 45 ? "#fff" : "#707070" }}>{bW}</span>
                      </div>
                    </div>
                  </div>

                  {/* Driver explanation */}
                  <p className="text-[11.5px] mt-1.5 ml-[52px] leading-relaxed" style={{ color: "#9a9a9a" }}>
                    {d.explanation}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Unique drivers ─────────────────────────────────────────────── */}
      {(onlyA.length > 0 || onlyB.length > 0) && (
        <div style={{ padding: "0 26px 20px" }}>
          <div className="grid grid-cols-2 gap-3">

            {/* Only in A */}
            <div className="rounded-xl p-4" style={{ background: "#fafafa", border: "1px solid #ededed" }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded" style={{ background: "#171717", color: "#fff" }}>
                  {companyA.ticker}
                </span>
                <span className="text-[12px] font-medium" style={{ color: "#171717" }}>only</span>
              </div>
              {onlyA.length === 0 && <p className="text-xs" style={{ color: "#9a9a9a" }}>No unique top-8 drivers</p>}
              <div className="space-y-3">
                {onlyA.map(d => {
                  const rawB = d.scoreB
                  return (
                    <div key={d.driver}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className="inline-flex items-center justify-center rounded shrink-0"
                          style={{ width: 15, height: 15, fontSize: 8.5, fontWeight: 700, background: PILLAR_BG[d.pillar], color: "#fff" }}
                        >
                          {d.pillar}
                        </span>
                        <span className="text-[12.5px] font-medium" style={{ color: "#171717" }}>{d.driver}</span>
                        <span className="font-mono text-[11px] ml-auto" style={{ color: "#707070" }}>{Math.round(d.scoreA*100)}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed" style={{ color: "#9a9a9a", marginLeft: 20 }}>
                        {d.explanation}
                        {rawB != null && (
                          <span style={{ color: "#b2b2b2" }}> ({companyB.ticker} raw: {Math.round(rawB*100)})</span>
                        )}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Only in B */}
            <div className="rounded-xl p-4" style={{ background: "#fafafa", border: "1px solid #ededed" }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded" style={{ background: "#9a9a9a", color: "#fff" }}>
                  {companyB.ticker}
                </span>
                <span className="text-[12px] font-medium" style={{ color: "#171717" }}>only</span>
              </div>
              {onlyB.length === 0 && <p className="text-xs" style={{ color: "#9a9a9a" }}>No unique top-8 drivers</p>}
              <div className="space-y-3">
                {onlyB.map(d => {
                  const scoreB = d.scoreB ?? 0
                  return (
                    <div key={d.driver}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span
                          className="inline-flex items-center justify-center rounded shrink-0"
                          style={{ width: 15, height: 15, fontSize: 8.5, fontWeight: 700, background: PILLAR_BG[d.pillar], color: "#fff" }}
                        >
                          {d.pillar}
                        </span>
                        <span className="text-[12.5px] font-medium" style={{ color: "#171717" }}>{d.driver}</span>
                        <span className="font-mono text-[11px] ml-auto" style={{ color: "#707070" }}>{Math.round(scoreB*100)}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed" style={{ color: "#9a9a9a", marginLeft: 20 }}>
                        {d.explanation}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Explanation ─────────────────────────────────────────────────── */}
      <div style={{ padding: "20px 26px 22px", background: "#1c1c1c" }}>
        <div className="flex items-start gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: "#3ecf8e", display: "block" }} />
          <div>
            <p className="text-[14px] leading-relaxed mb-3" style={{ color: "#ededed" }}>{explanation}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: "#9a9a9a" }}>{companyA.ticker} · {companyA.sasb}</p>
                <p className="text-[11.5px] leading-relaxed" style={{ color: "#c0c0c0" }}>{companyA.desc}</p>
              </div>
              <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: "#9a9a9a" }}>{companyB.ticker} · {companyB.sasb}</p>
                <p className="text-[11.5px] leading-relaxed" style={{ color: "#c0c0c0" }}>{companyB.desc}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <div style={{ padding: "12px 26px", borderTop: "1px solid #2a2a2a", background: "#1c1c1c" }}>
        <p className="font-mono text-[10.5px]" style={{ color: "#8a8a8a" }}>
          Materiality importance scores: Maxwell Data FTSE 100 survey (March 2025) · Jangani, Date &amp; Tucker (SSRN 5618192, 2026) · Descriptive; not an ESG rating.
        </p>
      </div>
    </div>
  )
}
