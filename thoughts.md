# ESG Integrity & WEM Navigator – Concept, Architecture, and Rationale

## Executive Overview

This document describes a full-stack prototype that critiques conventional ESG (Environmental, Social, Governance) investing while providing a concrete, data-driven decision-support tool for investors, auditors, and corporate executives.

The system, built as the "ESG Integrity & WEM Navigator", does not treat ESG scores as objective truths. Instead, it:

- Measures **signal quality** via rating divergence, claim verification, and controversy data (Integrity Score).
- Measures **real-world performance** on sector-specific, financially material sustainability KPIs (Impact Score), using an FTSE 100 materiality matrix for grounding.[^1]
- Measures **worker and ecological harm** via a deflationary Worker & Ecological Materiality score (WEM Score) based on emissions, regulatory fines, and CEO-to-worker pay ratios.
- Shows how these metrics interact with traditional ESG scores and stock-price relevant risks, including greenwashing litigation and regulatory action.[^2][^3][^4]

The prototype is deliberately critical of mainstream ESG, drawing on academic evidence of ESG rating divergence, greenwashing, and mixed relationships between ESG and financial performance.[^5][^6][^7][^8] It is, however, framed in investor-friendly language as a way to:

- Avoid portfolios loaded with fragile greenwashers.
- Identify under-recognised real performers.
- Provide a defensible ESG due-diligence workflow for investors and auditors.

***

## Background: Why ESG Needs a "Fix"

### Rating divergence and methodological confusion

Research on "Aggregate Confusion" shows that ESG ratings from major providers diverge substantially: correlations across raters for the same firm often range between 0.38 and 0.71, with differences arising from scope (which issues are included), measurement (how they are quantified), and weighting (how issues are aggregated).[^5] Methodological differences in measurement are the dominant source of divergence.[^5]

As a result, a company can be a "sustainability leader" under one methodology and a laggard under another, despite identical underlying behaviours. This undermines confidence in using any single ESG score as a decision-grade input.[^5][^9]

### Greenwashing risk and litigation exposure

A growing literature shows that high ESG scores can be positively associated with greenwashing risk: large firms with strong ESG branding are overrepresented in greenwashing accusations, restatements, and enforcement actions.[^6][^2][^10] Regulators such as the SEC and European authorities increasingly bring cases based on misleading ESG disclosures (both at the fund and issuer level), signalling that ESG misstatements are becoming a source of financial and legal risk.[^3][^4]

### ESG and stock performance: mixed and context-dependent

Meta-analyses of the ESG–financial performance relationship find no universal law. Many studies report a non-negative or mildly positive correlation between ESG metrics and financial performance, but effect sizes are small and heterogeneous across regions, sectors, and data definitions.[^11][^12][^8][^13] More recent work suggests that:

- High ESG *levels* can be associated with slightly lower long-term excess returns in some markets.
- **ESG momentum**—improvements in ESG scores over time—can be associated with short-term positive abnormal returns and lower future volatility.[^7][^14]

This supports a view where ESG labels can influence flows and risk perception, but do not reliably reward genuine sustainability in the way mainstream marketing claims.

### Tariq Fancy's "dangerous placebo" critique

Tariq Fancy, former CIO for sustainable investing at BlackRock, argues that ESG products are largely a "dangerous placebo"—a marketing gimmick that gives the public the illusion that markets are addressing climate and social crises, while leaving structural exploitation and externalities largely untouched.[^15][^16][^17] From this perspective, ESG can simultaneously have weak or ambiguous long-run performance links and still carry financial relevance through greenwashing risk, regulatory arbitrage, and flow-driven mispricings.

***

## Concept: Integrity, Impact, and WEM

The prototype responds to these issues by explicitly separating three dimensions of each company:

1. **ESG label pressure**: average ESG scores from conventional providers.
2. **Integrity of the ESG signal**: how trustworthy those scores and sustainability claims are (Integrity Score).
3. **Material reality**: real-world sustainability and harm on key financial and socio-ecological metrics (Impact Score and WEM Score).

This creates a structured "three-body" configuration: market label, signal quality, and material reality. The system is designed to show how these forces align or conflict for each firm.

### Integrity Score (signal quality)

Integrity measures whether the ESG story for a company can be trusted as a decision input. It is composed of:

