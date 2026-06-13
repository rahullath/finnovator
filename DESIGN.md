# UI/UX Design State & Open Implementation Opportunities
**ESG Integrity & Impact Navigator**

> This document is for the person taking ownership of design. It maps the current UI state honestly — what works, what's rough, and where the highest-impact changes are. Written for someone who may want to improve visual quality or UX flow.

---

## 1. Current state summary

The app is a single-page React app with a dark theme (`bg-surface` = near-black `#0d1117`). It loads, works, and is legible. It is **not polished**. It was built for correctness first. Design debt is real and the clock is ticking.

**What's working:**
- Three score dials (Integrity, Impact, WEM) render correctly with SVG arcs
- Placebo Index badge shows with correct colour coding
- Tabbed layout (Signal Breakdown / Impact & Capital / Action Panel) is functional
- Role toggle (Portfolio Manager / Sustainability Officer / Regulator) changes Action Panel content
- Charts (bar, scatter, horizontal bar) render via Recharts
- **Action Panel now shows real Maxwell Data FTSE100 financial materiality factors** — PM view shows ranked factors with materiality %, Sustainability view shows all 5 as a horizontal bar chart with source line
- **Material factors are company-specific** — powered by `backend/data/materiality.csv` extracted from `FTSE100 financial materiality March 2025.xlsx` (provided by Maxwell Data, the challenge organiser)

**What's rough:**
- Company selector is a flat row of ticker buttons — no name, no sector context
- The hero card is cramped on mobile; three dials overflow below 800px
- WEM breakdown panel is text-heavy with no visual hierarchy
- Portfolio tilt has three charts side-by-side at the same scale, making ORSTED's WEM dominance hard to read
- The quadrant plot dots are small and overlap (BP and SHEL sit almost identically)
- Action Panel text is dense; no visual distinction between severity levels
- Footer is functional but visually invisible
- Materiality bars in Sustainability view are CSS `div` widths — no axis labels, no absolute scale reference

---

## 2. Component inventory

| Component | File | Current state | Design debt |
|---|---|---|---|
| ScoreDial | `ScoreDial.tsx` | SVG arc, glow filter, works | Size is hardcoded; glow filter ID collides if label has spaces |
| QuadrantBadge | `QuadrantBadge.tsx` | Coloured pill, `large` prop | No icon; colour + text only |
| PlaceboBadge | inline in `App.tsx` | Works, red/yellow/gray | Should be its own component |
| WEMBreakdown | `WEMBreakdown.tsx` | Functional, dense | Penalty bars are basic; no sparkline for trend |
| DivergenceChart | `DivergenceChart.tsx` | Grouped bar chart | Shows E/S/G/Total per provider — good, just needs annotation |
| ClaimTable | `ClaimTable.tsx` | Table with status icons | ✓/✗/? icons could be richer; no expand-to-detail |
| ControversyTimeline | `ControversyTimeline.tsx` | List view | Not actually a timeline; no date axis |
| ImpactKPIs | `ImpactKPIs.tsx` | Horizontal bar vs sector | Works; "improving/flat/worsening" trend label isn't visually prominent |
| QuadrantPlot | `QuadrantPlot.tsx` | Scatter plot, colour-coded | Dots overlap; labels clip at edges; no hover tooltip with name+scores |
| PortfolioTilt | `PortfolioTilt.tsx` | 3-column horizontal bar | All charts use same x-axis domain (0–30%) — ORSTED's dominance in WEM tilt is under-represented |
| ActionPanel — PM view | `ActionPanel.tsx` | **Real Maxwell Data material factors** (ranked circles, materiality %) | Source attribution is small; factors have no link to which KPIs are weak/strong |
| ActionPanel — SO view | `ActionPanel.tsx` | **Materiality bars + disclosure integrity** | Bars are CSS widths with no axis — not a real chart; no absolute scale reference |
| ActionPanel — Regulator | `ActionPanel.tsx` | Fines, CEO ratio, contradicted claims | No change; still text-only, good information density |
| WeightSliders | `WeightSliders.tsx` | Three range inputs | Collapsible section — clean, works |

---

## 3. Open design opportunities (high → low impact)

### HIGH: Company selector redesign
**Current:** 8 ticker buttons in a row.  
**Problem:** No context for non-finance users. "What's ORSTED?"  
**Opportunity:** Replace with cards or a dropdown that shows company name, sector flag/icon, and a colour-coded WEM score badge. Even a simple `<select>` with the name would help.

