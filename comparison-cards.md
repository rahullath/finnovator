# Material Driver Comparison Card – Product Spec

## 1. Purpose

This document defines the structure and copy for **Material Driver Comparison Cards** used in the Maxwell Data product. The cards explain which sustainability‑related drivers (based on SASB financial materiality topics) most strongly move a company’s share price and how this pattern differs from its sector and the FTSE100.[web:1][web:13][web:16]

Audience:
- Equity PMs, analysts, and portfolio managers
- Internal quants and data engineers
- Stakeholders sceptical of traditional ESG/CSR reports but interested in **tradeable signals**

Non‑goals:
- Do **not** evaluate if a company is "good" or "bad" on ESG.
- Do **not** replicate sustainability reports or rating‑agency dashboards.[web:3][web:9]

---

## 2. Concept Overview

One **comparison card = one company**.

Each card shows:
1. **Who** the company is (name, ticker, sector, index).
2. **What** its top 8 financial materiality drivers are.
3. **How** those drivers compare versus sector and FTSE100 averages.
4. **Why** certain drivers are more or less market‑sensitive for this company than for its peers.
5. **Whether** each driver’s importance in the model is rising, flat, or falling over time.[web:16][web:18]

The card is driven entirely by:
- Daily news mapped to ~26–27 SASB materiality drivers.[web:13][web:16]
- Feature importance scores from Maxwell’s price‑movement model for FTSE100 stocks.[web:1][web:16]

---

## 3. Required Data Inputs

For each company in scope (initially FTSE100):

1. **Static reference data**
   - Company name
   - Ticker (e.g., `BP.L`)
   - Sector (aligned to SASB / IFRS S2 industry groupings)
   - Index membership (e.g., FTSE100)[web:13]

2. **Driver universe (shared across all companies)**
   - List of **26–27 SASB financial materiality drivers** (post‑2026 update), e.g., GHG Emissions, Business Ethics, Data Security, Water Management, etc.[web:13][web:26]
   - Short, plain‑English definitions per driver (1 sentence each), derived from SASB topic descriptions.

3. **Per‑company, per‑driver analytics** (from Maxwell model)
   - **Importance score**: normalized 0–100 measure of how strongly news about this driver explains stock price moves for this company.
   - **Sector average importance** for the same driver (averaged over companies in the same sector).
   - **FTSE100 average importance** for the same driver (universe average).
   - **Time series of importance scores** per driver (e.g., monthly values over last 12–24 months) to determine **trend** (▲ / ► / ▼).[web:16][web:18]

4. **Model metadata**
   - Confirmation that news is mapped using a consistent SASB‑style taxonomy.
   - Basic notes on model version and lookback window (for internal use only).

---

## 4. Card Layout – Top‑Level Structure

Each comparison card should contain the following visual blocks (top to bottom):

1. **Header block (identity)**
2. **Driver ranking table (top 8 drivers)**
3. **"Why this company is different" explanation panel**
4. **Driver trend mini‑view**
5. **Action hint / usage note for the investor**

### 4.1 Header Block

Contents:
- **Title:** `[Company name] – Material Driver Profile`
- **Subtitle:** `Top 8 financially material drivers from SASB‑based news sentiment model`
- **Meta line:**
  - `Universe: FTSE100 | Sector: [sector] | Data: Daily news tagged to [26/27] SASB drivers`

Tone: quant‑oriented, neutral, no ethical language.

### 4.2 Driver Ranking Table (Top 8)

Display a sorted list/table of the eight most important drivers for this company.

Recommended columns:
- **Rank**: 1–8
- **Driver**: driver name (e.g., `GHG Emissions`)
- **Your score**: importance score (0–100)
- **Sector avg**: sector average importance for the same driver
- **FTSE100 avg**: index‑wide average importance for the same driver
- **Trend**: ▲ rising, ► stable, ▼ falling (relative change in importance over lookback window)

Behaviour:
- Rows are sorted by **Your score** descending.
- Scores are visualised as horizontal bars with faint reference markers for sector and FTSE100.
- Trend is a small icon plus short label on hover (e.g., "Rising importance").

### 4.3 "Why This Company Is Different" Panel

This panel explains **in plain language** why some drivers are more or less market‑sensitive for this company than for peers.

Logic:
- Compute `difference = Your score – Sector avg` for each driver.
- Select **2–3 drivers with the largest absolute difference**.
- For each selected driver, show:
  1. Driver name
  2. Difference badge
  3. Short definition
  4. Two‑sentence explanation (see copy templates below).[web:16][web:21]

Layout example per driver:

> **GHG Emissions – MORE market‑sensitive than peers (+23)**  
> Short definition: "How the company measures and reduces its greenhouse gas emissions."  
> Explanation: "For this company, emissions news often links to regulatory fines, project delays, and activist pressure, so negative headlines have triggered sharper price moves than for sector peers. Investors appear to treat emissions issues here as a proxy for legal and political risk, not just reputation."[web:20][web:22]

