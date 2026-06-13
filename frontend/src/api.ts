import type { CompanyScore, PortfolioView, WeightConfig } from "./types"
// Re-export so callers can type the refresh response properly
export type { CompanyScore }

const BASE = "/api"

export async function fetchCompanies(): Promise<string[]> {
  const r = await fetch(`${BASE}/companies`)
  if (!r.ok) throw new Error("Failed to fetch companies")
  return r.json()
}

export async function fetchScore(ticker: string): Promise<CompanyScore> {
  const r = await fetch(`${BASE}/score/${ticker}`)
  if (!r.ok) throw new Error(`No data for ${ticker}`)
  return r.json()
}

export async function fetchScoreWithWeights(
  ticker: string,
  weights: WeightConfig
): Promise<CompanyScore> {
  const r = await fetch(`${BASE}/score/${ticker}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(weights),
  })
  if (!r.ok) throw new Error(`Failed to recalculate score for ${ticker}`)
  return r.json()
}

export async function fetchPortfolio(): Promise<PortfolioView> {
  const r = await fetch(`${BASE}/portfolio`)
  if (!r.ok) throw new Error("Failed to fetch portfolio")
  return r.json()
}

export async function refreshCompany(ticker: string): Promise<{ ingestion: Record<string, unknown>; scores: CompanyScore }> {
  const r = await fetch(`${BASE}/refresh/${ticker}`, { method: "POST" })
  if (!r.ok) throw new Error(`Failed to refresh ${ticker}`)
  return r.json()
}
