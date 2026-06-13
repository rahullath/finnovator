"""
Pre-bake all scores + FTSE100 profiles + price data to static JSON for Vercel.

Run from backend/ directory:
    python3 generate_scores.py

Outputs in frontend/public/data/:
    companies.json           — 8 demo tickers
    ftse100-index.json       — all 75 FTSE 100 companies (for search)
    scores/{TICKER}.json     — full score for 8 demo companies
    portfolio.json
    forecasts/{TICKER}.json
    materiality-comparison/{TICKER}.json
    profiles/{TICKER}.json   — materiality profile for all 75 FTSE 100 companies
    prices/{TICKER}.json     — static price data for 8 demo companies
"""
import json, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from scoring.engine import get_all_tickers, get_company_score, get_portfolio_view, get_forecast, get_materiality_comparison
from scoring.ftse_profile import get_all_ftse100_companies, get_ftse100_profile

OUT = Path(__file__).parent.parent / "frontend" / "public" / "data"
OUT.mkdir(parents=True, exist_ok=True)
(OUT / "scores").mkdir(exist_ok=True)
(OUT / "forecasts").mkdir(exist_ok=True)
(OUT / "materiality-comparison").mkdir(exist_ok=True)
(OUT / "profiles").mkdir(exist_ok=True)
(OUT / "prices").mkdir(exist_ok=True)

# ── Demo company scores ────────────────────────────────────────────────────────

tickers = get_all_tickers()
(OUT / "companies.json").write_text(json.dumps(tickers, indent=2))
print(f"wrote companies.json ({len(tickers)} tickers)")

for ticker in tickers:
    score = get_company_score(ticker)
    if score:
        (OUT / "scores" / f"{ticker}.json").write_text(score.model_dump_json(indent=2))
        print(f"  wrote scores/{ticker}.json")

pv = get_portfolio_view()
(OUT / "portfolio.json").write_text(pv.model_dump_json(indent=2))
print("wrote portfolio.json")

for ticker in tickers:
    fc = get_forecast(ticker)
    if fc:
        (OUT / "forecasts" / f"{ticker}.json").write_text(fc.model_dump_json(indent=2))
        print(f"  wrote forecasts/{ticker}.json")

for ticker in tickers:
    mc = get_materiality_comparison(ticker)
    if mc:
        (OUT / "materiality-comparison" / f"{ticker}.json").write_text(mc.model_dump_json(indent=2))
        print(f"  wrote materiality-comparison/{ticker}.json")

# ── FTSE 100 index (all 75 companies) ─────────────────────────────────────────

all_cos = get_all_ftse100_companies()
(OUT / "ftse100-index.json").write_text(json.dumps(all_cos, indent=2))
print(f"wrote ftse100-index.json ({len(all_cos)} companies)")

# ── FTSE 100 profiles ──────────────────────────────────────────────────────────

for co in all_cos:
    ticker = co["ticker"]
    profile = get_ftse100_profile(ticker)
    if profile:
        (OUT / "profiles" / f"{ticker}.json").write_text(json.dumps(profile, indent=2))
        print(f"  wrote profiles/{ticker}.json")

# Also write profiles for demo companies not in FTSE 100 CSV (using stub)
for ticker in tickers:
    if not (OUT / "profiles" / f"{ticker}.json").exists():
        # Write minimal stub so the frontend doesn't 404
        score = get_company_score(ticker)
        if score:
            stub = {
                "ticker": ticker,
                "name": score.name,
                "industry": score.sector,
                "sector": score.sector,
                "has_full_score": True,
                "peer_count": 0,
                "peer_names": [],
                "top_8_drivers": [
                    {
                        "driver": f.factor,
                        "category": "Governance",
                        "materiality_score": f.materiality_score,
                        "peer_median": round(f.materiality_score * 0.92, 4),
                        "ftse100_median": round(f.materiality_score * 0.85, 4),
                        "deviation_from_peer": round(f.materiality_score * 0.08, 4),
                        "deviation_from_ftse": round(f.materiality_score * 0.15, 4),
                        "direction_3m": "stable",
                        "direction_12m": "stable",
                        "confidence": "low",
                        "layman_explanation": "Key sustainability factor for this sector.",
                    }
                    for f in score.material_factors
                ],
                "all_26_drivers": [],
                "three_body_instability": 0.0,
            }
            (OUT / "profiles" / f"{ticker}.json").write_text(json.dumps(stub, indent=2))
            print(f"  wrote profiles/{ticker}.json (stub)")

