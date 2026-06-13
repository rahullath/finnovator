# Maxwell Data Challenge — Spec  
**“ESG Integrity & Impact Navigator”**  
**Subtitle:** From ESG greenwashing to decision‑grade sustainability signals

***

## 1. One‑line pitch

Build a data‑driven prototype that **sits on top of existing ESG scores** and tells decision‑makers:  

> “Where is this company’s ESG story credible, where is it greenwashed, and what does that mean for how we invest?” 

We expose **rating divergence and greenwashing risk**, add a simple **impact‑alignment view**, and then translate it into **clear actions and capital‑allocation choices**.

***

## 2. Problem & opportunity

### The problem

- ESG scores from different providers **diverge substantially** for the same company; academic work (“Aggregate Confusion”) shows low correlations and large methodological disagreements.
- Many scores are driven by **self‑reported disclosure and PR** rather than actual environmental or social performance, which is why high‑ESG firms can still be over‑represented in greenwashing scandals. 
- Despite this, ESG scores affect **capital allocation and cost of capital**: higher ESG ratings are associated with cheaper financing and portfolio inclusion, so flawed metrics mean **real misallocation of capital and hidden risk**. 

### Opportunity for Maxwell Data

Everyone else will build “yet another ESG dashboard” that visualises scores.  

We build **the layer of integrity and impact analysis that ESG is missing**:

- Identify **where ESG metrics are fragile or misleading**.  
- Show **which sustainability factors are actually material** to risk and impact in a sector.  
- Give **plain‑language recommendations** that executives and portfolio managers can act on.  

This positions Maxwell Data as the partner that **fixes ESG’s information problem**, not as “just another ratings vendor.” 

***

## 3. Concept overview

### Core idea

For each company (or small portfolio), our tool produces three top‑level outputs:

1. **Integrity Score (0–100)**  
   How reliable are this company’s ESG scores and claims, given rating divergence, disclosure vs reality, and controversy history? 
2. **Impact Alignment Score (0–100)**  
   How well do the company’s *actual* environmental and social metrics line up with its ESG narrative and with sector‑specific material issues?
3. **Action Panel**  
   A short, human‑readable summary:  
   - “Signal Quality: High / Medium / Low”  
   - “Key sustainability factors to focus on (top 3 for this sector)”  
   - “Recommended actions: engage / tilt / exclude / increase weight”  

### Why this is different

- **Not another ESG rating.** We don’t compete with MSCI/Sustainalytics; we **score the *trustworthiness* and materiality** of existing ESG signals.
- **Explicitly anti‑greenwashing.** We quantify where ESG is likely marketing vs real change, aligning with regulators’ focus on greenwashing risk. 
- **Capital‑allocation aware.** We link integrity and impact metrics to **implied cost‑of‑capital effects**, showing how portfolios might be misallocating capital today.

***

## 4. Users and value

### Primary users

- **Sustainable investment analysts / PMs**  
  Need to use ESG scores but are worried about greenwashing and rating noise.

### Secondary users

- **Corporate sustainability / strategy teams**  
  Want to benchmark how credible their ESG story would look to investors and regulators.  
- **Regulators / compliance teams**  
  Need tools to spot likely greenwashing cases quickly. 
### Value proposition

- **For investors:** avoid overpaying for greenwashed “leaders,” surface under‑recognised real performers, and improve portfolio resilience to ESG‑related regulation and controversy shocks
- **For executives:** see which ESG dimensions actually move risk and capital in their sector, and what evidence they need to reduce perceived greenwashing risk

***

## 5. Core mechanics & scoring

### 5.0 Three-score framework

The navigator produces **three top-level scores** per company:

1. **Integrity Score (0–100):** reliability of ESG signals (rating divergence + claim verification + controversies).
2. **Impact Alignment Score (0–100):** sector-material sustainability performance (emissions intensity, safety, wage fairness, etc.).
3. **WEM Score (0–100):** Worker & Ecological Materiality — a deflationary index that starts at 100 and subtracts penalties for absolute emissions intensity, labour exploitation (CEO pay ratio), and accumulated regulatory fines. Explicitly anti-shareholder-primacy: penalises externalised harm regardless of ESG narrative.

Composite output also includes a **Placebo Index** (0–1): high when ESG looks good but WEM and Integrity are low — operationalising Tariq Fancy's "dangerous placebo" concept.

```
placebo_index = sigmoid(a * (esg_score_avg - wem_score) + b * (100 - integrity_score))
```

---

### 5.1 Integrity Score (signal quality)

**Objective:** Measure how much confidence to place in a company’s existing ESG scores and narrative.

Components (0–100, later normalised and weighted):