- **Rating Divergence Score** – based on the spread of ESG ratings across providers (e.g., FMP, Sustainalytics via Yahoo, or other sources). High divergence implies low confidence in any single score, operationalising the Aggregate Confusion literature.[^5][^9]
- **Verification Score** – based on the share of numeric sustainability claims in filings and reports that can be verified against independent data. Claims are extracted via an LLM (for structure) and matched to emissions, safety, labour, or other datasets; claims are labelled verified, contradicted, or unverifiable.
- **Controversy Score** – based on recent ESG-relevant incidents from sources such as GDELT and Violation Tracker, weighted by severity and recency.[^18][^19]

The Integrity Score is a weighted combination of these components, with weights defaulting to something like 0.35 (divergence), 0.40 (verification), 0.25 (controversy), validated for consistency.

### Impact Score (sector-financial materiality)

Impact measures real-world sustainability performance on financially material issues for each sector. It is grounded in an FTSE 100 "financial materiality" dataset that assigns 0–1 weights to key ESG topics for each company, effectively specifying the top 8 material drivers per firm.[^1]

For each company:

- The top N material topics are selected (e.g., GHG emissions, water management, worker health and safety, data security).
- For each topic, one or more KPIs are defined (emissions intensity, frequency of incidents, pay equity metrics, etc.).
- Each KPI is benchmarked against the sector peer group (e.g., all FTSE 100 companies in the same industry) and scored on a 0–100 scale, incorporating both position and trend.
- The Impact Score is a materiality-weighted average of these KPI scores, using the FTSE matrix weights.[^1]

This ensures that the Impact dimension reflects sector-specific financial materiality rather than ad hoc choices.

### WEM Score (worker and ecological materiality)

The Worker & Ecological Materiality (WEM) score is a deflationary index that starts from 100 and subtracts penalties for three core vectors of externalised harm:

- **Carbon penalty**: based on emissions intensity (tons of CO₂e per unit of revenue), derived from Climate TRACE and other open datasets.[^20][^21]
- **Labour penalty**: based on CEO-to-median-worker pay ratios extracted from DEF 14A filings and related datasets, with penalties applying logarithmically above a threshold (e.g., 50:1 or 100:1).[^22][^23][^24]
- **Theft/fines penalty**: based on the five-year sum of regulatory fines from Violation Tracker Global (labour, safety, environmental, and other relevant violations).[^18][^19]

Formally the WEM score can be written as:

$$
\text{WEM} = 100 - (D_{\text{carbon}} + D_{\text{labor}} + D_{\text{theft}}),
$$

with each penalty term scaled and capped to keep WEM between 0 and 100. This index is intentionally worker- and society-centric; it penalizes firms that generate large negative externalities even if shareholders are rewarded in the short term.

### Quadrants and placebo risk

Using Integrity and Impact, the model assigns each company to one of four quadrants:

- High Integrity / High Impact – "Preferred Sustainability Leaders" (credible story and strong material performance).
- High Integrity / Low Impact – "Engagement Priorities" (credible reporting but limited real-world progress).
- Low Integrity / High Impact – "Under-recognised Performers" (good material performance not fully reflected in signals).
- Low Integrity / Low Impact – "Greenwashing Risk / Laggards" (classic dangerous placebo configuration).

A "placebo index" increases when ESG labels are high but WEM and Integrity are low, capturing the Fancy-style critique that such cases are marketing placebos with elevated risk of future regulatory or reputational correction.[^15][^16][^17][^10]

***

## Data Architecture and Ingestion

### Data sources

The prototype uses only public or accessible APIs and open datasets, including:

- **Financial Modeling Prep (FMP)** for ESG scores and fundamentals.
- **Yahoo/Sustainalytics or ESGScraper** for a second ESG provider when feasible, to compute rating divergence.[^25][^26][^27]
- **Climate TRACE** for national/sector emissions, with potential extension to asset-level data.[^20][^28][^21]
- **Violation Tracker Global** for 5-year regulatory fines by company and category (labour, environmental, etc.).[^18][^19]
- **SEC EDGAR / SEC-API / CEO-pay aggregators** for CEO-to-median-worker pay ratios and sustainability disclosures.[^22][^23][^24]
- **GDELT** for ESG-related controversies.
- **FTSE 100 materiality matrix** for company-level financial materiality weights across ESG topics.[^1]

