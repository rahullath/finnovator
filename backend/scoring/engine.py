"""
Main orchestration: loads data from CSVs and computes all scores.
All scoring logic is explicit and formula-driven — no black boxes.
"""
import math
import pandas as pd
from pathlib import Path

from .models import (
    WeightConfig, ESGRating, Claim, Controversy, ImpactKPI,
    WEMInputs, WEMBreakdown,
    IntegrityBreakdown, ImpactBreakdown, QuadrantInfo,
    MaterialFactor, CompanyScore, PortfolioEntry, PortfolioView,
)
from .divergence import calculate_divergence_score
from .verification import calculate_verification_score
from .controversy import calculate_controversy_score
from .impact import calculate_impact_score, get_material_factors
from .wem import calculate_wem_score

DATA_DIR = Path(__file__).parent.parent / "data"

QUADRANT_RULES = {
    ("high", "high"): {
        "quadrant": "preferred_leader",
        "label": "Preferred Sustainability Leader",
        "action": "increase_weight",
        "action_label": "Consider increasing portfolio weight",
        "color": "green",
        "placebo_risk": False,
    },
    ("high", "low"): {
        "quadrant": "engagement_priority",
        "label": "Engagement Priority",
        "action": "engage",
        "action_label": "Credible story but limited real-world progress — engage on specific KPIs",
        "color": "blue",
        "placebo_risk": False,
    },
    ("low", "high"): {
        "quadrant": "impact_alpha",
        "label": "Under-recognised Performer",
        "action": "investigate",
        "action_label": "Potential impact alpha — ESG signal understates real performance; investigate data gaps",
        "color": "yellow",
        "placebo_risk": False,
    },
    ("low", "low"): {
        "quadrant": "greenwashing_risk",
        "label": "Greenwashing Risk / Laggard",
        "action": "exclude",
        "action_label": "Candidate for exclusion or significant risk premium",
        "color": "red",
        "placebo_risk": True,
    },
}

QUADRANT_RECOMMENDATIONS = {
    "preferred_leader": [
        "ESG signal is reliable — weight the company's reported metrics with confidence",
        "Monitor for continued performance against sector-specific KPIs",
        "Engage constructively on remaining data gaps to maintain signal quality",
    ],
    "engagement_priority": [
        "ESG rating is credible but impact KPIs lag the narrative — press for concrete targets",
        "Require time-bound, science-based milestones before increasing allocation",
        "Sector-wide regulation is more effective than portfolio exclusion alone here",
    ],
    "impact_alpha": [
        "Real-world performance may be undervalued by mainstream ESG ratings — investigate",
        "Push company to improve disclosure quality to close integrity gap",
        "Consider over-weighting if due diligence confirms strong actual performance",
    ],
    "greenwashing_risk": [
        "High ESG branding with low measurable impact — textbook 'dangerous placebo' pattern (Tariq Fancy)",
        "Apply significant risk premium: regulation, litigation, and reputational exposure are material",
        "Exclusion or minimal weight recommended until claims can be independently verified",
        "Portfolio-level policy engagement more impactful than marginal tilt adjustments",
    ],
}


def _load_companies() -> pd.DataFrame:
    return pd.read_csv(DATA_DIR / "companies.csv")


def _load_ratings() -> pd.DataFrame:
    return pd.read_csv(DATA_DIR / "esg_ratings.csv")


def _load_claims() -> pd.DataFrame:
    return pd.read_csv(DATA_DIR / "claims.csv")


def _load_controversies() -> pd.DataFrame:
    return pd.read_csv(DATA_DIR / "controversies.csv")


def _load_kpis() -> pd.DataFrame:
    return pd.read_csv(DATA_DIR / "impact_kpis.csv")


def _load_wem_inputs() -> pd.DataFrame:
    return pd.read_csv(DATA_DIR / "wem_inputs.csv")


def _load_materiality() -> pd.DataFrame:
    path = DATA_DIR / "materiality.csv"
    if not path.exists():
        return pd.DataFrame(columns=["ticker", "factor", "materiality_score"])
    return pd.read_csv(path)