1. **Rating Divergence Score (35%)**  
   - Inputs: ESG scores from ≥2 providers (e.g., FMP ESG data + Open Sustainability Index or a mock second source). 
   - Method: compute spread (e.g., standard deviation / range) across providers; transform into a 0–100 “agreement” score (high spread → low score).  
   - Rationale: research shows that most ESG disagreement stems from measurement and scope choices, so divergence means “noisy signal.” [

2. **Disclosure vs Reality Score (40%)**  
   - Inputs:  
     - Extracted ESG claims from sustainability reports / 10‑K ESG sections (EDGAR or sample PDFs).  
     - Simple external indicators: emissions intensity trend, safety incidents, labour metrics (from ILO or curated sample data). 
   - Method (hackathon‑simplified):  
     - Use an LLM or lightweight NLP to pull **specific, numeric claims** (“we reduced scope‑1 emissions by 30% since 2018”).
     - Match against external or manually curated data; label each claim as ✓ verified / ✗ contradicted / ? unverifiable.  
     - Score = share of claims that are verified minus share contradicted.  
   - Rationale: literature finds ESG scores often reflect disclosure quality more than actual impact; we directly test claims. 

3. **Controversy & Restatement Score (25%)**  
   - Inputs: ESG‑related incidents from GDELT (or curated incidents) plus any ESG restatements or fines we can encode.)
   - Method:  
     - Count incidents over a lookback window; weight recent ones more heavily.  
     - Penalise firms with ESG misreporting / greenwashing enforcement as a strong negative signal.
   - Rationale: recent research links high ESG scores and frequent controversies/restatements to greenwashing risk.)

**Composite formula (conceptual)**

```text
Integrity Score (0–100) =
  0.35 × RatingAgreement
+ 0.40 × ClaimVerification
+ 0.25 × (1 – ControversyIntensity)
```

Weights are adjustable but justified in finance language (most weight on hard verification).

***

### 5.2 Impact Alignment Score (real‑world performance)

**Objective:** Distinguish between companies that *look good* on ESG vs those that actually **improve key sustainability outcomes** in their sector. [papers.ssrn](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4985314)

1. **Select 3–5 sector‑material KPIs** (per sector)  
   Examples for energy:  
   - Scope‑1 and 2 emissions trend (per unit of output or revenue).  
   - Share of capex going to low‑carbon activities.  
   - Major environmental incidents.  

2. **Benchmark each KPI**  
   - Against sector median and/or science‑based targets where possible (simplified for the hackathon).  
   - Score each KPI 0–100 based on position vs peer group and trend direction.  

3. **Aggregate to Impact Alignment Score**  
   - Weighted average of KPI scores, with weights reflecting materiality (e.g., emissions > capex disclosure).  
   - Display both the composite and the underlying KPIs to avoid “black box” accusations.  

Narrative: “This company’s ESG score is high, but its impact alignment is low: emissions per unit are flat, and capex is still 80% fossil. Conversely, this low‑ESG mid‑cap shows strong decarbonisation and safety improvements.” 

***

### 5.3 WEM Score (Worker & Ecological Materiality)

**Objective:** Bypass corporate self-reporting by measuring externalised harm directly from public enforcement and emissions data.

**Formula:**

```
WEM = clamp(100 - (D_carbon + D_labor + D_theft), 0, 100)
```

**Components:**

- **D_carbon (0–40):** emissions intensity `I = emissions_tco2e / revenue_usd`. Percentile-rank across company universe. `D_carbon = 40 * I_percentile`.
  - Data: Climate TRACE API v4 (facility/sector GHGs, open) mapped by country + sector for v1.

- **D_labor (0–30):** CEO-to-worker pay ratio R. `D_labor = clamp(20 * log(R / 50), 0, 30)`.
  - Data: SEC DEF 14A / PlainCEOPay / static curated CSV.

- **D_theft (0–40):** 5-year total regulatory fines F (labour + environmental). `D_theft = min(40, 10 * log10(F_millions + 1))`.
  - Data: Violation Tracker Global (open, with Python scrapers).

**WEM is stored in `wem_inputs` table/CSV** (revenue, emissions, fines, ceo_pay_ratio) so it's fully auditable and not a black box.

---

### 5.5 Capital‑allocation and decision‑support layer

**Goal:** Translate Integrity and Impact scores into **clear recommendations and portfolio signals**. 

1. **Score‑to‑capital mapping (illustrative)**  
   - Use existing findings that higher ESG scores are associated with lower cost of capital
   - In the prototype, show a simple mapping: “If you naively tilt by ESG score, these firms get cheaper financing. If you tilt by Integrity × Impact instead, the capital allocation pattern changes.” 