These data are ingested through dedicated Python ingestor classes (FMPIngestor, ClimateTraceIngestor, ViolationTrackerIngestor, CEOPayIngestor, etc.), which write to CSV files in a `data/` directory (standing in for a DB) or directly into a Postgres/Supabase schema.

### Backend API and orchestration

The backend is implemented as a FastAPI app exposing:

- `GET /api/companies` – list of tickers and basic metadata.
- `GET /api/score/{ticker}` – full CompanyScore object (ratings, claims, controversies, Integrity, Impact, WEM, quadrant, placebo index).
- `POST /api/score/{ticker}` – same as above but with custom Integrity weights.
- `GET /api/portfolio` – portfolio view across all companies, including naive ESG tilt and alternative tilts (Integrity×Impact, WEM-based).
- `POST /api/refresh/{ticker}` – orchestrates all ingestors for a ticker, then recomputes the scores.

Internally, the scoring engine loads companies, ratings, claims, controversies, KPI data, WEM inputs, and materiality weights from CSVs or SQL tables, builds typed objects, and computes the scores via modular functions (`calculate_divergence_score`, `calculate_verification_score`, `calculate_controversy_score`, `calculate_impact_score`, `calculate_wem_score`). This structure keeps the logic explicit and auditable rather than hidden inside a machine learning model.

***

## Frontend and User Experience

### React dashboard

The frontend is built in React + TypeScript (Vite + Tailwind). It consumes the FastAPI endpoints via a thin client (`api.ts`) and renders:

- **Company view**:
  - Ticker and metadata (name, sector, country).
  - ESG rating breakdown by provider and year.
  - Integrity, Impact, and WEM scores as dials or gauges.
  - Top 8 material drivers for the company (from the FTSE matrix) with current KPI scores and peer percentiles.[^1]
  - Claims table (verified / unverifiable / contradicted) with short notes.
  - Controversy timeline and severity indicators.
  - Quadrant label and recommendations (e.g., "Engagement Priority" with bullet-point actions).

- **Portfolio view**:
  - List of companies with Integrity, Impact, WEM, and ESG averages.
  - Naive ESG-tilted weights vs Integrity×Impact weights, and potentially WEM-tilted weights.
  - Aggregate metrics such as the share of portfolio weight in the "greenwashing risk" quadrant or in high-placebo-index names.

### Role-based perspectives

The dashboard supports different user perspectives, each corresponding to a different weighting of components and different UI emphasis:

- **Investor view** – emphasises:
  - Greenwashing and litigation risk (Integrity and WEM).
  - ESG momentum via changes in material KPIs.
  - Implications for portfolio tilts and risk-adjusted returns, consistent with evidence that ESG momentum may be more relevant than ESG levels for returns and volatility.[^7][^14]

- **Auditor / compliance view** – emphasises:
  - Claim verification status and potential misstatements.
  - Alignment between reported ESG scores and WEM/Impact metrics.
  - Companies most exposed to greenwashing enforcement or securities disclosure litigation.[^3][^4][^2]

- **Corporate (CFO/sustainability officer) view** – emphasises:
  - Where the firm sits vs peers on key material drivers.
  - Which KPIs would most improve Integrity and Impact scores.
  - Short- and medium-horizon projections (3–12 months) of relative position if current trends continue.

A "wisdom of the crowd" mode can average weighting schemes for these roles, reflecting the idea that auditors, investors, and corporate managers each see part of the picture; their combined view can be more informative than any single perspective alone.

***

## Use Cases and Value for Cynical Investors

### 1. Ranking bad options: which greenwashing is most fragile

In a world where "everyone knows" that ESG marketing is often spurious, the practical question is not whether greenwashing exists but **where it is most likely to unravel with financial consequences.** The Integrity and WEM layers enable:

- Systematic identification of names with high ESG branding but low Integrity and low WEM—"dangerous placebo" configurations most exposed to regulatory, litigation, and reputational shocks.[^15][^16][^17][^2][^10]
- Distinguishing between companies that are equally cynical in messaging but differ in how much real risk they carry.

This supports relative decisions such as underweighting the most fragile greenwashers within a sector, even if the investor does not premise their strategy on "sustainability outperforms" in aggregate.

### 2. ESG momentum and under-recognised improvers

