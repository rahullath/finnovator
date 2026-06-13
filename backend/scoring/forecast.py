"""
Forward-looking sustainability forecast.
All computations are deterministic and auditable — no LLM required.
Generates text from data-driven templates.

Implements the "3 Body Problem" framing:
  Body 1 — company's own ESG score
  Body 2 — sector peer group rank
  Body 3 — FTSE 100 benchmark position
High standard deviation between these three = the instability Maxwell named.
"""
import math
import statistics
from .models import (
    CompanyScore, PortfolioEntry,
    ForecastResult, DriverForecast, ThreeBodyAnalysis,
)

# Maps material factor label → relevant KPI names in impact_kpis.csv
FACTOR_KPI_MAP: dict[str, list[str]] = {
    "GHG Emissions": ["emissions_intensity", "methane_reduction"],
    "Ecological Impacts": ["major_incidents"],
    "Energy Management": ["low_carbon_capex_pct", "renewable_energy_pct"],
    "Labor Practices": ["labor_standards"],
    "Human Rights & Community Relations": ["labor_standards"],
    "Supply Chain Management": ["supply_chain_score"],
    "Product Quality & Safety": ["major_incidents"],
    "Physical Impacts of Climate Change": ["emissions_intensity"],
    "Business Ethics": [],
    "Business Model Resilience": ["low_carbon_capex_pct"],
    "Water & Hazardous Materials": ["water_intensity"],
    "Waste & Wastewater Management": [],
    "Customer Welfare": [],
    "Customer Privacy": [],
    "Data Security": [],
    "Employee Engagement": ["labor_standards"],
    "Access & Affordability": [],
    "Systemic Risk Management": [],
    "Critical Incidence Risk Management": ["major_incidents"],
    "Competitive Behavior": [],
    "Materials Sourcing & Efficiency": [],
    "Product Design & Lifecycle Management": ["low_carbon_capex_pct"],
    "Air Quality": ["emissions_intensity"],
}


def _ftse100_percentile(wem_score: float, sector: str) -> int:
    """
    Estimate absolute FTSE 100 percentile from WEM score.
    FTSE 100 is structurally anti-ESG: overweight in energy, mining, financials.
    Modelled as a WEM distribution with mean ≈ 50, std ≈ 20 across all 80 companies.
    No sector adjustment — energy companies appear where they deserve to: near the bottom.
    """
    mean = 50.0
    std = 20.0
    z = (wem_score - mean) / std
    pct = 50.0 * (1.0 + math.erf(z / math.sqrt(2)))
    return max(2, min(98, round(pct)))


def _peer_entries(sector: str, all_entries: list[PortfolioEntry]) -> list[PortfolioEntry]:
    """Return same-sector peers sorted by WEM descending. Falls back to full universe if only 1."""
    peers = [e for e in all_entries if e.sector == sector]
    universe = peers if len(peers) > 1 else all_entries
    return sorted(universe, key=lambda e: e.wem_score, reverse=True)


def _peer_rank(ticker: str, peers: list[PortfolioEntry]) -> int:
    for i, p in enumerate(peers):
        if p.ticker == ticker:
            return i + 1
    return len(peers)


def _kpi_direction(factor: str, kpis: list) -> tuple[str, str, str]:
    """Returns (direction_3m, direction_12m, confidence) for a material factor."""
    names = FACTOR_KPI_MAP.get(factor, [])
    matching = [k for k in kpis if k.kpi_name in names]

    if not matching:
        return "stable", "stable", "low"

    trends = [k.trend for k in matching]
    n_imp = trends.count("improving")
    n_wor = trends.count("worsening")

    if n_imp > n_wor:
        avg_score = sum(k.kpi_score for k in matching) / len(matching)
        if avg_score >= 65:
            return "leading", "leading", "high"
        return "stable", "leading", "medium"
    elif n_wor > n_imp:
        return "lagging", "lagging", "high"
    return "stable", "stable", "medium"