2. **Decision rules**  
   - High Integrity, High Impact → “Preferred sustainability leaders; consider increasing weight.”  
   - High Integrity, Low Impact → “Clear story but limited real progress; engagement priority.”  
   - Low Integrity, High Impact → “Under‑recognised performers; potential impact alpha; investigate data gaps.”  
   - Low Integrity, Low Impact → “Greenwashing/laggards; candidates for exclusion or significant risk premium.”  

3. **Executive‑facing Action Panel**  
   - “Top 3 sustainability factors that matter for your sector (based on our materiality mapping).”  
   - “For this company, factor X and Y are weak points; recommended actions: specific engagement asks, reporting improvements, or capital reallocation.”  

This is where you explicitly answer the challenge brief: **identify the most relevant sustainability factors and provide concrete recommendations.**  

***

## 6. Data sources

All primary sources are **public and bypass corporate PR spin**, except claims we explicitly extract and score.

| Data | Source | Usage |
|---|---|---|
| ESG ratings (primary) | Financial Modeling Prep API (`fmp.py`) | Base E/S/G/total scores + divergence |
| ESG ratings (second opinion) | Static curated CSV / OSI sample | Divergence calculation |
| Filings / sustainability reports | SEC EDGAR (`edgar.py`) | Claim extraction via LLM |
| News & controversies | GDELT (`gdelt.py`) | Controversy + greenwashing incidents |
| Company fundamentals | FMP fundamentals endpoint | Revenue for WEM carbon intensity |
| Impact KPIs | Curated CSV per sector | Emissions/safety/capex trends |
| **Emissions (ecology)** | **Climate TRACE API v4** (`climate_trace.py`) | GHG emissions → D_carbon penalty |
| **Labour/regulatory fines** | **Violation Tracker Global** (`violation_tracker.py`) | 5yr fines → D_theft penalty |
| **CEO pay ratio** | **PlainCEOPay / SEC DEF 14A** (`ceo_pay.py`) | Pay ratio → D_labor penalty |
| WEM inputs | `wem_inputs.csv` (curated static fallback) | Guarantees demo works if APIs flake |

The `wem_inputs.csv` pre-populates all 8 demo companies with realistic 2023/2024 values drawn from public filings so the full WEM score runs offline.

**Ingestion architecture (v1):**

```
POST /api/refresh/{ticker}
  → FMPIngestor       → companies, esg_ratings, revenue
  → ClimateTraceIngestor → emissions_tco2e (sector/country proxy for v1)
  → ViolationTrackerIngestor → labor_fines_5y, other_fines_5y
  → CEOPayIngestor    → ceo_pay_ratio
  → scoring engine    → recompute all scores
```

All ingestors fall back gracefully to the curated CSV data if the API is unavailable.

***

## 7. Architecture & tech stack

### High‑level flow

```text
User enters company → Backend fetches/loads data → Scoring engine computes
Integrity & Impact → Frontend shows dashboard + Action Panel
```

### Backend (Python)

- **Data ingestion layer** (`backend/ingestion/`)
  - `fmp.py` — FMP ESG API (ratings, fundamentals, revenue)
  - `edgar.py` — EDGAR 10-K fetcher
  - `gdelt.py` — GDELT controversies
  - `claude_extractor.py` — LLM claim extraction
  - `climate_trace.py` — Climate TRACE emissions (API v4, sector/country for v1)
  - `violation_tracker.py` — Violation Tracker Global fines scraper
  - `ceo_pay.py` — CEO pay ratio importer (PlainCEOPay / SEC DEF 14A)

- **Scoring engine** (`backend/scoring/`)
  - `divergence.py` — ESG rating spread → agreement score
  - `verification.py` — claim verified/contradicted/unverifiable ratios
  - `controversy.py` — recency-weighted incident severity
  - `impact.py` — sector-material KPIs vs peer median
  - `wem.py` — WEM score: D_carbon + D_labor + D_theft from `wem_inputs`
  - `engine.py` — orchestrates all modules, computes placebo_index, quadrant
  - `models.py` — Pydantic models: `CompanyScore`, `WEMInputs`, `WEMBreakdown`, `PortfolioView`

### Frontend

Choose what fits team skills; options:

- **Option A (fast)**: Python + Streamlit  
  - Faster to build for hackathon; easy charts, filters, and prototypes.  
- **Option B (more polished)**: React + TypeScript (as in old spec)  
  - Better UX; more work but stronger “Maxwell Data‑style” impression.

Key screens:

1. **Company Overview**
   - Three dials: Integrity Score, Impact Score, WEM Score.
   - Placebo Index badge (high = “dangerous placebo” risk).
   - Quadrant classification (“High Integrity / Low Impact”).

