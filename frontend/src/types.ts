export interface WeightConfig {
  divergence: number
  verification: number
  controversy: number
}

export interface ESGRating {
  source: string
  environmental: number
  social: number
  governance: number
  total: number
  year: number
}

export interface Claim {
  claim_text: string
  category: string
  verifiable_metric: string
  stated_value: string
  verification_status: "verified" | "unverifiable" | "contradicted"
  verification_note: string
  source_filing: string
}

export interface Controversy {
  headline: string
  incident_date: string
  esg_category: string
  severity: "high" | "medium" | "low"
  source_outlet: string
}

export interface ImpactKPI {
  kpi_name: string
  kpi_label: string
  kpi_value: number
  kpi_unit: string
  kpi_score: number
  sector_median: number
  sector_median_score: number
  trend: "improving" | "flat" | "worsening"
  materiality_weight: number
}

export interface IntegrityBreakdown {
  divergence_score: number
  verification_score: number
  controversy_score: number
  integrity_score: number
  weights: WeightConfig
}

export interface ImpactBreakdown {
  impact_score: number
  kpis: ImpactKPI[]
}

export interface MaterialFactor {
  factor: string
  materiality_score: number
  rank: number
  source: string
}

export interface WEMInputs {
  ticker: string
  year: number
  revenue_usd: number
  emissions_tco2e: number
  labor_fines_usd_5y: number
  other_fines_usd_5y: number
  ceo_pay_ratio: number
}

export interface WEMBreakdown {
  wem_score: number
  d_carbon: number
  d_labor: number
  d_theft: number
  emissions_intensity: number  // tCO2e per $M revenue
}

export type QuadrantColor = "green" | "blue" | "yellow" | "red"

export interface QuadrantInfo {
  quadrant: string
  label: string
  action: string
  action_label: string
  placebo_risk: boolean
  color: QuadrantColor
  recommendations: string[]
}

export interface CompanyScore {
  ticker: string
  name: string
  sector: string
  country: string
  ratings: ESGRating[]
  claims: Claim[]
  controversies: Controversy[]
  integrity: IntegrityBreakdown
  impact: ImpactBreakdown
  wem: WEMBreakdown
  wem_inputs: WEMInputs
  quadrant: QuadrantInfo
  esg_score_avg: number
  placebo_index: number
  material_factors: MaterialFactor[]
}

export interface PortfolioEntry {
  ticker: string
  name: string
  sector: string
  integrity_score: number
  impact_score: number
  wem_score: number
  placebo_index: number
  quadrant: string
  quadrant_color: QuadrantColor
  esg_score_avg: number
}

export interface PortfolioView {
  companies: PortfolioEntry[]
  naive_esg_tilt: { ticker: string; name: string; weight: number }[]
  integrity_impact_tilt: { ticker: string; name: string; weight: number }[]
  wem_tilt: { ticker: string; name: string; weight: number }[]
}

export interface DriverComparison {
  driver: string
  topic: string                  // "Environment" | "Social" | "Governance"
  company_score: number | null   // null = not in company's material top-8
  peer_median: number | null
  ftse100_median: number | null
  peer_n: number
  ftse100_n: number
  divergence_from_peer: number   // positive = company weighs this more than peers
  divergence_from_ftse: number
  uniqueness: string             // "company_leading"|"sector_norm"|"company_lagging"|"company_only"|"peer_only"|"absent"
  spread: number                 // three-body instability per driver
  why: string
}

export interface MaterialityComparison {
  ticker: string
  company_name: string
  industry: string
  ftse_industry: string
  peer_count: number
  top_8: DriverComparison[]
  all_26: DriverComparison[]
  three_body_instability: number
  unique_to_company: string[]
  unique_to_peers: string[]
}

export type Role = "pm" | "sustainability" | "regulator"
export type TabId = "signal" | "impact" | "action" | "outlook"

export interface DriverForecast {
  factor: string
  materiality_score: number
  direction_3m: "leading" | "stable" | "lagging"
  direction_12m: "leading" | "stable" | "lagging"
  confidence: "high" | "medium" | "low"
  note: string
}

export interface ThreeBodyAnalysis {
  body1_esg: number
  body2_peer_normalized: number
  body3_ftse_percentile: number
  instability_score: number
  instability_verdict: "severe" | "moderate" | "low"
  instability_note: string
  resolution: string
}

export interface ForecastResult {
  ticker: string
  peer_sector: string
  peer_count: number
  peer_rank_now: number
  peer_rank_3m: number
  peer_rank_12m: number
  ftse100_percentile_now: number
  ftse100_percentile_3m: number
  ftse100_percentile_12m: number
  driver_forecasts: DriverForecast[]
  three_body: ThreeBodyAnalysis
  summary_investor: string
  summary_corporate: string
  summary_auditor: string
  crowd_consensus: string
}
