"""
Materiality Comparison Engine.

For a given company, computes how its 8 material drivers compare against:
  - Body 2: sector peer group (FTSE100 companies in same industry)
  - Body 3: full FTSE100 benchmark (all 79 companies)

This is the "three-body" driver comparison: the same driver can carry
a very different financial materiality weight for BP vs Shell vs the market,
even within the same sector — the "no stable orbit" problem applied to drivers.
"""
import math
import pandas as pd
import numpy as np
from pathlib import Path
from .models import DriverComparison, MaterialityComparison

DATA_DIR = Path(__file__).parent.parent / "data"

# Maps our materiality.csv sector labels → FTSE100 dataset Industry column
INDUSTRY_PEER_MAP: dict[str, str] = {
    "Oil & gas producers": "Oil & gas producers",
    "Renewable energy": "Electrical utilities & independent power producers",
    "Personal goods": "Personal goods",
    "Food & beverages": "Beverages",
    "E-commerce & technology": "General retailers",
}

# SASB topic classification for every driver
DRIVER_TOPIC: dict[str, str] = {
    "Air Quality": "Environment",
    "Ecological Impacts": "Environment",
    "Energy Management": "Environment",
    "GHG Emissions": "Environment",
    "Water & Hazardous Materials": "Environment",
    "Waste & Wastewater Management": "Environment",
    "Access & Affordability": "Social",
    "Customer Privacy": "Social",
    "Customer Welfare": "Social",
    "Data Security": "Social",
    "Employee Engagement": "Social",
    "Employee Health & Safety": "Social",
    "Human Rights & Community Relations": "Social",
    "Labor Practices": "Social",
    "Product Quality & Safety": "Social",
    "Selling Practices & Product Labeling": "Social",
    "Business Ethics": "Governance",
    "Business Model Resilience": "Governance",
    "Competitive Behavior": "Governance",
    "Critical Incidence Risk Management": "Governance",
    "Management of the Legal & Regulatory Environment": "Governance",
    "Materials Sourcing & Efficiency": "Governance",
    "Product Design & Lifecycle Management": "Governance",
    "Physical Impacts of Climate Change": "Governance",
    "Supply Chain Management": "Governance",
    "Systemic Risk Management": "Governance",
}

ALL_DRIVERS = list(DRIVER_TOPIC.keys())

# Per-driver "why it differs" templates keyed on (topic, uniqueness_category)
_WHY_TEMPLATES: dict[tuple[str, str], str] = {
    ("Environment", "company_leading"): (
        "Company weights this environmental driver {delta:.0f}pts above sector peers — "
        "signals greater physical exposure or voluntary ambition relative to {industry} norm."
    ),
    ("Environment", "company_lagging"): (
        "Peers score this {delta:.0f}pts higher — company may be under-reporting "
        "environmental risk vs the {industry} group, or operating in lower-risk geographies."
    ),
    ("Environment", "sector_norm"): (
        "Consistent with {industry} sector consensus — shared environmental risk profile."
    ),
    ("Environment", "company_only"): (
        "Material only for this company within {industry}. Unique physical asset exposure "
        "or geography-specific regulatory pressure not shared by FTSE100 peers."
    ),
    ("Environment", "peer_only"): (
        "Peers treat this as material but company does not — potential disclosure gap "
        "or genuinely lower exposure (verify before concluding the latter)."
    ),
    ("Social", "company_leading"): (
        "Elevated social driver weighting (+{delta:.0f}pts vs peers) — higher workforce "
        "or community dependency, or past incidents driving stricter management focus."
    ),
    ("Social", "company_lagging"): (
        "Below peer group by {delta:.0f}pts — company's business model may have lower "
        "direct social exposure, or reporting of social materiality lags {industry} norms."
    ),
    ("Social", "sector_norm"): (
        "In line with {industry} peers — social driver consensus across the sector."
    ),
    ("Social", "company_only"): (
        "Company-specific social risk not present for FTSE100 {industry} peers — "
        "linked to specific geographies, supply chains, or product mix."
    ),
    ("Social", "peer_only"): (
        "FTSE100 {industry} companies flag this social risk; this company does not. "
        "Verify whether this reflects a genuine difference or a disclosure gap."
    ),
    ("Governance", "company_leading"): (
        "Governance driver rated {delta:.0f}pts above peers — past controversies, "
        "activist pressure, or management philosophy elevating this risk internally."
    ),
    ("Governance", "company_lagging"): (
        "Below {industry} peers by {delta:.0f}pts on this governance factor — "
        "sector peers face stronger regulatory or competitive governance scrutiny."
    ),
    ("Governance", "sector_norm"): (
        "Standard governance concern for {industry} — all peers weight it similarly."
    ),
    ("Governance", "company_only"): (
        "Governance risk flagged for this company but absent from FTSE100 {industry} peers — "
        "company-specific: jurisdiction, legal history, or capital structure."
    ),
    ("Governance", "peer_only"): (
        "Sector-level governance risk not reported material for this company — "
        "assess whether structure differences justify absence or flag a governance gap."
    ),
}


def _load_ftse100() -> pd.DataFrame:
    df = pd.read_csv(DATA_DIR / "ftse100_materiality_full.csv")
    # Numeric columns: convert all driver columns
    for d in ALL_DRIVERS:
        if d in df.columns:
            df[d] = pd.to_numeric(df[d], errors="coerce")
    return df


