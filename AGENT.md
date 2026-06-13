# ESG Integrity & Impact Navigator — Team Agent Guide
**UKFinnovator 2026 | Maxwell Data Challenge | Imperial College London**

> Read this first. This file is the single source of truth for anyone joining the project — technical or not, finance background or not. It also guides how to talk about the product to judges and users who may know nothing about ESG.

---

## 1. What we built (plain English)

ESG stands for **Environmental, Social, and Governance** — a way of rating companies on sustainability. But ESG ratings are broken: different rating agencies give the same company wildly different scores, and many companies score highly simply because they're good at PR, not because they actually cause less harm.

We built a tool that **sits on top of existing ESG scores** and answers three questions that no existing tool answers well:

1. **Can you trust this company's ESG rating?** (Integrity Score — 0–100)
2. **Is the company actually sustainable in the real world?** (Impact Alignment Score — 0–100)
3. **How much harm does this company externalise — emissions, exploitation, fines?** (WEM Score — 0–100)

We also compute a **Placebo Index** — a signal for when a company looks great on ESG but is actually terrible on real-world harm. Named after Tariq Fancy's (ex-BlackRock sustainable investing chief) description of ESG as a "dangerous placebo."

**The core argument:** ESG scores affect where trillions of dollars of capital flow. If those scores are unreliable or gameable, the market is misallocating capital and hiding real risk. We make that misallocation visible.

---

## 2. How to explain it to anyone

### To a judge who knows finance:
> "ESG rating divergence — documented in Berg, Koelbel & Rigobon (2022, Oxford Review of Finance) — means the same company can get a 30-point spread across providers. We score that signal quality, layer it against independent harm metrics (Climate TRACE emissions, regulatory fines, CEO pay ratios), and produce a Placebo Index that flags when ESG looks good but real-world harm is high."

### To a judge who doesn't know ESG:
> "Imagine Yelp reviews where every restaurant reviewer uses a completely different scoring system and never sees each other's reviews. You can't trust any individual score. We tell you which restaurants' scores can be trusted, and which ones are just good at marketing."

### To someone with no finance or tech background:
> "ESG is like a green star rating for companies. The problem is different rating agencies give the same company completely different stars. We check whether those stars are actually earned. Amazon has high ESG scores from some agencies, but it has a 512:1 CEO-to-worker pay ratio and $234M in labour fines in 5 years. Our tool shows you that gap."

### Demo talking points (60-second version):
1. Open the app, select XOM (ExxonMobil)
2. Point to three dials: Integrity 77, Impact 18, **WEM 5**
3. "WEM is 5 out of 100. That's because ExxonMobil emits at the 100th percentile of its peer group, its CEO earns 209× the median worker, and it has paid $473M in regulatory fines in 5 years."
4. Switch to ORSTED (Danish wind company)
5. "Same sector, WEM is 80. No labour penalty — CEO pays 44× median. Minimal fines. Climate TRACE shows it at the bottom of sector emissions."
6. "That's the story: naive ESG tilt gives both companies similar weight. WEM tilt reallocates capital away from XOM toward ORSTED. **That's the broken ESG signal made visible.**"

---

## 3. Full stack overview

```
User browser
    │
    ▼
React + TypeScript frontend (Vite, port 5173)
    │ HTTP → /api/*
    ▼
FastAPI backend (Python, port 8000)
    │
    ├── scoring/engine.py       ← loads data, computes all three scores
    │     ├── scoring/wem.py    ← D_carbon + D_labor + D_theft
    │     ├── scoring/divergence.py
    │     ├── scoring/verification.py
    │     ├── scoring/controversy.py
    │     └── scoring/impact.py
    │
    ├── ingestion/              ← live data fetchers (each has CSV fallback)
    │     ├── fmp.py            ← Financial Modeling Prep (revenue)
    │     ├── climate_trace.py  ← Climate TRACE v6 (emissions)
    │     ├── finnhub.py        ← Finnhub (ESG second provider)
    │     ├── edgar.py          ← SEC EDGAR (10-K claim extraction)
    │     ├── gdelt.py          ← GDELT (controversies, rate-limited)
    │     └── gemini_extractor.py ← Gemini (claim extraction from filings)
    │
    └── data/                   ← CSV fallback data (real values from filings)
          ├── companies.csv
          ├── esg_ratings.csv
          ├── wem_inputs.csv      ← revenue, emissions, fines, CEO pay ratio
          ├── materiality.csv     ← Maxwell Data FTSE100 financial materiality (March 2025)
          ├── claims.csv
          ├── controversies.csv
          └── impact_kpis.csv

Supabase (Postgres)             ← persistent storage (same schema as CSVs)
    ├── companies
    ├── esg_ratings
    ├── esg_claims
    ├── esg_incidents
    ├── impact_kpis
    ├── wem_inputs
    └── scores
```

