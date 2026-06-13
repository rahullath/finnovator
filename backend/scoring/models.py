from pydantic import BaseModel
from typing import Optional


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
    quadrant: QuadrantInfo


class PortfolioEntry(BaseModel):
    ticker: str
    name: str
    sector: str
    integrity_score: float
    impact_score: float
    quadrant: str
    quadrant_color: str
    esg_score_avg: float


class PortfolioView(BaseModel):
    companies: list[PortfolioEntry]
    naive_esg_tilt: list[dict]
    integrity_impact_tilt: list[dict]
