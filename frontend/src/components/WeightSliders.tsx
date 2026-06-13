import { useState } from "react"
import type { WeightConfig } from "../types"

interface Props {
  weights: WeightConfig
  onChange: (w: WeightConfig) => void
  loading?: boolean
}

const DESCRIPTIONS = {
  divergence: "Rating agreement across ESG providers — divergence means noisy signal (Berg et al.)",
  verification: "Share of specific ESG claims that are independently verified vs contradicted",
  controversy: "Clean news and enforcement record — recent high-severity incidents penalised",
}

export function WeightSliders({ weights, onChange, loading }: Props) {
  const [open, setOpen] = useState(false)

  const update = (key: keyof WeightConfig, value: number) => {
    const others = Object.keys(weights).filter((k) => k !== key) as (keyof WeightConfig)[]
    const remaining = 1 - value
    const otherTotal = others.reduce((s, k) => s + weights[k], 0)
    const newWeights = { ...weights, [key]: value }
    if (otherTotal > 0) {
      for (const k of others) {
        newWeights[k] = (weights[k] / otherTotal) * remaining
      }
    }
    onChange(newWeights)
  }

  const pct = (v: number) => `${Math.round(v * 100)}%`

  return (
    <div className="space-y-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-800 transition-colors"
      >
        <span className="font-mono text-xs bg-card border border-border px-1.5 py-0.5 rounded">
          {open ? "▼" : "▶"}
        </span>
        <span>Show formula & adjust weights</span>
        {loading && <span className="text-xs text-blue-400 animate-pulse">recalculating…</span>}
      </button>

      {open && (
        <div className="card p-4 space-y-4">
          <div className="flex items-start gap-2 text-xs text-gray-400 bg-gray-50 rounded-lg p-3 border border-border">
            <span className="text-blue-400 mt-0.5 shrink-0">ℹ</span>
            <span>
              Drag sliders to see how methodology choices change the Integrity Score — exactly what the{" "}
              <span className="text-gray-700 font-medium">MIT Aggregate Confusion project</span> shows about ESG rating arbitrariness.
              Weights auto-normalise to 100%.
            </span>
          </div>

          <div className="font-mono text-xs text-gray-500 bg-gray-50 rounded p-3 border border-border">
            Integrity Score = {pct(weights.divergence)} × RatingAgreement
            {" "}+ {pct(weights.verification)} × ClaimVerification
            {" "}+ {pct(weights.controversy)} × (1 − ControversyIntensity)
          </div>

          <div className="space-y-4">
            {(Object.keys(weights) as (keyof WeightConfig)[]).map((key) => (
              <div key={key} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-700 font-medium capitalize">{key}</span>
                  <span className="font-mono text-blue-400">{pct(weights[key])}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={Math.round(weights[key] * 100)}
                  onChange={(e) => update(key, Number(e.target.value) / 100)}
                  className="w-full accent-blue-500 h-1.5"
                />
                <p className="text-xs text-gray-500">{DESCRIPTIONS[key]}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
