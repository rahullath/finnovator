"""
Pre-bake all scores to static JSON for Vercel deployment.

Workflow:
  1. Update CSV data in backend/data/ (or run POST /api/refresh/{ticker})
  2. Run this script from backend/ directory:
       python3 generate_scores.py
  3. Commit the updated JSON files in frontend/public/data/
  4. Push to git → Vercel deploys the new scores

Vercel's build step is frontend-only (no Python runtime needed on Vercel).
The static JSON files are served directly from Vercel's CDN.

Outputs:
  ../frontend/public/data/companies.json
  ../frontend/public/data/scores/{TICKER}.json
  ../frontend/public/data/portfolio.json
"""
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from scoring.engine import get_all_tickers, get_company_score, get_portfolio_view

OUT = Path(__file__).parent.parent / "frontend" / "public" / "data"
OUT.mkdir(parents=True, exist_ok=True)
(OUT / "scores").mkdir(exist_ok=True)

tickers = get_all_tickers()

# companies.json
(OUT / "companies.json").write_text(json.dumps(tickers, indent=2))
print(f"wrote companies.json ({len(tickers)} tickers)")

# per-company score files
for ticker in tickers:
    score = get_company_score(ticker)
    if score:
        (OUT / "scores" / f"{ticker}.json").write_text(
            score.model_dump_json(indent=2)
        )
        print(f"  wrote scores/{ticker}.json")

# portfolio.json
pv = get_portfolio_view()
(OUT / "portfolio.json").write_text(pv.model_dump_json(indent=2))
print("wrote portfolio.json")
print("Done.")