**Key design principle:** every ingestor falls back to CSV data if the API is unavailable. The demo always works. Live data is pulled on `POST /api/refresh/{ticker}`.

---

## 4. Setup from scratch

### Prerequisites
- **Git**: `sudo apt install git` (Linux) / download from https://git-scm.com/
- **Python 3.11+**: `python3 --version` to check. Install from https://python.org if needed.
- **Node.js 18+**: `node --version` to check. Install from https://nodejs.org if needed.

### Step 1 — Clone and enter the repo
```bash
git clone <repo-url>
cd finnovator
```

### Step 2 — Backend setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Step 3 — Get free API keys (5 minutes)

**Financial Modeling Prep (FMP)** — already in `.env`, no action needed.

**Finnhub** — for real ESG second-provider scores:
1. Go to https://finnhub.io/register — email + password, no credit card
2. Copy your API key from the dashboard
3. Add to `backend/.env`: `FINNHUB_API_KEY=your_key_here`

**Gemini** — for claim extraction and controversy analysis:
1. Go to https://aistudio.google.com/ — sign in with Google
2. Click "Get API key" → Create → Copy
3. Add to `backend/.env`: `GEMINI_API_KEY=your_key_here`

**Supabase** — already configured in `.env` (project: `jvrhupdxzxgxfzpcnhjd`).

**Climate TRACE** and **SEC EDGAR** — no key needed, free public APIs.

### Step 4 — Frontend setup
```bash
cd ../frontend
npm install
```

### Step 5 — Create `.env` file
```bash
# backend/.env
FMP_API_KEY=PhWBcrQnjXHBtB7v0m38VXxUWY7ecIUJ
GEMINI_API_KEY=<your-gemini-key>
FINNHUB_API_KEY=<your-finnhub-key>
SUPABASE_PROJECT_URL=https://jvrhupdxzxgxfzpcnhjd.supabase.co
SUPABASE_ANON_KEY=<from-supabase-dashboard>
SUPABASE_SERVICE_ROLE=<from-supabase-dashboard>
```

### Step 6 — Run (two terminals)

