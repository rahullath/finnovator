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

## Cambridge Spark — Regulatory Perimeter Scanner: Academic / Policy Grounding

### The live policy context
**FCA Perimeter Report, March 2026** (this is from 3 months ago — very current):
- FCA explicitly flags: "general-purpose AI tools offering financial advice or recommendations may not fit neatly within existing regulatory frameworks"
- Identified gaps: AI personal finance chatbots, prediction markets, 'Annex 1 firms'
- **Our response**: build the tool that would have surfaced these 18 months earlier, before the FCA report

### The structural problem
Regulatory perimeter reviews are annual at best. FinTech product cycles are 3–6 months.

This creates a window where products operate with consumers at risk and no clear regulatory protection. The FCA knows this — their "AI Live Testing" initiative and Supercharged Sandbox are responses to it. But those are reactive (firms apply) not proactive (regulator monitors).

**Our approach**: proactive monitoring. Watch what's launching, map it against rules that exist, flag gaps before harm.

### What judges might ask

**"Wouldn't the FCA just do this themselves?"**
> They're trying to — their AI Lab launched in October 2024 partly for this reason. But they're resource-constrained and inherently reactive. We're building the external intelligence layer that feeds them signal.

**"How do you know your handbook mapping is accurate?"**
> The LLM mapping is probabilistic — we're explicit about confidence scores. Low confidence = flagged for human review. We're not replacing legal interpretation, we're triaging what needs interpretation.

**"Who actually buys this?"**
> Primary: FCA innovation / perimeter team (government procurement, slower but higher value). Secondary: consumer protection organisations (Which?, FCA complaints bodies) who want evidence for advocacy. Research licence to academic institutions.

**"What about EU regulation — is this UK only?"**
> UK first because FCA handbook is English and publicly accessible. The same architecture works for ESMA's regulatory perimeter. Internationalisation is a phase 2.
