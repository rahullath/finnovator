import type { CompanyScore, Role } from "../types"

interface Props {
  score: CompanyScore
  role: Role
}

const ROLE_LABELS: Record<Role, string> = {
  pm: "Portfolio Manager",
  sustainability: "Sustainability Officer",
  regulator: "Regulator / Compliance",
}

function Section({ title, items, accent }: { title: string; items: string[]; accent?: string }) {
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{title}</h4>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
            <span className={`shrink-0 mt-0.5 ${accent ?? "text-gray-500"}`}>—</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function PMView({ score }: { score: CompanyScore }) {
  const { integrity, impact, quadrant, wem } = score
  const wemDesc = wem.wem_score >= 70 ? "low externalised harm" : wem.wem_score >= 50 ? "moderate harm exposure" : "high externalised harm — significant hidden risk"
  const placeboDelta = Math.round(score.esg_score_avg - wem.wem_score)
  const topFactors = score.material_factors.slice(0, 3)

  return (
    <div className="space-y-5">
      <Section
        title="Signal Quality Assessment"
        items={[
          `Integrity: ${Math.round(integrity.integrity_score)}/100 — ${integrity.integrity_score >= 70 ? "reliable signal" : integrity.integrity_score >= 50 ? "moderate confidence" : "low confidence, treat with caution"}`,
          `Impact Alignment: ${Math.round(impact.impact_score)}/100 — ${impact.impact_score >= 70 ? "strong real-world progress" : impact.impact_score >= 50 ? "moderate performance" : "lagging sector on material KPIs"}`,
          `WEM Score: ${Math.round(wem.wem_score)}/100 — ${wemDesc}${placeboDelta > 15 ? ` (ESG overstates by ${placeboDelta} pts — placebo risk)` : ""}`,
          `Recommended action: ${quadrant.action_label}`,
        ]}
        accent="text-blue-400"
      />
      {topFactors.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Top 3 Material Factors — {score.sector}
          </h4>
          <p className="text-xs text-gray-500">Source: Maxwell Data FTSE100 Financial Materiality Survey, March 2025</p>
          <ul className="space-y-2 mt-1">
            {topFactors.map((f, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="shrink-0 w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                <div>
                  <span className="text-sm text-gray-800">{f.factor}</span>
                  <span className="ml-2 text-xs text-gray-500">materiality {(f.materiality_score * 100).toFixed(0)}%</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      <Section
        title="Portfolio Recommendation"
        items={quadrant.recommendations}
        accent="text-yellow-400"
      />
    </div>
  )
}

function SustainabilityView({ score }: { score: CompanyScore }) {
  const claimed = score.claims.length
  const verified = score.claims.filter((c) => c.verification_status === "verified").length
  const contradicted = score.claims.filter((c) => c.verification_status === "contradicted").length
  const topFactors = score.material_factors.slice(0, 5)

  return (
    <div className="space-y-5">
      <Section
        title="Disclosure Integrity"
        items={[
          `${claimed} specific ESG claims analysed from filings`,
          `${verified} verified against independent data (${claimed > 0 ? Math.round(verified / claimed * 100) : 0}%)`,
          `${contradicted} contradicted by external sources — restatement or clarification needed`,
          `Divergence between ESG providers: ${Math.abs(score.ratings[0]?.total - (score.ratings[1]?.total ?? score.ratings[0]?.total)).toFixed(1)} point spread`,
        ]}
        accent="text-green-400"
      />
      {score.quadrant.placebo_risk && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4 space-y-2">
          <p className="text-sm font-semibold text-red-400">Greenwashing Exposure: High</p>
          <p className="text-xs text-gray-400">
            Claims are contradicted by operational data. Regulators (FCA SDR, SEC, EU SFDR) are
            actively pursuing enforcement in this area. Prioritise restatement and verification before next reporting cycle.
          </p>
        </div>
      )}
      {topFactors.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Financially Material Factors — Prioritise Disclosure</h4>
          <p className="text-xs text-gray-500">Maxwell Data FTSE100 Materiality Survey, March 2025 · Focus disclosure on high-materiality factors to improve investor signal quality.</p>
          <ul className="space-y-1.5 mt-1">
            {topFactors.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <div className="h-1.5 rounded-full bg-green-500/30" style={{ width: `${f.materiality_score * 60}px` }} />
                <span className="text-gray-700">{f.factor}</span>
                <span className="text-gray-500 text-xs">{(f.materiality_score * 100).toFixed(0)}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <Section
        title="Improvement Priorities"
        items={[
          "Strengthen third-party verification for all numeric ESG claims",
          "Align internal reporting baselines with external data to close divergence",
          "Commission independent audit of claims currently marked unverifiable",
        ]}
        accent="text-blue-400"
      />
    </div>
  )
}

function RegulatorView({ score }: { score: CompanyScore }) {
  const highSeverity = score.controversies.filter((c) => c.severity === "high")
  const contradicted = score.claims.filter((c) => c.verification_status === "contradicted")
  const totalFinesM = ((score.wem_inputs.labor_fines_usd_5y + score.wem_inputs.other_fines_usd_5y) / 1_000_000).toFixed(0)
  const ceoRatio = score.wem_inputs.ceo_pay_ratio
  const divergence = Math.abs((score.ratings[0]?.total ?? 0) - (score.ratings[1]?.total ?? 0))

  return (
    <div className="space-y-5">
      <Section
        title="Enforcement Risk Indicators"
        items={[
          `${highSeverity.length} high-severity incidents in 36-month lookback`,
          `${contradicted.length} ESG claims contradicted by independent data`,
          `Provider divergence: ${divergence.toFixed(1)} pts — ${divergence > 15 ? "significant mismatch between ESG branding and independent assessment" : "within normal range"}`,
          `Total regulatory fines (5yr): $${totalFinesM}M — WEM theft penalty: ${score.wem.d_theft.toFixed(1)}/40 pts`,
          `CEO-to-worker pay ratio: ${ceoRatio}:1 — ${ceoRatio > 200 ? "extreme inequality, well above 50:1 threshold" : ceoRatio > 100 ? "above 50:1 threshold" : "below regulatory concern threshold"}`,
        ]}
        accent="text-red-400"
      />
      {contradicted.length > 0 && (
        <Section
          title="Contradicted Claims (enforcement risk)"
          items={contradicted.map((c) => `[${c.category.toUpperCase()}] "${c.claim_text.slice(0, 80)}…" — ${c.verification_note.slice(0, 100)}`)}
          accent="text-red-400"
        />
      )}
      <Section
        title="Regulatory Parallels"
        items={[
          "Pattern resembles WisdomTree / BNY Mellon enforcement: marketing vs holdings mismatch",
          "EU SFDR Article 9 reclassification risk if impact KPIs cannot be substantiated",
          "FCA SDR: sustainability label claims require independent verification",
        ]}
        accent="text-gray-500"
      />
    </div>
  )
}

export function ActionPanel({ score, role }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-gray-800">Action Panel</h3>
        <span className="text-xs text-gray-500">— {ROLE_LABELS[role]} view</span>
      </div>

      <div className="card p-5">
        {role === "pm" && <PMView score={score} />}
        {role === "sustainability" && <SustainabilityView score={score} />}
        {role === "regulator" && <RegulatorView score={score} />}
      </div>
    </div>
  )
}