**Terminal 1 — Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```
→ API live at http://localhost:8000  
→ Interactive API docs at http://localhost:8000/docs

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
→ App live at http://localhost:5173

---

## 5. Data sources and what's real

| Data | Source | Status | Notes |
|---|---|---|---|
| ESG scores (primary) | Financial Modeling Prep | CSV fallback | FMP ESG endpoint is paywalled; scores in CSV from 2024 reports |
| ESG scores (second) | Finnhub (Sustainalytics) | **Live** | Free key required; real Sustainalytics risk scores |
| Company revenue | FMP stable income-statement | **Live (US)** | XOM, AMZN: live. EU companies: real 2023 annual report values in CSV |
| Emissions | Climate TRACE v6 | **Live** | Sector-level global totals; revenue-fraction attributed to company |
| Regulatory fines | Static CSV | CSV fallback | Real values from DOJ/EPA enforcement press releases and 10-K disclosures |
| CEO pay ratio | Static CSV | CSV fallback | Real DEF 14A proxy statement values |
| ESG claims | SEC EDGAR + Gemini | **Live** | Real 10-K text; Gemini extracts specific numeric claims |
| **Financial materiality** | **Maxwell Data FTSE100 Survey (March 2025)** | **CSV** | Real SASB-style materiality scores per company — powers "Top 3 material factors" in Action Panel |
| Controversies | GDELT (rate-limited) | CSV fallback | Real incidents in CSV; GDELT pulls are retried on refresh |

**Why some things are static CSVs:** Violation Tracker and GDELT are rate-limited or bot-protected. The CSV values are drawn from real public sources (SEC filings, DOJ press releases, company annual reports). They're not fake — they're pre-fetched real data.

---

## 6. Key API endpoints

```
GET  /api/companies              → list of all 8 demo tickers
GET  /api/score/{ticker}         → full CompanyScore with all three scores
POST /api/score/{ticker}         → same but with custom integrity weights
GET  /api/portfolio              → all companies + three portfolio tilts
POST /api/refresh/{ticker}       → run all ingestors, update data, recompute
GET  /api/health                 → status check
```

Example curl:
```bash
curl http://localhost:8000/api/score/AMZN | python3 -m json.tool
```

---

## 7. Scoring formulas (quick reference)

### Integrity Score (0–100)
```
= 0.35 × RatingAgreement + 0.40 × ClaimVerification + 0.25 × ControversyScore
```
- **RatingAgreement**: 100 − (spread between providers / max_spread × 100)
- **ClaimVerification**: verified_share × 100 − contradicted_share × 100
- **ControversyScore**: 100 − recency-weighted incident severity

### WEM Score (0–100) — Worker & Ecological Materiality
```
WEM = 100 − (D_carbon + D_labor + D_theft)
```
- **D_carbon** (0–40): percentile rank of emissions intensity across all 8 companies × 40
- **D_labor** (0–30): clamp(20 × log(CEO_pay_ratio / 50), 0, 30)
- **D_theft** (0–40): min(40, 10 × log₁₀(total_fines_millions + 1))

### Placebo Index (0–1)
```
PI = sigmoid(0.6 × (ESG_avg − WEM) + 0.4 × (100 − Integrity))
```
>0.65 = "Dangerous Placebo" | 0.4–0.65 = "Moderate risk" | <0.4 = "Coherent"

---

## 8. Academic grounding (for judges)

- **Berg, Koelbel & Rigobon (2022)** — "Aggregate Confusion" — Oxford Review of Finance. Shows ~0.5 correlation between ESG raters on identical firms. Our rating divergence component is a direct operationalisation.
- **Tariq Fancy (2021)** — ex-BlackRock MD, "The Secret Sustainability: ESG is a Dangerous Placebo." Our Placebo Index operationalises this directly.
- **Hartzmark & Sussman (2019)** — ESG fund flows vs actual sustainability outcomes. Documents the capital misallocation problem.
- **Pedersen, Fitzgibbons & Pomorski (2021)** — ESG ratings and stock returns. Shows ESG-based capital allocation effects.

---

## 9. Team roles and what to touch

| Role | Your files | Don't touch |
|---|---|---|
| **Backend / data** | `backend/ingestion/*.py`, `backend/scoring/engine.py` | `frontend/` |
| **Frontend** | `frontend/src/` | `backend/scoring/` formulas |
| **Scoring theory** | `backend/scoring/wem.py`, `engine.py` | Ingestion layer |
| **Demo / pitch** | This file, `METHODOLOGY_DEFENCE.md` | Code |

---

## 10. Troubleshooting

**Backend won't start:**
```bash
# Make sure you're in the venv
source backend/venv/bin/activate
# Check for import errors
python3 -c "from scoring.engine import get_company_score; print('OK')"
```

**Frontend shows "No data for BP":**
- Check backend is running on port 8000
- Check CORS: frontend must be on 5173 or 3000

**Supabase not connecting:**
- The app works entirely from CSV fallback even without Supabase
- Supabase is for persistence, not for the demo to function

**"FMP 402" in refresh logs:**
- Expected for EU companies (BP, SHEL, ORSTED etc.) on free tier
- App falls back to CSV revenue values (which are real annual report numbers)

**Climate TRACE returns 0 emissions:**
- Check that `year=2022` is in the request (some year values return no data)
- The sector mapping in `climate_trace.py` maps each ticker to a sector

---

## 11. What "real data" means in this project

A common question: "Is the data fake?"

**It's not.** Here's what each data point traces to:

- XOM CEO pay ratio (209:1): from ExxonMobil DEF 14A proxy statement filed with the SEC, fiscal year 2023
- AMZN labour fines ($234M): from DOJ, EEOC, OSHA enforcement actions documented in Amazon's 10-K risk factors
- BP other fines ($310M): from UK FCA, Deepwater Horizon settlement carryovers, EPA actions in 10-K
- ORSTED CEO pay ratio (44:1): from Ørsted 2023 Annual Report, remuneration section
- Emissions: sector-level from Climate TRACE v6 (independent satellite + ML methodology, not self-reported)

The static CSVs are pre-fetched real values, not invented numbers. The `POST /api/refresh/{ticker}` endpoint updates them from live APIs where those APIs are accessible.