### 4.4 Trend Mini‑View

Show whether each driver’s importance in the model is changing over time.

Options:
- **Minimal:** only ▲/►/▼ icons per driver, based on trend classification.
- **Richer:** tiny sparkline mini‑charts for the top 3 drivers (importance vs. time) with tooltips.

Clarify in microcopy that this is **trend in model importance**, not the company’s absolute sustainability performance.

### 4.5 Action Hint / Usage Note

Single line at bottom:

> "Use these drivers to focus your fundamental work where markets have historically reacted most strongly to news for this stock – especially where its pattern diverges from sector and FTSE100 averages."

This speaks directly to alpha/mispricing rather than ethics.

---

## 5. Field Definitions & Copy Rules

### 5.1 Field Definitions

- **Your score (0–100):** Normalized measure of how much price movement for this company can be statistically linked to news on this driver, according to Maxwell’s model.[web:16][web:18]
- **Sector avg / FTSE100 avg:** The same metric averaged over all companies in the sector / index. Provides context for whether a driver matters more or less here.
- **Trend (▲/►/▼):** Direction of change in importance over a defined period (e.g., last 12 months).
- **Top 8 drivers:** The eight drivers with the highest "Your score" for this company. Remaining drivers are still tracked but hidden by default.

### 5.2 Copy Tone Guidelines

- **Focus on risk and pricing, not morality.**
  - Good: "News about health & safety incidents has historically coincided with sharp price drops for this company, indicating that investors treat it as a key operational risk."
  - Avoid: "This company is bad at health & safety."

- **Explain mechanisms, not scores.**
  - Mention what the driver represents (fines, delays, lawsuits, churn, financing costs).
  - Link it to how markets have reacted in the past.

- **Avoid ESG jargon and rating‑agency language.**
  - Avoid: "Best‑in‑class ESG performance", "leader", "laggard", "triple materiality".
  - Prefer: "more/less market‑sensitive than sector peers", "markets reacted more strongly here".

- **Always stay conditional and descriptive.**
  - Use "historically", "in the sample", "the model suggests".

---

## 6. Standard Copy Templates

You can reuse and parameterise these templates.

### 6.1 Card Intro

> "This card shows the eight sustainability‑related drivers that have historically explained this company’s share price moves the most, using daily news mapped to SASB financial materiality topics."[web:7][web:8][web:16]

### 6.2 Driver Difference (More Sensitive)

> "For this company, news about **[Driver]** has coincided with larger price moves than for sector peers. This suggests investors treat **[Driver]‑related events** (e.g., fines, investigations, operational disruptions) as a key risk channel for this stock."

### 6.3 Driver Difference (Less Sensitive)

> "In this sector, **[Driver]** often moves stock prices, but for this company the relationship has been weaker. Markets may be assuming its controls or exposure are relatively stable unless a major event occurs."

### 6.4 Trend Explanation

> "The importance of **[Driver]** in our model has been **[rising / stable / falling]** over the past **[X]** months, indicating that markets are **[increasingly / consistently / less often]** reacting to news on this topic for this stock."

### 6.5 CEO‑Safe Framing

> "We are not scoring whether the company is ‘good’ or ‘bad’ on these topics. We quantify which topics markets have actually traded on for this stock, and where that pattern differs from peers – potential sources of mispricing."

---

## 7. UX & Interaction Guidelines

- Do **not** make users read full sustainability reports; everything should be visible in one card view.[web:1]
- Emphasise **charts and relative positions** (bars, deltas, trend icons) rather than narrative prose.
- Keep explanations to **2 sentences per highlighted driver** to avoid cognitive overload.
- Allow toggling between **"Top 8"** and **"All drivers"** for advanced users.
- Provide tooltips with short driver definitions for non‑expert users.
- Keep language neutral; avoid politically loaded terms.

---

## 8. Implementation Checklist

Before shipping comparison cards for a new universe/company set, verify:

1. [ ] SASB driver list and definitions are up to date with current standards (26–27 drivers).[web:13][web:22][web:26]
2. [ ] Maxwell model outputs per company and driver include: importance score, sector avg, FTSE avg, and time series for trend.[web:16][web:18]
3. [ ] Top‑8 ranking logic is implemented and deterministic.
4. [ ] Difference selection logic (for "Why this company is different") picks 2–3 drivers with largest absolute deviations.
5. [ ] Copy templates are parameterised and free of value judgements.
6. [ ] UI is readable on mobile and desktop; charts remain interpretable at small sizes.
7. [ ] Legal/compliance review confirms that all language is descriptive, model‑based, and does not constitute ESG ratings or labels.

Once these conditions are met, the comparison card component is ready to be wired into the Maxwell Data product for FTSE100 coverage and later extended to additional indices.