```
[ BP plc (Energy, UK)  ▼ ]  ← simple: dropdown with full names
```
or card-style:
```
┌─────────────────┐  ┌─────────────────┐
│ BP plc  ⚡ UK   │  │ Ørsted  🌊 DK   │
│ WEM: 34  🔴     │  │ WEM: 80  🟢     │
└─────────────────┘  └─────────────────┘
```

**Note:** Company names and sectors are available from `GET /api/score/{ticker}` — no extra API call needed.

### HIGH: Hero section on mobile
**Current:** Dials overflow on <800px screens.  
**Opportunity:** Stack dials vertically on mobile. Use `flex-col sm:flex-row`. The three dials at `size={115}` in a row are ~420px wide — fine on desktop, broken on phone.

### HIGH: Controversy Timeline → actual timeline
**Current:** It's a list, not a timeline.  
**Opportunity:** An actual horizontal or vertical timeline with date markers is visually compelling and works as a "narrative of harm" visual for the pitch. Severity (high/medium/low) maps to dot size or colour. Could use a simple CSS timeline without a chart library.

```
2024 ────●───────●──────────────── 2022
         ▲ Deepwater   ▲ EPA fine
         High          Medium
```

### MEDIUM: Placebo Index — make it a first-class visual
**Current:** Small pill badge below the quadrant label.  
**Opportunity:** The Placebo Index is our most differentiated concept. It deserves a prominent visual treatment. A horizontal "risk meter" bar from 0 to 1 with the Tariq Fancy quote sourced beneath it would land harder with judges.

```
Placebo Risk  ──────────────████  0.78
              0              1
"ESG as a dangerous placebo" — Tariq Fancy, former MD, BlackRock
```

### MEDIUM: QuadrantPlot — fix overlap, add hover
**Current:** BP and SHEL overlap; XOM is far right. Dots are small (r=6).  
**Opportunity:** 
- Increase dot radius to 10–14
- Add jitter for overlapping companies
- Add hover tooltip showing: name, integrity score, impact score, WEM, placebo index
- Quadrant labels could be larger and use coloured backgrounds

### HIGH: Action Panel — link material factors to actual KPI scores
**Current:** PM view shows top 3 Maxwell Data material factors (e.g. "Physical Impacts of Climate Change — 76%") but doesn't connect them to how the company actually performs on that factor.  
**Opportunity:** Cross-reference material factors with Impact KPIs and WEM sub-scores. For each material factor, show a one-line verdict: "GHG Emissions — material at 58%, but company scores 22/100 on this KPI (worsening trend)." This is the most powerful story the data can tell and it's currently half-connected.

```
┌─────────────────────────────────────────────────┐
│ 1  GHG Emissions              materiality 58%   │
│    Company KPI score: 22/100  ↘ worsening       │
│ 2  Physical Climate Change    materiality 76%   │
│    Company KPI score: —  (no data)              │
└─────────────────────────────────────────────────┘
```

### MEDIUM: Portfolio Tilt — show reallocation delta
**Current:** Three separate bar charts. You can't easily see how much a company's weight changes between tilts.  
**Opportunity:** A delta column (Naive ESG weight → WEM weight, +/−%) alongside each row would immediately communicate "XOM loses 8 percentage points under WEM tilt." This is the core capital misallocation argument visualised in a single number.

### MEDIUM: WEM Breakdown — penalty visualisation
**Current:** Three labelled bars with "remaining before cap" text.  
**Opportunity:** Show the full 110-point budget as a single bar (100 baseline) with three penalty blocks stacked to the right. This makes the "deflationary from 100" framing visually obvious:

```
WEM Score  ████████████████████████████████░░░░░░░░░░  34
           0          D_carbon  D_labor  D_theft    100
```

### LOW: Score Dial — add sub-label context
**Current:** Just the number and label.  
**Opportunity:** Add a 3-word descriptor below the label: "34 / Engagement Priority" or use the colour class as a verbal cue ("Low", "Moderate", "Strong").

### LOW: Role toggle — visual framing
**Current:** Three text buttons in the header.  
**Opportunity:** A short descriptor line below the toggle that changes per role:
- PM: "Capital allocation & risk lens"
- Sustainability Officer: "Disclosure quality & improvement lens"
- Regulator: "Enforcement & compliance lens"

### MEDIUM: Action Panel SO view — upgrade materiality bars to a real chart
**Current:** Materiality bars are `<div>` elements with `width: ${score * 60}px` — not a proper chart, no axis, no consistent scale across companies.  
**Opportunity:** Replace with a small `BarChart` (Recharts, already installed) showing all 5 factors on a 0–1 axis with a labelled threshold line at 0.5 ("material threshold"). Source line stays: "Maxwell Data FTSE100, March 2025."

