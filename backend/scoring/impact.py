from .models import ImpactKPI

SECTOR_WEIGHTS: dict[str, dict[str, float]] = {
    "energy": {
        "emissions_intensity": 0.35,
        "low_carbon_capex_pct": 0.30,
        "renewable_energy_pct": 0.20,
        "major_incidents": 0.10,
        "methane_reduction": 0.05,
    },
    "consumer": {
        "emissions_intensity": 0.30,
        "supply_chain_score": 0.25,
        "plastic_reduction": 0.20,
        "labor_standards": 0.15,
        "water_intensity": 0.10,
    },
    "technology": {
        "renewable_energy_pct": 0.30,
        "emissions_intensity": 0.25,
        "supply_chain_score": 0.20,
        "labor_standards": 0.15,
        "scope3_reduction": 0.10,
    },
}

SECTOR_MATERIAL_FACTORS: dict[str, list[str]] = {
    "energy": [
        "Emissions intensity (Scope 1+2 per unit revenue)",
        "Low-carbon capital expenditure share",
        "Renewable energy generation share",
    ],
    "consumer": [
        "Supply chain sustainability (Scope 3 sourcing)",
        "Absolute emissions reduction trajectory",
        "Labour standards and human rights in supply chain",
    ],
    "technology": [
        "Renewable energy procurement (data centre intensity)",
        "Scope 3 supply chain emissions",
        "Labour standards and worker welfare",
    ],
}


def calculate_impact_score(kpis: list[ImpactKPI], sector: str) -> float:
    """
    Weighted average of sector-specific KPI scores (each 0–100).
    Uses materiality_weight from data if available, else falls back to SECTOR_WEIGHTS.
    """
    if not kpis:
        return 50.0

    weighted_sum = 0.0
    weight_total = 0.0

    for kpi in kpis:
        weight = kpi.materiality_weight
        weighted_sum += weight * kpi.kpi_score
        weight_total += weight

    if weight_total == 0:
        return 50.0

    return round(weighted_sum / weight_total, 1)


def get_material_factors(sector: str) -> list[str]:
    return SECTOR_MATERIAL_FACTORS.get(sector, [
        "Scope 1+2 emissions intensity",
        "Supply chain sustainability",
        "Governance and transparency",
    ])
