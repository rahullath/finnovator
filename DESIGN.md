# UI/UX Design State & Open Implementation Opportunities
**ESG Integrity & Impact Navigator**

> This document is for anyone taking ownership of design. It maps the current UI state honestly — what works, what's rough, and where the highest-impact changes are. Written for someone who may want to improve visual quality or UX flow. **Last updated: June 2026.**

---

## 1. Current state summary

The app is a single-page React app with a **light theme** (`bg-surface` = `#f8f9fa`, cards on `#ffffff`). It loads, works, and is legible. The design has been substantially improved since the initial prototype but visual polish and mobile responsiveness still lag behind the product's conceptual ambition.

**What's working:**
- Three score dials (Integrity, Impact, WEM) render correctly with SVG arcs, sublabels, and colour coding
- `PlaceboChip` inline badge shows with correct colour coding (red / amber / green)
- `QuadrantBadge` with `large` prop renders labelled pill in hero
- Tabbed layout (`Overview / Materiality / Signals / Impact & WEM / Decisions`) is functional; tabs hide correctly for materiality-only companies
- Role toggle (Portfolio Manager / Sustainability Officer / Regulator) is in the sticky header and changes `ActionPanel` content
- **FTSE 100 search bar** (`SearchBar.tsx`) — all ~75 FTSE 100 companies are searchable, not just the 8 full-score demo tickers; powered by `GET /api/ftse100/index`
- **Materiality tab** (`PeerRadar`, `DriverDeviation`) — for any searched FTSE 100 company, shows a radar chart of their top-8 material drivers vs peer group and FTSE 100 median, and a deviation bar chart
- **Three-body Venn** (`ThreeBodyVenn.tsx`) in the Overview tab — shows ESG label vs peer normalised vs FTSE percentile, with instability score and resolution text
- **Forecast view** (`ForecastView.tsx`) — rank timeline + driver table in Overview
- **Action Panel now shows real Maxwell Data FTSE100 financial materiality factors** — PM view shows ranked factors with materiality %, Sustainability view shows all 5 as a horizontal bar chart with source line
- **Material factors are company-specific** — powered by `backend/data/materiality.csv` extracted from `FTSE100 financial materiality March 2025.xlsx` (provided by Maxwell Data, the challenge organiser)
- `PriceWidget.tsx` in hero card — live price + change when available
- Weight sliders in Signals tab are collapsible and live-recalculate Integrity score

**What's rough:**
- Tabs bar lacks visual separation from the hero card below it — the join looks accidental
- Score dials are `size={105}` — fine on desktop, **still overflow on mobile below ~700px**; the `flex-col sm:flex-row` fix has been applied but dial size itself hasn't shrunk on mobile
- `QuadrantPlot` dots still overlap (BP and SHEL, XOM far right) with no hover tooltip showing scores
- `ControversyTimeline` is still a styled list, not an actual date-axis timeline
- `PortfolioTilt` — three horizontal bar charts at identical x-axis domains; ORSTED's WEM dominance is underrepresented; no delta column showing weight change across tilts
- `WEMBreakdown` penalty bars are visual but the "deflationary from 100" budget framing isn't intuitive
- `ActionPanel` PM view shows top material factors with no connection to actual KPI scores
- `ActionPanel` SO view materiality bars are CSS `div` widths — no axis, no absolute scale reference
- Placebo Index chip is small; the concept is our most differentiated idea and deserves more visual real estate
- Dark/light theme inconsistency: most components use Tailwind light defaults but a few legacy utility classes reference `bg-surface` which is now `#f8f9fa` (light), not the original dark `#0d1117`
- `ForecastView` is data-rich but visually dense — axis labels are tiny at mobile widths
- Footer is functional but nearly invisible against the white background

---

## 2. Component inventory

