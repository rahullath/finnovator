// Comparison Card — full-page card view, ported from the Navigator's card layout.
// Shows: header, ranking table (company vs sector vs FTSE100), why-different, momentum, action hint.

import type { FTSEProfile, CompanyScore, MaterialityComparison } from "../types"

interface Props {
  profile:     FTSEProfile
  score:       CompanyScore | null
  comparison:  MaterialityComparison | null
}

const PILLAR_BG: Record<string, string> = { E: "#2f7d8a", S: "#7a5ea8", G: "#8a6d2f" }
const PILLAR_MAP: Record<string, string> = {
  Environment: "E", Social: "S", Governance: "G",
}

const DIR = {
  leading: { icon: "▲", word: "rising",  color: "#2f7d8a", bg: "rgba(47,125,138,0.10)" },
  stable:  { icon: "►", word: "stable",  color: "#9a9a9a", bg: "#f4f4f4" },
  lagging: { icon: "▼", word: "falling", color: "#c0492f", bg: "rgba(192,73,47,0.10)" },
}

export function ComparisonCard({ profile, score, comparison }: Props) {
  const rows = profile.top_8_drivers.map((d, i) => {
    const pil     = PILLAR_MAP[d.category] ?? "G"
    const your    = Math.round(d.materiality_score * 100)
    const sAvg    = Math.round(d.peer_median * 100)
    const fAvg    = Math.round(d.ftse100_median * 100)
    const diff    = your - sAvg
    const dir     = DIR[d.direction_3m]
    return { ...d, pil, your, sAvg, fAvg, diff, dir, rank: i + 1 }
  })

  // Top 3 by absolute deviation from sector avg
  const whyDiff = [...rows]
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
    .slice(0, 3)

  const trendMini = rows.slice(0, 5)

  const sectorLabel = profile.sector.charAt(0).toUpperCase() + profile.sector.slice(1)

  return (
    <div style={{ maxWidth: 960, margin: "6px auto 0" }}>
      <div
        className="overflow-hidden"
        style={{ border: "1px solid #e4e4e4", borderRadius: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
      >

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div style={{ padding: "26px 30px 22px", borderBottom: "1px solid #ededed" }}>
          <div className="label-upper mb-2.5">Material Driver Profile</div>
          <h1 className="text-[27px] font-semibold tracking-tight mb-2 leading-tight">
            {profile.name}
          </h1>
          <p className="text-[13.5px] mb-3.5" style={{ color: "#707070", lineHeight: 1.5 }}>
            The 8 sustainability topics that have most moved this company's share price, ranked by historical market sensitivity.
          </p>
          <div className="font-mono text-[11px]" style={{ color: "#8a8a8a", paddingTop: 13, borderTop: "1px solid #f0f0f0" }}>
            FTSE 100 &nbsp;·&nbsp; {sectorLabel} &nbsp;·&nbsp; Based on daily news data
            {score && (
              <>
                &nbsp;·&nbsp; Integrity {Math.round(score.integrity.integrity_score)}/100
                &nbsp;·&nbsp; WEM {Math.round(score.wem.wem_score)}/100
              </>
            )}
          </div>
        </div>

        {/* ── Intro ──────────────────────────────────────────────────────── */}
        <div style={{ padding: "17px 30px", background: "#fafafa", borderBottom: "1px solid #ededed" }}>
          <p className="text-[13px]" style={{ color: "#525252", lineHeight: 1.55, maxWidth: 780 }}>
            When news breaks about one of these topics, {profile.name}'s stock price has historically reacted more than it does to news on other sustainability issues. The higher the score, the stronger that link has been.
          </p>
        </div>

        {/* ── Ranking table ──────────────────────────────────────────────── */}
        <div style={{ padding: "22px 30px 24px" }}>
          <div className="flex items-baseline justify-between gap-3 flex-wrap mb-4">
            <h2 className="text-[15px] font-semibold">Top 8 material drivers</h2>
            <div className="flex items-center gap-4 text-[11px]" style={{ color: "#707070" }}>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-3.5 h-1.5 rounded-sm" style={{ background: "#171717" }} />
                this company
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-0.5 h-3" style={{ background: "#9a9a9a" }} />
                sector avg
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-full border" style={{ background: "#fff", borderColor: "#5f5f5f", borderWidth: 1.5 }} />
                FTSE 100 avg
              </span>
            </div>
          </div>

          {/* Column headers */}
          <div
            className="grid pb-2.5 border-b font-mono text-[10px] uppercase tracking-wide"
            style={{ gridTemplateColumns: "26px 1fr 150px 84px", gap: 14, padding: "0 4px 9px", borderColor: "#ededed", color: "#b2b2b2", fontWeight: 600 }}
          >
            <span>#</span>
            <span>Topic (score 0–100)</span>
            <span style={{ textAlign: "right" }}>Company / Sector / FTSE</span>
            <span style={{ textAlign: "right" }}>Trend</span>
          </div>

          {rows.map((r, i) => (
            <div
              key={r.driver}
              className="grid items-center"
              style={{
                gridTemplateColumns: "26px 1fr 150px 84px",
                gap: 14,
                padding: "13px 4px",
                borderTop: i === 0 ? "none" : "1px solid #f4f4f4",
              }}
            >
              {/* Rank */}
              <span className="font-mono text-xs font-semibold" style={{ color: "#9a9a9a" }}>{r.rank}</span>

              {/* Driver + bar */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className="inline-flex items-center justify-center rounded text-white shrink-0"
                    style={{ width: 18, height: 18, fontSize: 9.5, fontWeight: 700, background: PILLAR_BG[r.pil] }}
                  >
                    {r.pil}
                  </span>
                  <span className="text-[13px] font-medium" style={{ color: "#171717" }}>{r.driver}</span>
                </div>
                {/* Bar */}
                <div className="relative h-[22px] rounded-md" style={{ background: "#f6f6f6" }}>
                  {/* Company fill */}
                  <div
                    className="absolute inset-y-0 left-0 rounded-md"
                    style={{ width: `${r.your}%`, background: "#171717" }}
                  />
                  {/* Sector avg marker */}
                  <div
                    className="absolute top-[-2px] bottom-[-2px] w-[2px]"
                    style={{ left: `${r.sAvg}%`, background: "#9a9a9a" }}
                  />
                  {/* FTSE100 avg circle */}
                  <div
                    className="absolute rounded-full border"
                    style={{
                      left: `${r.fAvg}%`,
                      top: "50%",
                      transform: "translate(-50%,-50%)",
                      width: 9, height: 9,
                      background: "#fff", borderColor: "#5f5f5f", borderWidth: 1.5,
                    }}
                  />
                </div>
              </div>

              {/* Scores */}
              <div style={{ textAlign: "right" }}>
                <span className="font-mono text-[16px] font-semibold" style={{ color: "#171717" }}>{r.your}</span>
                <div className="font-mono text-[10.5px] mt-0.5" style={{ color: "#9a9a9a" }}>
                  S {r.sAvg} · F {r.fAvg}
                </div>
              </div>

              {/* Trend */}
              <div className="flex items-center justify-end gap-1.5">
                <span
                  className="text-xs font-semibold"
                  style={{ color: r.dir.color, background: r.dir.bg, padding: "3px 7px", borderRadius: 6 }}
                >
                  {r.dir.icon}
                </span>
                <span className="text-[11px]" style={{ color: "#9a9a9a" }}>{r.dir.word}</span>
              </div>
            </div>
          ))}

          <p className="text-[11px] mt-3.5" style={{ color: "#9a9a9a", lineHeight: 1.5 }}>
            Trend shows whether the underlying data for each topic is improving, stable, or getting worse based on the latest available figures.
          </p>
        </div>

        {/* ── Why this company is different ──────────────────────────────── */}
        <div style={{ padding: "24px 30px", background: "#fafafa", borderTop: "1px solid #ededed" }}>
          <h2 className="text-[15px] font-semibold mb-1">Where this company stands out</h2>
          <p className="text-[12px] mb-4" style={{ color: "#9a9a9a" }}>
            Topics where market sensitivity is noticeably higher or lower than the sector norm.
          </p>
          <div className="flex flex-col gap-3">
            {whyDiff.map(w => {
              const more = w.diff >= 0
              const mag  = Math.abs(w.diff)
              return (
                <div
                  key={w.driver}
                  className="rounded-xl p-4"
                  style={{ background: "#fff", border: "1px solid #ededed" }}
                >
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span
                      className="inline-flex items-center justify-center rounded text-white"
                      style={{ width: 18, height: 18, fontSize: 9.5, fontWeight: 700, background: PILLAR_BG[w.pil] }}
                    >
                      {w.pil}
                    </span>
                    <span className="text-[14px] font-semibold" style={{ color: "#171717" }}>{w.driver}</span>
                    <span
                      className="font-mono text-[10.5px] font-semibold"
                      style={{
                        color:      more ? "#2f5d8a" : "#8a6d2f",
                        background: more ? "rgba(47,93,138,0.10)" : "rgba(138,109,47,0.10)",
                        padding: "4px 9px", borderRadius: 6,
                      }}
                    >
                      {more ? "MORE" : "LESS"} market-sensitive than peers ({more ? "+" : "−"}{mag})
                    </span>
                  </div>
                  <p className="text-[12px] mb-2 italic" style={{ color: "#8a8a8a", lineHeight: 1.5 }}>
                    {w.layman_explanation}
                  </p>
                  <p className="text-[13px]" style={{ color: "#3a3a3a", lineHeight: 1.6 }}>
                    {more
                      ? `${profile.name}'s stock price has moved more than peers when ${w.driver.toLowerCase()} news breaks. Incidents, fines, or investigations in this area have historically triggered a bigger market reaction here than elsewhere in the sector.`
                      : `This topic routinely moves share prices across the sector, but ${profile.name} has been less sensitive to it. Either the company has demonstrated better controls, or investors see its exposure as lower than average. A major incident could change that quickly.`
                    }
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Driver momentum ────────────────────────────────────────────── */}
        <div style={{ padding: "22px 30px", borderTop: "1px solid #ededed" }}>
          <h2 className="text-[15px] font-semibold mb-3">Driver momentum</h2>
          <div className="flex flex-wrap gap-2.5">
            {trendMini.map(t => (
              <div
                key={t.driver}
                className="flex items-center gap-2 rounded-xl"
                style={{ background: "#fafafa", border: "1px solid #ededed", padding: "9px 13px" }}
              >
                <span
                  className="text-xs font-semibold"
                  style={{ color: t.dir.color, background: t.dir.bg, padding: "2px 6px", borderRadius: 5 }}
                >
                  {t.dir.icon}
                </span>
                <span className="text-[12.5px]" style={{ color: "#212121" }}>{t.driver}</span>
                <span className="text-[11px]" style={{ color: "#9a9a9a" }}>{t.dir.word}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Action hint ────────────────────────────────────────────────── */}
        <div style={{ padding: "22px 30px", background: "#1c1c1c" }}>
          <div className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: "#3ecf8e", display: "block" }} />
            <p className="text-[14px]" style={{ color: "#ededed", lineHeight: 1.6, maxWidth: 790 }}>
              Focus research and engagement on the top-ranked topics here. That is where news events have historically moved this stock the most, especially where the score is clearly above or below what peers show.
              {score && ` Signal quality: ${Math.round(score.integrity.integrity_score)}/100. Harm exposure: ${Math.round(score.wem.wem_score)}/100.`}
            </p>
          </div>
        </div>

        {/* ── Source ─────────────────────────────────────────────────────── */}
        <div style={{ padding: "14px 30px", borderTop: "1px solid #2a2a2a", background: "#1c1c1c" }}>
          <p className="font-mono text-[10.5px]" style={{ color: "#8a8a8a", lineHeight: 1.5 }}>
            Scores from the Maxwell Data FTSE 100 news-sentiment model. Methodology: Jangani, Date &amp; Tucker, SSRN 5618192 (2026). This is a research tool, not a regulated ESG rating.
          </p>
        </div>

      </div>
    </div>
  )
}
