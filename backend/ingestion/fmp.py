"""
Financial Modeling Prep — stable-tier endpoints only (free).
Covers: income statement (revenue), company profile.
US tickers (XOM, AMZN) return live data.
European tickers return 402 from FMP free tier; we fall back to CSV.
"""
import os
import httpx
import pandas as pd
from pathlib import Path

FMP_KEY = os.getenv("FMP_API_KEY", "")
BASE = "https://financialmodelingprep.com/stable"
DATA_DIR = Path(__file__).parent.parent / "data"

# Symbols that work on FMP free stable tier
US_SUPPORTED = {"XOM", "AMZN"}


def _get(path: str, params: dict) -> dict | list | None:
    if not FMP_KEY:
        return None
    try:
        r = httpx.get(f"{BASE}/{path}", params={"apikey": FMP_KEY, **params}, timeout=10)
        if r.status_code == 200:
            return r.json()
    except Exception:
        pass
    return None


def fetch_revenue(ticker: str) -> float | None:
    """Return most recent annual revenue in USD. None if unavailable."""
    data = _get("income-statement", {"symbol": ticker, "limit": 1})
    if data and isinstance(data, list) and data[0].get("revenue"):
        return float(data[0]["revenue"])
    return None


def fetch_profile(ticker: str) -> dict | None:
    """Return company profile dict (name, sector, country, marketCap)."""
    data = _get("profile", {"symbol": ticker})
    if data and isinstance(data, list) and data:
        p = data[0]
        return {
            "name": p.get("companyName"),
            "sector": p.get("sector"),
            "country": p.get("country"),
            "market_cap": p.get("marketCap"),
        }
    return None


class FMPIngestor:
    """
    Fetches real revenue from FMP stable endpoints and updates wem_inputs.csv.
    Falls back to existing CSV value when FMP doesn't cover the ticker (EU companies).
    """

    def fetch(self, ticker: str) -> dict:
        result = {"ticker": ticker, "status": "csv_fallback"}

        revenue = fetch_revenue(ticker)
        if revenue is not None:
            self._update_wem_csv(ticker, "revenue_usd", revenue)
            result = {"ticker": ticker, "status": "ok", "revenue_usd": revenue, "source": "fmp_stable"}
        else:
            # Read existing value so callers know what we're using
            df = pd.read_csv(DATA_DIR / "wem_inputs.csv")
            row = df[df["ticker"] == ticker]
            existing = float(row["revenue_usd"].iloc[0]) if not row.empty else None
            result["reason"] = "FMP free tier: non-US or paywalled"
            result["revenue_usd"] = existing
            result["source"] = "annual_report_csv"

        return result

    @staticmethod
    def _update_wem_csv(ticker: str, field: str, value: float) -> None:
        path = DATA_DIR / "wem_inputs.csv"
        df = pd.read_csv(path)
        df.loc[df["ticker"] == ticker, field] = value
        df.to_csv(path, index=False)