| Component | File | Current state | Design debt |
|---|---|---|---|
| ScoreDial | `ScoreDial.tsx` | SVG arc, glow filter, sublabel, works | Dial size hardcoded at `size={105}`; doesn't shrink on mobile |
| QuadrantBadge | `QuadrantBadge.tsx` | Coloured pill, `large` prop, `actionLabel`, `placeboRisk` | No icon; colour + text only |
| PlaceboChip | inline in `App.tsx` | Works, red/amber/green chips | Still inline — should be extracted to `PlaceIndicator.tsx`; deserves larger visual treatment |
| WEMBreakdown | `WEMBreakdown.tsx` | Functional, penalty bars | Still no "deflationary budget bar" (see §3); sparkline for trend absent |
| DivergenceChart | `DivergenceChart.tsx` | Grouped bar chart (E/S/G/Total per provider) | Good; needs annotation line for sector average |
| ClaimTable | `ClaimTable.tsx` | Table with ✓/✗/? icons | No expand-to-detail; icons could be richer |
| ControversyTimeline | `ControversyTimeline.tsx` | Styled list view | Not actually a timeline; no date axis |
| ImpactKPIs | `ImpactKPIs.tsx` | Horizontal bar vs sector | "improving/flat/worsening" trend label not visually prominent |
| QuadrantPlot | `QuadrantPlot.tsx` | Scatter plot, colour-coded, selected ticker highlighted | Dots overlap; no hover tooltip with name+scores; quadrant labels small |
| PortfolioTilt | `PortfolioTilt.tsx` | 3-column horizontal bar charts | Same x-axis domain for all three tilts; no delta column |
| ActionPanel — PM | `ActionPanel.tsx` | **Real Maxwell Data material factors** (ranked circles, materiality %) | Factors not linked to KPI scores; no "weak/strong on this factor" verdict |
| ActionPanel — SO | `ActionPanel.tsx` | Materiality bars + disclosure integrity | CSS `div` widths — not a real chart; no axis labels |
| ActionPanel — Regulator | `ActionPanel.tsx` | Fines, CEO ratio, contradicted claims | Text-only; good information density; no change needed |
| WeightSliders | `WeightSliders.tsx` | Three range inputs, collapsible | Clean, works |
| SearchBar | `SearchBar.tsx` | Fuzzy search over 75+ FTSE 100 companies | No keyboard navigation (arrow keys); no sector filter |
| ThreeBodyVenn | `ThreeBodyVenn.tsx` | Venn diagram: ESG label vs peer vs FTSE percentile | SVG labels can clip on mobile |
| PeerRadar | `PeerRadar.tsx` | Radar chart of top-8 drivers vs peer + FTSE100 | Recharts radar; looks good; consider larger default height |
| DriverDeviation | `DriverDeviation.tsx` | Horizontal bar deviation from peer median | Works well; no absolute scale reference |
| ForecastView | `ForecastView.tsx` | Rank timeline + driver table | Dense; axis labels tiny on mobile |
| PriceWidget | `PriceWidget.tsx` | Live price + % change | Good; disappears silently if no price data (expected) |
| MaterialityComparison | `MaterialityComparison.tsx` | Cross-company comparison table | Check if this is rendered anywhere — may be unused |

---

## 3. Open design opportunities (high → low impact)

### HIGH: Placebo Index — make it a first-class visual
**Current:** Small inline chip below the quadrant badge.  
**Problem:** The Placebo Index is our most differentiated concept. It's named after Tariq Fancy's (ex-BlackRock) critique. Currently buried as a tiny pill.  
**Opportunity:** A full horizontal risk meter with the Fancy quote, spanning the width of the hero or appearing as a banner when PI > 0.65.

```
Placebo Risk  ──────────────████  0.78
              0              1
"ESG as a dangerous placebo" — Tariq Fancy, former MD, BlackRock
```

Extract `PlaceboChip` to its own `PlaceboIndicator.tsx` component. Add a mode that renders a full bar instead of a pill (e.g. when `variant="expanded"`).

### HIGH: Action Panel — link material factors to actual KPI scores
**Current:** PM view shows top 3 Maxwell Data material factors (e.g. "Physical Impacts of Climate Change — 76%") but doesn't say how the company performs on that factor.  
**Opportunity:** Cross-reference material factors with Impact KPIs and WEM sub-scores. For each material factor, show a one-line verdict:

```
┌─────────────────────────────────────────────────┐
│ 1  GHG Emissions              materiality 58%   │
│    Company KPI score: 22/100  ↘ worsening       │
│ 2  Physical Climate Change    materiality 76%   │
│    Company KPI score: —  (no data)              │
└─────────────────────────────────────────────────┘
```

This is the most powerful story the data tells and it's currently half-connected. The KPI scores are available in `score.impact.kpis[]`.

### HIGH: QuadrantPlot — fix overlap, add hover tooltip
**Current:** BP and SHEL overlap; XOM is far right. Dots are small.  
**Opportunity:**
- Increase dot radius to 10–14
- Add jitter for overlapping companies
- Add hover tooltip: name, integrity score, impact score, WEM, placebo index
- Quadrant labels could be larger with coloured background fills

### MEDIUM: PortfolioTilt — show reallocation delta
**Current:** Three separate bar charts at the same x-axis domain. You can't easily see how much a company's weight changes between tilts.  
**Opportunity:** A delta column (Naive ESG → WEM weight, ±%) alongside each row immediately communicates "XOM loses 8pp under WEM tilt." This is the core capital misallocation argument in a single number.

