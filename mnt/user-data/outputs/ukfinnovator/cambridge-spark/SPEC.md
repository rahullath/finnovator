# Cambridge Spark Challenge — Spec
**"Reimagine financial regulation in an AI-driven world"**

---

## The idea: Regulatory Perimeter Scanner

The FCA's own March 2026 perimeter report explicitly flags that general-purpose AI tools offering financial advice "may not fit neatly within existing regulatory frameworks." The regulator is saying publicly: *we have gaps and we can't see them fast enough.*

We build the tool that helps regulators see those gaps before they become consumer harms.

### Why this is different
Every other team will build a compliance automation tool — cheaper, faster box-ticking for institutions. That's been done. It helps firms, not people.

We build infrastructure for the *regulator* — something that monitors what's emerging in the market and automatically maps it against what regulation currently covers. The output is a structured brief a regulator can actually act on, not a dashboard for a compliance officer.

---

## The core mechanic: Perimeter Gap Detection

```
Gap Score = what's happening in market - what regulation currently covers
```

### Step 1: Monitor emerging financial products/services
- Scrape newly launched FinTech products (ProductHunt FinTech category, FCA Innovation Hub applications summary, press releases)
- Track new DeFi protocols (DefiLlama API — free)
- Monitor FCA regulatory sandbox participants (public list)
- Use LLM to classify each into a product category and extract key features

### Step 2: Map existing regulatory framework
- Parse FCA handbook sections (public, downloadable)
- Build a structured index: which activities are covered, under which rule, with what conditions
- This is a one-time build — the index is then queryable

### Step 3: Gap detection
- For each new product/service, ask: "does any existing FCA rule clearly cover this?"
- LLM-assisted mapping: "given these product features, which FCA handbook sections apply, and how confident are you?"
- Flag where confidence is low or where no clear mapping exists
- Output: gap report with severity score (consumer exposure × regulatory ambiguity)

### Step 4: Consumer harm signal
- GDELT API: news monitoring for consumer complaints / harm incidents linked to unregulated FinTech products
- FCA complaints data (public): baseline for what kinds of harm reach the regulator
- Weight gaps by whether similar product types have already generated consumer harm

---

## What the tool outputs

A live **Regulatory Gap Feed** — ranked by severity:

| Product/Service | Category | Coverage Status | Gap Severity | Consumer Exposure |
|---|---|---|---|---|
| [AI finance chatbot X] | Personal finance advice | Partial — depends on personalisation threshold | High | 2.3M users |
| [DeFi lending protocol Y] | Consumer credit | Uncovered — no e-money or CCA authorisation required | Critical | Unknown |
| [Prediction market Z] | Speculative investment | Outside perimeter (FCA March 2026 flag) | Medium | Growing |

Each item links to: the relevant FCA handbook section (or absence of one), the evidence basis, and a suggested regulatory question for the FCA to consider.