def _factor_note(factor: str, kpis: list, materiality: float) -> str:
    names = FACTOR_KPI_MAP.get(factor, [])
    matching = [k for k in kpis if k.kpi_name in names]
    if matching:
        k = matching[0]
        rel = "above" if k.kpi_value > k.sector_median else "below"
        trend_word = {"improving": "leading", "worsening": "lagging", "flat": "stable"}[k.trend]
        return f"{trend_word} — {k.kpi_value:.0f}{k.kpi_unit} vs sector median {k.sector_median:.0f}{k.kpi_unit} ({rel})"
    if materiality >= 0.65:
        return f"High materiality ({materiality*100:.0f}%) — tracked via controversy signal (no direct KPI)"
    return f"Materiality {materiality*100:.0f}% — no direct metric in dataset"


def _kpi_momentum(kpis: list) -> float:
    """Weighted net momentum. Positive = net improving."""
    total = 0.0
    for k in kpis:
        if k.trend == "improving":
            total += k.materiality_weight
        elif k.trend == "worsening":
            total -= k.materiality_weight
    return total


def _project_rank(rank_now: int, peer_count: int, momentum: float, high_controversy: bool) -> tuple[int, int]:
    rank_12m = rank_now
    if momentum >= 0.30:
        rank_12m = max(1, rank_now - 1)
    elif momentum <= -0.30:
        rank_12m = min(peer_count, rank_now + 1)

    if high_controversy or abs(momentum) < 0.30:
        rank_3m = rank_now
    elif momentum >= 0.50:
        rank_3m = max(1, rank_now - 1)
    elif momentum <= -0.50:
        rank_3m = min(peer_count, rank_now + 1)
    else:
        rank_3m = rank_now

    return rank_3m, rank_12m


def _three_body(
    esg_avg: float,
    peer_rank: int,
    peer_count: int,
    ftse_pct: int,
    wem: float,
    integrity: float,
    quadrant_label: str,
) -> ThreeBodyAnalysis:
    body1 = float(esg_avg)
    body2 = 100.0 * (1 - (peer_rank - 1) / max(peer_count - 1, 1))
    body3 = float(ftse_pct)

    vals = [body1, body2, body3]
    try:
        instability = statistics.stdev(vals)
    except Exception:
        instability = 0.0

    verdict = "severe" if instability >= 25 else ("moderate" if instability >= 12 else "low")

    spread = max(vals) - min(vals)
    labels = ["ESG score", "sector peer rank", "FTSE 100 position"]
    high_label = labels[vals.index(max(vals))]
    low_label = labels[vals.index(min(vals))]

    if verdict == "severe":
        note = (
            f"{high_label} ({max(vals):.0f}/100) flatters significantly vs "
            f"{low_label} ({min(vals):.0f}/100) — a {spread:.0f}-point spread. "
            f"No stable orbit: ESG scores are contaminated by peer-group construction "
            f"and the FTSE 100's anti-ESG benchmark composition."
        )
    elif verdict == "moderate":
        note = (
            f"Moderate conflict between the three signals ({spread:.0f}-pt spread). "
            f"{high_label} reads better than {low_label} implies. "
            f"The FTSE 100's overweight in energy and mining inflates relative ESG rankings."
        )
    else:
        note = (
            f"Low instability — ESG score, sector position, and FTSE 100 rank "
            f"tell a broadly consistent story ({spread:.0f}-pt spread)."
        )

    resolution = (
        f"Our resolution: Integrity {integrity:.0f}/100 × WEM {wem:.0f}/100 → '{quadrant_label}'. "
        f"Jangani, Date & Tucker (SSRN 5618192, 2026) show driver rankings shift across "
        f"regime windows (COVID → COP26 → energy crisis). We anchor to verifiable harm metrics "
        f"(emissions, pay ratios, enforcement records) that are regime-stable — "
        f"not ESG labels that oscillate with market narrative."
    )

    return ThreeBodyAnalysis(
        body1_esg=round(body1, 1),
        body2_peer_normalized=round(body2, 1),
        body3_ftse_percentile=round(body3, 1),
        instability_score=round(instability, 1),
        instability_verdict=verdict,
        instability_note=note,
        resolution=resolution,
    )