### LOW: Dark theme colour system
**Current:** Uses a handful of Tailwind utilities + custom `card`/`surface`/`border` tokens.  
**Opportunity:** The current palette is functional but monotone. Two improvements:
1. Give each score a persistent colour identity (Integrity = blue, Impact = green, WEM = purple) used consistently across dials, breakdown bars, portfolio tilt charts.
2. The "dangerous placebo" red should be used more sparingly — currently it appears on both low WEM dials AND controversy severity AND placebo badges, diluting the impact.

---

## 4. Mobile responsiveness checklist

| Screen element | 375px | 768px | 1280px |
|---|---|---|---|
| Company selector | ❌ wraps badly | ✅ | ✅ |
| Hero (3 dials) | ❌ overflow | ⚠️ tight | ✅ |
| Tab bar | ✅ | ✅ | ✅ |
| Divergence chart | ✅ responsive | ✅ | ✅ |
| Portfolio tilt (3 col) | ❌ cramped | ⚠️ tight | ✅ |
| Action panel | ✅ | ✅ | ✅ |

Priority fixes for mobile: company selector + hero dials + portfolio tilt grid.

---

## 5. Accessibility notes

- Score dials are SVG with no aria-label — add `role="img" aria-label="Integrity Score: 57 out of 100"`
- Colour is used as the sole differentiator for quadrant classification — add text labels
- All interactive elements have visible focus states (Tailwind default ring) — keep these
- Font size on chart axes (10px) is below WCAG minimum for body text — acceptable in charts

---

## 6. Design tokens in use

From `index.css` (Tailwind CSS layer):
```css
--color-surface:  #0d1117   /* page background */
--color-card:     #161b22   /* card background */
--color-border:   #21262d   /* subtle borders */
```

Score colours:
- green:  #22c55e  (Integrity high / WEM high)
- blue:   #3b82f6  (Impact medium / Integrity medium)
- yellow: #eab308  (WEM medium / placebo moderate)
- red:    #ef4444  (low scores / dangerous placebo)
- purple: #a855f7  (WEM tilt portfolio chart)

---

## 7. Chart library

Currently: **Recharts** (React wrapper for D3). Already installed.

Available chart types used:
- `BarChart` + `Bar` — divergence chart, portfolio tilt
- `ScatterChart` + `Scatter` — quadrant plot
- Custom SVG arc — score dials

Recharts is fine for the demo. If you want to replace charts with something more visual, **D3** is available as a dev dependency but would need direct SVG work.

---

## 8. What to prioritise in the time you have

If you have **30 minutes:** Fix the company selector to show full names. This is a one-line change in `App.tsx` — map ticker to `{ticker} – {score.name}` in the button label.

If you have **2 hours:**
1. Fix mobile hero (flex-col on small screens)
2. Make the Placebo Index a proper visual bar with the Tariq Fancy quote
3. Add hover tooltips to the quadrant plot
4. Upgrade SO view materiality bars to a real Recharts `BarChart` (install already there)

If you have **half a day:**
1. All of the above
2. Rebuild controversy list as an actual timeline with date axis
3. Add WEM "budget bar" to WEM breakdown (stacked: 100 baseline minus penalty blocks)
4. Add portfolio tilt delta column (Naive ESG → WEM weight, ±%)
5. Cross-reference material factors with KPI scores in PM view (see section 3)

---

## 9. Data layer changes (June 2025 session)

These changes affect what data is available to components — relevant if you're adding new UI.

| Change | What's available now |
|---|---|
| `materiality.csv` added | `score.material_factors[]` — array of `{factor, materiality_score, rank, source}` per company, top 5 by score |
| Source | Maxwell Data FTSE100 Financial Materiality Survey, March 2025 — real SASB-style scores |
| Coverage | BP, SHEL, ULVR: exact FTSE100 values. XOM, TTE: oil & gas sector average. ORSTED: utility average. NESN: food/beverage average. AMZN: retail/tech average. |
| Gemini SDK | Migrated to `google-genai` 2.8.0 (`from google import genai`). Model chain: `gemini-2.0-flash` → `gemini-1.5-flash` → `gemini-2.0-flash-lite`. Claim extraction and controversy fetching work when quota allows. |
| `requirements.txt` | Cleaned: removed `anthropic`, `yfinance`; added `google-genai`, `finnhub-python`, `openpyxl` |
