from pydantic import BaseModel
from typing import Optional, List


class WeightConfig(BaseModel):
    divergence: float = 0.35
    verification: float = 0.40
    controversy: float = 0.25

    def validate_weights(self) -> "WeightConfig":
        total = self.divergence + self.verification + self.controversy
        if abs(total - 1.0) > 0.01:
            scale = 1.0 / total
            return WeightConfig(
                divergence=self.divergence * scale,
                verification=self.verification * scale,
                controversy=self.controversy * scale,
            )
        return self


class ESGRating(BaseModel):
    source: str
    environmental: float
    social: float
    governance: float
    total: float
    year: int


class Claim(BaseModel):
    claim_text: str
    category: str
    verifiable_metric: str
    stated_value: str
    verification_status: str  # "verified" | "unverifiable" | "contradicted"
    verification_note: str
    source_filing: str


class Controversy(BaseModel):
    headline: str
    incident_date: str
    esg_category: str
    severity: str  # "high" | "medium" | "low"
    source_outlet: str


class ImpactKPI(BaseModel):
    kpi_name: str
    kpi_label: str
    kpi_value: float
    kpi_unit: str
    kpi_score: float
    sector_median: float
    sector_median_score: float
    trend: str  # "improving" | "flat" | "worsening"
    materiality_weight: float


class MaterialFactor(BaseModel):
    factor: str
    materiality_score: float
    rank: int
    source: str = "Maxwell Data FTSE100 Materiality Survey (March 2025)"


class WEMInputs(BaseModel):
    ticker: str
    year: int
    revenue_usd: float
    emissions_tco2e: float
    labor_fines_usd_5y: float
    other_fines_usd_5y: float
    ceo_pay_ratio: float


class WEMBreakdown(BaseModel):
    wem_score: float
    d_carbon: float
    d_labor: float
    d_theft: float
    emissions_intensity: float  # tCO2e per $M revenue


class IntegrityBreakdown(BaseModel):
    divergence_score: float
    verification_score: float
    controversy_score: float
    integrity_score: float
    weights: WeightConfig


class ImpactBreakdown(BaseModel):
    impact_score: float
    kpis: list[ImpactKPI]


class QuadrantInfo(BaseModel):
    quadrant: str
    label: str
    action: str
    action_label: str
    placebo_risk: bool
    color: str
    recommendations: list[str]


class CompanyScore(BaseModel):
    ticker: str
    name: str
    sector: str
    country: str
    ratings: list[ESGRating]
    claims: list[Claim]
    controversies: list[Controversy]
    integrity: IntegrityBreakdown
    impact: ImpactBreakdown
    wem: WEMBreakdown
    wem_inputs: WEMInputs
    quadrant: QuadrantInfo
    esg_score_avg: float
    placebo_index: float
    material_factors: list[MaterialFactor] = []


class PortfolioEntry(BaseModel):
    ticker: str
    name: str
    sector: str
    integrity_score: float
    impact_score: float
    wem_score: float
    placebo_index: float
    quadrant: str
    quadrant_color: str
    esg_score_avg: float


class PortfolioView(BaseModel):
    companies: list[PortfolioEntry]
    naive_esg_tilt: list[dict]
    integrity_impact_tilt: list[dict]
    wem_tilt: list[dict]


class DriverForecast(BaseModel):
    factor: str
    materiality_score: float
    direction_3m: str   # "improving" | "flat" | "worsening"
    direction_12m: str
    confidence: str     # "high" | "medium" | "low"
    note: str


class ThreeBodyAnalysis(BaseModel):
    body1_esg: float               # company's avg ESG score (0–100)
    body2_peer_normalized: float   # peer rank as score: 100=1st, 0=last
    body3_ftse_percentile: float   # estimated FTSE 100 percentile (0–100)
    instability_score: float       # std-dev of the three signals
    instability_verdict: str       # "severe" | "moderate" | "low"
    instability_note: str
    resolution: str


class ForecastResult(BaseModel):
    ticker: str
    peer_sector: str
    peer_count: int
    peer_rank_now: int
    peer_rank_3m: int
    peer_rank_12m: int
    ftse100_percentile_now: int
    ftse100_percentile_3m: int
    ftse100_percentile_12m: int
    driver_forecasts: list[DriverForecast]
    three_body: ThreeBodyAnalysis
    summary_investor: str
    summary_corporate: str
    summary_auditor: str
    crowd_consensus: str