def _summaries(
    score: CompanyScore,
    peer_rank_now: int,
    rank_3m: int,
    rank_12m: int,
    peer_count: int,
    peer_sector: str,
    ftse_now: int,
    ftse_3m: int,
    ftse_12m: int,
) -> tuple[str, str, str, str]:
    name = score.name
    wem = score.wem.wem_score
    integrity = score.integrity.integrity_score
    esg = score.esg_score_avg
    placebo = score.placebo_index
    top = score.material_factors[0] if score.material_factors else None
    top_factor = top.factor if top else "GHG Emissions"
    top_mat = top.materiality_score if top else 0.6

    high_sev = sum(1 for c in score.controversies if c.severity == "high")
    contradicted = [c for c in score.claims if c.verification_status == "contradicted"]
    verified = sum(1 for c in score.claims if c.verification_status == "verified")
    n_claims = max(len(score.claims), 1)
    provider_spread = abs(
        (score.ratings[0].total if score.ratings else esg) -
        (score.ratings[1].total if len(score.ratings) > 1 else score.ratings[0].total if score.ratings else esg)
    )

    def rverb(a, b):
        return "rise" if a > b else ("fall" if a < b else "hold steady")

    r3 = rverb(peer_rank_now, rank_3m)
    r12 = rverb(peer_rank_now, rank_12m)

    risk_add = (
        f" {high_sev} high-severity incidents (36mo) represent unpriced tail risk."
        if high_sev >= 2 else ""
    )
    placebo_add = (
        f" Placebo Index {placebo:.2f} — ESG narrative overstates real performance."
        if placebo >= 0.45 else ""
    )

    wem_label = (
        "material ESG risk — recommend underweight or significant risk premium"
        if wem < 40 else
        "moderate harm exposure — hold, engage on material drivers"
        if wem < 65 else
        "credible sustainability — candidate for overweight in ESG mandates"
    )

    investor = (
        f"{name} is projected to {r3} in its {peer_sector} peer ranking "
        f"({peer_rank_now}→{rank_3m} of {peer_count}) over 3 months. "
        f"FTSE 100 position: {_ord(ftse_now)}→{_ord(ftse_3m)} percentile. "
        f"WEM {wem:.0f}/100 — {wem_label}."
        f"{risk_add}{placebo_add}"
    )

    gap = esg - wem
    gap_note = (
        f" ESG scores overstate performance by {gap:.0f} pts — "
        f"close this gap by improving {top_factor} disclosure quality."
        if gap > 15 else ""
    )
    corporate = (
        f"12-month sector ranking forecast: {r12} "
        f"({peer_rank_now}→{rank_12m} of {peer_count}). "
        f"FTSE 100: {_ord(ftse_now)}→{_ord(ftse_12m)} percentile. "
        f"Highest-leverage action: {top_factor} ({top_mat*100:.0f}% materiality) — "
        f"this single driver has the greatest impact on FTSE 100 ranking improvement."
        f"{gap_note}"
    )

    contradiction_note = (
        f"{len(contradicted)} claim(s) directly contradicted by external data — "
        f"{'high' if len(contradicted) >= 2 else 'moderate'} restatement risk."
        if contradicted else
        "No directly contradicted claims — disclosure quality above sector average."
    )
    auditor = (
        f"Of {n_claims} ESG claims analysed, {verified} ({verified/n_claims*100:.0f}%) "
        f"are independently verifiable. {contradiction_note} "
        f"ESG provider spread: {provider_spread:.0f} pts — "
        f"{'significant methodological disagreement reflected in Integrity Score' if provider_spread > 10 else 'within normal range'}. "
        f"Priority: third-party audit of {top_factor} measurement methodology."
    )

    if wem < 40 and placebo >= 0.4:
        signal = "Lagging — underweight; high harm + ESG overstatement confirmed"
    elif wem >= 65 and integrity >= 60:
        signal = "Leading — overweight candidate; low harm, credible signal"
    elif integrity >= 60 and score.impact.impact_score < 50:
        signal = "Stable — engage; credible signal but impact KPIs lag narrative"
    else:
        signal = "Stable — hold; monitor material driver trajectory"

    consensus = (
        f"Aggregated signal across investor, corporate, and audit lenses: {signal}. "
        f"Driver rankings are temporally unstable across market regimes (Jangani et al., SSRN 5618192). "
        f"The 3-body instability — ESG score, peer rank, FTSE position pulling in different directions — "
        f"is resolved by WEM ({wem:.0f}/100) × Integrity ({integrity:.0f}/100): "
        f"regime-stable signals grounded in verifiable harm, not rater methodology."
    )

    return investor, corporate, auditor, consensus


