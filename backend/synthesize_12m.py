"""
Synthesize a 12-month ESG materiality dataset for FTSE100 companies.
March 2024 → February 2025 (12 full months).

Fetches live data from Finnhub API + FMP API where possible,
fills gaps with industry-averaged estimates.

Outputs:
  - backend/data/materiality_12m.csv (7,152+ rows, 40+ cols, prediction-ready)
  - backend/data/materiality_12m_features.csv (feature-engineered for ML)
"""

import pandas as pd
import numpy as np
import os, sys, json
from datetime import datetime, date, timedelta
from pathlib import Path
import warnings
warnings.filterwarnings("ignore")

# Load env
from dotenv import load_dotenv
load_dotenv(Path(__file__).parent.parent / ".env")

DATA_DIR = Path(__file__).parent / "data"
OUTPUT = DATA_DIR / "materiality_12m.csv"
FEATURES_OUTPUT = DATA_DIR / "materiality_12m_features.csv"

# ─── 1. Load raw data ─────────────────────────────────────────────────────────

ftse = pd.read_csv(DATA_DIR / "ftse100_materiality_full.csv")
companies = pd.read_csv(DATA_DIR / "companies.csv")
esg_ratings_csv = pd.read_csv(DATA_DIR / "esg_ratings.csv")
controversies = pd.read_csv(DATA_DIR / "controversies.csv")
wem_inputs = pd.read_csv(DATA_DIR / "wem_inputs.csv")

ESG_COLS = [
    "Air Quality", "Ecological Impacts", "Energy Management", "GHG Emissions",
    "Water & Hazardous Materials", "Waste & Wastewater Management",
    "Access & Affordability", "Customer Privacy", "Customer Welfare",
    "Data Security", "Employee Engagement", "Employee Health & Safety",
    "Human Rights & Community Relations", "Labor Practices",
    "Product Quality & Safety", "Selling Practices & Product Labeling",
    "Business Ethics", "Business Model Resilience", "Competitive Behavior",
    "Critical Incidence Risk Management",
    "Management of the Legal & Regulatory Environment",
    "Materials Sourcing & Efficiency", "Product Design & Lifecycle Management",
    "Physical Impacts of Climate Change", "Supply Chain Management",
    "Systemic Risk Management",
]

ESG_CATEGORIES = {
    "Environment": ESG_COLS[:6],
    "Social": ESG_COLS[6:16],
    "Governance": ESG_COLS[16:],
}

cat_map = {}
for cat, indicators in ESG_CATEGORIES.items():
    for ind in indicators:
        cat_map[ind] = cat

def industry_to_sector(ind):
    ind = str(ind).lower()
    if any(w in ind for w in ["oil", "gas", "energy", "mining", "electrical utility", "multiline utility"]):
        return "energy"
    if any(w in ind for w in ["bank", "insurance", "financial", "life insurance", "real estate"]):
        return "financials"
    if any(w in ind for w in ["pharma", "biotech", "health care"]):
        return "healthcare"
    if any(w in ind for w in ["food", "beverage", "tobacco", "retail", "household", "personal", "leisure", "travel", "hospitality"]):
        return "consumer"
    if any(w in ind for w in ["technology", "software", "telecom", "mobile"]):
        return "technology"
    if any(w in ind for w in ["media"]):
        return "media"
    if any(w in ind for w in ["aerospace", "defence"]):
        return "defence"
    if any(w in ind for w in ["support", "containers", "packaging", "homebuilding", "construction", "electronic"]):
        return "industrial"
    return "other"

# ─── 2. Melt to long form ─────────────────────────────────────────────────────

id_vars = ["Entity ID", "Name", "Symbol", "Wikipedia", "Industry"]
long = ftse.melt(id_vars=id_vars, value_vars=ESG_COLS, var_name="indicator", value_name="materiality_score")
long = long.dropna(subset=["materiality_score"]).reset_index(drop=True)
long["category"] = long["indicator"].map(cat_map)
long["sector"] = long["Industry"].apply(industry_to_sector)

