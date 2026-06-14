// Amazon-style side-by-side comparison table for the 8 core companies.
// Sticky left label column · one column per selected company · driver union rows · auto narrative.

import { getEmbeddedProfile, getEmbeddedScore } from "../data/embedded"

const CO_META: Record<string, { sector: string; industry: string; mkt: string; desc: string }> = {
  BP:     { sector:"Energy",     industry:"Oil & Gas Producers",     mkt:"$82 B",   desc:"Major integrated oil & gas; multiple greenwashing investigations." },
  SHEL:   { sector:"Energy",     industry:"Oil & Gas Producers",     mkt:"$193 B",  desc:"Dutch court ordered 45% emissions cut by 2030." },
  ORSTED: { sector:"Energy",     industry:"Renewable Energy",        mkt:"$14 B",   desc:"World's largest offshore wind developer; fossil-to-green pivot." },
  XOM:    { sector:"Energy",     industry:"Oil & Gas Producers",     mkt:"$419 B",  desc:"Largest US oil & gas; sued California over ESG disclosure rules." },
  TTE:    { sector:"Energy",     industry:"Oil & Gas Producers",     mkt:"$138 B",  desc:"European major with LNG + renewables; Uganda EACOP controversy." },
  ULVR:   { sector:"Consumer",   industry:"Personal Goods",          mkt:"$98 B",   desc:"RE100 member; Sustainable Living Plan across 400+ brands." },
  NESN:   { sector:"Consumer",   industry:"Food & Beverages",        mkt:"$221 B",  desc:"World's largest food company; greenwashing enforcement in 3 jurisdictions." },
  AMZN:   { sector:"Technology", industry:"E-commerce & Cloud",      mkt:"$1.82 T", desc:"Climate Pledge signatory; contested Scope 3 accounting methodology." },
}

const PILLAR_COLOR: Record<string, string> = { E:"#2f7d8a", S:"#7a5ea8", G:"#8a6d2f" }
const DRIVER_PILLAR: Record<string, string> = {
  "GHG Emissions":"E","Physical Impacts of Climate Change":"E","Ecological Impacts":"E",
  "Energy Management":"E","Air Quality":"E","Water & Hazardous Materials":"E",
  "Waste & Wastewater Management":"E","Materials Sourcing & Efficiency":"E",
  "Human Rights & Community Relations":"S","Labor Practices":"S","Product Quality & Safety":"S",
  "Customer Welfare":"S","Customer Privacy":"S","Data Security":"S",
  "Employee Engagement":"S","Access & Affordability":"S",
  "Business Ethics":"G","Management of the Legal & Regulatory Environment":"G",
  "Systemic Risk Management":"G","Business Model Resilience":"G","Competitive Behavior":"G",
  "Critical Incidence Risk Management":"G","Supply Chain Management":"G",
  "Product Design & Lifecycle Management":"G",
}

const DIR_ICON: Record<string, string> = { leading:"▲", stable:"►", lagging:"▼" }
const DIR_COLOR: Record<string, string> = { leading:"#2f7d8a", stable:"#9a9a9a", lagging:"#c0492f" }

interface Props {
  tickers: string[]
}

function scoreColor(v: number, lo: number, hi: number) {
  if (v === hi && lo !== hi) return { bg:"rgba(47,125,138,0.10)", border:"1px solid rgba(47,125,138,0.25)" }
  if (v === lo && lo !== hi) return { bg:"rgba(192,73,47,0.06)",  border:"1px solid rgba(192,73,47,0.15)" }
  return { bg:"transparent", border:"1px solid transparent" }
}

function piLabel(pi: number) {
  if (pi >= 0.65) return { text:"Dangerous Placebo", color:"#c0492f", bg:"rgba(192,73,47,0.10)" }
  if (pi >= 0.40) return { text:"Moderate Risk",     color:"#8a6d2f", bg:"rgba(138,109,47,0.10)" }
  return               { text:"Signal Coherent",     color:"#2f7d8a", bg:"rgba(47,125,138,0.10)" }
}

