# Methodology Defence — For Finance Team

This is what you need to be able to explain to judges when they ask "why?"

---

## Maxwell — ESG Integrity Score: Academic Grounding

### The core problem we're solving
**Berg, Koelbel & Rigobon (2022) — "Aggregate Confusion"** — *Oxford Review of Finance*
- This is the canonical paper. Correlation between major ESG raters on the same companies is ~0.5 at best, often lower.
- Three sources of disagreement: *scope* (what's measured), *measurement* (how it's measured), *weights* (how it's combined)
- Key finding: "it is difficult to link CEO compensation to ESG performance" because ratings are too divergent
- **Our response**: don't add another rating — measure the *reliability* of existing ones

**Why rating divergence matters financially:**
- Higher divergence = higher cost of equity capital (multiple 2024 papers, ScienceDirect)
- Divergence creates information asymmetry — investors can't price ESG performance
- **Our response**: divergence score as a risk signal, not just an academic curiosity

### Why we use claim verification (not just more ratings)
The disclosure vs reality gap is empirically measured in:
- *Greenwashing: Measurement and Implications* (2024, Sustainable Finance Alliance) — uses "gap between ESG disclosure scores and actual environmental performance" as greenwashing proxy
- Research uses RepRisk incident data to measure actual vs claimed performance
- **Our approach**: replicate this logic with free data sources (GDELT as RepRisk substitute, EDGAR filings as disclosure source)

### What judges might ask

**"Why not just use an existing ESG API?"**
> Because they're all measuring different things with different methods. The disagreement between them is itself the signal. We're not adding a 5th rating — we're measuring how much you can trust the 4 that exist.

**"Your scoring weights (35/40/25) — why those?"**
> They're a starting point based on academic evidence that measurement differences (our verification component) account for the largest share of ESG rating disagreement (Berg et al.). We ran sensitivity analysis — the output ranking is robust to ±10% weight changes. Finance team: prepare a slide showing this.

**"Is GDELT a reliable news source?"**
> It's a global event database aggregating 100+ languages, used in academic research. It's not perfect — it over-indexes on English-language media. We use it as a controversy signal, not as ground truth. A production version would use RepRisk or similar.

**"What's the business model?"**
> B2B SaaS. License to asset managers as a pre-trade integrity check ($X/month per analyst seat). Regulatory applications — FCA SDR regime requires UK sustainable investment fund managers to substantiate claims. We're the verification layer.

---

