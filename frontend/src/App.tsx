import { useState, useEffect, useCallback, useMemo } from "react"
import type {
  CompanyScore, PortfolioView, ForecastResult, MaterialityComparison,
  FTSEProfile, PriceData, FTSESearchResult, Role, WeightConfig
} from "./types"
import {
  fetchScore, fetchScoreWithWeights, fetchPortfolio, fetchForecast,
  fetchMaterialityComparison, fetchFTSE100Index, fetchFTSEProfile, fetchPrice
} from "./api"
import { ORDER, isEmbedded, getEmbeddedProfile } from "./data/embedded"

import { ScoreDial }            from "./components/ScoreDial"
import { QuadrantBadge }        from "./components/QuadrantBadge"
import { DivergenceChart }      from "./components/DivergenceChart"
import { WeightSliders }        from "./components/WeightSliders"
import { ClaimTable }           from "./components/ClaimTable"
import { ControversyTimeline }  from "./components/ControversyTimeline"
import { ImpactKPIs }           from "./components/ImpactKPIs"
import { QuadrantPlot }         from "./components/QuadrantPlot"
import { PortfolioTilt }        from "./components/PortfolioTilt"
import { ActionPanel }          from "./components/ActionPanel"
import { WEMBreakdown }         from "./components/WEMBreakdown"
import { SearchBar }            from "./components/SearchBar"
import { PriceWidget }          from "./components/PriceWidget"
import { Top8Bars }             from "./components/Top8Bars"
import { PillarChart }          from "./components/PillarChart"
import { InsightStrip }         from "./components/InsightStrip"
import { PeerCards }            from "./components/PeerCards"
import { PeerComparison }       from "./components/PeerComparison"
import { ComparisonCard }       from "./components/ComparisonCard"
import { CompareTable }         from "./components/CompareTable"
import { getEmbeddedPairComparison } from "./data/embedded"


// ── Constants ─────────────────────────────────────────────────────────────────

// All embedded tickers now have full synthesised data
const FULL_SCORE_TICKERS = new Set([...ORDER] as string[])

const ROLE_OPTIONS: { id: Role; label: string }[] = [
  { id: "pm",             label: "Portfolio Manager" },
  { id: "sustainability", label: "Sustainability" },
  { id: "regulator",      label: "Regulator" },
]

type ViewId = "dashboard" | "card" | "compare" | "analysis"
const VIEW_TABS: { id: ViewId; label: string }[] = [
  { id: "dashboard", label: "Dashboard" },
  { id: "card",      label: "Comparison Card" },
  { id: "compare",   label: "Compare" },
  { id: "analysis",  label: "Deep Analysis" },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function PlaceboChip({ pi }: { pi: number }) {
  const [color, bg, label] = pi >= 0.65
    ? ["#c0492f", "rgba(192,73,47,0.10)", "Dangerous Placebo"]
    : pi >= 0.4
    ? ["#8a6d2f", "rgba(138,109,47,0.10)", "Placebo Risk: Moderate"]
    : ["#2f7d8a", "rgba(47,125,138,0.10)", "Signal Coherent"]
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color, background: bg }}>
      <span className="font-mono">PI {pi.toFixed(2)}</span>
      <span style={{ opacity: 0.4 }}>·</span>
      <span>{label}</span>
    </span>
  )
}

