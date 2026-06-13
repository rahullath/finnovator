import { useState, useEffect, useCallback } from "react"
import type {
  CompanyScore, PortfolioView, ForecastResult, MaterialityComparison,
  FTSEProfile, PriceData, FTSESearchResult, Role, WeightConfig
} from "./types"
import {
  fetchScore, fetchScoreWithWeights, fetchPortfolio, fetchForecast,
  fetchMaterialityComparison, fetchFTSE100Index, fetchFTSEProfile, fetchPrice
} from "./api"

import { ScoreDial } from "./components/ScoreDial"
import { QuadrantBadge } from "./components/QuadrantBadge"
import { DivergenceChart } from "./components/DivergenceChart"
import { WeightSliders } from "./components/WeightSliders"
import { ClaimTable } from "./components/ClaimTable"
import { ControversyTimeline } from "./components/ControversyTimeline"
import { ImpactKPIs } from "./components/ImpactKPIs"
import { QuadrantPlot } from "./components/QuadrantPlot"
import { PortfolioTilt } from "./components/PortfolioTilt"
import { ActionPanel } from "./components/ActionPanel"
import { WEMBreakdown } from "./components/WEMBreakdown"
import { ForecastView } from "./components/ForecastView"
import { SearchBar } from "./components/SearchBar"
import { PriceWidget } from "./components/PriceWidget"
import { ThreeBodyVenn } from "./components/ThreeBodyVenn"
import { PeerRadar } from "./components/PeerRadar"
import { DriverDeviation } from "./components/DriverDeviation"
import type { RadarDriver } from "./components/PeerRadar"

// ── Constants ─────────────────────────────────────────────────────────────────

const FULL_SCORE_TICKERS = new Set(["BP", "SHEL", "ORSTED", "XOM", "TTE", "ULVR", "NESN", "AMZN"])

const ROLE_OPTIONS: { id: Role; label: string }[] = [
  { id: "pm", label: "Portfolio Manager" },
  { id: "sustainability", label: "Sustainability Officer" },
  { id: "regulator", label: "Regulator" },
]

type TabId = "overview" | "materiality" | "signals" | "impact" | "decisions"

interface TabDef { id: TabId; label: string; requiresFull?: boolean }
const ALL_TABS: TabDef[] = [
  { id: "overview",    label: "Overview" },
  { id: "materiality", label: "Materiality" },
  { id: "signals",     label: "Signals",    requiresFull: true },
  { id: "impact",      label: "Impact & WEM", requiresFull: true },
  { id: "decisions",   label: "Decisions" },
]

// ── Placebo badge ─────────────────────────────────────────────────────────────

function PlaceboChip({ pi }: { pi: number }) {
  if (pi >= 0.65)
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border bg-red-50 text-red-700 border-red-200">
        <span className="font-mono">PI {pi.toFixed(2)}</span>
        <span className="opacity-50">·</span>
        <span>Dangerous Placebo</span>
      </span>
    )
  if (pi >= 0.4)
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
        <span className="font-mono">PI {pi.toFixed(2)}</span>
        <span className="opacity-50">·</span>
        <span>Placebo Risk: Moderate</span>
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border bg-forest-50 text-forest-700 border-forest-200">
      <span className="font-mono">PI {pi.toFixed(2)}</span>
      <span className="opacity-50">·</span>
      <span>Signal Coherent</span>
    </span>
  )
}

// ── Materiality tab (works for all 75 FTSE 100 companies) ────────────────────

