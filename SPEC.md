# Maxwell Data Challenge — Spec
**"Build a data-driven prototype to support better sustainable investment decisions"**

---

## The idea: ESG Integrity Score

Most ESG tools answer: *"how does this company score for my portfolio?"*

This tool answers: *"how much does this company's ESG claim match what's independently verifiable?"*

We call the output an **Integrity Score** — not another ESG rating, but a second-order measure of *how credible* the existing ratings are for a given company.

### Why this is different
Every other team will build a dashboard that displays ESG scores. That's the obvious move and it's been done. 

We build the tool that exposes *why ESG scores can't be trusted at face value* — and then gives decision-makers a cleaner signal by measuring the gap between claim and verification.

This is grounded in peer-reviewed finance literature (Berg et al. 2022, *Aggregate Confusion*, Oxford Review of Finance) which shows near-zero correlation between major ESG raters on the same companies. We're not making a political argument — we're implementing what the academic literature already recommends.

---

## The core mechanic: Gap Scoring

```
Integrity Score = f(Rating Divergence, Disclosure Tone vs Reality, Cross-source Verification)
```

### Component 1: Rating Divergence Score
- Pull ESG ratings from 2+ free sources for the same company
- Measure the spread (standard deviation across raters)
- High divergence = low confidence in any single rating
- **Source**: Financial Modeling Prep API (free tier), Open Sustainability Index

### Component 2: Disclosure Tone vs Reality
- Fetch company sustainability report / 10-K ESG section (SEC EDGAR — free, no key needed)
- Run NLP sentiment/claim extraction on the text
- Cross-reference specific claims against independent data:
  - Carbon claims → Global Carbon Project / CDP data
  - Labour claims → ILO ILOSTAT API (free)
  - Governance claims → ISS proxy voting data (limited free)
- Flag where claims are unverifiable or contradicted

### Component 3: News & Controversy Signal
- GDELT API (free, real-time global news) — query company name + ESG controversy keywords
- RepRisk-style incident counting without the RepRisk price tag
- Weight recent incidents more heavily

### Final score
```
Integrity Score (0–100) = 
  (1 - normalised_divergence) * 0.35
  + verification_rate * 0.40
  + (1 - controversy_rate) * 0.25
```

Weights are a starting point — finance team should stress-test and adjust with justification.

---

## What the tool outputs

For a given company (searched by name or ticker):

1. **Integrity Score** — single number, prominently displayed
2. **Divergence breakdown** — which raters agree, which disagree, and by how much
3. **Claim verification panel** — specific ESG claims from their own report, each marked: ✓ verified / ? unverifiable / ✗ contradicted
4. **Controversy timeline** — recent news incidents flagged as ESG-relevant
5. **Decision signal** — plain language: "High integrity: ratings are consistent and claims are verifiable" / "Low integrity: significant divergence and unverified claims — treat ratings with caution"

### Who uses this
- **Primary**: Sustainable investment analysts who use ESG ratings but know they're imperfect
- **Secondary**: Regulators who need to identify greenwashing risks
- **Not**: Retail investors (too complex), the company itself (they have compliance tools)

---

## Data sources (all free, all accessible day-of)

| Data | Source | API / Access |
|---|---|---|
| ESG ratings (multiple) | Financial Modeling Prep | `https://financialmodelingprep.com/api/v3/esg-environmental-social-governance-data?symbol=AAPL&apikey=KEY` — free tier 250 req/day |
| ESG ratings (alternative) | Open Sustainability Index | `https://api.opensustainabilityindex.org/` — open |
| SEC filings (sustainability sections) | EDGAR | `https://data.sec.gov/` — no key, 10 req/s |
| ILO labour statistics | ILOSTAT | `https://ilostat.ilo.org/resources/ilostat-api/` — free |
| Global news / incidents | GDELT | `https://api.gdeltproject.org/api/v2/doc/doc?query=COMPANY+ESG&mode=artlist&format=json` — free, no key |
| Company fundamentals | Yahoo Finance (yfinance Python) | `pip install yfinance` — free |

**Sign up before the event**: Financial Modeling Prep free API key (takes 2 minutes).

---

## Architecture

```
User inputs company name/ticker
        ↓
[Data Ingestion Layer — Python]
  ├── FMP API → ESG ratings (multiple)
  ├── EDGAR API → latest 10-K / sustainability report text
  ├── GDELT API → recent news incidents
  └── ILOSTAT API → relevant labour data
        ↓
[Scoring Engine — Python]
  ├── DivergenceCalculator
  ├── ClaimExtractor (LLM — Claude API)
  ├── VerificationMatcher
  └── ControveryCounter
        ↓
[IntegrityScore] → stored in Supabase
        ↓
[Frontend — React + TypeScript]
  └── Company search → score card → breakdown panels
```

### LLM usage (Claude API)
The claim extraction step is the one place LLM is essential and justified:
```python
# Prompt to extract verifiable ESG claims from filing text
system = """
Extract specific, verifiable ESG claims from this text.
Return JSON array: [{claim, category, verifiable_metric, stated_value}]
Only include claims that reference a specific number, target, or outcome.
Ignore vague statements like "we are committed to sustainability".
"""
```
This is not AI for AI's sake — it's the only practical way to turn 80 pages of SEC filing text into structured, matchable claims in 2 days.

---

## Database schema (Supabase)

```sql
-- Companies searched
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticker TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ESG ratings from multiple sources
CREATE TABLE esg_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  source TEXT NOT NULL, -- 'fmp', 'osi', etc.
  environmental_score FLOAT,
  social_score FLOAT,
  governance_score FLOAT,
  overall_score FLOAT,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extracted claims from filings
CREATE TABLE esg_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  claim_text TEXT,
  category TEXT, -- 'environmental', 'social', 'governance'
  verifiable_metric TEXT,
  stated_value TEXT,
  verification_status TEXT, -- 'verified', 'unverifiable', 'contradicted'
  source_filing TEXT
);

-- News incidents
CREATE TABLE esg_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  headline TEXT,
  url TEXT,
  incident_date TIMESTAMPTZ,
  esg_category TEXT
);

-- Final scores
CREATE TABLE integrity_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES companies(id),
  divergence_score FLOAT,
  verification_score FLOAT,
  controversy_score FLOAT,
  integrity_score FLOAT, -- final composite
  calculated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Pitch framing

**Problem**: ESG ratings from different agencies have near-zero correlation on the same company (Berg et al. 2022). Investors using a single rating are flying blind. The ratings measure what companies *say*, not what they *do*.

**Existing solutions fail because**: They add more ratings into the same broken framework. More data, same problem.

**Our approach**: Don't add another rating. Measure the *reliability* of the ratings that already exist, and score the verifiability of the company's own claims.

**Output for decision-makers**: One number. "This company's ESG claims are 73% verifiable and raters strongly agree. This one is 31% verifiable and raters disagree by 40 points. Choose accordingly."

**Scale path**: License to asset managers as a pre-trade integrity check. Regulatory applications (FCA SDR compliance). Index inclusion criteria.

---

## What to demo
1. Search "BP" → see low integrity score with breakdown
2. Search "Unilever" → see medium score, show divergence panel
3. Click a specific claim → see "unverifiable" flag with explanation
4. Show the contrast: same company, 3 different ESG ratings from 3 sources, 40-point spread

Keep the demo to these 4 steps. Don't show everything.