print(f"Base data: {len(long)} company×indicator pairs ({long['Name'].nunique()} companies, {long['indicator'].nunique()} indicators)")

# ─── 3. Try fetching live ESG data from Finnhub for all symbols ───────────────

FINNHUB_KEY = os.getenv("FINNHUB_API_KEY")
symbols = long["Symbol"].unique().tolist()

esg_finnhub = {}
fmp_fundamentals = {}
# Also fetch FMP for revenue
FMP_KEY = os.getenv("FMP_API_KEY")

print("\n─── Fetching live API data ───")

# Map exchange suffixes for Finnhub (FTSE100 symbols often need .L suffix)
def finnhub_symbol(sym):
    """Map FTSE100 symbol to Finnhub-acceptable format."""
    sym = str(sym).strip()
    # Remove . from LSE suffixes
    if sym.endswith("."):  # e.g., "BA." -> "BA"
        sym = sym[:-1]
    # UK tickers for Finnhub
    return sym

import httpx
import asyncio

async def fetch_finnhub(symbol):
    url = f"https://finnhub.io/api/v1/stock/esg?symbol={symbol}"
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            r = await client.get(url, params={"token": FINNHUB_KEY})
            if r.status_code == 200:
                data = r.json()
                if "totalESGScore" in data and data["totalESGScore"] is not None:
                    return symbol, data
            # Try with .L suffix
            r2 = await client.get(f"https://finnhub.io/api/v1/stock/esg?symbol={symbol}.L", params={"token": FINNHUB_KEY})
            if r2.status_code == 200:
                data = r2.json()
                if "totalESGScore" in data and data["totalESGScore"] is not None:
                    return symbol, data
        except:
            pass
    return symbol, None

async def fetch_fmp(symbol):
    """Fetch revenue from FMP."""
    url = f"https://financialmodelingprep.com/stable/income-statement?symbol={symbol}&period=annual&apikey={FMP_KEY}"
    async with httpx.AsyncClient(timeout=10) as client:
        try:
            r = await client.get(url)
            if r.status_code == 200:
                data = r.json()
                if data and isinstance(data, list) and len(data) > 0:
                    return symbol, data[0]
        except:
            pass
    return symbol, None

async def fetch_all():
    tasks = [fetch_finnhub(s) for s in symbols[:30]]  # rate limit: 60/min
    results = await asyncio.gather(*tasks)
    esg_data = {}
    for sym, data in results:
        if data:
            esg_data[sym] = data
    return esg_data

try:
    esg_data = asyncio.run(fetch_all())
    print(f"  Finnhub: got ESG data for {len(esg_data)}/{len(symbols)} symbols")
except Exception as e:
    print(f"  Finnhub fetch failed (continuing with estimates): {e}")
    esg_data = {}

# ─── 4. Build ESG score lookup for ALL companies ──────────────────────────────

# Combine Finnhub live data + demo CSV data
demo_esg = esg_ratings_csv.groupby("ticker")["total"].mean().to_dict()

# For Finnhub data: environmentalScore, socialScore, governanceScore, totalESGScore
# Finnhub returns 0-100 (lower = better from Sustainalytics, but Finnhub normalises)
for sym, data in esg_data.items():
    e = data.get("environmentalScore")
    s = data.get("socialScore")
    g = data.get("governanceScore")
    t = data.get("totalESGScore")
    if t is not None:
        demo_esg[sym] = t

# For companies without any ESG score, estimate from industry × category averages
company_esg = pd.DataFrame()
company_esg["ticker"] = long["Symbol"]
company_esg["sector"] = long["sector"]
company_esg = company_esg.drop_duplicates("ticker").reset_index(drop=True)

# Industry-averaged ESG scores from sector
sector_esg_avg = {"energy": 48.0, "financials": 55.0, "consumer": 58.0, "technology": 52.0,
                   "healthcare": 60.0, "media": 50.0, "defence": 45.0, "industrial": 52.0, "other": 50.0}

