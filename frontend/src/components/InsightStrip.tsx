// Auto-generated insight cards from score + profile data.
// Shows 3-4 findings a non-expert can immediately understand.

import type { CompanyScore, FTSEProfile } from "../types"

interface Insight {
  label: string
  text:  string
  color: string
}

function buildInsights(score: CompanyScore | null, profile: FTSEProfile | null): Insight[] {
  const out: Insight[] = []

  if (score) {
    // 1 — Greenwashing / placebo risk
    const pi = score.placebo_index
    const wem = Math.round(score.wem.wem_score)
    const esg = Math.round(score.esg_score_avg)
    if (pi >= 0.65) {
      out.push({
        label: "High greenwashing risk",
        text:  `The ESG score (${esg}) is ${esg - wem} points above the harm score (${wem}). In plain terms: the company looks good on paper but the underlying evidence on carbon, fines, and pay gaps tells a different story. Investors relying on the headline ESG rating alone may be taking on more risk than they realise.`,
        color: "#c0492f",
      })
    } else if (pi >= 0.4) {
      out.push({
        label: "ESG score and real-world data diverge",
        text:  `The ESG score (${esg}) and harm score (${wem}) are ${Math.abs(esg - wem)} points apart. Some public claims could not be verified or were contradicted by external data. Worth looking at the detail before acting on the headline rating.`,
        color: "#8a6d2f",
      })
    } else {
      out.push({
        label: "ESG signals look consistent",
        text:  `The ESG score (${esg}), signal quality score (${Math.round(score.integrity.integrity_score)}), and harm score (${wem}) all point in the same direction. The public narrative broadly matches the underlying data, which is not always the case.`,
        color: "#2f7d8a",
      })
    }

    // 2 — Integrity signal
    const int = Math.round(score.integrity.integrity_score)
    const divOk  = score.integrity.divergence_score >= 60
    const contOk = score.integrity.controversy_score >= 60
    const verOk  = score.integrity.verification_score >= 60
    if (int < 50) {
      const reasons: string[] = []
      if (!divOk)  reasons.push(`different rating agencies give very different scores`)
      if (!contOk) reasons.push(`${score.controversies.length} documented incidents in the past 3 years`)
      if (!verOk)  reasons.push(`most public claims could not be independently verified`)
      out.push({
        label: "Low confidence in the data",
        text:  `Signal quality: ${int}/100. Problems found: ${reasons.join("; ")}. Different ESG providers appear to be measuring quite different things for this company, so no single score should be taken at face value.`,
        color: "#c0492f",
      })
    } else if (int >= 72) {
      out.push({
        label: "Data quality is solid",
        text:  `Signal quality: ${int}/100. Rating agencies broadly agree with each other, more claims are verified than contradicted, and the company has a clean recent track record. The ESG story here is more trustworthy than average.`,
        color: "#2f7d8a",
      })
    }
  }

  if (profile) {
    // 3 — Biggest driver divergence from sector
    const sorted = [...profile.top_8_drivers].sort((a, b) => Math.abs(b.deviation_from_peer) - Math.abs(a.deviation_from_peer))
    const top = sorted[0]
    if (top && Math.abs(top.deviation_from_peer) > 0.05) {
      const pts  = Math.round(Math.abs(top.deviation_from_peer) * 100)
      const more = top.deviation_from_peer > 0 ? "above" : "below"
      const dir  = top.direction_3m === "leading" ? "and trending higher" : top.direction_3m === "lagging" ? "and trending lower" : "with stable momentum"
      out.push({
        label: `Biggest difference from peers: ${top.driver}`,
        text:  `This company is ${pts} points ${more} the sector average on ${top.driver}, ${dir}. ${top.layman_explanation}`,
        color: top.deviation_from_peer > 0 ? "#2f7d8a" : "#8a6d2f",
      })
    }

    // 4 — Momentum signal
    const leading = profile.top_8_drivers.filter(d => d.direction_3m === "leading")
    const lagging  = profile.top_8_drivers.filter(d => d.direction_3m === "lagging")
    if (lagging.length >= 2 && lagging.length >= leading.length) {
      out.push({
        label: `${lagging.length} material drivers deteriorating`,
        text:  `${lagging.map(d => d.driver).join(", ")} are all moving in the wrong direction. When multiple risk areas deteriorate at the same time, ESG rating downgrades tend to follow. That risk is not yet priced into the headline score.`,
        color: "#c0492f",
      })
    } else if (leading.length >= 2 && leading.length >= lagging.length) {
      out.push({
        label: `${leading.length} material drivers improving`,
        text:  `${leading.map(d => d.driver).join(", ")} are all moving in the right direction. Improvements across several areas at once often come before an ESG rating upgrade, which can lower borrowing costs and attract more ESG-focused investors.`,
        color: "#2f7d8a",
      })
    }
  }

  return out.slice(0, 3)
}

interface Props {
  score:   CompanyScore | null
  profile: FTSEProfile | null
}

export function InsightStrip({ score, profile }: Props) {
  const insights = buildInsights(score, profile)
  if (insights.length === 0) return null

  return (
    <div className="space-y-0">
      <div className="label-upper mb-2.5">Key findings</div>
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${insights.length}, 1fr)` }}>
        {insights.map((ins, i) => (
          <div
            key={i}
            className="rounded-xl p-4"
            style={{ background: "#fff", border: "1px solid #ededed", borderLeft: `3px solid ${ins.color}` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[12.5px] font-semibold" style={{ color: "#171717" }}>{ins.label}</span>
            </div>
            <p className="text-[12px] leading-relaxed" style={{ color: "#3a3a3a" }}>{ins.text}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
