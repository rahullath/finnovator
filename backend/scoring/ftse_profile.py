"""
FTSE 100 materiality profiles — generated from materiality_12m.csv.
Provides search, peer comparison, and quarterly forecasts for all 75 companies.
Full Integrity/Impact/WEM scores are only available for the 8 demo companies.
"""
import pandas as pd
import numpy as np
from pathlib import Path

DATA_DIR = Path(__file__).parent.parent / "data"

FULL_SCORE_TICKERS = {"BP", "SHEL", "ORSTED", "XOM", "TTE", "ULVR", "NESN", "AMZN"}

LAYMAN_EXPLANATIONS: dict[str, str] = {
    "Air Quality": "How much harmful air pollution the company generates. High pollution = fines, community backlash, and growing health liability.",
    "Ecological Impacts": "Damage to ecosystems — habitat destruction, biodiversity loss. Matters most for companies operating near protected or sensitive land.",
    "Energy Management": "How efficiently the company uses energy. High energy costs hit margins when prices spike; inefficiency signals poor capital discipline.",
    "GHG Emissions": "Total greenhouse gas output. Directly exposed to carbon taxes, emissions trading costs, and increasingly, regulatory fines and litigation.",
    "Waste & Hazardous Materials Management": "How toxic waste is handled. Poor management = cleanup liability, site remediation costs, and legal risk that can linger for decades.",
    "Water & Wastewater Management": "Water consumption and discharge quality. Critical in water-scarce regions; failure to manage affects operating licences and community relations.",
    "Access & Affordability": "Whether products and services are accessible to lower-income groups. Regulatory pressure is rising in utilities, telecoms, and financial services.",
    "Customer Privacy": "How customer data is protected. GDPR fines run to 4% of global revenue; reputational damage often exceeds the fine itself.",
    "Customer Welfare": "Impact on customer health and wellbeing. Particularly material for food, pharma, and financial products where harm can lead to mass litigation.",
    "Data Security": "Cybersecurity resilience. Breaches trigger regulatory fines, shareholder litigation, and lasting customer loss — especially in tech and finance.",
    "Employee Engagement": "Staff satisfaction and retention. High turnover means productivity loss, recruitment costs, and weaker institutional knowledge.",
    "Employee Health & Safety": "Workplace accident and illness rates. Incidents mean regulatory fines, lost productivity, insurance cost increases, and reputational damage.",
    "Human Rights & Community Relations": "Treatment of workers and host communities throughout the supply chain. Exposure to forced labour laws (UK Modern Slavery Act, EU CSRD) is growing.",
    "Labour Practices": "Fair wages, union relations, and working conditions. Risk of strikes, class-action litigation, and regulatory action where conditions fall below standards.",
    "Product Quality & Safety": "Defects, recalls, and safety incidents. Liability exposure and brand damage can be severe — especially in consumer goods and industrials.",
    "Selling Practices & Product Labelling": "Misleading marketing or mislabelled products. Regulatory fines are rising and consumer trust is hard to rebuild.",
    "Business Ethics": "Bribery, corruption, and integrity of management. Direct legal exposure in regulated markets; one enforcement action can trigger capital flight.",
    "Business Model Resilience": "Whether the business model survives regulatory or market shifts — such as the transition away from fossil fuels or towards circular economy models.",
    "Competitive Behaviour": "Antitrust risk from market dominance or predatory pricing. Large fines in tech and pharma; regulatory attention has increased globally.",
    "Critical Incidence Risk Management": "Crisis response capability — oil spills, product failures, cyber attacks. Companies that respond slowly destroy value rapidly.",
    "Management of the Legal & Regulatory Environment": "Exposure to lawsuits, lobbying costs, and compliance burden. The regulatory environment is tightening across all major markets.",
    "Materials Sourcing & Efficiency": "Supply chain resilience and raw material costs. Concentration risk in sourcing is a growing concern for investors after recent supply shocks.",
    "Product Design & Lifecycle Management": "Design for sustainability — recyclability, durability, repairability. Increasingly regulated under the EU taxonomy and ecodesign rules.",
    "Physical Impacts of Climate Change": "Direct exposure to extreme weather, sea-level rise, and droughts. Insurance costs and asset write-downs are already materialising for high-exposure firms.",
    "Supply Chain Management": "Managing supplier ESG risks. Regulation is shifting liability to purchasers — the EU CSDDD now requires active supply chain due diligence.",
    "Systemic Risk Management": "Role in broader financial or systemic risk. Especially material for banks, insurers, and large utilities where failure has sector-wide consequences.",
}