2. **Signal Breakdown** (Signals tab)
   - Rating Divergence chart (bar/scatter).
   - Claim verification table (✓ / ? / ✗) with short notes.
   - Controversy timeline.

3. **Impact & WEM View** (Impact tab)
   - Impact KPIs vs sector median (small bar charts).
   - WEM breakdown: D_carbon / D_labor / D_theft sub-scores with raw inputs.
   - ESG score vs WEM vs Integrity numeric comparison.

4. **Portfolio View**
   - Three tilts: naive ESG / Integrity×Impact / WEM-weighted.
   - Sector and greenwashing-risk quadrant breakdown.

5. **Action Panel**
   - Bulleted recommendations per role (PM / Sustainability Officer / Regulator).
   - Role toggle changes framing: PM sees tilt/risk language, SO sees engagement asks, Regulator sees fines/mismatch data.

**New API endpoints:**
- `GET /api/score/{ticker}` — now includes `wem`, `wem_inputs`, `placebo_index`
- `GET /api/portfolio` — includes `wem_score`, `placebo_index` per entry, third tilt
- `POST /api/refresh/{ticker}` — orchestrates all ingestors and recomputes scores

### Storage

- **Simple MVP**: in‑memory or SQLite/JSON during the hackathon.  
- **Stretch**: use Supabase as in the previous spec for persistence and multi‑user demos.

***

## 8. Weekend delivery plan

### Day 1 — Afternoon / Evening

- [x] Demo companies (8 firms: BP, SHEL, ORSTED, XOM, TTE, ULVR, NESN, AMZN) with static CSVs.
- [x] Integrity Score + Impact Alignment in Python + FastAPI backend.
- [x] React frontend with dials, divergence chart, claim table, controversy timeline, quadrant plot, portfolio tilt.
- [ ] **Add `wem_inputs.csv`** with realistic 2023/24 values for all 8 companies.
- [ ] **Implement `wem.py`** scoring module (D_carbon / D_labor / D_theft).
- [ ] **Update `models.py`** — add `WEMInputs`, `WEMBreakdown`, `placebo_index` to `CompanyScore`/`PortfolioView`.
- [ ] **Update `engine.py`** to load wem_inputs and call wem.py; compute placebo_index.
- [ ] **Extend API** — `GET /api/score/{ticker}` returns wem + placebo; `POST /api/refresh/{ticker}` stub.
- [ ] **Stub ingestion modules** — climate_trace.py, violation_tracker.py, ceo_pay.py (callable, fall back to CSV).

### Day 2 — Morning

- [ ] **Frontend WEM dial** — third score dial on company overview.
- [ ] **WEM breakdown panel** — D_carbon / D_labor / D_theft bars with raw input values shown.
- [ ] **Placebo Index badge** on company card.
- [ ] **Third portfolio tilt** — WEM-weighted allocation column.
- [ ] **Role toggle** — PM / Sustainability / Regulator framing in Action Panel.

### Day 2 — Afternoon

- Polish **demo script**:
  - XOM/BP: high ESG narrative, low WEM (big carbon + fines) → “dangerous placebo”
  - ORSTED: average ESG, high WEM + Impact → “under-recognised performer”
  - AMZN: high ESG score, terrible CEO pay ratio + labour fines → WEM exposes it
- Rehearse 3-minute walkthrough; emphasise the three numbers ESG providers don't give you.

***

## 9. Narrative & judging alignment

**How we open the pitch**

- “ESG is now big enough to move markets – affecting cost of capital and portfolio flows – but the underlying metrics are noisy, diverging, and vulnerable to greenwashing.” 
- “Regulators are fining funds for misleading ESG claims; former heads of sustainable investing like Tariq Fancy call parts of ESG a ‘dangerous placebo’.” 

**How we frame the solution**

- “Maxwell Data’s ESG Integrity & Impact Navigator turns ESG from a branding exercise into **decision‑grade intelligence** by:  
  - Quantifying **signal quality** (Integrity Score).  
  - Measuring **real‑world sustainability performance** (Impact Alignment).  
  - Translating both into **capital allocation and engagement actions**.”  

**How it meets the brief**

- **Data‑driven prototype:** clear formulas, transparent components, real or realistic datasets.  
- **Improves sustainable investment choices:** helps investors avoid greenwashing traps and back impactful firms.  
- **Translates complexity into action:** compresses messy ESG signals into a small set of scores plus plain‑language recommendations executives can use in investment committees and board discussions.  

***

This spec deliberately fuses the strongest elements of your previous “Integrity Score” design (gap scoring, claim verification, controversy analysis, Supabase‑ready backend) with the more explicitly **impact‑ and capital‑allocation‑aware** lens (Impact Alignment, greenwashing risk, cost‑of‑capital implications) grounded in current ESG literature. 