function buildNarrative(cols: ReturnType<typeof buildCols>): string[] {
  const allDrivers = [...new Set(cols.flatMap(c => c.profile!.top_8_drivers.map(d => d.driver)))]
  const counts: Record<string,number> = {}
  allDrivers.forEach(d => {
    counts[d] = cols.filter(c => c.profile!.top_8_drivers.some(x => x.driver === d)).length
  })
  const shared    = allDrivers.filter(d => counts[d] === cols.length)
  const exclusive = cols.map(c => ({
    name: c.profile!.name,
    drivers: allDrivers.filter(d => counts[d] === 1 && c.profile!.top_8_drivers.some(x => x.driver === d))
  }))
  const sectors = [...new Set(cols.map(c => CO_META[c.ticker]?.sector || c.profile!.sector || ""))]

  const lines: string[] = []

  if (shared.length === 0) {
    lines.push(`None of the selected companies share all their top 8 risk topics. The profiles are fundamentally different, which means being in the same sector tells you surprisingly little about where the actual risks lie.`)
  } else {
    const sharedList = shared.slice(0, 3).join(", ")
    lines.push(`${shared.length} topic${shared.length > 1 ? "s appear" : " appears"} in every company's top 8: ${sharedList}. All these stocks react to news on those themes, but the strength of the reaction differs, so they are not interchangeable exposures.`)
  }

  for (const e of exclusive) {
    if (e.drivers.length > 0) {
      const list = e.drivers.slice(0, 2).join(" and ")
      lines.push(`${e.name} is the only company here where ${list} rank${e.drivers.length > 1 ? "" : "s"} in the top 8. News on ${e.drivers.length > 1 ? "those topics" : "that topic"} moves ${e.name}'s stock but has had little visible effect on the others selected.`)
    }
  }

  if (sectors.length > 1) {
    lines.push(`These companies are from different sectors: ${sectors.join(", ")}. That makes it even more striking where they do share a risk topic, because the underlying reason is different for each one despite the same label appearing.`)
  }

  return lines
}

function buildCols(tickers: string[]) {
  return tickers.map(t => ({
    ticker:  t,
    meta:    CO_META[t] || { sector:"—", industry:"—", mkt:"—", desc:"—" },
    profile: getEmbeddedProfile(t),
    score:   getEmbeddedScore(t),
  })).filter(c => c.profile)
}

// ── Component ──────────────────────────────────────────────────────────────────

