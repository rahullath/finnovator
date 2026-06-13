"""
ESG Integrity & Impact Navigator — FastAPI backend
Run: uvicorn main:app --reload --port 8000
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from scoring.engine import get_company_score, get_portfolio_view, get_all_tickers
from scoring.models import WeightConfig, CompanyScore, PortfolioView
from ingestion.fmp import FMPIngestor
from ingestion.climate_trace import ClimateTraceIngestor
from ingestion.violation_tracker import ViolationTrackerIngestor
from ingestion.ceo_pay import CEOPayIngestor
from ingestion.finnhub import FinnhubIngestor

app = FastAPI(title="ESG Integrity & Impact Navigator", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
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


@app.get("/api/health")
async def health() -> dict:
    return {"status": "ok", "companies": get_all_tickers()}