### Who uses this
- **Primary**: FCA innovation team / perimeter team — gives them structured signal earlier
- **Secondary**: Policy researchers, parliamentary committees, consumer protection bodies
- **Not**: Regulated firms (that's compliance tooling, different product)

---

## Data sources

| Data | Source | Access |
|---|---|---|
| DeFi protocol launches | DefiLlama API | `https://api.llama.fi/protocols` — free, no key |
| FCA innovation sandbox participants | FCA website (scrape) | `https://www.fca.org.uk/firms/innovation/regulatory-sandbox/cohort-participants` |
| FCA handbook | FCA Handbook (scrape/download) | `https://www.handbook.fca.org.uk/` |
| Financial news (consumer harm signals) | GDELT | Free, no key |
| FinTech product launches | ProductHunt API | Free tier available |
| FCA press releases / perimeter reports | FCA website RSS | Free |

**Key document to pre-download**: FCA Perimeter Report March 2026 (PDF, public). This is your ground truth for what the regulator already knows. Your tool should surface the *next* gaps, not the ones they've already flagged.

---

## Architecture

```
[Data Ingestion — runs continuously or on-demand]
  ├── DefiLlama → new protocol tracker
  ├── FCA sandbox list → new authorised innovators
  ├── GDELT → consumer harm signals
  └── ProductHunt / press releases → new FinTech launches
        ↓
[Classification Engine — LLM]
  Each new product/service:
  ├── Classify: product type, target consumer, key features
  ├── Extract: regulatory-relevant characteristics
  └── Assess: which FCA handbook sections plausibly apply
        ↓
[Gap Detection Engine]
  ├── Handbook index lookup (pre-built)
  ├── Confidence scoring: how clearly does existing rule cover this?
  └── Consumer exposure estimate (user numbers if available)
        ↓
[Gap Feed — stored in Supabase]
        ↓
[Frontend — React]
  └── Ranked gap feed → item detail → handbook mapping → severity breakdown
```

### LLM usage (Claude API)
Two critical uses:
```python
# 1. Classify a new financial product
system_classify = """
You are a UK financial regulation expert. Given a description of a new financial product or service,
extract:
- product_type: one of [payment, lending, investment, insurance, advice, exchange, other]
- target_consumers: [retail, institutional, sme, all]  
- key_regulatory_features: list of features that determine regulatory treatment
  (e.g. "accepts deposits", "provides personalised advice", "holds client assets")
Return JSON only.
"""

# 2. Map product to FCA handbook
system_map = """
You are an FCA handbook expert. Given a product's regulatory features,
identify which FCA handbook sourcebooks and sections apply.
For each section: state whether coverage is clear, partial, or absent.
If absent, describe the gap in one sentence.
Return JSON only.
"""
```

---

## Database schema (Supabase)

```sql
CREATE TABLE financial_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  source TEXT, -- 'defi_llama', 'fca_sandbox', 'product_hunt', etc.
  product_type TEXT,
  target_consumers TEXT[],
  regulatory_features TEXT[],
  consumer_exposure_estimate INT,
  detected_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE handbook_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sourcebook TEXT, -- 'COBS', 'CONC', 'BCOBS', etc.
  section_ref TEXT,
  section_title TEXT,
  covered_activities TEXT[],
  conditions TEXT
);

CREATE TABLE regulatory_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES financial_products(id),
  coverage_status TEXT, -- 'covered', 'partial', 'absent'
  confidence_score FLOAT,
  applicable_sections TEXT[], -- references to handbook_sections
  gap_description TEXT,
  severity_score FLOAT, -- consumer_exposure * (1 - confidence)
  harm_signals INT DEFAULT 0, -- GDELT incident count
  assessed_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Pitch framing

**Problem**: The FCA is structurally reactive — they regulate what they can see, but new FinTech products emerge faster than perimeter reviews happen. The March 2026 perimeter report took a year to produce and covers gaps that practitioners spotted 18 months ago.

**Existing solutions fail because**: RegTech tools help *firms* comply with rules that exist. Nobody is helping *regulators* see where rules don't yet reach.

**Our approach**: Continuously monitor what's launching in the market, automatically map it against existing FCA rules, and surface gaps before consumer harm materialises.

**Output for regulators**: A ranked gap feed. "Here are 7 product types operating in the UK today with no clear regulatory coverage. Here is the relevant handbook text (or absence of it). Here are the consumer harm signals we're already seeing."

**Scale path**: License to FCA as a regulatory intelligence tool. Replicate for FCA equivalents in EU (ESMA), US (CFPB). Sell research reports to parliamentary committees and consumer protection bodies.

---

## What to demo
1. Show the live gap feed — sorted by severity
2. Click the top gap → show the product, the attempted handbook mapping, and the gap
3. Show the consumer harm signal from GDELT for that category
4. Show the output brief: one structured paragraph a regulator could paste into a policy memo

Keep it to these 4 steps.