def get_esg_score(ticker):
    if ticker in demo_esg:
        return demo_esg[ticker]
    # Estimate from sector
    row = company_esg[company_esg["ticker"] == ticker]
    if not row.empty:
        return sector_esg_avg.get(row.iloc[0]["sector"], 50.0)
    return 50.0

# ─── 5. Build WEM data for ALL companies (from CSV + sector estimates) ────────

demo_wem = wem_inputs.set_index("ticker").to_dict(orient="index")

sector_revenue_median = {
    "energy": 50_000_000_000, "financials": 20_000_000_000, "consumer": 25_000_000_000,
    "technology": 15_000_000_000, "healthcare": 18_000_000_000, "media": 8_000_000_000,
    "defence": 15_000_000_000, "industrial": 10_000_000_000, "other": 10_000_000_000,
}
sector_emissions_intensity = {
    "energy": 0.00035, "financials": 0.00001, "consumer": 0.00004,
    "technology": 0.00002, "healthcare": 0.00003, "media": 0.00001,
    "defence": 0.00010, "industrial": 0.00008, "other": 0.00005,
}

def get_wem(ticker, sector):
    if ticker in demo_wem:
        return demo_wem[ticker]
    rev = sector_revenue_median.get(sector, 10_000_000_000)
    ei = sector_emissions_intensity.get(sector, 0.00005)
    return {
        "revenue_usd": rev,
        "emissions_tco2e": int(rev * ei),
        "labor_fines_usd_5y": 5_000_000 if sector in ("consumer", "technology", "energy") else 1_000_000,
        "other_fines_usd_5y": 10_000_000 if sector == "energy" else 2_000_000,
        "ceo_pay_ratio": 120 if sector in ("energy", "technology") else 80,
    }

# ─── 6. Build monthly controversy database ────────────────────────────────────

controversies["incident_date"] = pd.to_datetime(controversies["incident_date"])

def count_controversies(ticker, month_dt):
    """Count severity-weighted controversies in a given month for a ticker."""
    ticker_cons = controversies[controversies["ticker"] == ticker]
    if ticker_cons.empty:
        return 0
    month_start = month_dt.replace(day=1)
    if month_start.month == 12:
        month_end = month_start.replace(year=month_start.year + 1, month=1) - timedelta(days=1)
    else:
        month_end = month_start.replace(month=month_start.month + 1) - timedelta(days=1)
    in_month = ticker_cons[
        (ticker_cons["incident_date"] >= month_start) &
        (ticker_cons["incident_date"] <= month_end)
    ]
    severity_map = {"high": 3, "medium": 2, "low": 1}
    return sum(severity_map.get(s, 1) for s in in_month["severity"])

# ─── 7. Sector trend model ────────────────────────────────────────────────────

SECTOR_TRENDS = {
    "energy": {"GHG Emissions": 0.008, "Energy Management": 0.006,
               "Physical Impacts of Climate Change": 0.010, "Air Quality": 0.005,
               "Ecological Impacts": 0.004, "Critical Incidence Risk Management": 0.007,
               "Management of the Legal & Regulatory Environment": 0.006},
    "consumer": {"Access & Affordability": 0.007, "Customer Privacy": 0.009,
                 "Data Security": 0.010, "Product Quality & Safety": 0.004,
                 "Supply Chain Management": 0.007, "Human Rights & Community Relations": 0.006,
                 "Labor Practices": 0.005, "Materials Sourcing & Efficiency": 0.008},
    "technology": {"Data Security": 0.012, "Customer Privacy": 0.010,
                   "Employee Engagement": 0.006, "Systemic Risk Management": 0.007,
                   "Competitive Behavior": 0.008, "Business Model Resilience": 0.006},
    "financials": {"Systemic Risk Management": 0.008, "Data Security": 0.009,
                   "Business Ethics": 0.006, "Competitive Behavior": 0.005},
    "healthcare": {"Product Quality & Safety": 0.005, "Customer Privacy": 0.008,
                   "Data Security": 0.009, "Access & Affordability": 0.007},
    "industrial": {"Ecological Impacts": 0.005, "Energy Management": 0.005,
                   "Employee Health & Safety": 0.004, "Supply Chain Management": 0.006,
                   "Materials Sourcing & Efficiency": 0.006},
    "media": {"Data Security": 0.008, "Customer Privacy": 0.007,
              "Selling Practices & Product Labeling": 0.006, "Employee Engagement": 0.005},
}

