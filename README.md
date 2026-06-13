# ESG Integrity & Impact Navigator

**UKFinnovator 2026 · Maxwell Data Challenge · Imperial College London**

> Turning ESG from a branding exercise into decision-grade intelligence.

ESG ratings are broken. The same company gets wildly different scores from different providers. Many high-ESG companies have terrible real-world sustainability records. Capital flows to the best PR teams, not the best performers.

We built the layer of **integrity and impact analysis that ESG is missing**: score the trustworthiness of ESG signals, measure real-world harm directly, and translate both into capital allocation decisions.

---

## Three scores, one verdict

| Score | What it measures | Key inputs |
|---|---|---|
| **Integrity Score** (0–100) | Can you trust the ESG ratings? | Rating divergence across providers, ESG claim verification vs independent data, controversy history |
| **Impact Alignment** (0–100) | Is the company actually improving? | Sector-material KPIs vs peer median (emissions trend, capex, safety) |
| **WEM Score** (0–100) | How much harm is externalised? | Climate TRACE emissions intensity, CEO/worker pay ratio, 5-year regulatory fines |

**Placebo Index (0–1):** flags when ESG looks good but WEM and Integrity say otherwise — operationalising Tariq Fancy's "dangerous placebo" critique.

---

## Quick start

```bash
# Backend
cd backend && python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

App: http://localhost:5173 · API docs: http://localhost:8000/docs

**→ Full setup (API keys, troubleshooting): [AGENT.md](AGENT.md)**

---

## Architecture

```
React + TypeScript (Vite, port 5173)
        ↕  /api/*
FastAPI (Python, port 8000)
        ↕
Scoring engine  ←  WEM · Integrity · Impact · Placebo Index
        ↕
Ingestion layer ←  FMP · Finnhub · Climate TRACE v6 · SEC EDGAR · Gemini
        ↕
Supabase Postgres  +  CSV fallback (always works offline)
```

---

## Data sources

| Source | Used for | Key |
|---|---|---|
| Financial Modeling Prep | Company revenue (live, US tickers) | In `.env` |
| Finnhub (Sustainalytics) | ESG second-provider scores | Free — see AGENT.md |
| Climate TRACE v6 | Sector GHG emissions (not self-reported) | None needed |
| SEC EDGAR | 10-K ESG claim extraction | None needed |
| Gemini | Claim extraction + controversy analysis | Free — see AGENT.md |
| Supabase | Persistence | In `.env` |

---

## Key docs

| File | Purpose |
|---|---|
| **[AGENT.md](AGENT.md)** | Full team guide — setup, talking points, troubleshooting |
| **[DESIGN.md](DESIGN.md)** | UI/UX state and open design opportunities |
| **[METHODOLOGY_DEFENCE.md](METHODOLOGY_DEFENCE.md)** | Academic grounding for finance judges |
| **[CLAUDE.md](CLAUDE.md)** | Full product spec (the definitive reference) |

---

## Academic grounding

- Berg, Koelbel & Rigobon (2022) — *Aggregate Confusion* — Oxford Review of Finance
- Tariq Fancy (2021) — *ESG as a Dangerous Placebo*
- Hartzmark & Sussman (2019) — ESG fund flows vs actual sustainability outcomes