def _ord(n: int) -> str:
    """Return ordinal string: 1→'1st', 2→'2nd', 21→'21st'."""
    if 11 <= (n % 100) <= 13:
        return f"{n}th"
    return f"{n}{['th', 'st', 'nd', 'rd', 'th'][min(n % 10, 4)]}"


def generate_forecast(score: CompanyScore, all_entries: list[PortfolioEntry]) -> ForecastResult:
    """Main entry point: compute full forward-looking forecast from existing score data."""
    sector = score.sector
    peers = _peer_entries(sector, all_entries)
    peer_count = len(peers)
    peer_sector = peers[0].sector if peers else sector

    rank_now = _peer_rank(score.ticker, peers)
    ftse_now = _ftse100_percentile(score.wem.wem_score, sector)

    kpis = score.impact.kpis
    momentum = _kpi_momentum(kpis)
    high_controversy = sum(1 for c in score.controversies if c.severity == "high") >= 3

    rank_3m, rank_12m = _project_rank(rank_now, peer_count, momentum, high_controversy)
    ftse_3m = max(2, min(98, ftse_now + round(momentum * 3)))
    ftse_12m = max(2, min(98, ftse_now + round(momentum * 7)))

    driver_forecasts = [
        DriverForecast(
            factor=mf.factor,
            materiality_score=mf.materiality_score,
            direction_3m=_kpi_direction(mf.factor, kpis)[0],
            direction_12m=_kpi_direction(mf.factor, kpis)[1],
            confidence=_kpi_direction(mf.factor, kpis)[2],
            note=_factor_note(mf.factor, kpis, mf.materiality_score),
        )
        for mf in score.material_factors
    ]

    three_body = _three_body(
        esg_avg=score.esg_score_avg,
        peer_rank=rank_now,
        peer_count=peer_count,
        ftse_pct=ftse_now,
        wem=score.wem.wem_score,
        integrity=score.integrity.integrity_score,
        quadrant_label=score.quadrant.label,
    )

    inv, corp, aud, crowd = _summaries(
        score=score,
        peer_rank_now=rank_now,
        rank_3m=rank_3m,
        rank_12m=rank_12m,
        peer_count=peer_count,
        peer_sector=peer_sector,
        ftse_now=ftse_now,
        ftse_3m=ftse_3m,
        ftse_12m=ftse_12m,
    )

    return ForecastResult(
        ticker=score.ticker,
        peer_sector=peer_sector,
        peer_count=peer_count,
        peer_rank_now=rank_now,
        peer_rank_3m=rank_3m,
        peer_rank_12m=rank_12m,
        ftse100_percentile_now=ftse_now,
        ftse100_percentile_3m=ftse_3m,
        ftse100_percentile_12m=ftse_12m,
        driver_forecasts=driver_forecasts,
        three_body=three_body,
        summary_investor=inv,
        summary_corporate=corp,
        summary_auditor=aud,
        crowd_consensus=crowd,
    )