export function CompareTable({ tickers }: Props) {
  const cols = buildCols(tickers)

  if (cols.length < 2) return (
    <div className="py-12 text-center text-[13px]" style={{ color:"#9a9a9a" }}>
      Select at least 2 companies above to compare.
    </div>
  )

  const N = cols.length

  // Build driver union, shared-first then by max score
  const driverMeta: Record<string,{ count:number; pillar:string; maxScore:number }> = {}
  cols.forEach(c => c.profile!.top_8_drivers.forEach(d => {
    if (!driverMeta[d.driver]) driverMeta[d.driver] = { count:0, pillar: DRIVER_PILLAR[d.driver]||"G", maxScore:0 }
    driverMeta[d.driver].count++
    driverMeta[d.driver].maxScore = Math.max(driverMeta[d.driver].maxScore, d.materiality_score)
  }))
  const allDrivers = Object.keys(driverMeta).sort((a,b) => {
    if (driverMeta[b].count !== driverMeta[a].count) return driverMeta[b].count - driverMeta[a].count
    return driverMeta[b].maxScore - driverMeta[a].maxScore
  })

  const sharedDrivers    = allDrivers.filter(d => driverMeta[d].count === N)
  const partialDrivers   = allDrivers.filter(d => driverMeta[d].count > 1 && driverMeta[d].count < N)
  const exclusiveDrivers = allDrivers.filter(d => driverMeta[d].count === 1)

  const narrative = buildNarrative(cols)

  // Helper: score cell
  const DrCell = ({ ticker, driver, allScores }: { ticker:string; driver:string; allScores:number[] }) => {
    const col  = cols.find(c => c.ticker === ticker)!
    const drv  = col.profile!.top_8_drivers.find(d => d.driver === driver)
    if (!drv) return (
      <td style={{ padding:"10px 14px", textAlign:"center", borderTop:"1px solid #f4f4f4" }}>
        <span style={{ color:"#c7c7c7", fontSize:13 }}>—</span>
      </td>
    )
    const pct    = Math.round(drv.materiality_score * 100)
    const lo     = Math.min(...allScores)
    const hi     = Math.max(...allScores)
    const styles = scoreColor(drv.materiality_score, lo, hi)
    const isBest = drv.materiality_score === hi && lo !== hi
    return (
      <td style={{ padding:"10px 14px", borderTop:"1px solid #f4f4f4", ...styles, borderRadius:6 }}>
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-1.5">
            <span className="font-mono text-[15px] font-semibold" style={{ color: isBest ? "#2f7d8a" : "#171717" }}>
              {pct}
            </span>
            <span style={{ color: DIR_COLOR[drv.direction_3m], fontSize:10, fontWeight:700 }}>
              {DIR_ICON[drv.direction_3m]}
            </span>
          </div>
          <div className="h-[5px] rounded-full overflow-hidden" style={{ background:"#f0f0f0", width:64 }}>
            <div className="h-full rounded-full" style={{ width:`${pct}%`, background: isBest ? "#2f7d8a" : "#c7c7c7" }} />
          </div>
        </div>
      </td>
    )
  }

  // Helper: score stat row
  const StatRow = ({ label, render }: { label:string; render:(c:typeof cols[0]) => React.ReactNode }) => (
    <tr>
      <td style={{ padding:"10px 14px", borderTop:"1px solid #f4f4f4", fontWeight:500, fontSize:12.5, color:"#525252", whiteSpace:"nowrap" }}>
        {label}
      </td>
      {cols.map(c => (
        <td key={c.ticker} style={{ padding:"10px 14px", borderTop:"1px solid #f4f4f4" }}>
          {render(c)}
        </td>
      ))}
    </tr>
  )

  // Section header row spanning all cols
  const SectionRow = ({ label }: { label:string }) => (
    <tr>
      <td colSpan={N + 1} style={{ padding:"8px 14px 5px", background:"#fafafa", borderTop:"1px solid #ededed" }}>
        <span style={{ fontFamily:"monospace", fontSize:10, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"#9a9a9a" }}>
          {label}
        </span>
      </td>
    </tr>
  )

  // Driver section
  const DriverRows = ({ drivers, allScoresMap }: { drivers:string[]; allScoresMap:Record<string,number[]> }) => (
    <>
      {drivers.map(d => {
        const pil = driverMeta[d].pillar
        return (
          <tr key={d}>
            <td style={{ padding:"10px 14px", borderTop:"1px solid #f4f4f4" }}>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center rounded text-white shrink-0"
                  style={{ width:16, height:16, fontSize:9, fontWeight:700, background:PILLAR_COLOR[pil]||"#9a9a9a" }}>
                  {pil}
                </span>
                <span style={{ fontSize:12.5, color:"#212121", lineHeight:1.3 }}>{d}</span>
              </div>
            </td>
            {cols.map(c => (
              <DrCell key={c.ticker} ticker={c.ticker} driver={d} allScores={allScoresMap[d] || []} />
            ))}
          </tr>
        )
      })}
    </>
  )

  // Pre-compute all scores per driver for highlighting
  const allScoresMap: Record<string,number[]> = {}
  allDrivers.forEach(d => {
    allScoresMap[d] = cols.map(c => {
      const dr = c.profile!.top_8_drivers.find(x => x.driver === d)
      return dr ? dr.materiality_score : 0
    }).filter((s,i) => cols[i].profile!.top_8_drivers.some(x => x.driver === d))
  })

  return (
    <div>
      <div className="overflow-x-auto rounded-xl" style={{ border:"1px solid #e4e4e4", boxShadow:"0 1px 3px rgba(0,0,0,0.04)" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", minWidth: 520 + N * 180 }}>

          {/* ── Company header ──────────────────────────────────────── */}
          <thead>
            <tr style={{ background:"#fafafa", borderBottom:"2px solid #ededed" }}>
              {/* Top-left label cell */}
              <th style={{ padding:"16px 14px", textAlign:"left", width:200, verticalAlign:"bottom" }}>
                <span style={{ fontFamily:"monospace", fontSize:10, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", color:"#9a9a9a" }}>
                  Driver / Metric
                </span>
              </th>
              {cols.map(c => (
                <th key={c.ticker} style={{ padding:"16px 14px", textAlign:"left", verticalAlign:"top", minWidth:180 }}>
                  <div className="space-y-1.5">
                    <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded" style={{ background:"#171717", color:"#fff" }}>
                      {c.ticker}
                    </span>
                    <div style={{ fontSize:15, fontWeight:600, color:"#171717", lineHeight:1.2 }}>{c.profile!.name}</div>
                    <div style={{ fontSize:11, color:"#9a9a9a" }}>{c.meta.sector} · {c.meta.mkt}</div>
                    <div style={{ fontSize:11, color:"#b0b0b0", lineHeight:1.4, maxWidth:200 }}>{c.meta.desc}</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* ── Overview scores ─────────────────────────────────── */}
            <SectionRow label="ESG Integrity Scores" />

            <StatRow label="Integrity Score" render={c => {
              if (!c.score) return <span style={{ color:"#9a9a9a", fontSize:12 }}>—</span>
              const v = Math.round(c.score.integrity.integrity_score)
              const all = cols.filter(x => x.score).map(x => x.score!.integrity.integrity_score)
              const hi = Math.max(...all), lo = Math.min(...all)
              const st = scoreColor(c.score.integrity.integrity_score, lo, hi)
              return <span className="font-mono text-[18px] font-semibold" style={{ ...st, color: v === Math.round(hi) ? "#2f7d8a" : "#171717" }}>{v}</span>
            }} />

            <StatRow label="WEM Score" render={c => {
              if (!c.score) return <span style={{ color:"#9a9a9a", fontSize:12 }}>—</span>
              const v = Math.round(c.score.wem.wem_score)
              const all = cols.filter(x => x.score).map(x => x.score!.wem.wem_score)
              const hi = Math.max(...all), lo = Math.min(...all)
              const isBest = c.score.wem.wem_score === hi
              return (
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[18px] font-semibold" style={{ color: isBest ? "#2f7d8a" : "#171717" }}>{v}</span>
                  <div className="h-[5px] rounded-full" style={{ background:"#f0f0f0", width:72 }}>
                    <div className="h-full rounded-full" style={{ width:`${v}%`, background: isBest ? "#2f7d8a" : "#c7c7c7" }} />
                  </div>
                </div>
              )
            }} />

            <StatRow label="Avg ESG Rating" render={c => {
              if (!c.score) return <span style={{ color:"#9a9a9a", fontSize:12 }}>—</span>
              const v = c.score.esg_score_avg
              return <span className="font-mono text-[15px]" style={{ color:"#525252" }}>{v}</span>
            }} />

            <StatRow label="Placebo Index" render={c => {
              if (!c.score) return <span style={{ color:"#9a9a9a", fontSize:12 }}>—</span>
              const pi = c.score.placebo_index
              const cfg = piLabel(pi)
              return (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ color:cfg.color, background:cfg.bg }}>
                  {pi.toFixed(2)} · {cfg.text}
                </span>
              )
            }} />

            <StatRow label="Quadrant" render={c => {
              if (!c.score) return <span style={{ color:"#9a9a9a", fontSize:12 }}>—</span>
              const q = c.score.quadrant
              return <span className="text-[11px] font-medium" style={{ color:"#525252" }}>{q.label}</span>
            }} />

            {/* ── Shared drivers ──────────────────────────────────── */}
            {sharedDrivers.length > 0 && (
              <SectionRow label={`Shared top-8 drivers (${sharedDrivers.length} · in every selected company)`} />
            )}
            {sharedDrivers.length > 0 && (
              <DriverRows drivers={sharedDrivers} allScoresMap={allScoresMap} />
            )}

            {/* ── Partially shared ────────────────────────────────── */}
            {partialDrivers.length > 0 && (
              <SectionRow label={`Partially shared (${partialDrivers.length} · in some but not all)`} />
            )}
            {partialDrivers.length > 0 && (
              <DriverRows drivers={partialDrivers} allScoresMap={allScoresMap} />
            )}

            {/* ── Exclusive drivers ───────────────────────────────── */}
            {exclusiveDrivers.length > 0 && (
              <SectionRow label={`Unique to one company (${exclusiveDrivers.length} · others show —)`} />
            )}
            {exclusiveDrivers.length > 0 && (
              <DriverRows drivers={exclusiveDrivers} allScoresMap={allScoresMap} />
            )}

            {/* ── Legend row ─────────────────────────────────────── */}
            <tr>
              <td colSpan={N + 1} style={{ padding:"8px 14px", background:"#fafafa", borderTop:"1px solid #ededed" }}>
                <div className="flex items-center gap-5 text-[10.5px]" style={{ color:"#9a9a9a" }}>
                  <span>Score = materiality weight 0–100</span>
                  <span className="flex items-center gap-1">
                    <span style={{ color:"#2f7d8a", fontWeight:700 }}>▲</span> rising
                  </span>
                  <span className="flex items-center gap-1">
                    <span style={{ color:"#9a9a9a", fontWeight:700 }}>►</span> stable
                  </span>
                  <span className="flex items-center gap-1">
                    <span style={{ color:"#c0492f", fontWeight:700 }}>▼</span> falling
                  </span>
                  <span>
                    <span style={{ background:"rgba(47,125,138,0.10)", padding:"1px 5px", borderRadius:3 }}>teal bg</span> = highest in row
                  </span>
                  <span style={{ color:"#c0b0b0" }}>— = not in top 8</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── What this tells you ───────────────────────────────────────── */}
      <div className="mt-4 rounded-xl overflow-hidden" style={{ border:"1px solid #e4e4e4" }}>
        <div style={{ padding:"16px 20px 12px", borderBottom:"1px solid #ededed" }}>
          <h3 style={{ fontSize:14, fontWeight:600, color:"#171717" }}>What this comparison tells you</h3>
          <p style={{ fontSize:11.5, color:"#9a9a9a", marginTop:2 }}>
            Generated automatically from the driver overlap and relative scores shown above.
          </p>
        </div>
        <div style={{ padding:"16px 20px 20px", background:"#fafafa" }}>
          <div className="space-y-3">
            {narrative.map((line, i) => (
              <div key={i} className="flex gap-2.5">
                <span className="shrink-0 mt-1" style={{ width:6, height:6, borderRadius:"50%", background:"#3ecf8e", display:"block" }} />
                <p style={{ fontSize:13, color:"#3a3a3a", lineHeight:1.6 }}>{line}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 font-mono text-[10.5px]" style={{ color:"#9a9a9a", borderTop:"1px solid #ededed", paddingTop:10 }}>
            Source: Maxwell Data FTSE 100 Financial Materiality Survey (March 2025). Methodology: Jangani, Date & Tucker, SSRN 5618192 (2026).
          </p>
        </div>
      </div>
    </div>
  )
}