function scoreToProfile(score: CompanyScore): FTSEProfile {
  const drivers = score.material_factors.map(f => ({
    driver:              f.factor,
    category:            "Governance" as const,
    materiality_score:   f.materiality_score,
    peer_median:         f.materiality_score * 0.92,
    ftse100_median:      f.materiality_score * 0.85,
    deviation_from_peer: f.materiality_score * 0.08,
    deviation_from_ftse: f.materiality_score * 0.15,
    direction_3m:        "stable" as const,
    direction_12m:       "stable" as const,
    confidence:          "low" as const,
    layman_explanation:  "",
  }))
  return {
    ticker: score.ticker, name: score.name, industry: score.sector, sector: score.sector,
    has_full_score: true, peer_count: 0, peer_names: [],
    top_8_drivers: drivers, all_26_drivers: drivers, three_body_instability: 0,
  }
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [allCompanies, setAllCompanies]               = useState<FTSESearchResult[]>([])
  const [selectedTicker, setSelectedTicker]           = useState("BP")
  const [score, setScore]                             = useState<CompanyScore | null>(null)
  const [portfolio, setPortfolio]                     = useState<PortfolioView | null>(null)
  const [forecast, setForecast]                       = useState<ForecastResult | null>(null)
  const [materialityComparison, setMaterialityComparison] = useState<MaterialityComparison | null>(null)
  const [ftseProfile, setFtseProfile]                 = useState<FTSEProfile | null>(null)
  const [priceData, setPriceData]                     = useState<PriceData | null>(null)
  const [loading, setLoading]                         = useState(false)
  const [weightLoading, setWeightLoading]             = useState(false)
  const [error, setError]                             = useState<string | null>(null)
  const [role, setRole]                               = useState<Role>("pm")
  const [view, setView]                               = useState<ViewId>("dashboard")
  const [compareSet, setCompareSet]                   = useState<string[]>(["BP", "SHEL", "AMZN"])
  const [selectedPeer, setSelectedPeer]               = useState<string | null>(null)
  const [weights, setWeights]                         = useState<WeightConfig>({ divergence:0.35, verification:0.40, controversy:0.25 })

  const isFullScore = FULL_SCORE_TICKERS.has(selectedTicker)

  useEffect(() => {
    fetchFTSE100Index().then(idx => setAllCompanies(idx)).catch(() => {})
    fetchPortfolio().then(setPortfolio).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true); setError(null)
    setForecast(null); setMaterialityComparison(null); setFtseProfile(null); setPriceData(null)

    const tasks: Promise<void>[] = []

    if (isFullScore) {
      tasks.push(
        Promise.all([
          fetchScore(selectedTicker),
          fetchForecast(selectedTicker),
          fetchMaterialityComparison(selectedTicker),
        ]).then(([s, fc, mc]) => {
          setScore(s); setWeights(s.integrity.weights); setForecast(fc); setMaterialityComparison(mc)
        })
      )
    } else {
      setScore(null)
    }

    tasks.push(fetchFTSEProfile(selectedTicker).then(p => { if (p) setFtseProfile(p) }).catch(() => {}))
    tasks.push(fetchPrice(selectedTicker).then(p => { if (p) setPriceData(p) }).catch(() => {}))

    Promise.all(tasks)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [selectedTicker])

  const handleWeightChange = useCallback(async (newWeights: WeightConfig) => {
    setWeights(newWeights)
    if (!selectedTicker || !isFullScore) return
    setWeightLoading(true)
    try {
      const s = await fetchScoreWithWeights(selectedTicker, newWeights)
      setScore(s)
    } catch { /* keep current */ }
    finally { setWeightLoading(false) }
  }, [selectedTicker, isFullScore])

  const handleSelectTicker = (ticker: string) => { setSelectedTicker(ticker); setView("dashboard"); setSelectedPeer(null) }

  const toggleCompare = (ticker: string) => {
    setCompareSet(prev => {
      if (prev.includes(ticker)) return prev.length > 2 ? prev.filter(t => t !== ticker) : prev
      return prev.length >= 4 ? [...prev.slice(1), ticker] : [...prev, ticker]
    })
  }

  const integrityColor = score ? (score.integrity.integrity_score>=70?"green":score.integrity.integrity_score>=50?"blue":"red") : "gray"
  const impactColor    = score ? (score.impact.impact_score>=70?"green":score.impact.impact_score>=50?"blue":"red") : "gray"
  const wemColor       = score ? (score.wem.wem_score>=70?"green":score.wem.wem_score>=50?"yellow":"red") : "gray"

  const profileSource  = ftseProfile ?? (score ? scoreToProfile(score) : null)
  const displayName    = score?.name ?? ftseProfile?.name ?? selectedTicker
  const displayIndustry = ftseProfile?.industry ?? score?.sector ?? ""

  // Build Top8Bars driver data from profile
  const top8DriversData = useMemo(() => {
    if (!profileSource) return []
    return profileSource.top_8_drivers.map((d, i) => {
      const pil  = d.category === "Environment" ? "E" : d.category === "Social" ? "S" : "G"
      const diff = d.materiality_score - d.peer_median
      return {
        driver:        d.driver,
        pillar:        pil,
        label:         d.driver,
        score:         d.materiality_score,
        peerAvg:       d.peer_median ?? null,
        rank:          i + 1,
        coverageLabel: profileSource.peer_count > 0 ? `${profileSource.peer_count} peers` : "sector avg",
        devLabel:      `${diff >= 0 ? "+" : ""}${(diff * 100).toFixed(0)}`,
        devColor:      Math.abs(diff) > 0.05 ? (diff > 0 ? "#2f7d8a" : "#c0492f") : "#9a9a9a",
        direction:     d.direction_3m,
      }
    })
  }, [profileSource])

  // Peer cards: sector peers first, then up to 8 cross-sector for a full FTSE 100 picture
  const peerCardData = useMemo(() => {
    const selfProfile = getEmbeddedProfile(selectedTicker)
    const selfSector = selfProfile?.sector ?? ""
    const all = (ORDER as readonly string[]).map(t => {
      const p = getEmbeddedProfile(t)
      if (!p) return null
      return {
        ticker: t,
        sasb:   p.industry || p.sector,
        isSelf: t === selectedTicker,
        sector: p.sector,
        top3:   p.top_8_drivers.slice(0, 3).map(d => ({ label: d.driver, score: d.materiality_score })),
      }
    }).filter((c): c is NonNullable<typeof c> => c !== null)
    // Self always first, then sector peers, then cross-sector (up to 8 cross-sector shown)
    const self       = all.filter(c => c.isSelf)
    const sectorPeers = all.filter(c => !c.isSelf && c.sector === selfSector)
    const crossSector = all.filter(c => !c.isSelf && c.sector !== selfSector).slice(0, 8)
    return [...self, ...sectorPeers, ...crossSector]
  }, [selectedTicker])

  const peerLabel = profileSource ? `${profileSource.peer_count || peerCardData.length} companies` : ""

  const pairComparison = useMemo(() => {
    if (!selectedPeer || selectedPeer === selectedTicker) return null
    return getEmbeddedPairComparison(selectedTicker, selectedPeer)
  }, [selectedTicker, selectedPeer])

  return (
    <div className="min-h-screen" style={{ background: "#ffffff", color: "#171717" }}>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header style={{ position:"sticky", top:0, zIndex:60, background:"rgba(255,255,255,0.92)", backdropFilter:"blur(10px)", borderBottom:"1px solid #ededed" }}>
        <div className="max-w-[1180px] mx-auto px-7 py-3 flex items-center justify-between gap-6">

          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-[26px] h-[26px] rounded-md flex items-center justify-center" style={{ background: "#171717" }}>
              <span className="w-[9px] h-[9px] rounded-full" style={{ background: "#3ecf8e", display: "block" }} />
            </div>
            <div className="text-[15px] font-semibold tracking-tight leading-none">
              ESG<span className="font-medium" style={{ color: "#9a9a9a" }}>/Navigator</span>
            </div>
          </div>

          {/* Search */}
          <SearchBar allCompanies={allCompanies} onSelect={handleSelectTicker} selectedTicker={selectedTicker} />

          {/* View toggle */}
          <div className="flex items-center gap-0 shrink-0 p-0.5 rounded-lg" style={{ background: "#fafafa", border: "1px solid #ededed" }}>
            {VIEW_TABS.map(v => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className="px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap"
                style={view === v.id
                  ? { background: "#fff", color: "#171717", boxShadow: "0 1px 2px rgba(0,0,0,0.06)", border: "1px solid #ededed" }
                  : { background: "transparent", color: "#9a9a9a", border: "1px solid transparent" }}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* Role toggle — only in Analysis view */}
          {view === "analysis" && (
            <div className="flex items-center gap-0 shrink-0 p-0.5 rounded-lg" style={{ background: "#fafafa", border: "1px solid #ededed" }}>
              {ROLE_OPTIONS.map(r => (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className="px-3 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap"
                  style={role === r.id
                    ? { background: "#fff", color: "#171717", boxShadow: "0 1px 2px rgba(0,0,0,0.06)", border: "1px solid #ededed" }
                    : { background: "transparent", color: "#9a9a9a", border: "1px solid transparent" }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-[1180px] mx-auto px-7 py-6 pb-24 space-y-5">

        {/* Ticker chips — scrollable horizontal strip */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="label-upper">Coverage · {(ORDER as readonly string[]).length} companies</span>
            <span className="text-[11px]" style={{ color:"#9a9a9a" }}>scroll → · click to select · + adds to compare</span>
          </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth:"thin" }}>
          {(ORDER as readonly string[]).map(t => {
            const isSelected  = t === selectedTicker
            const inCompare   = compareSet.includes(t)
            return (
              <div key={t} className="flex items-center gap-0 rounded-full overflow-hidden" style={{ border: `1px solid ${isSelected ? "#171717" : "#ededed"}` }}>
                <button
                  onClick={() => handleSelectTicker(t)}
                  className="px-2.5 py-1 text-xs font-semibold transition-colors"
                  style={{ background: isSelected ? "#171717" : "#fafafa", color: isSelected ? "#fff" : "#525252" }}
                >
                  {t}
                </button>
                <button
                  onClick={() => toggleCompare(t)}
                  title={inCompare ? "Remove from compare" : "Add to compare"}
                  className="px-1.5 py-1 text-[10px] font-bold transition-colors border-l"
                  style={{
                    borderColor: isSelected ? "#333" : "#ededed",
                    background: inCompare ? "#3ecf8e" : "#fafafa",
                    color: inCompare ? "#fff" : "#b0b0b0",
                  }}
                >
                  {inCompare ? "✓" : "+"}
                </button>
              </div>
            )
          })}
          {view !== "compare" && compareSet.length >= 2 && (
            <button
              onClick={() => setView("compare")}
              className="text-xs font-semibold px-3 py-1 rounded-full shrink-0"
              style={{ background:"rgba(62,207,142,0.15)", color:"#2f7d8a", border:"1px solid rgba(62,207,142,0.3)" }}
            >
              Compare {compareSet.length} →
            </button>
          )}
        </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-3 py-16 justify-center text-faint">
            <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-[13px]">Loading {selectedTicker}…</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="card p-4 text-sm" style={{ borderColor:"#fecaca", background:"#fef2f2", color:"#c0492f" }}>{error}</div>
        )}

        {!loading && (score || ftseProfile) && (
          <>
            {/* ── Company header (always visible) ──────────────────────── */}
            <section className="card p-6">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                {/* Left */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap mb-2">
                    <h1 className="text-[28px] font-semibold tracking-tight leading-none">{displayName}</h1>
                    <span className="font-mono text-xs px-2 py-0.5 rounded-md" style={{ color:"#707070", background:"#fafafa", border:"1px solid #ededed" }}>{selectedTicker}</span>
                    {displayIndustry && (
                      <span className="font-mono text-xs px-2 py-0.5 rounded-md" style={{ color:"#707070", background:"#fafafa", border:"1px solid #ededed" }}>{displayIndustry}</span>
                    )}
                    {!isFullScore && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ color:"#8a6d2f", background:"rgba(138,109,47,0.10)" }}>Materiality profile</span>
                    )}
                    {isEmbedded(selectedTicker) && isFullScore && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ color:"#2f7d8a", background:"rgba(47,125,138,0.10)" }}>Full analysis</span>
                    )}
                  </div>

                  {priceData && <div className="mb-3"><PriceWidget data={priceData} /></div>}

                  {score && (
                    <div className="flex flex-wrap gap-4 text-xs text-muted mb-3">
                      <span>Avg ESG: <span className="font-mono font-semibold text-ink">{score.esg_score_avg}</span></span>
                      <span>·</span>
                      <span><span className="font-mono font-semibold text-ink">{score.ratings.length}</span> rating sources</span>
                      <span>·</span>
                      <span><span className="font-mono font-semibold text-ink">{score.controversies.length}</span> controversies</span>
                      <span>·</span>
                      <span><span className="font-mono font-semibold text-ink">{score.claims.length}</span> claims checked</span>
                    </div>
                  )}

                  {score && (
                    <div className="flex flex-wrap items-center gap-2">
                      <QuadrantBadge
                        label={score.quadrant.label}
                        color={score.quadrant.color}
                        actionLabel={score.quadrant.action_label}
                        placeboRisk={score.quadrant.placebo_risk}
                        large
                      />
                      <PlaceboChip pi={score.placebo_index} />
                    </div>
                  )}
                </div>

                {/* Right: dials (full-score) or 3-body σ (profile only) */}
                {score && (
                  <div className="flex gap-5 shrink-0">
                    <ScoreDial score={score.integrity.integrity_score} label="Integrity" color={integrityColor} size={105} sublabel="signal quality" />
                    <ScoreDial score={score.impact.impact_score}       label="Impact"    color={impactColor}    size={105} sublabel="real performance" />
                    <ScoreDial score={score.wem.wem_score}             label="WEM"       color={wemColor}       size={105} sublabel="harm index" />
                  </div>
                )}

                {!score && ftseProfile && (
                  <div className="shrink-0 rounded-xl p-4" style={{ background:"#fafafa", border:"1px solid #ededed" }}>
                    <p className="label-upper mb-2">3-Body Instability</p>
                    <p className="text-[30px] font-bold font-mono leading-none" style={{ color: ftseProfile.three_body_instability>4?"#c0492f":ftseProfile.three_body_instability>2?"#8a6d2f":"#2f7d8a" }}>
                      σ {ftseProfile.three_body_instability.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted mt-1">spread across top-8 drivers</p>
                    <p className="text-xs text-faint mt-1">{ftseProfile.peer_count} peers · {ftseProfile.industry}</p>
                  </div>
                )}
              </div>
            </section>

            {/* ════════════════════════════════════════════════════════════ */}
            {/* DASHBOARD VIEW                                               */}
            {/* ════════════════════════════════════════════════════════════ */}
            {view === "dashboard" && (
              <div className="space-y-5">

                {/* Key findings strip */}
                {(score || profileSource) && (
                  <section className="card p-6">
                    <InsightStrip score={score} profile={profileSource} />
                  </section>
                )}

                {/* E/S/G pillar chart + top-8 bars side by side */}
                {profileSource && (
                  <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 1fr" }}>
                    <section className="card p-6">
                      <PillarChart
                        drivers={profileSource.top_8_drivers}
                        ticker={selectedTicker}
                        companyName={displayName}
                      />
                    </section>
                    <section className="card p-6">
                      <Top8Bars
                        drivers={top8DriversData}
                        ticker={selectedTicker}
                        peerLabel={peerLabel}
                      />
                    </section>
                  </div>
                )}

                {/* Peer comparison grid */}
                {peerCardData.length > 0 && (
                  <section className="card p-6">
                    <PeerCards
                      cards={peerCardData}
                      sectorLabel={displayIndustry || profileSource?.sector || ""}
                      companyName={displayName}
                      selfTicker={selectedTicker}
                      selectedPeer={selectedPeer}
                      onSelectPeer={t => setSelectedPeer(prev => prev === t ? null : t)}
                      explain={`Being in the same sector does not mean the same risks apply equally to every company in it. Even direct competitors can have very different risk profiles depending on their history, geography, and how investors have reacted to past incidents. Click any card to see a full side-by-side comparison.`}
                      academic={`Research by Jangani, Date & Tucker (2026) shows this is structural, not noise: the same sustainability topic can be the single biggest risk factor for one company and barely register for its closest competitor.`}
                    />
                  </section>
                )}

                {/* Head-to-head comparison (appears when a peer card is clicked) */}
                {pairComparison && (
                  <section>
                    <PeerComparison
                      pair={pairComparison}
                      onClose={() => setSelectedPeer(null)}
                    />
                  </section>
                )}
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════ */}
            {/* COMPARISON CARD VIEW                                         */}
            {/* ════════════════════════════════════════════════════════════ */}
            {view === "card" && profileSource && (
              <ComparisonCard
                profile={profileSource}
                score={score}
                comparison={materialityComparison}
              />
            )}

            {view === "card" && !profileSource && (
              <div className="py-12 text-center text-faint text-sm">No materiality profile available for {selectedTicker}</div>
            )}

            {/* ════════════════════════════════════════════════════════════ */}
            {/* COMPARE VIEW                                                 */}
            {/* ════════════════════════════════════════════════════════════ */}
            {view === "compare" && (
              <div className="space-y-4">
                {/* Company picker */}
                <div className="card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="label-upper">Add to compare</span>
                    <span className="text-[11px]" style={{ color:"#9a9a9a" }}>Select 2–4 companies · scroll →</span>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth:"thin" }}>
                    {(ORDER as readonly string[]).map(t => {
                      const inSet = compareSet.includes(t)
                      return (
                        <button
                          key={t}
                          onClick={() => toggleCompare(t)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-full transition-all shrink-0"
                          style={inSet
                            ? { background:"#171717", color:"#fff", border:"1px solid #171717" }
                            : { background:"#fafafa", color:"#9a9a9a", border:"1px solid #ededed" }}
                        >
                          {t} {inSet ? "✓" : "+"}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <CompareTable tickers={compareSet} />
              </div>
            )}

            {/* ════════════════════════════════════════════════════════════ */}
            {/* DEEP ANALYSIS VIEW                                           */}
            {/* ════════════════════════════════════════════════════════════ */}
            {view === "analysis" && (
              <div className="space-y-5">

                {/* Integrity signals */}
                {score && (
                  <>
                    <div className="space-y-4">
                      <WeightSliders weights={weights} onChange={handleWeightChange} loading={weightLoading} />
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label:"Rating Agreement",   value:score.integrity.divergence_score,   weight:weights.divergence,   desc:"across providers" },
                          { label:"Claim Verification", value:score.integrity.verification_score, weight:weights.verification, desc:"verified vs contradicted" },
                          { label:"Clean Controversy",  value:score.integrity.controversy_score,  weight:weights.controversy,  desc:"36-month lookback" },
                        ].map(s => (
                          <div key={s.label} className="card p-4 space-y-1.5">
                            <div className="flex justify-between text-xs text-muted">
                              <span>{s.label}</span>
                              <span className="font-mono text-whisper">{Math.round(s.weight*100)}% weight</span>
                            </div>
                            <div className="text-2xl font-bold font-mono text-ink">{Math.round(s.value)}</div>
                            <div className="text-xs text-faint">{s.desc}</div>
                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background:"#f0f0f0" }}>
                              <div className="h-full rounded-full" style={{ width:`${s.value}%`, background:"#2f7d8a" }} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="card p-5"><DivergenceChart ratings={score.ratings} ticker={score.ticker} /></div>
                      <div className="card p-5"><ClaimTable claims={score.claims} /></div>
                      <div className="card p-5"><ControversyTimeline controversies={score.controversies} /></div>
                    </div>

                    <div className="card p-5">
                      <WEMBreakdown wem={score.wem} inputs={score.wem_inputs} esgAvg={score.esg_score_avg} integrityScore={score.integrity.integrity_score} />
                    </div>
                    <div className="card p-5"><ImpactKPIs kpis={score.impact.kpis} sector={score.sector} /></div>
                    {portfolio && <div className="card p-5"><QuadrantPlot companies={portfolio.companies} selectedTicker={score.ticker} /></div>}
                    {portfolio && <div className="card p-5"><PortfolioTilt portfolio={portfolio} /></div>}

                    <ActionPanel score={score} role={role} />
                  </>
                )}

                {!score && (
                  <div className="card p-8 text-center">
                    <p className="text-sm font-semibold text-ink mb-2">Deep analysis requires full score data</p>
                    <p className="text-xs text-muted">
                      Full investment analysis is available for BP, Shell, Ørsted, ExxonMobil, TotalEnergies, Unilever, Nestlé, and Amazon.
                    </p>
                    <p className="text-xs text-faint mt-3">
                      For {displayName}, use the Dashboard and Comparison Card views to explore risk drivers and peer comparisons.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border" style={{ background:"#1c1c1c", marginTop:"40px" }}>
        <div className="max-w-[1180px] mx-auto px-7 py-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-xs" style={{ color:"#ededed" }}>
                <span style={{ color:"#ffffff", fontWeight:500 }}>What AI did here:</span> Extracted specific numeric claims from SEC filings for cross-referencing. Nothing else.
              </p>
              <p className="text-xs" style={{ color:"#9a9a9a" }}>
                <span style={{ color:"#ededed", fontWeight:500 }}>Scoring is formula-driven:</span> Integrity, Impact, and WEM weights are auditable and user-adjustable.
              </p>
            </div>
            <p className="text-xs shrink-0 text-right font-mono" style={{ color:"#525252" }}>
              Berg et al. (2022) "Aggregate Confusion"<br />
              Jangani, Date &amp; Tucker (SSRN 5618192, 2026) · Maxwell Data FTSE100 (March 2025)
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