def _load_materiality() -> pd.DataFrame:
    return pd.read_csv(DATA_DIR / "materiality.csv")


def _load_companies() -> pd.DataFrame:
    return pd.read_csv(DATA_DIR / "companies.csv")


def _safe_median(series: pd.Series) -> float | None:
    vals = series.dropna()
    return float(vals.median()) if len(vals) else None


def _uniqueness(
    company_score: float | None,
    peer_median: float | None,
    peer_n: int,
) -> str:
    if company_score is not None and peer_n == 0:
        return "company_only"
    if company_score is None and peer_n > 0:
        return "peer_only"
    if company_score is None and peer_n == 0:
        return "absent"
    # both present — compare
    delta = company_score - (peer_median or 0.0)  # type: ignore[operator]
    if delta >= 0.05:
        return "company_leading"
    if delta <= -0.05:
        return "company_lagging"
    return "sector_norm"


def _why(
    driver: str,
    uniqueness: str,
    industry: str,
    delta: float,
) -> str:
    topic = DRIVER_TOPIC.get(driver, "Governance")
    tmpl = _WHY_TEMPLATES.get((topic, uniqueness), "")
    if not tmpl:
        return f"Insufficient peer data for {driver} comparison in {industry}."
    return tmpl.format(delta=abs(delta) * 100, industry=industry)


def get_materiality_comparison(ticker: str) -> MaterialityComparison | None:
    companies_df = _load_companies()
    row = companies_df[companies_df["ticker"] == ticker]
    if row.empty:
        return None

    company_name = row.iloc[0]["name"]

    mat_df = _load_materiality()
    company_mat = mat_df[mat_df["ticker"] == ticker]
    if company_mat.empty:
        return None

    # Industry from materiality.csv (uses SASB classification)
    industry = company_mat.iloc[0]["sector"]
    ftse_industry = INDUSTRY_PEER_MAP.get(industry, industry)

    ftse_df = _load_ftse100()

    # Peer group = FTSE100 companies in the same industry
    peer_df = ftse_df[ftse_df["Industry"] == ftse_industry]
    peer_count = len(peer_df)

    # Company scores from materiality.csv (only top 8 are stored)
    company_scores: dict[str, float] = {
        str(r["factor"]): float(r["materiality_score"])
        for _, r in company_mat.iterrows()
    }

    all_comparisons: list[DriverComparison] = []
    for driver in ALL_DRIVERS:
        company_score = company_scores.get(driver)  # None if not in top 8

        if driver in ftse_df.columns:
            peer_col = peer_df[driver].dropna()
            ftse_col = ftse_df[driver].dropna()
        else:
            peer_col = pd.Series([], dtype=float)
            ftse_col = pd.Series([], dtype=float)

        peer_n = int(len(peer_col))
        ftse_n = int(len(ftse_col))
        peer_median = _safe_median(peer_col)
        ftse_median = _safe_median(ftse_col)

        uniqueness = _uniqueness(company_score, peer_median, peer_n)

        # Divergence: positive = company weights this MORE than reference
        c = company_score or 0.0
        delta_peer = round(c - (peer_median or c), 4)
        delta_ftse = round(c - (ftse_median or c), 4)

        # Three-body spread for this driver: std of [company, peer, ftse100]
        vals = [v for v in [company_score, peer_median, ftse_median] if v is not None]
        spread = float(np.std(vals)) if len(vals) >= 2 else 0.0

        why_text = _why(driver, uniqueness, industry, delta_peer)

        all_comparisons.append(DriverComparison(
            driver=driver,
            topic=DRIVER_TOPIC.get(driver, "Governance"),
            company_score=round(company_score, 4) if company_score is not None else None,
            peer_median=round(peer_median, 4) if peer_median is not None else None,
            ftse100_median=round(ftse_median, 4) if ftse_median is not None else None,
            peer_n=peer_n,
            ftse100_n=ftse_n,
            divergence_from_peer=round(delta_peer, 4),
            divergence_from_ftse=round(delta_ftse, 4),
            uniqueness=uniqueness,
            spread=round(spread, 4),
            why=why_text,
        ))

    # Top 8: company's own drivers first (by score), then pad with highest peer-only drivers
    with_company = [c for c in all_comparisons if c.company_score is not None]
    with_company.sort(key=lambda x: x.company_score or 0.0, reverse=True)
    top_8 = with_company[:8]

    # Three-body instability across the 8 drivers
    spreads = [c.spread for c in top_8 if c.spread > 0]
    three_body_instability = round(float(np.mean(spreads)) if spreads else 0.0, 4)

    # Unique drivers: company has that peers don't, and vice versa
    unique_to_company = [c.driver for c in all_comparisons if c.uniqueness == "company_only"]
    unique_to_peers = [c.driver for c in all_comparisons if c.uniqueness == "peer_only"]

    return MaterialityComparison(
        ticker=ticker,
        company_name=company_name,
        industry=industry,
        ftse_industry=ftse_industry,
        peer_count=peer_count,
        top_8=top_8,
        all_26=all_comparisons,
        three_body_instability=three_body_instability,
        unique_to_company=unique_to_company,
        unique_to_peers=unique_to_peers,
    )