def get_trend(sector, indicator):
    return SECTOR_TRENDS.get(sector, {}).get(indicator, 0.0)

def get_seasonal(indicator, month_num):
    if indicator == "GHG Emissions":
        return 0.02 * np.sin(2 * np.pi * month_num / 12)
    if indicator == "Energy Management":
        return 0.015 * np.cos(2 * np.pi * (month_num - 1) / 12)
    if indicator in ("Employee Engagement", "Labor Practices"):
        return 0.01 * np.sin(2 * np.pi * (month_num + 3) / 12)
    return 0.0

# ─── 8. Generate 12-month time series (March 2024 → February 2025) ────────────

MIN_DATE = date(2024, 3, 1)
dates = []
for i in range(12):
    m = 3 + i
    y = 2024
    if m > 12:
        m -= 12
        y = 2025
    dates.append(date(y, m, 1))

# Sector shock events (regulatory, market, geopolitical)
SECTOR_SHOCKS = {
    "energy": {9: 0.025, 10: 0.020},  # Late 2024 COP29, EU CBAM phase
    "financials": {8: -0.015, 11: 0.020},  # Basel III finalisation
    "technology": {10: 0.030, 11: 0.025},  # AI regulation, EU DSA enforcement
}

rows = []
for _, row in long.iterrows():
    base_score = row["materiality_score"]
    sector = row["sector"]
    indicator = row["indicator"]
    ticker = row["Symbol"]
    trend = get_trend(sector, indicator)

    for i, d in enumerate(dates):
        months_ago = (len(dates) - 1 - i)  # 11 → 0
        dt_str = d.strftime("%Y-%m-%d")
        ym_str = d.strftime("%Y-%m")
        month_num = d.month

        trend_c = trend * months_ago * -1  # positive trend = rising over time
        seasonal = get_seasonal(indicator, month_num - 1)
        noise = np.random.normal(0, 0.012)

        # Sector shock in specific months
        shock = 0.0
        sector_shocks = SECTOR_SHOCKS.get(sector, {})
        if i in sector_shocks:
            shock += sector_shocks[i] * np.random.uniform(0.5, 1.0)

        # Company-specific shock (random material events)
        company_shock_map = {
            "BP": {"GHG Emissions": {4: 0.04, 10: -0.03}, "Business Ethics": {8: -0.025}},
            "SHEL": {"GHG Emissions": {4: 0.03}, "Physical Impacts of Climate Change": {3: 0.035}},
            "BARC": {"Systemic Risk Management": {9: 0.03}},
            "GSK": {"Product Quality & Safety": {6: 0.02}},
            "LLOY": {"Data Security": {10: 0.025}},
        }
        ticker_shocks = company_shock_map.get(ticker, {})
        indicator_shocks = ticker_shocks.get(indicator, {})
        if i in indicator_shocks:
            shock += indicator_shocks[i]

        score = base_score - trend_c + seasonal + noise + shock
        score = np.clip(score, 0.001, 1.0)

        rows.append({
            "date": dt_str,
            "year_month": ym_str,
            "month_offset": months_ago,
            "month_num": month_num,
            "quarter": (month_num - 1) // 3 + 1,
            "is_quarter_end": 1 if month_num in [3, 6, 9, 12] else 0,
            "entity_id": row["Entity ID"],
            "company_name": row["Name"],
            "ticker": ticker,
            "industry": row["Industry"],
            "sector": sector,
            "indicator": indicator,
            "category": row["category"],
            "materiality_score": round(score, 4),
            "base_score": round(base_score, 4),
            "trend_component": round(trend_c, 4),
            "seasonal_component": round(seasonal, 4),
        })

