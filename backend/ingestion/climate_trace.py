"""
Climate TRACE API v6 — open data, no key required.
https://api.climatetrace.org/v6/

Strategy: fetch global sector-level tCO2e totals, then attribute to each
company by its revenue fraction of the sector.  Not facility-level (that's
licence-restricted), but grounded in independent third-party measurements,
not corporate self-reporting.

Sector global totals (tCO2e, 2022 baseline) are fetched live; revenue
denominators come from our curated list of top-revenue peers per sector so
the attribution is defensible.

Falls back to wem_inputs.csv values when the API is unreachable.
"""
import httpx
import pandas as pd
from pathlib import Path

BASE = "https://api.climatetrace.org/v6"
DATA_DIR = Path(__file__).parent.parent / "data"

# Map ticker → ClimateTRACE sector name
SECTOR_MAP = {
    "BP":     "oil-and-gas-production",
    "SHEL":   "oil-and-gas-production",
    "XOM":    "oil-and-gas-production",
    "TTE":    "oil-and-gas-production",
    "ORSTED": "power-sector",
    "ULVR":   "other-manufacturing",
    "NESN":   "other-manufacturing",
    "AMZN":   "road-transportation",
}

# Total sector revenues (USD) — top-20 revenue-ranked peers per sector,
# from public 2023 annual reports.  Used as the denominator for attribution.
# Update annually; see comments for sources.
SECTOR_PEER_REVENUE_USD = {
    # Top oil majors: Aramco, Sinopec, PetroChina, Shell, ExxonMobil, BP,
    # TotalEnergies, Valero, Marathon, Phillips 66 (2023 reports)
    "oil-and-gas-production": 3_800_000_000_000,
    # Global power sector: top 20 utilities by revenue ~$900B combined
    "power-sector": 900_000_000_000,
    # Top food/FMCG manufacturers: Nestlé, Unilever, P&G, Kraft, Danone etc.
    "other-manufacturing": 1_200_000_000_000,
    # Global logistics/road: Amazon, UPS, FedEx, DHL, XPO ~$800B
    "road-transportation": 800_000_000_000,
}

# Company revenues USD 2023 — from FMP (US) or annual reports (EU)
# Used as numerator in attribution.  Refreshed by FMPIngestor for US tickers.
COMPANY_REVENUE_USD = {
    "BP":     211_000_000_000,
    "SHEL":   301_000_000_000,
    "XOM":    398_000_000_000,
    "TTE":    218_000_000_000,
    "ORSTED":  10_200_000_000,
    "ULVR":    60_100_000_000,
    "NESN":    94_400_000_000,
    "AMZN":   575_000_000_000,
}


def _fetch_sector_totals(year: int = 2022) -> dict[str, float]:
    """Returns {sector_name: tCO2e} from Climate TRACE v6."""
    try:
        r = httpx.get(f"{BASE}/assets/emissions", params={"year": year}, timeout=15)
        if r.status_code != 200:
            return {}
        items = r.json().get("all", [])
        return {
            item["Sector"]: item["Emissions"]
            for item in items
            if "Sector" in item and "Emissions" in item
        }
    except Exception:
        return {}


def _read_csv_value(ticker: str, field: str) -> float | None:
    try:
        df = pd.read_csv(DATA_DIR / "wem_inputs.csv")
        row = df[df["ticker"] == ticker]
        if not row.empty:
            return float(row[field].iloc[0])
    except Exception:
        pass
    return None


def _update_wem_csv(ticker: str, field: str, value: float) -> None:
    path = DATA_DIR / "wem_inputs.csv"
    df = pd.read_csv(path)
    df.loc[df["ticker"] == ticker, field] = value
    df.to_csv(path, index=False)


def _company_revenue(ticker: str) -> float:
    """Live revenue from CSV (FMPIngestor may have updated it)."""
    live = _read_csv_value(ticker, "revenue_usd")
    return live if live else COMPANY_REVENUE_USD.get(ticker, 1.0)


class ClimateTraceIngestor:
    """
    Attributes sector-level GHG emissions to companies by revenue fraction.

    Formula:
      company_emissions = sector_global_emissions
                          × (company_revenue / sector_peer_total_revenue)

    Source: Climate TRACE v6, independent satellite + ML measurements.
    """

    def fetch(self, ticker: str) -> dict:
        sector = SECTOR_MAP.get(ticker)
        if not sector:
            return {"status": "csv_fallback", "reason": f"No sector mapping for {ticker}"}

        sector_totals = _fetch_sector_totals(year=2022)
        if not sector_totals:
            return {"status": "csv_fallback", "reason": "Climate TRACE API unreachable"}

        sector_emissions = sector_totals.get(sector)
        if sector_emissions is None:
            return {"status": "csv_fallback", "reason": f"Sector {sector!r} not in response"}

        peer_total = SECTOR_PEER_REVENUE_USD.get(sector, 1.0)
        company_rev = _company_revenue(ticker)
        revenue_fraction = company_rev / peer_total

        attributed_emissions = sector_emissions * revenue_fraction

        # Write back to CSV so engine picks it up
        _update_wem_csv(ticker, "emissions_tco2e", attributed_emissions)

        return {
            "status": "ok",
            "ticker": ticker,
            "sector": sector,
            "sector_global_tco2e": sector_emissions,
            "company_revenue_usd": company_rev,
            "peer_total_revenue_usd": peer_total,
            "revenue_fraction": round(revenue_fraction, 6),
            "attributed_emissions_tco2e": round(attributed_emissions, 0),
            "methodology": "revenue_fraction_attribution",
            "source": "climatetrace_v6",
            "year": 2022,
        }
