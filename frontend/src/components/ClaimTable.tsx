import { useState } from "react"
import type { Claim } from "../types"

interface Props {
  claims: Claim[]
}

const STATUS_CONFIG = {
  verified:     { icon: "✓", label: "Verified",      class: "text-green-400 bg-green-500/10 border-green-500/20" },
  unverifiable: { icon: "?", label: "Unverifiable",  class: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20" },
  contradicted: { icon: "✗", label: "Contradicted",  class: "text-red-400 bg-red-500/10 border-red-500/20" },
}

export function ClaimTable({ claims }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null)

  const counts = {
    verified: claims.filter((c) => c.verification_status === "verified").length,
    unverifiable: claims.filter((c) => c.verification_status === "unverifiable").length,
    contradicted: claims.filter((c) => c.verification_status === "contradicted").length,
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-200">ESG Claim Verification</h3>
        <div className="flex gap-3 text-xs">
          <span className="text-green-400">{counts.verified} verified</span>
          <span className="text-yellow-400">{counts.unverifiable} unverifiable</span>
          <span className="text-red-400">{counts.contradicted} contradicted</span>
        </div>
      </div>

      <div className="text-xs text-gray-500 px-1">
        Claims extracted from company filings and cross-referenced against independent data.
        AI role: extraction only. Verification logic is explicit rule-based matching.
      </div>

      <div className="space-y-1.5">
        {claims.map((claim, i) => {
          const cfg = STATUS_CONFIG[claim.verification_status]
          const isExpanded = expanded === i
          return (
            <div
              key={i}
              className="card overflow-hidden cursor-pointer hover:border-gray-600 transition-colors"
              onClick={() => setExpanded(isExpanded ? null : i)}
            >
              <div className="flex items-start gap-3 p-3">
                <span className={`shrink-0 mt-0.5 w-6 h-6 rounded border flex items-center justify-center text-xs font-bold ${cfg.class}`}>
                  {cfg.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-200 leading-snug">{claim.claim_text}</p>
                  <p className="text-xs text-gray-500 mt-1">{claim.source_filing}</p>
                </div>
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.class}`}>
                  {cfg.label}
                </span>
              </div>
              {isExpanded && (
                <div className="border-t border-border bg-surface px-4 py-3 space-y-2">
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Stated value: </span>
                    <span className="text-xs text-gray-300 font-mono">{claim.stated_value}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 uppercase tracking-wide">Verification note: </span>
                    <span className="text-xs text-gray-300">{claim.verification_note}</span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
