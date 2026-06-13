import { useState, useEffect, useCallback } from "react"
import type { CompanyScore, PortfolioView, ForecastResult, MaterialityComparison, Role, TabId, WeightConfig } from "./types"
import { fetchScore, fetchScoreWithWeights, fetchPortfolio, fetchCompanies, fetchForecast, fetchMaterialityComparison } from "./api"

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

const ROLE_OPTIONS: { id: Role; label: string }[] = [
  { id: "pm", label: "Portfolio Manager" },
  { id: "sustainability", label: "Sustainability Officer" },
  { id: "regulator", label: "Regulator" },
]

const TAB_OPTIONS: { id: TabId; label: string }[] = [
  { id: "outlook", label: "Outlook" },
  { id: "signal", label: "Signal Breakdown" },
  { id: "impact", label: "Impact & Capital" },
  { id: "action", label: "Action Panel" },
]

const DEFAULT_TICKERS = ["BP", "SHEL", "ORSTED", "XOM", "TTE", "ULVR", "NESN", "AMZN"]

export default function App() {
  const [tickers, setTickers] = useState<string[]>(DEFAULT_TICKERS)
  const [selectedTicker, setSelectedTicker] = useState("BP")
  const [score, setScore] = useState<CompanyScore | null>(null)
  const [portfolio, setPortfolio] = useState<PortfolioView | null>(null)
  const [forecast, setForecast] = useState<ForecastResult | null>(null)
  const [materialityComparison, setMaterialityComparison] = useState<MaterialityComparison | null>(null)
  const [loading, setLoading] = useState(false)
  const [weightLoading, setWeightLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [role, setRole] = useState<Role>("pm")
  const [tab, setTab] = useState<TabId>("outlook")
  const [weights, setWeights] = useState<WeightConfig>({ divergence: 0.35, verification: 0.40, controversy: 0.25 })

  useEffect(() => {
    fetchCompanies().then(setTickers).catch(() => {})
    fetchPortfolio().then(setPortfolio).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    setForecast(null)
    setMaterialityComparison(null)
    Promise.all([
      fetchScore(selectedTicker),
      fetchForecast(selectedTicker),
      fetchMaterialityComparison(selectedTicker),
    ])
      .then(([s, fc, mc]) => {
        setScore(s)
        setWeights(s.integrity.weights)
        setForecast(fc)
        setMaterialityComparison(mc)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [selectedTicker])

  const handleWeightChange = useCallback(async (newWeights: WeightConfig) => {
    setWeights(newWeights)
    if (!selectedTicker) return
    setWeightLoading(true)
    try {
      const s = await fetchScoreWithWeights(selectedTicker, newWeights)
      setScore(s)
    } catch {
      // keep current score on failure
    } finally {
      setWeightLoading(false)
    }
  }, [selectedTicker])

  const integrityColor = score
    ? score.integrity.integrity_score >= 70 ? "green"
    : score.integrity.integrity_score >= 50 ? "blue"
    : "red"
    : "gray"

  const impactColor = score
    ? score.impact.impact_score >= 70 ? "green"
    : score.impact.impact_score >= 50 ? "blue"
    : "red"
    : "gray"

  const wemColor = score
    ? score.wem.wem_score >= 70 ? "green"
    : score.wem.wem_score >= 50 ? "yellow"
    : "red"
    : "gray"

  const placeboLevel = score
    ? score.placebo_index >= 0.65 ? { label: "Dangerous Placebo", cls: "text-red-400 bg-red-500/10 border-red-500/30" }
    : score.placebo_index >= 0.4 ? { label: "Placebo Risk: Moderate", cls: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30" }
    : { label: "Signal Coherent", cls: "text-gray-400 bg-surface border-border" }
    : null

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-white">ESG Integrity & Impact Navigator</h1>
            <p className="text-xs text-gray-500">Maxwell Data Challenge · UKFinnovator 2026</p>
          </div>
          <div className="flex items-center gap-1 bg-surface rounded-lg border border-border p-0.5">
            {ROLE_OPTIONS.map((r) => (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  role === r.id
                    ? "bg-card text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        {/* Company selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-500 mr-1">Company:</span>
          {tickers.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTicker(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all ${
                selectedTicker === t
                  ? "bg-white text-gray-900 border-white"
                  : "bg-transparent text-gray-400 border-border hover:border-gray-500 hover:text-gray-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex items-center gap-3 py-12 justify-center text-gray-500">
            <span className="animate-spin">⟳</span>
            <span>Loading {selectedTicker}…</span>
          </div>
        )}

        {error && (
          <div className="card p-4 border-red-500/30 bg-red-500/5 text-red-400 text-sm">
            {error}
          </div>
        )}

        {score && !loading && (
          <>
            {/* Hero: company info + scores */}
            <div className="card p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-white">{score.name}</h2>
                    <span className="font-mono text-xs text-gray-500 bg-surface border border-border px-2 py-0.5 rounded">{score.ticker}</span>
                    <span className="text-xs text-gray-500 capitalize">{score.sector}</span>
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500 mb-4">
                    <span>Avg ESG score: {score.ratings.length ? (score.ratings.reduce((s, r) => s + r.total, 0) / score.ratings.length).toFixed(1) : "N/A"}</span>
                    <span>·</span>
                    <span>{score.ratings.length} rating sources</span>
                    <span>·</span>
                    <span>{score.controversies.length} controversies (36mo)</span>
                    <span>·</span>
                    <span>{score.claims.length} claims analysed</span>
                  </div>
                  <QuadrantBadge
                    label={score.quadrant.label}
                    color={score.quadrant.color}
                    actionLabel={score.quadrant.action_label}
                    placeboRisk={score.quadrant.placebo_risk}
                    large
                  />
                  {placeboLevel && (
                    <div className={`mt-2 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${placeboLevel.cls}`}>
                      <span className="font-mono">PI {score.placebo_index.toFixed(2)}</span>
                      <span className="opacity-40">·</span>
                      <span>{placeboLevel.label}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-6 shrink-0">
                  <ScoreDial
                    score={score.integrity.integrity_score}
                    label="Integrity Score"
                    color={integrityColor}
                    size={115}
                  />
                  <ScoreDial
                    score={score.impact.impact_score}
                    label="Impact Alignment"
                    color={impactColor}
                    size={115}
                  />
                  <ScoreDial
                    score={score.wem.wem_score}
                    label="WEM Score"
                    color={wemColor}
                    size={115}
                  />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-border">
              {TAB_OPTIONS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                    tab === t.id
                      ? "border-blue-500 text-white"
                      : "border-transparent text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {tab === "outlook" && (
              forecast
                ? <ForecastView score={score} forecast={forecast} materialityComparison={materialityComparison} />
                : <div className="py-12 text-center text-gray-500 text-sm">Loading outlook…</div>
            )}

            {tab === "signal" && (
              <div className="space-y-6">
                <WeightSliders weights={weights} onChange={handleWeightChange} loading={weightLoading} />

                {/* Sub-score breakdown */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Rating Agreement", value: score.integrity.divergence_score, weight: weights.divergence, desc: "across providers" },
                    { label: "Claim Verification", value: score.integrity.verification_score, weight: weights.verification, desc: "verified vs contradicted" },
                    { label: "Clean Controversy", value: score.integrity.controversy_score, weight: weights.controversy, desc: "36-month lookback" },
                  ].map((s) => (
                    <div key={s.label} className="card p-4 space-y-1">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{s.label}</span>
                        <span className="font-mono text-gray-600">{Math.round(s.weight * 100)}% weight</span>
                      </div>
                      <div className="text-2xl font-bold text-white font-mono">{Math.round(s.value)}</div>
                      <div className="text-xs text-gray-500">{s.desc}</div>
                      <div className="h-1 bg-surface rounded-full overflow-hidden border border-border">
                        <div className="h-full bg-blue-500/60 rounded-full" style={{ width: `${s.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="card p-5">
                  <DivergenceChart ratings={score.ratings} ticker={score.ticker} />
                </div>

                <div className="card p-5">
                  <ClaimTable claims={score.claims} />
                </div>

                <div className="card p-5">
                  <ControversyTimeline controversies={score.controversies} />
                </div>
              </div>
            )}

            {tab === "impact" && (
              <div className="space-y-6">
                <div className="card p-5">
                  <WEMBreakdown
                    wem={score.wem}
                    inputs={score.wem_inputs}
                    esgAvg={score.esg_score_avg}
                    integrityScore={score.integrity.integrity_score}
                  />
                </div>
                <div className="card p-5">
                  <ImpactKPIs kpis={score.impact.kpis} sector={score.sector} />
                </div>
                {portfolio && (
                  <div className="card p-5">
                    <QuadrantPlot companies={portfolio.companies} selectedTicker={score.ticker} />
                  </div>
                )}
                {portfolio && (
                  <div className="card p-5">
                    <PortfolioTilt portfolio={portfolio} />
                  </div>
                )}
              </div>
            )}

            {tab === "action" && (
              <ActionPanel score={score} role={role} />
            )}
          </>
        )}
      </main>

      {/* Footer — AI transparency */}
      <footer className="border-t border-border mt-12">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-gray-600">
            <div className="space-y-0.5">
              <p>
                <span className="text-gray-400 font-medium">What AI did here:</span> Extracted specific numeric claims from SEC filings for cross-referencing. Nothing else.
              </p>
              <p>
                <span className="text-gray-400 font-medium">What AI did not do:</span> No automatic ESG scoring, no hidden re-weighting, no generative sustainability narratives.
              </p>
            </div>
            <p className="text-gray-600 shrink-0">
              Grounded in Berg et al. (2022) · MIT Aggregate Confusion Project
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