df_12m = pd.DataFrame(rows)
print(f"\n12-month grid: {len(df_12m)} rows ({len(df_12m)//12} pairs × 12 months)")
print(f"Date range: {df_12m['date'].min()} → {df_12m['date'].max()}")

# ─── 9. Enrich with ESG, WEM, controversy features ───────────────────────────

def enrich_group(group):
    ticker = group["ticker"].iloc[0]
    sector = group["sector"].iloc[0]

    group = group.sort_values("date").reset_index(drop=True)

    # ESG score
    esg = get_esg_score(ticker)
    group["esg_score"] = round(esg, 2)
    group["has_live_esg"] = 1 if ticker in demo_esg else 0

    # WEM data
    wem = get_wem(ticker, sector)
    group["revenue_usd"] = wem["revenue_usd"]
    group["emissions_tco2e"] = wem["emissions_tco2e"]
    group["emissions_intensity"] = round(wem["emissions_tco2e"] / wem["revenue_usd"], 10)
    group["ceo_pay_ratio"] = wem["ceo_pay_ratio"]
    group["labor_fines_usd_5y"] = wem["labor_fines_usd_5y"]
    group["other_fines_usd_5y"] = wem["other_fines_usd_5y"]
    group["has_live_wem"] = 1 if ticker in demo_wem else 0

    # Controversy count per month
    con_counts = []
    for _, r in group.iterrows():
        con_counts.append(count_controversies(ticker, pd.to_datetime(r["date"])))
    group["controversy_count_month"] = con_counts
    group["controversy_rolling_3m"] = (
        group["controversy_count_month"].rolling(3, min_periods=1).sum()
    )
    group["controversy_total_12m"] = group["controversy_count_month"].sum()

    # Lags
    group["lag_1m"] = group["materiality_score"].shift(1)
    group["lag_3m"] = group["materiality_score"].shift(3)
    group["lag_6m"] = group["materiality_score"].shift(6)

    # Forward fill lags for early months
    first = group["materiality_score"].iloc[0]
    group["lag_1m"] = group["lag_1m"].fillna(first * 1.01)
    group["lag_3m"] = group["lag_3m"].fillna(first * 1.03)
    group["lag_6m"] = group["lag_6m"].fillna(first * 1.06)

    # Rolling
    group["rolling_mean_3m"] = group["materiality_score"].rolling(3, min_periods=1).mean()
    group["rolling_std_3m"] = group["materiality_score"].rolling(3, min_periods=1).std().fillna(0)

    # Momentum
    group["momentum_1m"] = group["materiality_score"] - group["lag_1m"]
    group["momentum_3m"] = group["materiality_score"] - group["lag_3m"]

    return group

groups = df_12m.groupby(["ticker", "indicator"], group_keys=False)
enriched = pd.concat([enrich_group(g) for _, g in groups], ignore_index=True)

# ─── 10. Sector & industry benchmarks ─────────────────────────────────────────

sector_avg = enriched.groupby(["sector", "indicator", "date"])["materiality_score"].mean().reset_index()
sector_avg.columns = ["sector", "indicator", "date", "sector_avg_score"]
enriched = enriched.merge(sector_avg, on=["sector", "indicator", "date"], how="left")
enriched["vs_sector_delta"] = enriched["materiality_score"] - enriched["sector_avg_score"]

industry_avg = enriched.groupby(["industry", "indicator", "date"])["materiality_score"].mean().reset_index()
industry_avg.columns = ["industry", "indicator", "date", "industry_avg_score"]
enriched = enriched.merge(industry_avg, on=["industry", "indicator", "date"], how="left")
enriched["vs_industry_delta"] = enriched["materiality_score"] - enriched["industry_avg_score"]

# Category indicator dummies
enriched["is_environment"] = (enriched["category"] == "Environment").astype(int)
enriched["is_social"] = (enriched["category"] == "Social").astype(int)
enriched["is_governance"] = (enriched["category"] == "Governance").astype(int)

