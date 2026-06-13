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
          <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
            <span className={`shrink-0 mt-0.5 ${accent ?? "text-gray-500"}`}>—</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function PMView({ score }: { score: CompanyScore }) {
  const { integrity, impact, quadrant } = score
  const topKPI = [...score.impact.kpis].sort((a, b) => b.materiality_weight - a.materiality_weight).slice(0, 3)

  return (
    <div className="space-y-5">
      <Section
        title="Signal Quality Assessment"
        items={[
          `Integrity: ${Math.round(integrity.integrity_score)}/100 — ${integrity.integrity_score >= 70 ? "reliable signal" : integrity.integrity_score >= 50 ? "moderate confidence" : "low confidence, treat with caution"}`,
          `Impact Alignment: ${Math.round(impact.impact_score)}/100 — ${impact.impact_score >= 70 ? "strong real-world progress" : impact.impact_score >= 50 ? "moderate performance" : "lagging sector on material KPIs"}`,
          `Recommended action: ${quadrant.action_label}`,
        ]}
        accent="text-blue-400"
      />
      <Section
        title="Top 3 Material Factors (this sector)"
        items={topKPI.map((k) => `${k.kpi_label}: score ${k.kpi_score}/100 (${k.trend})`)}
        accent="text-gray-500"
      />
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

  return (
    <div className="space-y-5">
      <Section
        title="Disclosure Integrity"
        items={[
          `${claimed} specific ESG claims analysed from filings`,
          `${verified} verified against independent data (${Math.round(verified / claimed * 100)}%)`,
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

  return (
    <div className="space-y-5">
      <Section
        title="Enforcement Risk Indicators"
        items={[
          `${highSeverity.length} high-severity incidents in 36-month lookback`,
          `${contradicted.length} ESG claims contradicted by independent data`,
          `Provider divergence: ${Math.abs((score.ratings[0]?.total ?? 0) - (score.ratings[1]?.total ?? 0)).toFixed(1)} pts — ${score.ratings[0]?.total > 60 && Math.abs((score.ratings[0]?.total ?? 0) - (score.ratings[1]?.total ?? 0)) > 15 ? "significant mismatch between high ESG branding and independent assessment" : "within normal range"}`,
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
        <h3 className="text-sm font-semibold text-gray-200">Action Panel</h3>
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