# ── Static price data ──────────────────────────────────────────────────────────

STATIC_PRICES = {
    "BP":    {"price": 4.23,  "currency": "GBP", "change_1d": 0.05,  "change_1d_pct": 1.2,  "change_1m_pct": 2.3,  "sparkline_6m": [100,97,98,101,103,99,98,102,104,106,103,101,102,105,107,104,103,106,108,107,105,104,106,108,110,107], "as_of": "2026-06-13", "source": "static"},
    "SHEL":  {"price": 26.80, "currency": "GBP", "change_1d": 0.11,  "change_1d_pct": 0.4,  "change_1m_pct": 3.1,  "sparkline_6m": [100,102,101,103,105,104,102,105,107,106,104,106,108,107,105,108,110,109,107,110,112,111,109,112,114,113], "as_of": "2026-06-13", "source": "static"},
    "ORSTED":{"price": 289.0, "currency": "DKK", "change_1d": -1.44, "change_1d_pct": -0.5, "change_1m_pct": -4.2, "sparkline_6m": [100,103,105,102,100,98,96,99,101,99,97,95,97,99,97,95,93,95,97,95,93,91,93,95,96,96], "as_of": "2026-06-13", "source": "static"},
    "XOM":   {"price": 113.5, "currency": "USD", "change_1d": 0.91,  "change_1d_pct": 0.8,  "change_1m_pct": 5.2,  "sparkline_6m": [100,101,103,105,104,106,108,107,105,107,109,108,106,109,111,110,108,111,113,112,110,113,115,114,112,115], "as_of": "2026-06-13", "source": "static"},
    "TTE":   {"price": 61.85, "currency": "EUR", "change_1d": 0.19,  "change_1d_pct": 0.3,  "change_1m_pct": 1.8,  "sparkline_6m": [100,101,100,102,103,102,101,103,104,103,102,104,105,104,103,105,106,105,104,106,107,106,105,107,108,107], "as_of": "2026-06-13", "source": "static"},
    "ULVR":  {"price": 44.82, "currency": "GBP", "change_1d": 0.04,  "change_1d_pct": 0.1,  "change_1m_pct": 11.6, "sparkline_6m": [100,99,98,99,101,103,105,107,109,108,110,112,111,113,115,114,116,118,117,119,121,120,122,124,123,125], "as_of": "2026-06-13", "source": "static"},
    "NESN":  {"price": 82.3,  "currency": "CHF", "change_1d": -0.25, "change_1d_pct": -0.3, "change_1m_pct": -9.1, "sparkline_6m": [100,98,96,97,95,93,91,92,90,88,89,87,85,86,84,82,83,81,79,80,78,76,77,75,73,74], "as_of": "2026-06-13", "source": "static"},
    "AMZN":  {"price": 186.4, "currency": "USD", "change_1d": 3.35,  "change_1d_pct": 1.8,  "change_1m_pct": 19.2, "sparkline_6m": [100,103,106,109,112,110,113,116,119,117,120,123,126,124,127,130,133,131,134,137,140,138,141,144,147,145], "as_of": "2026-06-13", "source": "static"},
}

for ticker, data in STATIC_PRICES.items():
    (OUT / "prices" / f"{ticker}.json").write_text(json.dumps({**data, "ticker": ticker}, indent=2))
    print(f"  wrote prices/{ticker}.json")

print("\nDone. All static JSON files generated.")
