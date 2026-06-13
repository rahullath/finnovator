"""
Finnhub ESG ingestor — free tier, instant signup at https://finnhub.io/register
Provides Sustainalytics ESG risk scores as a second provider alongside FMP.

Free tier: 60 API calls/minute, no credit card.
ESG endpoint: GET /api/v1/stock/esg?symbol={ticker}&token={key}

Returns:
  environmentScore, socialScore, governanceScore, totalEsg
  (Sustainalytics scale: lower = better risk exposure; we normalise to 0–100)

Falls back to esg_ratings.csv OSI values when key is absent or API fails.
"""
import os
import httpx
import pandas as pd
from pathlib import Path

FINNHUB_KEY = os.getenv("FINNHUB_API_KEY", "")
BASE = "https://finnhub.io/api/v1"
DATA_DIR = Path(__file__).parent.parent / "data"

# Sustainalytics risk scores range roughly 0–50 (lower = better).
# We invert and scale to 0–100 for our convention (higher = better).
# 50 = worst possible → score 0 ; 0 = best possible → score 100
def _normalise_sustainalytics(raw: float) -> float:
    return round(max(0.0, min(100.0, (50.0 - raw) * 2.0)), 1)


# Ticker remapping: Finnhub uses US exchange symbols
TICKER_MAP = {
    "BP":     "BP",      # BP trades on NYSE as ADR
    "SHEL":   "SHEL",    # Shell NYSE ADR
    "ORSTED": "DNNGY",   # Ørsted US OTC ADR
    "XOM":    "XOM",
    "TTE":    "TTE",     # TotalEnergies NYSE ADR
    "ULVR":   "UL",      # Unilever NYSE ADR
    "NESN":   "NSRGY",   # Nestlé US OTC ADR
    "AMZN":   "AMZN",
}


def _fetch_esg(symbol: str) -> dict | None:
    if not FINNHUB_KEY:
        return None
    try:
        r = httpx.get(
            f"{BASE}/stock/esg",
            params={"symbol": symbol, "token": FINNHUB_KEY},
            timeout=10,
        )
        if r.status_code == 200:
            d = r.json()
            if d.get("totalEsg") is not None:
                return d
    except Exception:
        pass
    return None


def _update_ratings_csv(ticker: str, e: float, s: float, g: float, total: float) -> None:
    """Upsert a 'finnhub' row in esg_ratings.csv."""
    path = DATA_DIR / "esg_ratings.csv"
    df = pd.read_csv(path)
    mask = (df["ticker"] == ticker) & (df["source"] == "Finnhub")
    if mask.any():
        df.loc[mask, ["environmental", "social", "governance", "total"]] = [e, s, g, total]
    else:
        new_row = pd.DataFrame([{
            "ticker": ticker, "source": "Finnhub",
            "environmental": e, "social": s, "governance": g,
            "total": total, "year": 2024,
        }])
        df = pd.concat([df, new_row], ignore_index=True)
    df.to_csv(path, index=False)


class FinnhubIngestor:
    """
    Fetches Sustainalytics ESG risk scores via Finnhub and writes them to
    esg_ratings.csv as a second provider. Enables real divergence scoring.
    """

    def fetch(self, ticker: str) -> dict:
        symbol = TICKER_MAP.get(ticker, ticker)
        data = _fetch_esg(symbol)

        if data is None:
            return {
                "status": "csv_fallback",
                "ticker": ticker,
                "reason": "No FINNHUB_API_KEY or API error — register free at finnhub.io",
            }

        # Sustainalytics: lower score = lower risk = better
        e_raw = data.get("environmentScore") or 50.0
        s_raw = data.get("socialScore") or 50.0
        g_raw = data.get("governanceScore") or 50.0
        t_raw = data.get("totalEsg") or 50.0

        e = _normalise_sustainalytics(e_raw)
        s = _normalise_sustainalytics(s_raw)
        g = _normalise_sustainalytics(g_raw)
        total = _normalise_sustainalytics(t_raw)

        _update_ratings_csv(ticker, e, s, g, total)

        return {
            "status": "ok",
            "ticker": ticker,
            "symbol_used": symbol,
            "source": "Finnhub_Sustainalytics",
            "raw_risk_score": t_raw,
            "normalised_score": total,
            "e": e, "s": s, "g": g,
        }
