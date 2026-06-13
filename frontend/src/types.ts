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
  quadrant: QuadrantInfo
}

export interface PortfolioEntry {
  ticker: string
  name: string
  sector: string
  integrity_score: number
  impact_score: number
  quadrant: string
  quadrant_color: QuadrantColor
  esg_score_avg: number
}

export interface PortfolioView {
  companies: PortfolioEntry[]
  naive_esg_tilt: { ticker: string; name: string; weight: number }[]
  integrity_impact_tilt: { ticker: string; name: string; weight: number }[]
}

export type Role = "pm" | "sustainability" | "regulator"
export type TabId = "signal" | "impact" | "action"