def _get_material_factors(ticker: str, top_n: int = 5) -> list[MaterialFactor]:
    df = _load_materiality()
    subset = df[df["ticker"] == ticker].nlargest(top_n, "materiality_score").reset_index(drop=True)
    return [
        MaterialFactor(
            factor=row["factor"],
            materiality_score=round(float(row["materiality_score"]), 4),
            rank=i + 1,
        )
        for i, row in subset.iterrows()
    ]


def _all_wem_inputs() -> list[WEMInputs]:
    df = _load_wem_inputs()
    return [
        WEMInputs(
            ticker=row["ticker"],
            year=int(row["year"]),
            revenue_usd=float(row["revenue_usd"]),
            emissions_tco2e=float(row["emissions_tco2e"]),
            labor_fines_usd_5y=float(row["labor_fines_usd_5y"]),
            other_fines_usd_5y=float(row["other_fines_usd_5y"]),
            ceo_pay_ratio=float(row["ceo_pay_ratio"]),
        )
        for _, row in df.iterrows()
    ]


def _placebo_index(esg_avg: float, wem_score: float, integrity_score: float) -> float:
    """
    High when ESG looks good but WEM and Integrity are low.
    Operationalises Tariq Fancy's 'dangerous placebo' idea.
    """
    raw = 0.6 * (esg_avg - wem_score) + 0.4 * (100 - integrity_score)
    return round(1 / (1 + math.exp(-raw / 20)), 3)


def get_all_tickers() -> list[str]:
    return _load_companies()["ticker"].tolist()


def get_company_score(ticker: str, weights: WeightConfig | None = None) -> CompanyScore | None:
    if weights is None:
        weights = WeightConfig()
    weights = weights.validate_weights()

    companies_df = _load_companies()
    company_row = companies_df[companies_df["ticker"] == ticker]
    if company_row.empty:
        return None
    company = company_row.iloc[0]

    ratings_df = _load_ratings()
    ratings = [
        ESGRating(
            source=row["source"],
            environmental=row["environmental"],
            social=row["social"],
            governance=row["governance"],
            total=row["total"],
            year=int(row["year"]),
        )
        for _, row in ratings_df[ratings_df["ticker"] == ticker].iterrows()
    ]

    claims_df = _load_claims()
    claims = [
        Claim(
            claim_text=row["claim_text"],
            category=row["category"],
            verifiable_metric=row["verifiable_metric"],
            stated_value=row["stated_value"],
            verification_status=row["verification_status"],
            verification_note=row["verification_note"],
            source_filing=row["source_filing"],
        )
        for _, row in claims_df[claims_df["ticker"] == ticker].iterrows()
    ]

    controversies_df = _load_controversies()
    controversies = [
        Controversy(
            headline=row["headline"],
            incident_date=row["incident_date"],
            esg_category=row["esg_category"],
            severity=row["severity"],
            source_outlet=row["source_outlet"],
        )
        for _, row in controversies_df[controversies_df["ticker"] == ticker].iterrows()
    ]

    kpis_df = _load_kpis()
    kpis = [
        ImpactKPI(
            kpi_name=row["kpi_name"],
            kpi_label=row["kpi_label"],
            kpi_value=row["kpi_value"],
            kpi_unit=row["kpi_unit"],
            kpi_score=row["kpi_score"],
            sector_median=row["sector_median"],
            sector_median_score=row["sector_median_score"],
            trend=row["trend"],
            materiality_weight=row["materiality_weight"],
        )
        for _, row in kpis_df[kpis_df["ticker"] == ticker].iterrows()
    ]

    divergence_score = calculate_divergence_score(ratings)
    verification_score = calculate_verification_score(claims)
    controversy_score = calculate_controversy_score(controversies)

    integrity_score = round(
        weights.divergence * divergence_score
        + weights.verification * verification_score
        + weights.controversy * controversy_score,
        1,
    )

    impact_score = calculate_impact_score(kpis, company["sector"])

    # WEM score
    all_wem = _all_wem_inputs()
    wem_df = _load_wem_inputs()
    wem_row = wem_df[wem_df["ticker"] == ticker]
    if not wem_row.empty:
        row = wem_row.iloc[0]
        wem_inputs_obj = WEMInputs(
            ticker=ticker,
            year=int(row["year"]),
            revenue_usd=float(row["revenue_usd"]),
            emissions_tco2e=float(row["emissions_tco2e"]),
            labor_fines_usd_5y=float(row["labor_fines_usd_5y"]),
            other_fines_usd_5y=float(row["other_fines_usd_5y"]),
            ceo_pay_ratio=float(row["ceo_pay_ratio"]),
        )
    else:
        wem_inputs_obj = WEMInputs(
            ticker=ticker, year=2023,
            revenue_usd=1.0, emissions_tco2e=0.0,
            labor_fines_usd_5y=0.0, other_fines_usd_5y=0.0, ceo_pay_ratio=50.0,
        )

    wem_result = calculate_wem_score(wem_inputs_obj, all_wem)
    wem_breakdown = WEMBreakdown(**wem_result)

    avg_esg = round(sum(r.total for r in ratings) / len(ratings), 1) if ratings else 50.0
    placebo_idx = _placebo_index(avg_esg, wem_breakdown.wem_score, integrity_score)

    integrity_tier = "high" if integrity_score >= 50 else "low"
    impact_tier = "high" if impact_score >= 50 else "low"
    rule = QUADRANT_RULES[(integrity_tier, impact_tier)]

    quadrant = QuadrantInfo(
        quadrant=rule["quadrant"],
        label=rule["label"],
        action=rule["action"],
        action_label=rule["action_label"],
        placebo_risk=rule["placebo_risk"],
        color=rule["color"],
        recommendations=QUADRANT_RECOMMENDATIONS[rule["quadrant"]],
    )

    material_factors = _get_material_factors(ticker)

    return CompanyScore(
        ticker=ticker,
        name=company["name"],
        sector=company["sector"],
        country=company["country"],
        ratings=ratings,
        claims=claims,
        controversies=controversies,
        integrity=IntegrityBreakdown(
            divergence_score=divergence_score,
            verification_score=verification_score,
            controversy_score=controversy_score,
            integrity_score=integrity_score,
            weights=weights,
        ),
        impact=ImpactBreakdown(
            impact_score=impact_score,
            kpis=kpis,
        ),
        wem=wem_breakdown,
        wem_inputs=wem_inputs_obj,
        quadrant=quadrant,
        esg_score_avg=avg_esg,
        placebo_index=placebo_idx,
        material_factors=material_factors,
    )