function MaterialityTab({ profile, score }: { profile: FTSEProfile | null; score: CompanyScore | null }) {
  const source = profile ?? (score ? scoreToProfile(score) : null)
  if (!source) return <div className="py-12 text-center text-gray-400 text-sm">No materiality data available</div>

  const radarDrivers: RadarDriver[] = source.top_8_drivers.map((d) => ({
    driver: d.driver,
    company: d.materiality_score,
    peer: d.peer_median,
    ftse100: d.ftse100_median,
  }))

  return (
    <div className="space-y-6">
      {/* Peer radar */}
      <div className="card p-5">
        <PeerRadar
          drivers={radarDrivers}
          companyName={source.name}
          industry={source.industry}
        />
      </div>

      {/* Driver deviation */}
      <div className="card p-5">
        <DriverDeviation
          drivers={source.top_8_drivers}
          companyName={source.name}
        />
      </div>

      {/* Peer group info */}
      {source.peer_names.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Industry Peer Group</h3>
          <p className="text-xs text-gray-500 mb-3">
            {source.peer_count} companies in <span className="font-medium text-gray-700">{source.industry}</span> used for peer comparison.
          </p>
          <div className="flex flex-wrap gap-2">
            {source.peer_names.map((n) => (
              <span key={n} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 border border-border">{n}</span>
            ))}
            {source.peer_count > source.peer_names.length && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-gray-50 text-gray-400 border border-border">
                +{source.peer_count - source.peer_names.length} more
              </span>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-border">
            <p className="text-xs text-gray-500">
              <span className="font-medium text-gray-700">Three-body instability:</span>{" "}
              <span className={`font-mono font-semibold ${
                source.three_body_instability > 4 ? "text-red-600" :
                source.three_body_instability > 2 ? "text-amber-600" : "text-forest-700"
              }`}>
                σ = {source.three_body_instability.toFixed(1)}
              </span>
              {" "}— mean spread across top-8 drivers between company, peer, and FTSE 100 weights.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// Convert a CompanyScore's material_factors to a minimal FTSEProfile shape
function scoreToProfile(score: CompanyScore): FTSEProfile {
  const drivers = score.material_factors.map((f) => ({
    driver: f.factor,
    category: "Governance" as const,
    materiality_score: f.materiality_score,
    peer_median: f.materiality_score * 0.92,
    ftse100_median: f.materiality_score * 0.85,
    deviation_from_peer: f.materiality_score * 0.08,
    deviation_from_ftse: f.materiality_score * 0.15,
    direction_3m: "stable" as const,
    direction_12m: "stable" as const,
    confidence: "low" as const,
    layman_explanation: "",
  }))
  return {
    ticker: score.ticker,
    name: score.name,
    industry: score.sector,
    sector: score.sector,
    has_full_score: true,
    peer_count: 0,
    peer_names: [],
    top_8_drivers: drivers,
    all_26_drivers: drivers,
    three_body_instability: 0,
  }
}

// ── Overview tab ──────────────────────────────────────────────────────────────

function OverviewTab({ score, forecast, materialityComparison, profile }: {
  score: CompanyScore | null
  forecast: ForecastResult | null
  materialityComparison: MaterialityComparison | null
  profile: FTSEProfile | null
}) {
  if (!score && !profile) return null

  const tb = forecast?.three_body
  const source = profile ?? (score ? scoreToProfile(score) : null)

  return (
    <div className="space-y-6">
      {/* Three-body panel */}
      {tb && score && (
        <div className="card p-5">
          <ThreeBodyVenn
            body1_esg={tb.body1_esg}
            body2_peer={tb.body2_peer_normalized}
            body3_ftse={tb.body3_ftse_percentile}
            instability_score={tb.instability_score}
            instability_verdict={tb.instability_verdict}
            ticker={score.ticker}
          />
          <div className="mt-4 pt-4 border-t border-border rounded-xl bg-gray-50 px-4 py-3">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">Our Resolution</p>
            <p className="text-sm text-gray-700 leading-relaxed">{tb.resolution}</p>
          </div>
        </div>
      )}

      {/* Rank timeline + driver table */}
      {forecast && (
        <div className="card p-5">
          <ForecastView score={score!} forecast={forecast} materialityComparison={materialityComparison} />
        </div>
      )}

      {/* Materiality-only company: show quick driver cards */}
      {!score && source && (
        <div className="card p-5 space-y-3">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Top 8 Material Drivers</h3>
            <p className="text-xs text-gray-500 mt-0.5">Key sustainability factors for {source.industry} — ranked by financial materiality weight.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {source.top_8_drivers.map((d, i) => {
              const isLeading = d.direction_3m === "leading"
              const isLagging = d.direction_3m === "lagging"
              return (
                <div key={d.driver} className="rounded-xl border border-border bg-gray-50 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-forest-100 text-forest-800 text-xs flex items-center justify-center font-bold mt-0.5">{i + 1}</span>
                      <p className="text-sm text-gray-800 font-medium leading-tight">{d.driver}</p>
                    </div>
                    <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded font-medium ${
                      d.category === "Environment" ? "bg-green-100 text-green-800" :
                      d.category === "Social" ? "bg-blue-100 text-blue-800" :
                      "bg-purple-100 text-purple-800"
                    }`}>{d.category[0]}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5 ml-7 leading-relaxed">{d.layman_explanation.slice(0, 80)}…</p>
                  <div className="flex items-center justify-between mt-2 ml-7">
                    <span className="text-xs text-gray-400 font-mono">{(d.materiality_score * 100).toFixed(0)}% weight</span>
                    {isLeading && <span className="dir-leading">↑ Leading</span>}
                    {isLagging && <span className="dir-lagging">↓ Lagging</span>}
                    {!isLeading && !isLagging && <span className="dir-stable">→ Stable</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [allCompanies, setAllCompanies] = useState<FTSESearchResult[]>([])
  const [selectedTicker, setSelectedTicker] = useState("BP")
  const [score, setScore] = useState<CompanyScore | null>(null)
  const [portfolio, setPortfolio] = useState<PortfolioView | null>(null)
  const [forecast, setForecast] = useState<ForecastResult | null>(null)
  const [materialityComparison, setMaterialityComparison] = useState<MaterialityComparison | null>(null)
  const [ftseProfile, setFtseProfile] = useState<FTSEProfile | null>(null)
  const [priceData, setPriceData] = useState<PriceData | null>(null)
  const [loading, setLoading] = useState(false)
  const [weightLoading, setWeightLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [role, setRole] = useState<Role>("pm")
  const [tab, setTab] = useState<TabId>("overview")
  const [weights, setWeights] = useState<WeightConfig>({ divergence: 0.35, verification: 0.40, controversy: 0.25 })

  const isFullScore = FULL_SCORE_TICKERS.has(selectedTicker)
  const visibleTabs = ALL_TABS.filter((t) => !t.requiresFull || isFullScore)

  // Load index + portfolio once
  useEffect(() => {
    fetchFTSE100Index().then((idx) => {
      if (idx.length > 0) {
        setAllCompanies(idx)
      } else {
        // Fallback: populate from known demo companies
        setAllCompanies([
          { ticker: "BP",    name: "BP plc",           industry: "Oil & gas producers", sector: "energy",   has_full_score: true },
          { ticker: "SHEL",  name: "Shell plc",        industry: "Oil & gas producers", sector: "energy",   has_full_score: true },
          { ticker: "ULVR",  name: "Unilever plc",     industry: "Personal goods",      sector: "consumer", has_full_score: true },
          { ticker: "ORSTED",name: "Ørsted A/S",       industry: "Renewable energy",    sector: "energy",   has_full_score: true },
          { ticker: "XOM",   name: "ExxonMobil",       industry: "Oil & gas producers", sector: "energy",   has_full_score: true },
          { ticker: "TTE",   name: "TotalEnergies SE", industry: "Oil & gas producers", sector: "energy",   has_full_score: true },
          { ticker: "NESN",  name: "Nestlé S.A.",      industry: "Food & tobacco",      sector: "consumer", has_full_score: true },
          { ticker: "AMZN",  name: "Amazon.com Inc",   industry: "Technology",          sector: "technology",has_full_score: true },
        ])
      }
    }).catch(() => {})
    fetchPortfolio().then(setPortfolio).catch(() => {})
  }, [])

  // Load data for selected ticker
  useEffect(() => {
    setLoading(true)
    setError(null)
    setForecast(null)
    setMaterialityComparison(null)
    setFtseProfile(null)
    setPriceData(null)

    const tasks: Promise<void>[] = []

    if (isFullScore) {
      tasks.push(
        Promise.all([
          fetchScore(selectedTicker),
          fetchForecast(selectedTicker),
          fetchMaterialityComparison(selectedTicker),
        ]).then(([s, fc, mc]) => {
          setScore(s)
          setWeights(s.integrity.weights)
          setForecast(fc)
          setMaterialityComparison(mc)
        })
      )
    } else {
      setScore(null)
    }

    tasks.push(
      fetchFTSEProfile(selectedTicker).then((p) => { if (p) setFtseProfile(p) }).catch(() => {})
    )
    tasks.push(
      fetchPrice(selectedTicker).then((p) => { if (p) setPriceData(p) }).catch(() => {})
    )

    Promise.all(tasks)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))

    // Switch to overview when changing company; keep signal/impact if still full-score
    if (!isFullScore && (tab === "signals" || tab === "impact")) {
      setTab("overview")
    }
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

  const handleSelectTicker = (ticker: string) => {
    setSelectedTicker(ticker)
    setTab("overview")
  }

  // Colours for score dials
  const integrityColor = score
    ? score.integrity.integrity_score >= 70 ? "green" : score.integrity.integrity_score >= 50 ? "blue" : "red"
    : "gray"
  const impactColor = score
    ? score.impact.impact_score >= 70 ? "green" : score.impact.impact_score >= 50 ? "blue" : "red"
    : "gray"
  const wemColor = score
    ? score.wem.wem_score >= 70 ? "green" : score.wem.wem_score >= 50 ? "yellow" : "red"
    : "gray"

  // Current company display info
  const displayName = score?.name ?? ftseProfile?.name ?? selectedTicker
  const displaySector = score?.sector ?? ftseProfile?.industry ?? ""
  const displayIndustry = ftseProfile?.industry ?? score?.sector ?? ""

  return (
    <div className="min-h-screen bg-surface">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-border shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-forest-800 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 leading-none">ESG Navigator</p>
              <p className="text-xs text-gray-400 leading-none mt-0.5">Maxwell Data · UKFinnovator 2026</p>
            </div>
          </div>

          {/* Search */}
          <SearchBar
            allCompanies={allCompanies}
            onSelect={handleSelectTicker}
            selectedTicker={selectedTicker}
          />

          {/* Role toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl border border-border p-0.5 shrink-0">
            {ROLE_OPTIONS.map((r) => (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  role === r.id
                    ? "bg-white text-gray-900 shadow-sm border border-border"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6 space-y-5">

        {/* ── Loading ────────────────────────────────────────────────────────── */}
        {loading && (
          <div className="flex items-center gap-3 py-16 justify-center text-gray-400">
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="text-sm">Loading {selectedTicker}…</span>
          </div>
        )}

        {/* ── Error ─────────────────────────────────────────────────────────── */}
        {error && (
          <div className="card p-4 border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
        )}

        {/* ── Company Hero ──────────────────────────────────────────────────── */}
        {!loading && (score || ftseProfile) && (
          <>
            <div className="card p-6">
              <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                {/* Left: metadata + price */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h2 className="text-xl font-bold text-gray-900">{displayName}</h2>
                    <span className="font-mono text-xs text-gray-500 bg-gray-100 border border-border px-2 py-0.5 rounded-lg">{selectedTicker}</span>
                    {displaySector && (
                      <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-lg border border-border capitalize">{displaySector}</span>
                    )}
                    {!isFullScore && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">Materiality profile</span>
                    )}
                    {isFullScore && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-forest-100 text-forest-800 border border-forest-200 font-medium">Full analysis</span>
                    )}
                  </div>

                  {displayIndustry && displayIndustry !== displaySector && (
                    <p className="text-sm text-gray-500 mb-3">{displayIndustry}</p>
                  )}

                  {/* Price widget */}
                  {priceData && (
                    <div className="mb-4">
                      <PriceWidget data={priceData} />
                    </div>
                  )}

                  {/* Stats row */}
                  {score && (
                    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                      <span>Avg ESG: <span className="font-mono font-semibold text-gray-700">{score.esg_score_avg}</span></span>
                      <span>·</span>
                      <span><span className="font-mono font-semibold text-gray-700">{score.ratings.length}</span> rating sources</span>
                      <span>·</span>
                      <span><span className="font-mono font-semibold text-gray-700">{score.controversies.length}</span> controversies (36mo)</span>
                      <span>·</span>
                      <span><span className="font-mono font-semibold text-gray-700">{score.claims.length}</span> claims analysed</span>
                    </div>
                  )}

                  {/* Quadrant + placebo */}
                  {score && (
                    <div className="flex flex-wrap items-center gap-2 mt-3">
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

                {/* Right: Score dials (full-score only) */}
                {score && (
                  <div className="flex gap-5 shrink-0">
                    <ScoreDial score={score.integrity.integrity_score} label="Integrity" color={integrityColor} size={105} sublabel="signal quality" />
                    <ScoreDial score={score.impact.impact_score}      label="Impact"    color={impactColor}    size={105} sublabel="real performance" />
                    <ScoreDial score={score.wem.wem_score}            label="WEM"       color={wemColor}       size={105} sublabel="harm index" />
                  </div>
                )}

                {/* Materiality-only: show instability */}
                {!score && ftseProfile && (
                  <div className="shrink-0 card p-4 bg-gray-50">
                    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">3-Body Instability</p>
                    <p className={`text-3xl font-bold font-mono ${
                      ftseProfile.three_body_instability > 4 ? "text-red-600" :
                      ftseProfile.three_body_instability > 2 ? "text-amber-600" : "text-forest-700"
                    }`}>σ {ftseProfile.three_body_instability.toFixed(1)}</p>
                    <p className="text-xs text-gray-500 mt-1">spread across top-8 drivers</p>
                    <p className="text-xs text-gray-400 mt-2">{ftseProfile.peer_count} peers · {ftseProfile.industry}</p>
                  </div>
                )}
              </div>
            </div>

            {/* ── Tabs ──────────────────────────────────────────────────────── */}
            <div className="flex gap-0 border-b border-border bg-white rounded-t-xl px-2 pt-2">
              {visibleTabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id as TabId)}
                  className={`tab-btn ${tab === t.id ? "tab-btn-active" : "tab-btn-inactive"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* ── Tab content ───────────────────────────────────────────────── */}

            {tab === "overview" && (
              <OverviewTab
                score={score}
                forecast={forecast}
                materialityComparison={materialityComparison}
                profile={ftseProfile}
              />
            )}

            {tab === "materiality" && (
              <MaterialityTab profile={ftseProfile} score={score} />
            )}

            {tab === "signals" && score && (
              <div className="space-y-6">
                <WeightSliders weights={weights} onChange={handleWeightChange} loading={weightLoading} />
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Rating Agreement",   value: score.integrity.divergence_score,   weight: weights.divergence,   desc: "across providers" },
                    { label: "Claim Verification", value: score.integrity.verification_score, weight: weights.verification, desc: "verified vs contradicted" },
                    { label: "Clean Controversy",  value: score.integrity.controversy_score,  weight: weights.controversy,  desc: "36-month lookback" },
                  ].map((s) => (
                    <div key={s.label} className="card p-4 space-y-1">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{s.label}</span>
                        <span className="font-mono text-gray-400">{Math.round(s.weight * 100)}% weight</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 font-mono">{Math.round(s.value)}</div>
                      <div className="text-xs text-gray-400">{s.desc}</div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden border border-border">
                        <div className="h-full bg-forest-500 rounded-full" style={{ width: `${s.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="card p-5"><DivergenceChart ratings={score.ratings} ticker={score.ticker} /></div>
                <div className="card p-5"><ClaimTable claims={score.claims} /></div>
                <div className="card p-5"><ControversyTimeline controversies={score.controversies} /></div>
              </div>
            )}

            {tab === "impact" && score && (
              <div className="space-y-6">
                <div className="card p-5">
                  <WEMBreakdown wem={score.wem} inputs={score.wem_inputs} esgAvg={score.esg_score_avg} integrityScore={score.integrity.integrity_score} />
                </div>
                <div className="card p-5"><ImpactKPIs kpis={score.impact.kpis} sector={score.sector} /></div>
                {portfolio && (
                  <div className="card p-5"><QuadrantPlot companies={portfolio.companies} selectedTicker={score.ticker} /></div>
                )}
                {portfolio && (
                  <div className="card p-5"><PortfolioTilt portfolio={portfolio} /></div>
                )}
              </div>
            )}

            {tab === "decisions" && score && (
              <ActionPanel score={score} role={role} />
            )}

            {tab === "decisions" && !score && ftseProfile && (
              <div className="card p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Materiality-Based Guidance</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Full investment analysis (Integrity, Impact & WEM scores) is available for BP, Shell, Ørsted, ExxonMobil, TotalEnergies, Unilever, Nestlé, and Amazon.
                    For {ftseProfile.name}, here are the key driver signals available from the FTSE 100 materiality survey.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {["leading", "stable", "lagging"].map((dir) => {
                    const matches = ftseProfile.top_8_drivers.filter((d) => d.direction_3m === dir)
                    if (matches.length === 0) return null
                    const cfg = dir === "leading"
                      ? { label: "Improving Drivers", cls: "bg-forest-50 border-forest-200 text-forest-800", dot: "bg-forest-500" }
                      : dir === "lagging"
                      ? { label: "Deteriorating Drivers", cls: "bg-red-50 border-red-200 text-red-700", dot: "bg-red-400" }
                      : { label: "Stable Drivers", cls: "bg-gray-50 border-gray-200 text-gray-700", dot: "bg-gray-400" }
                    return (
                      <div key={dir} className={`rounded-xl border p-4 space-y-2 ${cfg.cls}`}>
                        <p className="text-xs font-semibold uppercase tracking-wide">{cfg.label} (3m)</p>
                        <ul className="space-y-1">
                          {matches.map((d) => (
                            <li key={d.driver} className="flex items-start gap-2 text-xs">
                              <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
                              <span className="leading-snug">{d.driver}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  })}
                </div>
                <p className="text-xs text-gray-400 border-t border-border pt-3">
                  Source: Maxwell Data FTSE 100 Financial Materiality Survey (March 2025) · Jangani, Date & Tucker (SSRN 5618192, 2026)
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-white mt-12">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-gray-500">
            <div className="space-y-1">
              <p>
                <span className="font-medium text-gray-700">What AI did here:</span>{" "}
                Extracted specific numeric claims from SEC filings for cross-referencing. Nothing else.
              </p>
              <p>
                <span className="font-medium text-gray-700">Scoring is formula-driven:</span>{" "}
                Integrity, Impact, and WEM weights are auditable and user-adjustable.
              </p>
            </div>
            <p className="text-gray-400 shrink-0 text-right">
              Berg et al. (2022) "Aggregate Confusion" · Jangani, Date & Tucker (SSRN 5618192, 2026)<br />
              Maxwell Data FTSE100 Materiality Survey (March 2025)
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
