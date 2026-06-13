"""
ESG Integrity & Impact Navigator — FastAPI backend
Run: uvicorn main:app --reload --port 8000
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from scoring.engine import get_company_score, get_portfolio_view, get_all_tickers, get_forecast, get_materiality_comparison
from scoring.models import WeightConfig, CompanyScore, PortfolioView, ForecastResult, MaterialityComparison
from scoring.ftse_profile import get_all_ftse100_companies, search_ftse100, get_ftse100_profile
from ingestion.fmp import FMPIngestor
from ingestion.climate_trace import ClimateTraceIngestor
from ingestion.violation_tracker import ViolationTrackerIngestor
from ingestion.ceo_pay import CEOPayIngestor
from ingestion.finnhub import FinnhubIngestor

app = FastAPI(title="ESG Integrity & Impact Navigator", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/companies")
async def list_companies() -> list[str]:
    return get_all_tickers()


@app.get("/api/score/{ticker}", response_model=CompanyScore)
async def score_company(ticker: str) -> CompanyScore:
    result = get_company_score(ticker.upper())
    if not result:
        raise HTTPException(status_code=404, detail=f"Company '{ticker}' not found in dataset")
    return result


class WeightRequest(BaseModel):
    divergence: float = 0.35
    verification: float = 0.40
    controversy: float = 0.25


@app.post("/api/score/{ticker}", response_model=CompanyScore)
async def score_company_custom_weights(ticker: str, body: WeightRequest) -> CompanyScore:
    """Recalculate integrity score with custom weights — powers the weight slider."""
    weights = WeightConfig(
        divergence=body.divergence,
        verification=body.verification,
        controversy=body.controversy,
    )
    result = get_company_score(ticker.upper(), weights=weights)
    if not result:
        raise HTTPException(status_code=404, detail=f"Company '{ticker}' not found in dataset")
    return result


@app.get("/api/portfolio", response_model=PortfolioView)
async def portfolio_view() -> PortfolioView:
    return get_portfolio_view()


@app.post("/api/refresh/{ticker}")
async def refresh_company(ticker: str) -> dict:
    """
    Orchestrates all ingestors for a ticker, then recomputes scores.
    Each ingestor falls back to CSV data if its API is unavailable.
    """
    t = ticker.upper()
    results = {}
    for name, ingestor in [
        ("fmp", FMPIngestor()),
        ("climate_trace", ClimateTraceIngestor()),
        ("finnhub", FinnhubIngestor()),
        ("violation_tracker", ViolationTrackerIngestor()),
        ("ceo_pay", CEOPayIngestor()),
    ]:
        try:
            results[name] = ingestor.fetch(t)
        except Exception as e:
            results[name] = {"status": "error", "detail": str(e)}

    score = get_company_score(t)
    if not score:
        raise HTTPException(status_code=404, detail=f"Company '{ticker}' not found after refresh")
    return {"ticker": t, "ingestion": results, "scores": score.model_dump()}


@app.get("/api/forecast/{ticker}", response_model=ForecastResult)
async def forecast_company(ticker: str) -> ForecastResult:
    result = get_forecast(ticker.upper())
    if not result:
        raise HTTPException(status_code=404, detail=f"Company '{ticker}' not found")
    return result


@app.get("/api/materiality-comparison/{ticker}", response_model=MaterialityComparison)
async def materiality_comparison(ticker: str) -> MaterialityComparison:
    result = get_materiality_comparison(ticker.upper())
    if not result:
        raise HTTPException(status_code=404, detail=f"No materiality data for '{ticker}'")
    return result


@app.get("/api/health")
async def health() -> dict:
    return {"status": "ok", "companies": get_all_tickers()}


# ── FTSE 100 search & profile endpoints ──────────────────────────────────────

@app.get("/api/search")
async def search_companies(q: str = "") -> list[dict]:
    """Search all 75 FTSE 100 companies by name, ticker, or industry."""
    return search_ftse100(q)


@app.get("/api/ftse100-index")
async def ftse100_index() -> list[dict]:
    """Full index of all FTSE 100 companies — used to populate search bar."""
    return get_all_ftse100_companies()


@app.get("/api/profile/{ticker}")
async def ftse_profile(ticker: str) -> dict:
    """
    Materiality profile for any FTSE 100 company.
    Includes top-8 drivers, peer comparison, deviation, and quarterly forecasts.
    """
    profile = get_ftse100_profile(ticker.upper())
    if not profile:
        raise HTTPException(status_code=404, detail=f"No FTSE 100 profile for '{ticker}'")
    return profile


# ── Stock price endpoint ──────────────────────────────────────────────────────

import os, httpx, time

FMP_KEY = os.getenv("FMP_API_KEY", "")
FINNHUB_KEY = os.getenv("FINNHUB_API_KEY", "")

# FMP ticker mapping for UK/European stocks
FMP_TICKER_MAP = {
    "BP":    "BP",
    "SHEL":  "SHEL",
    "ULVR":  "UL",
    "TTE":   "TTE",
    "ORSTED": "DNNGY",
    "XOM":   "XOM",
    "AMZN":  "AMZN",
    "NESN":  "NSRGY",
}

# Static price fallback for demo companies (prices as of June 2026)
STATIC_PRICES: dict[str, dict] = {
    "BP":    {"price": 4.23,  "currency": "GBP", "change_1d": 0.05,  "change_1d_pct": 1.2,  "change_1m_pct": 2.3,  "sparkline_6m": [100,97,98,101,103,99,98,102,104,106,103,101,102,105,107,104,103,106,108,107,105,104,106,108,110,107]},
    "SHEL":  {"price": 26.80, "currency": "GBP", "change_1d": 0.11,  "change_1d_pct": 0.4,  "change_1m_pct": 3.1,  "sparkline_6m": [100,102,101,103,105,104,102,105,107,106,104,106,108,107,105,108,110,109,107,110,112,111,109,112,114,113]},
    "ORSTED":{"price": 289.0, "currency": "DKK", "change_1d": -1.44, "change_1d_pct": -0.5, "change_1m_pct": -4.2, "sparkline_6m": [100,103,105,102,100,98,96,99,101,99,97,95,97,99,97,95,93,95,97,95,93,91,93,95,96,96]},
    "XOM":   {"price": 113.5, "currency": "USD", "change_1d": 0.91,  "change_1d_pct": 0.8,  "change_1m_pct": 5.2,  "sparkline_6m": [100,101,103,105,104,106,108,107,105,107,109,108,106,109,111,110,108,111,113,112,110,113,115,114,112,115]},
    "TTE":   {"price": 61.85, "currency": "EUR", "change_1d": 0.19,  "change_1d_pct": 0.3,  "change_1m_pct": 1.8,  "sparkline_6m": [100,101,100,102,103,102,101,103,104,103,102,104,105,104,103,105,106,105,104,106,107,106,105,107,108,107]},
    "ULVR":  {"price": 44.82, "currency": "GBP", "change_1d": 0.04,  "change_1d_pct": 0.1,  "change_1m_pct": 11.6, "sparkline_6m": [100,99,98,99,101,103,105,107,109,108,110,112,111,113,115,114,116,118,117,119,121,120,122,124,123,125]},
    "NESN":  {"price": 82.3,  "currency": "CHF", "change_1d": -0.25, "change_1d_pct": -0.3, "change_1m_pct": -9.1, "sparkline_6m": [100,98,96,97,95,93,91,92,90,88,89,87,85,86,84,82,83,81,79,80,78,76,77,75,73,74]},
    "AMZN":  {"price": 186.4, "currency": "USD", "change_1d": 3.35,  "change_1d_pct": 1.8,  "change_1m_pct": 19.2, "sparkline_6m": [100,103,106,109,112,110,113,116,119,117,120,123,126,124,127,130,133,131,134,137,140,138,141,144,147,145]},
}


@app.get("/api/price/{ticker}")
async def stock_price(ticker: str) -> dict:
    """
    Returns current stock price, daily/monthly change, and 6-month sparkline.
    Falls back to static demo data if API is unavailable.
    """
    t = ticker.upper()
    static = STATIC_PRICES.get(t)

    # Try FMP live price
    if FMP_KEY:
        fmp_symbol = FMP_TICKER_MAP.get(t, t)
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                r = await client.get(
                    f"https://financialmodelingprep.com/api/v3/quote/{fmp_symbol}",
                    params={"apikey": FMP_KEY},
                )
                if r.status_code == 200:
                    data = r.json()
                    if data and isinstance(data, list) and len(data) > 0:
                        q = data[0]
                        # Get historical for sparkline (26 weeks)
                        hist_r = await client.get(
                            f"https://financialmodelingprep.com/api/v3/historical-price-full/{fmp_symbol}",
                            params={"timeseries": 182, "apikey": FMP_KEY},  # 182 days ≈ 26 weeks
                        )
                        sparkline = []
                        if hist_r.status_code == 200:
                            hist = hist_r.json().get("historical", [])
                            # Get weekly closes (every 7 days)
                            weekly = hist[::7][:26]
                            if weekly:
                                base = weekly[-1]["close"]
                                sparkline = [round(w["close"] / base * 100, 2) for w in reversed(weekly)]
                        return {
                            "ticker": t,
                            "price": q.get("price", 0),
                            "currency": "USD" if fmp_symbol not in ["BP", "SHEL", "UL", "DNNGY"] else "GBP",
                            "change_1d": round(q.get("change", 0), 2),
                            "change_1d_pct": round(q.get("changesPercentage", 0), 2),
                            "change_1m_pct": round(((q.get("price", 0) / q.get("priceAvg50", q.get("price", 1) or 1)) - 1) * 100, 2) if q.get("priceAvg50") else (static or {}).get("change_1m_pct", 0),
                            "sparkline_6m": sparkline or (static or {}).get("sparkline_6m", []),
                            "as_of": str(q.get("timestamp", "")),
                            "source": "live",
                        }
        except Exception:
            pass

    if static:
        return {**static, "ticker": t, "as_of": "2026-06-13", "source": "static"}

    raise HTTPException(status_code=404, detail=f"No price data for '{ticker}'")