CATEGORY_LABELS = {
    "Environment": "E",
    "Social": "S",
    "Governance": "G",
}


def _classify_direction(mom_1m: float, mom_3m: float, threshold: float = 0.012) -> str:
    if mom_3m > threshold or (mom_3m > 0 and mom_1m > threshold * 1.5):
        return "leading"
    if mom_3m < -threshold or (mom_3m < 0 and mom_1m < -threshold * 1.5):
        return "lagging"
    return "stable"


def _confidence(mom_1m: float, mom_3m: float) -> str:
    if abs(mom_1m) > 0.02 and abs(mom_3m) > 0.015 and (mom_1m * mom_3m > 0):
        return "high"
    if abs(mom_3m) > 0.01:
        return "medium"
    return "low"


def _load_latest() -> pd.DataFrame:
    df = pd.read_csv(DATA_DIR / "materiality_12m.csv")
    return df[df["month_offset"] == 0].copy()


def get_all_ftse100_companies() -> list[dict]:
    latest = _load_latest()
    companies = (
        latest[["company_name", "ticker", "industry", "sector"]]
        .drop_duplicates()
        .sort_values("company_name")
    )
    return [
        {
            "ticker": row["ticker"],
            "name": row["company_name"],
            "industry": row["industry"],
            "sector": row["sector"],
            "has_full_score": row["ticker"] in FULL_SCORE_TICKERS,
        }
        for _, row in companies.iterrows()
    ]


def search_ftse100(query: str, limit: int = 12) -> list[dict]:
    q = query.lower().strip()
    all_cos = get_all_ftse100_companies()
    if not q:
        return all_cos[:limit]
    results = [
        c for c in all_cos
        if q in c["ticker"].lower() or q in c["name"].lower() or q in c["industry"].lower()
    ]
    return results[:limit]


def get_ftse100_profile(ticker: str) -> dict | None:
    latest = _load_latest()
    company_data = latest[latest["ticker"] == ticker]
    if company_data.empty:
        return None

    meta = company_data.iloc[0]
    company_name = str(meta["company_name"])
    industry = str(meta["industry"])
    sector = str(meta["sector"])

    all_companies = get_all_ftse100_companies()
    peer_companies = [c for c in all_companies if c["industry"] == industry and c["ticker"] != ticker]

    drivers: list[dict] = []
    for _, row in company_data.iterrows():
        driver_name = str(row["indicator"])
        mat_score = float(row["materiality_score"])
        industry_avg = float(row["industry_avg_score"]) if not pd.isna(row.get("industry_avg_score", float("nan"))) else mat_score
        sector_avg = float(row["sector_avg_score"]) if not pd.isna(row.get("sector_avg_score", float("nan"))) else mat_score
        mom_1m = float(row["momentum_1m"]) if not pd.isna(row.get("momentum_1m", float("nan"))) else 0.0
        mom_3m = float(row["momentum_3m"]) if not pd.isna(row.get("momentum_3m", float("nan"))) else 0.0

        dir_3m = _classify_direction(mom_1m, mom_3m)
        dir_12m = "stable"
        if mom_3m > 0.022:
            dir_12m = "leading"
        elif mom_3m < -0.022:
            dir_12m = "lagging"

        drivers.append({
            "driver": driver_name,
            "category": str(row.get("category", "Governance")),
            "materiality_score": round(mat_score, 4),
            "peer_median": round(industry_avg, 4),
            "ftse100_median": round(sector_avg, 4),
            "deviation_from_peer": round(mat_score - industry_avg, 4),
            "deviation_from_ftse": round(mat_score - sector_avg, 4),
            "direction_3m": dir_3m,
            "direction_12m": dir_12m,
            "confidence": _confidence(mom_1m, mom_3m),
            "layman_explanation": LAYMAN_EXPLANATIONS.get(driver_name, "Key sustainability factor for this sector."),
        })

    drivers.sort(key=lambda d: d["materiality_score"], reverse=True)
    top_8 = drivers[:8]

    spreads = [
        float(np.std([d["materiality_score"], d["peer_median"], d["ftse100_median"]]) * 100)
        for d in top_8
    ]
    three_body_instability = round(float(np.mean(spreads)), 1) if spreads else 0.0

    return {
        "ticker": ticker,
        "name": company_name,
        "industry": industry,
        "sector": sector,
        "has_full_score": ticker in FULL_SCORE_TICKERS,
        "peer_count": len(peer_companies),
        "peer_names": [c["name"] for c in peer_companies[:5]],
        "top_8_drivers": top_8,
        "all_26_drivers": drivers,
        "three_body_instability": three_body_instability,
    }
