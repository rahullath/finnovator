"""
WEM (Worker & Ecological Materiality) Score.

Deflationary index starting at 100; subtracts penalties for:
  D_carbon — emissions intensity vs peer universe
  D_labor  — CEO-to-worker pay ratio
  D_theft  — 5-year total regulatory fines

Explicitly anti-shareholder-primacy: penalises externalised harm
regardless of ESG narrative.

All penalty caps and thresholds are declared as named constants
so they can be debated and adjusted without touching the formula.
"""
import math
from .models import WEMInputs

CARBON_PENALTY_CAP = 40.0   # max points deducted for emissions intensity
LABOR_PENALTY_CAP = 30.0    # max points deducted for CEO pay ratio
THEFT_PENALTY_CAP = 40.0    # max points deducted for regulatory fines

LABOR_THRESHOLD_RATIO = 50  # pay ratio at or below this → no deduction
THEFT_SCALE_MILLIONS = 1.0  # fines denominator in $M (scale factor)
THEFT_MULTIPLIER = 10.0     # multiplier before log10 compression


def _carbon_penalty(intensity: float, all_intensities: list[float]) -> float:
    """D_carbon = 40 × percentile_rank(intensity) across company universe."""
    if not all_intensities or len(all_intensities) < 2:
        return CARBON_PENALTY_CAP / 2  # neutral when no peer data
    ranked = sorted(all_intensities)
    rank = sum(1 for x in ranked if x <= intensity) / len(ranked)
    return round(CARBON_PENALTY_CAP * rank, 2)


def _labor_penalty(ceo_pay_ratio: float) -> float:
    """D_labor = clamp(20 × log(R / 50), 0, 30)."""
    if ceo_pay_ratio <= LABOR_THRESHOLD_RATIO:
        return 0.0
    penalty = 20.0 * math.log(ceo_pay_ratio / LABOR_THRESHOLD_RATIO)
    return round(min(penalty, LABOR_PENALTY_CAP), 2)


def _theft_penalty(labor_fines_usd: float, other_fines_usd: float) -> float:
    """D_theft = min(40, 10 × log10(F_millions + 1))."""
    total_millions = (labor_fines_usd + other_fines_usd) / 1_000_000
    penalty = THEFT_MULTIPLIER * math.log10(total_millions / THEFT_SCALE_MILLIONS + 1)
    return round(min(penalty, THEFT_PENALTY_CAP), 2)


def calculate_wem_score(inputs: "WEMInputs", all_inputs: list["WEMInputs"]) -> dict:
    """
    Returns WEM score plus breakdown components.
    all_inputs is the full peer universe for percentile ranking.
    """
    intensity = inputs.emissions_tco2e / inputs.revenue_usd if inputs.revenue_usd > 0 else 0.0
    all_intensities = [
        w.emissions_tco2e / w.revenue_usd
        for w in all_inputs
        if w.revenue_usd > 0
    ]

    d_carbon = _carbon_penalty(intensity, all_intensities)
    d_labor = _labor_penalty(inputs.ceo_pay_ratio)
    d_theft = _theft_penalty(inputs.labor_fines_usd_5y, inputs.other_fines_usd_5y)

    wem = round(max(0.0, min(100.0, 100.0 - d_carbon - d_labor - d_theft)), 1)

    return {
        "wem_score": wem,
        "d_carbon": d_carbon,
        "d_labor": d_labor,
        "d_theft": d_theft,
        "emissions_intensity": round(intensity * 1_000_000, 4),  # tCO2e per $M revenue
    }