### MEDIUM: ControversyTimeline → actual timeline
**Current:** It's a styled list, not a timeline.  
**Opportunity:** A horizontal or vertical timeline with date markers is visually compelling and works as a "narrative of harm" visual for the pitch. Severity (high/medium/low) maps to dot size or colour. Could use a simple CSS timeline without a chart library.

```
2024 ────●───────────●──────────────── 2022
         ▲ Deepwater  ▲ EPA fine
         High         Medium
```

### MEDIUM: WEM Breakdown — penalty budget bar
**Current:** Three labelled bars with "remaining before cap" text.  
**Opportunity:** Show the full 100-point budget as a single bar with three penalty blocks stacked to the right. This makes the "deflationary from 100" framing obvious:

```
WEM Score  ████████████████████████████████░░░░░░░░░░  34
           0          D_carbon  D_labor  D_theft    100
```

### MEDIUM: Action Panel SO view — upgrade materiality bars to a real chart
**Current:** CSS `div` elements with `width: ${score * 60}px` — not a proper chart, no axis.  
**Opportunity:** Replace with a small `BarChart` (Recharts, already installed) showing all 5 factors on a 0–1 axis with a labelled threshold line at 0.5 ("material threshold"). Source line stays: "Maxwell Data FTSE100, March 2025."

### MEDIUM: Tabs bar — visual separation from hero
**Current:** The tab strip sits directly on the card below the hero; the join looks unintentional.  
**Opportunity:** Add a `border-b border-border` separator line or give the tabs strip a distinct `bg-gray-50` background so it reads as a navigation element, not an extension of the hero card.

### LOW: Score Dial — mobile size
**Current:** Three dials at `size={105}` render fine on desktop; the `flex-col sm:flex-row` wraps them correctly but the dials remain 105px on small screens.  
**Opportunity:** Pass a responsive size (e.g. `size={80}` on mobile via a `useWindowSize` hook, or media query).

### LOW: SearchBar — keyboard navigation
**Current:** Renders a dropdown list but arrow keys don't navigate the results.  
**Opportunity:** Add `onKeyDown` handler: `ArrowDown`/`ArrowUp` to highlight items, `Enter` to select.

### LOW: Role toggle — descriptor line
**Current:** Three text buttons in the header.  
**Opportunity:** A short descriptor line below the toggle that changes per role:
- PM: "Capital allocation & risk lens"
- Sustainability Officer: "Disclosure quality & improvement lens"
- Regulator: "Enforcement & compliance lens"

### LOW: Footer visibility
**Current:** White text on white background — nearly invisible.  
**Opportunity:** Give the footer a `bg-gray-50` background and a stronger `border-t border-border`.

### LOW: DivergenceChart — sector annotation
**Current:** Shows E/S/G/Total per provider — good.  
**Opportunity:** Add a horizontal reference line at the FTSE100 sector average for each dimension, so the divergence is contextualised against industry norms, not just across the two providers.

---

## 4. Mobile responsiveness checklist

| Screen element | 375px | 768px | 1280px |
|---|---|---|---|
| Search bar | ✅ | ✅ | ✅ |
| Role toggle | ⚠️ wraps to 2 rows | ✅ | ✅ |
| Hero (3 dials) | ⚠️ dials col-wrap but still large | ✅ | ✅ |
| Tab bar | ✅ | ✅ | ✅ |
| ThreeBodyVenn | ⚠️ SVG labels clip | ✅ | ✅ |
| PeerRadar | ✅ responsive | ✅ | ✅ |
| DriverDeviation | ✅ | ✅ | ✅ |
| Divergence chart | ✅ responsive | ✅ | ✅ |
| Portfolio tilt (3 col) | ❌ cramped | ⚠️ tight | ✅ |
| ForecastView | ⚠️ axis labels tiny | ✅ | ✅ |
| Action panel | ✅ | ✅ | ✅ |

Priority mobile fixes: role toggle wrapping, dial size, ThreeBodyVenn SVG labels, PortfolioTilt stacking.

---

## 5. Accessibility notes

- Score dials are SVG with no `aria-label` — add `role="img" aria-label="Integrity Score: 57 out of 100"`
- Colour is used as the sole differentiator for quadrant classification — add text labels (already present via `QuadrantBadge`; verify radar dots)
- All interactive elements have visible focus states (Tailwind default ring) — keep these
- Font size on chart axes (10px) is below WCAG minimum for body text — acceptable in charts specifically; flag for future audit
- `SearchBar` dropdown list items should have `role="option"` for screen readers