By focusing on trajectories of material KPIs rather than only ESG levels, the system can help identify firms that are **quietly improving** on financially material sustainability drivers before ESG labels or indices fully incorporate those changes. Given empirical evidence that ESG momentum can be positively associated with returns and lower volatility, such names may offer "impact alpha" opportunities.[^7][^14][^8]

Conversely, firms with high ESG labels but stagnating or worsening KPI trends can be flagged as likely candidates for future downgrades or negative surprises.

### 3. Legal and regulatory risk management

For auditors and investors subject to ESG-related mandates or disclosure obligations, the dashboard provides a defensible due-diligence process:

- Evidence that ESG scores were not accepted at face value; rating divergence, claim verification, and WEM were explicitly assessed.
- A transparent rationale for holding or excluding a company, linked to measurable metrics and peer comparisons.

This can mitigate future legal exposure under regimes that scrutinise ESG claims and marketing, such as EU greenwashing guidelines, SEC climate disclosure rules, and national consumer protection laws.[^3][^4]

### 4. Portfolio construction under constraints

Institutional investors often must satisfy ESG policy constraints and client expectations, even if they privately share the CEO's cynicism about ESG narratives.[^17][^15] The prototype enables:

- Construction of portfolios that appear ESG-compliant by conventional ratings, while internally optimising for Integrity, Impact, and WEM.
- Explicit trade-off analysis between expected return (including possible "sin stock" premia), greenwashing risk, and long-run regulatory or physical-climate exposures.[^29][^30]

This aligns with Fancy's critique in a paradoxical way: the tool exposes ESG's placebo nature while giving investors more honest risk information and a way to navigate a flawed regime.

***

## Conclusion

The ESG Integrity & WEM Navigator is intentionally sceptical of conventional ESG, but it does not reject measurement or data. Instead, it:

- Treats ESG scores as contested, constructed signals subject to divergence, spin, and greenwashing.[^5][^6][^10]
- Uses independent data streams (emissions, fines, pay ratios) and an explicit materiality matrix to quantify real-world sustainability performance and harm.[^1][^20][^21][^18][^22][^23]
- Provides a transparent scoring framework—Integrity, Impact, WEM—that can be interrogated, reweighted, and adapted to different roles and preferences.

For investors who "do not believe" greenwashing narratives, the tool is still useful because it ranks **how** and **where** the narratives are fragile, and how that fragility interacts with capital flows, legal risk, and peer dynamics. It offers a way to systematically underweight the most dangerous placebos, spot real improvers early, and satisfy ESG process requirements without buying into the idea that ESG, as currently practiced, is a sufficient answer to the climate and social crises.

---

## References

