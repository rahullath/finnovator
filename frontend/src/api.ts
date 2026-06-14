import type { CompanyScore, PortfolioView, WeightConfig, ForecastResult, MaterialityComparison, FTSESearchResult, FTSEProfile, PriceData } from "./types"
import {
  ORDER, isEmbedded,
  getEmbeddedScore, getEmbeddedProfile, getEmbeddedForecast,
  getEmbeddedMaterialityComparison, getEmbeddedPortfolio, getEmbeddedCompanies,
} from "./data/embedded"
export type { CompanyScore }

// Backend is primary. Embedded data is a complete offline fallback for the 8
// core companies (used when backend is unreachable or in prod without JSON files).

const PROD = import.meta.env.PROD

async function tryFetch<T>(url: string): Promise<T> {
  const r = await fetch(url)
  if (!r.ok) throw new Error(`${r.status} ${url}`)
  return r.json()
}

// ── Scores ────────────────────────────────────────────────────────────────────

export async function fetchScore(ticker: string): Promise<CompanyScore> {
  try {
    const url = PROD ? `/data/scores/${ticker}.json` : `/api/score/${ticker}`
    return await tryFetch<CompanyScore>(url)
  } catch {
    const e = getEmbeddedScore(ticker)
    if (e) return e
    throw new Error(`No data for ${ticker}`)
  }
}

export async function fetchScoreWithWeights(ticker: string, weights: WeightConfig): Promise<CompanyScore> {
  if (PROD) return fetchScore(ticker)
  try {
    const r = await fetch(`/api/score/${ticker}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(weights),
    })
    if (!r.ok) throw new Error(`${r.status}`)
    return r.json()
  } catch {
    return fetchScore(ticker)
  }
}

// ── Portfolio ─────────────────────────────────────────────────────────────────

export async function fetchPortfolio(): Promise<PortfolioView> {
  try {
    const url = PROD ? "/data/portfolio.json" : "/api/portfolio"
    return await tryFetch<PortfolioView>(url)
  } catch {
    return getEmbeddedPortfolio()
  }
}

// ── Forecast ──────────────────────────────────────────────────────────────────

export async function fetchForecast(ticker: string): Promise<ForecastResult> {
  try {
    const url = PROD ? `/data/forecasts/${ticker}.json` : `/api/forecast/${ticker}`
    return await tryFetch<ForecastResult>(url)
  } catch {
    const e = getEmbeddedForecast(ticker)
    if (e) return e
    throw new Error(`No forecast for ${ticker}`)
  }
}

// ── Materiality comparison ────────────────────────────────────────────────────

export async function fetchMaterialityComparison(ticker: string): Promise<MaterialityComparison> {
  try {
    const url = PROD ? `/data/materiality-comparison/${ticker}.json` : `/api/materiality-comparison/${ticker}`
    return await tryFetch<MaterialityComparison>(url)
  } catch {
    const e = getEmbeddedMaterialityComparison(ticker)
    if (e) return e
    throw new Error(`No materiality comparison for ${ticker}`)
  }
}

// ── FTSE 100 index ────────────────────────────────────────────────────────────

export async function fetchFTSE100Index(): Promise<FTSESearchResult[]> {
  try {
    const url = PROD ? "/data/ftse100-index.json" : "/api/ftse100-index"
    const list = await tryFetch<FTSESearchResult[]>(url)
    if (list.length > 0) return list
    throw new Error("empty")
  } catch {
    return getEmbeddedCompanies()
  }
}

// ── FTSE profile ──────────────────────────────────────────────────────────────

export async function fetchFTSEProfile(ticker: string): Promise<FTSEProfile | null> {
  try {
    const url = PROD ? `/data/profiles/${ticker}.json` : `/api/profile/${ticker}`
    return await tryFetch<FTSEProfile>(url)
  } catch {
    return getEmbeddedProfile(ticker)
  }
}

// ── Price ─────────────────────────────────────────────────────────────────────

export async function fetchPrice(ticker: string): Promise<PriceData | null> {
  try {
    const url = PROD ? `/data/prices/${ticker}.json` : `/api/price/${ticker}`
    return await tryFetch<PriceData>(url)
  } catch {
    return null
  }
}

// ── Refresh (dev-only) ────────────────────────────────────────────────────────

export async function refreshCompany(ticker: string): Promise<{ ingestion: Record<string, unknown>; scores: CompanyScore }> {
  if (PROD) return { ingestion: { status: "static_deployment" }, scores: await fetchScore(ticker) }
  try {
    return await tryFetch(`/api/refresh/${ticker}`)
  } catch {
    return { ingestion: { status: "error" }, scores: await fetchScore(ticker) }
  }
}