---

## 6. Design tokens in use

From `index.css` (Tailwind CSS `@layer base`):
```css
--color-surface:   #f8f9fa   /* page background — LIGHT */
--color-card:      #ffffff   /* card background */
--color-border:    #e5e7eb   /* subtle borders */
```

Score colours (consistent across dials, breakdown bars, charts):
- **Integrity** → blue:   `#3b82f6` (medium) / `#22c55e` green (high) / `#ef4444` red (low)
- **Impact** → same scale as Integrity
- **WEM** → green / yellow `#eab308` / red — note WEM uses yellow for medium, not blue
- **Placebo** → red `#ef4444` (dangerous) / amber `#eab308` (moderate) / forest green (coherent)

> ⚠️ **Colour collision:** red currently appears on low-WEM dials, high controversy severity, and high-PI placebo chips simultaneously. This dilutes the signal. Reserve red exclusively for Placebo > 0.65 and WEM < 30; use orange for controversy severity.

Custom CSS classes in use: `.card`, `.tab-btn`, `.tab-btn-active`, `.tab-btn-inactive`, `.dir-leading`, `.dir-lagging`, `.dir-stable`, `bg-forest-{n}`, `text-forest-{n}`.

---

## 7. Chart library

Currently: **Recharts** (React wrapper for D3). Already installed.

Chart types in use:
- `BarChart` + `Bar` — divergence chart, portfolio tilt, driver deviation, SO materiality bars
- `ScatterChart` + `Scatter` — quadrant plot
- `RadarChart` + `Radar` — peer radar (materiality tab)
- Custom SVG arcs — score dials, ThreeBodyVenn
- CSS `div` widths — SO view materiality bars (should be replaced with Recharts)

D3 is available as a dev dependency but not currently used directly.

---

## 8. What to prioritise in the time you have

**If you have 30 minutes:**
1. Extract `PlaceboChip` to its own component and add the expanded bar variant with the Tariq Fancy quote beneath it

**If you have 2 hours:**
1. Add hover tooltip to `QuadrantPlot` (name, Integrity, Impact, WEM, PI)
2. Upgrade SO view materiality bars to a real Recharts `BarChart` with a 0–1 axis
3. Add the delta column to `PortfolioTilt` (Naive ESG → WEM weight, ±%)
4. Fix footer visibility (bg-gray-50 + stronger border)

**If you have half a day:**
1. All of the above
2. Build `ControversyTimeline` as a real CSS date-axis timeline
3. Add WEM budget bar to `WEMBreakdown` (stacked penalty blocks on a 100-baseline)
4. Cross-reference material factors with KPI scores in `ActionPanel` PM view (see §3)
5. Add keyboard navigation to `SearchBar`

---

## 9. Data layer changes log

| Change | Date | What's available now |
|---|---|---|
| `materiality.csv` added | May 2026 | `score.material_factors[]` — `{factor, materiality_score, rank, source}` per company, top 5 by score |
| FTSE 100 full index added | Jun 2026 | `GET /api/ftse100/index` — all ~75 companies with top-8 drivers, peer group, 3-body instability, direction signals |
| `GET /api/ftse100/profile/{ticker}` | Jun 2026 | Full `FTSEProfile` — `top_8_drivers`, `all_26_drivers`, `peer_names`, `three_body_instability`, `direction_3m/12m` per driver |
| `GET /api/forecast/{ticker}` | Jun 2026 | `ForecastResult` — rank timeline, driver table, three-body resolution text |
| `GET /api/price/{ticker}` | Jun 2026 | `PriceData` — live price and % change via FMP |
| Gemini SDK | May 2026 | Migrated to `google-genai` 2.8.0 (`from google import genai`). Model chain: `gemini-2.0-flash` → `gemini-1.5-flash` → `gemini-2.0-flash-lite` |
| `requirements.txt` | May 2026 | Cleaned: removed `anthropic`, `yfinance`; added `google-genai`, `finnhub-python`, `openpyxl` |
| Source attribution | Jun 2026 | Jangani, Date & Tucker (SSRN 5618192, 2026) added as second citation alongside Berg et al. (2022) |

**Coverage for full score (8 companies):** BP, SHEL, ULVR, ORSTED, XOM, TTE, NESN, AMZN  
**Coverage for materiality profile (FTSE 100):** ~75 companies via Maxwell Data survey  
**ESG materiality weights:** BP, SHEL, ULVR — exact FTSE100 values. XOM, TTE — oil & gas sector average. ORSTED — utility average. NESN — food/beverage average. AMZN — retail/tech average.
