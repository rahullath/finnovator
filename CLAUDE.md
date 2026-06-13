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

### 5.3 Capital‑allocation and decision‑support layer

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

## 6. Data sources (hackathon‑realistic)

We reuse and extend your prior spec’s data plan, with flexibility to fall back to curated CSVs if APIs are slow.

| Data | Source | Usage |
|---|---|---|
| ESG ratings (multiple) | Financial Modeling Prep API | Base ESG scores + divergence |
| ESG ratings (alt / mock) | Open Sustainability Index or static sample | Second opinion for divergence |
| Filings / sustainability reports | SEC EDGAR + curated PDFs | Claim extraction & verification |
| Labour & social stats | ILOSTAT + sample metrics | Basic S component where relevant |
| News & controversies | GDELT + manual incident tagging | Controversy & greenwashing risk |
| Company fundamentals | yfinance / static CSV | Context & simple cost‑of‑capital views |
| Impact KPIs | Manually curated for a few firms | Emissions/safety/capex trends for demo 

Pre‑event: generate or download a small, clean sample dataset to guarantee a smooth demo even if APIs flake.  

***

## 7. Architecture & tech stack

### High‑level flow

```text
User enters company → Backend fetches/loads data → Scoring engine computes
Integrity & Impact → Frontend shows dashboard + Action Panel
```

### Backend (Python)

- **Data ingestion layer**  
  - Wrappers for FMP ESG API, EDGAR/GDELT, and CSV loaders.
- **Scoring engine**  
  - `DivergenceCalculator` (ESG rating spread).  
  - `ClaimExtractor` (LLM or rule‑based) to pull numeric ESG claims from filings.
  - `VerificationMatcher` to check claims against external metrics (simplified logic).  
  - `ControversyCounter` to aggregate incidents by recency and severity.
  - `ImpactScorer` to compute sector‑specific KPIs and aggregate Impact Alignment.  
  - `DecisionEngine` to classify companies into the four quadrants and produce action text.  

### Frontend

Choose what fits team skills; options:

- **Option A (fast)**: Python + Streamlit  
  - Faster to build for hackathon; easy charts, filters, and prototypes.  
- **Option B (more polished)**: React + TypeScript (as in old spec)  
  - Better UX; more work but stronger “Maxwell Data‑style” impression.

Key screens:

1. **Company Overview**  
   - Integrity Score and Impact Alignment Score as two big dials.  
   - Quadrant classification (“High Integrity / Low Impact”).  

2. **Signal Breakdown**  
   - Rating Divergence chart (bar/scatter).  
   - Claim verification table (✓ / ? / ✗) with short notes.  
   - Controversy timeline.  

3. **Impact & Capital View**  
   - Impact KPIs vs sector median (small bar charts).  
   - Simple “Current ESG‑tilt allocation vs Integrity×Impact tilt” comparison for a 5‑stock sample portfolio.  

4. **Action Panel**  
   - Bulleted recommendations for investors and executives.  

### Storage

- **Simple MVP**: in‑memory or SQLite/JSON during the hackathon.  
- **Stretch**: use Supabase as in the previous spec for persistence and multi‑user demos.

***

## 8. Weekend delivery plan

### Day 1 — Afternoon / Evening

- Finalise **sector and 5–10 demo companies** (e.g., energy or large consumer names).  
- Build **static CSVs** for ESG ratings, controversies, and 3–4 impact KPIs per company.  
- Implement Integrity Score and Impact Alignment calculations in Python.  
- Set up minimal frontend skeleton (Streamlit or React).  

### Day 2 — Morning

- Wire scoring engine to frontend; build core visualisations:  
  - Integrity dial, divergence chart, claim verification table.  
  - Impact vs ESG quadrant plot.  
- Implement simple portfolio view: two bar charts for “ESG tilt” vs “Integrity×Impact tilt.”  

### Day 2 — Afternoon

- Polish **Action Panel copy** so it reads like something an asset manager would actually use.  
- Prepare **demo script**:  
  - Company A (classic “greenwashed leader”): high ESG, low Integrity & Impact.  
  - Company B (under‑recognised): average ESG, high Impact and decent Integrity.  
- Rehearse 3‑minute live walkthrough and 2‑minute Q&A.

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
