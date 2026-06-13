import type { CompanyScore, PortfolioView, WeightConfig, ForecastResult, MaterialityComparison, FTSESearchResult, FTSEProfile, PriceData } from "./types"
export type { CompanyScore }

// In dev: Vite proxy forwards /api/* → localhost:8000 (FastAPI)
// In prod (Vercel): no backend — fetch pre-baked static JSON from /data/*
const PROD = import.meta.env.PROD

export async function fetchCompanies(): Promise<string[]> {
  if (PROD) {
    const r = await fetch("/data/companies.json")
    if (!r.ok) throw new Error("Failed to fetch companies")
    return r.json()
  }
  const r = await fetch("/api/companies")
  if (!r.ok) throw new Error("Failed to fetch companies")
  return r.json()
}

export async function fetchScore(ticker: string): Promise<CompanyScore> {
  if (PROD) {
    const r = await fetch(`/data/scores/${ticker}.json`)
    if (!r.ok) throw new Error(`No data for ${ticker}`)
    return r.json()
  }
  const r = await fetch(`/api/score/${ticker}`)
  if (!r.ok) throw new Error(`No data for ${ticker}`)
  return r.json()
}

export async function fetchScoreWithWeights(
  ticker: string,
  weights: WeightConfig
): Promise<CompanyScore> {
  if (PROD) {
    // Weight sliders can't recompute in prod — return cached score unchanged
    return fetchScore(ticker)
  }
  const r = await fetch(`/api/score/${ticker}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(weights),
  })
  if (!r.ok) throw new Error(`Failed to recalculate score for ${ticker}`)
  return r.json()
}

export async function fetchPortfolio(): Promise<PortfolioView> {
  if (PROD) {
    const r = await fetch("/data/portfolio.json")
    if (!r.ok) throw new Error("Failed to fetch portfolio")
    return r.json()
  }
  const r = await fetch("/api/portfolio")
  if (!r.ok) throw new Error("Failed to fetch portfolio")
  return r.json()
}

export async function fetchForecast(ticker: string): Promise<ForecastResult> {
  if (PROD) {
    const r = await fetch(`/data/forecasts/${ticker}.json`)
    if (!r.ok) throw new Error(`No forecast for ${ticker}`)
    return r.json()
  }
  const r = await fetch(`/api/forecast/${ticker}`)
  if (!r.ok) throw new Error(`No forecast for ${ticker}`)
  return r.json()
}

export async function fetchMaterialityComparison(ticker: string): Promise<MaterialityComparison> {
  if (PROD) {
    const r = await fetch(`/data/materiality-comparison/${ticker}.json`)
    if (!r.ok) throw new Error(`No materiality comparison for ${ticker}`)
    return r.json()
  }
  const r = await fetch(`/api/materiality-comparison/${ticker}`)
  if (!r.ok) throw new Error(`No materiality comparison for ${ticker}`)
  return r.json()
}

export async function refreshCompany(ticker: string): Promise<{ ingestion: Record<string, unknown>; scores: CompanyScore }> {
  if (PROD) {
    const scores = await fetchScore(ticker)
    return { ingestion: { status: "static_deployment" }, scores }
  }
  const r = await fetch(`/api/refresh/${ticker}`, { method: "POST" })
  if (!r.ok) throw new Error(`Failed to refresh ${ticker}`)
  return r.json()
}

export async function fetchFTSE100Index(): Promise<FTSESearchResult[]> {
  if (PROD) {
    const r = await fetch("/data/ftse100-index.json")
    if (!r.ok) return []
    return r.json()
  }
  const r = await fetch("/api/ftse100-index")
  if (!r.ok) return []
  return r.json()
}

export async function fetchFTSEProfile(ticker: string): Promise<FTSEProfile | null> {
  if (PROD) {
    const r = await fetch(`/data/profiles/${ticker}.json`)
    if (!r.ok) return null
    return r.json()
  }
  const r = await fetch(`/api/profile/${ticker}`)
  if (!r.ok) return null
  return r.json()
}

export async function fetchPrice(ticker: string): Promise<PriceData | null> {
  if (PROD) {
    const r = await fetch(`/data/prices/${ticker}.json`)
    if (!r.ok) return null
    return r.json()
  }
  const r = await fetch(`/api/price/${ticker}`)
  if (!r.ok) return null
  return r.json()
}