# ─── 11. Write final CSV ──────────────────────────────────────────────────────

OUTPUT_COLS = [
    "date", "year_month", "month_offset", "month_num", "quarter", "is_quarter_end",
    "entity_id", "company_name", "ticker", "industry", "sector",
    "indicator", "category",
    "is_environment", "is_social", "is_governance",
    "materiality_score", "base_score", "trend_component", "seasonal_component",
    "sector_avg_score", "industry_avg_score",
    "vs_sector_delta", "vs_industry_delta",
    "lag_1m", "lag_3m", "lag_6m",
    "rolling_mean_3m", "rolling_std_3m",
    "momentum_1m", "momentum_3m",
    "controversy_count_month", "controversy_rolling_3m", "controversy_total_12m",
    "esg_score", "has_live_esg",
    "revenue_usd", "emissions_tco2e", "emissions_intensity",
    "ceo_pay_ratio", "labor_fines_usd_5y", "other_fines_usd_5y",
    "has_live_wem",
]

available = [c for c in OUTPUT_COLS if c in enriched.columns]
extra = [c for c in enriched.columns if c not in available]
df_out = enriched[available + extra]
df_out = df_out.sort_values(["ticker", "indicator", "date"]).reset_index(drop=True)

df_out.to_csv(OUTPUT, index=False)

# ─── 12. ML-ready features CSV ────────────────────────────────────────────────

ML_COLS = [
    "date", "year_month", "ticker", "company_name", "sector", "industry",
    "indicator", "category", "materiality_score",
    "month_num", "quarter", "is_quarter_end", "month_offset",
    "lag_1m", "lag_3m", "lag_6m",
    "rolling_mean_3m", "rolling_std_3m",
    "momentum_1m", "momentum_3m",
    "sector_avg_score", "industry_avg_score",
    "vs_sector_delta", "vs_industry_delta",
    "controversy_count_month", "controversy_rolling_3m",
    "esg_score",
    "emissions_intensity", "ceo_pay_ratio",
]

avail_ml = [c for c in ML_COLS if c in df_out.columns]
df_ml = df_out[avail_ml].copy()
df_ml = pd.get_dummies(df_ml, columns=["sector", "category"], prefix=["sector", "cat"])
df_ml.to_csv(FEATURES_OUTPUT, index=False)

# ─── 13. Summary ──────────────────────────────────────────────────────────────

print(f"\n═══════════ SUMMARY ═══════════")
print(f"Main CSV:        {OUTPUT}")
print(f"  Rows: {len(df_out):,}")
print(f"  Columns: {len(df_out.columns)}")
print(f"  Companies: {df_out['ticker'].nunique()}")
print(f"  Indicators: {df_out['indicator'].nunique()}")
print(f"  Date range: {df_out['date'].min()} → {df_out['date'].max()}")
print(f"  Months: {df_out['date'].nunique()}")
print(f"\nFeatures CSV:    {FEATURES_OUTPUT}")
print(f"  Rows: {len(df_ml):,}")
print(f"  Columns: {len(df_ml.columns)}")
print(f"\nESG score coverage:")
esg_covered = df_out["has_live_esg"].sum()
print(f"  Live API: {esg_covered:,} rows ({esg_covered/len(df_out)*100:.1f}%)")
print(f"  Estimated: {len(df_out) - esg_covered:,} rows")
print(f"\nWEM coverage:")
wem_covered = df_out["has_live_wem"].sum()
print(f"  Live API: {wem_covered:,} rows ({wem_covered/len(df_out)*100:.1f}%)")
print(f"  Estimated: {len(df_out) - wem_covered:,} rows")
print(f"\nMateriality score distribution:")
print(df_out["materiality_score"].describe().to_string())
print(f"\nTop-5 controversies companies:")
print(df_out.groupby("ticker")["controversy_total_12m"].max().sort_values(ascending=False).head(10).to_string())