1. [FTSE100-financial-materiality-March-2025.xlsx](https://ppl-ai-file-upload.s3.amazonaws.com/web/direct-files/attachments/82450310/b020f9ea-99be-45c5-ac79-f5489ecd7e29/FTSE100-financial-materiality-March-2025.xlsx?AWSAccessKeyId=ASIA2F3EMEYEXBRZQQJE&Signature=ayOgDZ%2FY3hBmPp%2B8oZ8160MQ0%2F8%3D&x-amz-security-token=IQoJb3JpZ2luX2VjEGYaCXVzLWVhc3QtMSJIMEYCIQCEhxGzXI2UEHN0sIHktr%2F2Ls4B8iXQcdoUCMsdqE00zAIhAPMaFbqtieydVb0OXLXUG8xNzSQ7aFnNhL8zB2EzGkrDKvMECC4QARoMNjk5NzUzMzA5NzA1Igy3B%2Beip%2Br0B5flYacq0ARewaXFBAkOzBcoU%2Bvwo2JU%2FWPgV4ItxLYeDD0n%2Ba3%2FDdJsmDppoZqKE0nlEodu5fswv71M4Ff2yP%2Btw5yQuFlVSCgz4hjjRhTgdoyNq7mTW8h5u09pEpb5Uixag9cdxODZj7G2x5Ji%2BtfjHiE7K4j8eNtIen5nmyKmShyQMIXfq9kpaT%2FK%2FfDYp2UAOYBg2neo5wIvB41biAo3F%2BjllZsZKJE1SZl%2B9U0Vc%2B23EuW1vU4t7ARKM6lMd1qHoGjhgY1nKDRc%2BIG1fTomezL0J252Rzbn%2B%2Bw0v7YCQkjjySMPYPqbkLR%2FHhmbSgv497H%2BGKBKAu1Ula9f1AXFZpvzuWZZ%2BsXevgEx%2BmkbeEOd4%2FuWjeu7TZwZZfBiukoMRkUBTtpTrtGZA5ipL4Nx12r%2BLJKdn2U%2FVDI631mIAprUSfKty8%2FEK6Bn1e7LTevu3YiaLkhnh9Lz0HKD5gyYnXYq3LnmJd9Jv%2BtkH6gJO3wHk0GZtBFyux5E9pzqvbXWopsOuxDf9kl9enrgPnB8PY%2BUKTZ7M2HJXjCboHsK9EFXVJbjnef9ZtFup%2Fec6Qf7Srkpx7W1fx4T%2FETjktRZlhrGtsDv6q0ODzmKge921YhOQd%2BgYcQ9NcwbmScteB8Bh9re8Ap5ylz%2F9gZwil9qITgQ%2F27upFLM4yT2N7ybJQb9WbeMm7wZlrJCweLg17zzsxJzlpAhQSMQdIqUIP5AsCO058Wtkv9%2FG7KD0ObKg0kluZX4kYDXr3SAPKMG1vn7PCHQukZCR5Fc7A%2BPTO%2F41xvGbdbNMNuxtdEGOpcBYX0SxBaFYJUkFaJsYVICuJuu9nchX5qIrjOVYkm1Nu0ruhghQTey7KPVRLh5pe%2BIwy%2B8Q%2Fe%2FR1z7PO7n54NmMHGUGCfdPqMUW8m5WNXBJ8so27y3TgbAlUxDoR%2FjkgTahm764uw4K1vAOYsRUce0kABqNBSSz93TkezlIGM0Jkci7mZPEl4BeHCY36who0AckO7LLmRTCA%3D%3D&Expires=1781360302) - - Environment Social Governance
- Entity ID Name Symbol Wikipedia Industry Air Quality Ecological Im...

2. [Determinants and forecasting of corporate greenwashing ...](https://opus.bibliothek.uni-augsburg.de/opus4/frontdoor/deliver/index/docId/126925/file/126925.pdf)

3. [THE GROWING RISK OF](https://marketingstorageragrs.blob.core.windows.net/webfiles/ESG_Handbook_Growing_RisksLiabilities.pdf)

4. [Disclosure, Greenwashing, and the Future of ESG Litigation](https://scholarlycommons.law.wlu.edu/cgi/viewcontent.cgi?article=4865&context=wlulr)

5. [Aggregate Confusion: The Divergence of ESG Ratings](https://revfin.org/aggregate-confusion-the-divergence-of-esg-ratings/) - This paper investigates why ESG ratings diverge. The analysis is based on data from six prominent ES...

6. [What You See is Not What You Get: ESG Scores and Greenwashing Risk](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4985314) - This paper shows that ESG scores capture a company's greenwashing behavior. Greenwashing accusations...

7. [The Effects of ESG Scores and ESG Momentum on Stock Returns and Volatility: Evidence from U.S. Markets](https://www.mdpi.com/1911-8074/18/7/367) - The impact of Environmental, Social, and Governance (ESG) scores on financial performance remains a ...

8. [ESG and Stock Performance: A Systematic Review of ...](https://rsisinternational.org/journals/ijriss/view/esg-and-stock-performance-a-systematic-review-of-heterogeneous-effects-measurement-challenges-and-investment-implications) - However, empirical evidence regarding the relationship between ESG performance and stock returns rem...

9. [MIT Prof. Rigobon: Dealing with confusion and incongruity in the ‘ESG data zoo’ | STOXX](https://stoxx.com/mit-prof-rigobon-dealing-with-confusion-and-incongruity-in-the-esg-data-zoo/) - ESG & Sustainability | MIT Professor of Applied Economics Roberto Rigobon took the stage at the rece...

10. [Higher the ESG Score, Higher the Risk of Green Washing](https://sustainabilityzero.com/higher-the-esg-score-higher-the-risk-of-green-washing/) - The sustainability teams are extremely busy with their sustainability disclosures and working overti...

11. [aggregated evidence from more than 2000 empirical studies](https://www.sustainablefinance.ch/upload/cms/user/201512_JSustFinance_MetastudyPerformance.pdf)

12. [Do ESG Practices Promote Financial Performance? Comparison of English, Chinese, and Korean Papers Through Bibliometric and Meta-Analysis](https://www.mdpi.com/2071-1050/16/22/9810) - Companies engaged in ESG practices to enhance financial performance and demonstrate a commitment to ...

13. [ESG investing & firm performance: Retrospections of past & ...](https://onlinelibrary.wiley.com/doi/full/10.1002/csr.2982)

14. [How does ESG performance affect stock returns? Empirical evidence from listed companies in China](https://linkinghub.elsevier.com/retrieve/pii/S2405844023035272) - With the increasing attention to sustainable development, environmental, social, and corporate gover...

15. [Fancy That! An Industry Insider Calls Sustainable Investing a ...](https://impactmoney.net/impact-investing/fancy-that-an-industry-insider-calls-sustainable-investing-a-dangerous-placebo/) - In sum, Fancy suggests ESG investing is more of a marketing gimmick than a serious tool for achievin...

16. [Does ESG Work? Tariq Fancy on Investing Greenwashing and the Need for More ‘Rules and Referees’ — The Conscious Investor](https://www.theconsciousinvestor.co/blog/tariq-fancy-esg) - As the former chief investment officer of sustainable investing at BlackRock, Tariq Fancy led a glob...

17. [Has Tariq Fancy demolished the case for ESG investing?](https://www.capitalmonitor.ai/analysis/has-tariq-fancy-demolished-the-case-for-esg-investing/) - He argued that ESG-labelled investment products overstate their impact and that market-led solutions...

18. [Discover the Regulatory Penalties Paid by Large Corporations Around the World](https://violationtrackerglobal.goodjobsfirst.org) - Violation Tracker Global, produced by the Corporate Research Project of Good Jobs First, is a wide-r...

19. [Violation Tracker - Good Jobs First](https://violationtracker.goodjobsfirst.org) - Violation Tracker is the first wide-ranging database on corporate misconduct. It covers banking, con...

20. [Data Downloads - Climate TRACE](https://climatetrace.org/data) - We make meaningful climate action faster and easier by mobilizing the global tech community to track...

21. [Climate TRACE datasets | Open Net Zero by Icebreaker One](https://opennetzero.org/climate-trace) - Open Net Zero makes it easy to find, access and securely share data. Click to learn more about Clima...

22. [Form DEF 14A Filings - Definitive Proxy Statements - SEC API](https://sec-api.io/datasets/form-def-14a-filings) - Download dataset Form DEF 14A Filings - Definitive Proxy Statements from the bulk dataset downloader...

23. [PlainCEOPay — CEO Pay Ratio Intelligence](https://plainceopay.com) - CEO pay ratio intelligence — transparent executive compensation data from SEC EDGAR filings for 2,00...

24. [CEO Pay Blog: Data-Driven Executive Compensation Analysis](https://www.ceopaywatch.com/blog) - ... SEC DEF 14A proxy statement. We currently track 209 companies and 836 named executive officers, ...

25. [Extracting ESG Data from Yahoo! Finance using Python](https://medium.com/@jamesbowden/extracting-esg-data-from-yahoo-finance-using-python-4834bc8db570) - ESG investing refers to the incorporation of three non-financial factors (Environmental, Social and ...

26. [ESGScraper](https://pypi.org/project/ESGScraper/) - Package that allows you to find ESG ratings from Yahoo Finance, MSCI, CSR Hub, S&P Global, SustainAn...

27. [Python code to scrape Sustainalytics ratings from Yahoo! Finance ...](https://github.com/DriesLaurs/sustainalytics_yahoo_finance) - Python3 script to scrape all available Sustainalytics ESG ratings from Yahoo! Finance for stocks and...

28. [Climate TRACE](https://climatetrace.org) - We make meaningful climate action faster and easier by mobilizing the global tech community to track...

29. [CESifo Working Paper no. 9724](https://www.ifo.de/DocDL/cesifo1_wp9724.pdf)

30. [Financial Materiality and Market Dynamics of ESG Performance in the Global Electronics In-dustry: An Empirical Analysis Amidst Diverse Regulatory and Technological Landscapes](https://www.opastpublishers.com/open-access-articles/financial-materiality-and-market-dynamics-of-esg-performance-in-the-global-electronics-industry-an-empirical-analysis-amidst-diver-9245.html) - The global electronics industry faces escalating sustainability regulations and rapid technological ...