def get_portfolio_view() -> PortfolioView:
    tickers = get_all_tickers()
    entries: list[PortfolioEntry] = []

    for ticker in tickers:
        score = get_company_score(ticker)
        if not score:
            continue
        entries.append(PortfolioEntry(
            ticker=ticker,
            name=score.name,
            sector=score.sector,
            integrity_score=score.integrity.integrity_score,
            impact_score=score.impact.impact_score,
            wem_score=score.wem.wem_score,
            placebo_index=score.placebo_index,
            quadrant=score.quadrant.quadrant,
            quadrant_color=score.quadrant.color,
            esg_score_avg=score.esg_score_avg,
        ))

    total_esg = sum(e.esg_score_avg for e in entries) or 1.0
    total_ii = sum(e.integrity_score * e.impact_score / 100 for e in entries) or 1.0
    total_wem = sum(e.wem_score for e in entries) or 1.0

    naive_tilt = sorted(
        [{"ticker": e.ticker, "name": e.name, "weight": round(e.esg_score_avg / total_esg * 100, 1)} for e in entries],
        key=lambda x: -x["weight"],
    )
    ii_scores = [e.integrity_score * e.impact_score / 100 for e in entries]
    integrity_impact_tilt = sorted(
        [{"ticker": e.ticker, "name": e.name, "weight": round(s / total_ii * 100, 1)} for e, s in zip(entries, ii_scores)],
        key=lambda x: -x["weight"],
    )
    wem_tilt = sorted(
        [{"ticker": e.ticker, "name": e.name, "weight": round(e.wem_score / total_wem * 100, 1)} for e in entries],
        key=lambda x: -x["weight"],
    )

    return PortfolioView(
        companies=entries,
        naive_esg_tilt=naive_tilt,
        integrity_impact_tilt=integrity_impact_tilt,
        wem_tilt=wem_tilt,
    )
