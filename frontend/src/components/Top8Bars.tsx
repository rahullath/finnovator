// Navigator-style top-8 material drivers chart.
// Horizontal bars: company score (filled), peer avg (vertical marker), score label.

interface Driver {
  driver:           string
  pillar:           string   // E | S | G
  label:            string   // short label
  score:            number   // 0–1
  peerAvg:          number | null
  rank:             number
  coverageLabel:    string
  devLabel:         string
  devColor:         string
  direction:        "leading" | "stable" | "lagging"
}

interface Props {
  drivers:     Driver[]
  ticker:      string
  peerLabel:   string   // e.g. "4 peers"
}

const PILLAR_BG: Record<string, string> = {
  E: "#2f7d8a",
  S: "#7a5ea8",
  G: "#8a6d2f",
}

const DIR_STYLE: Record<string, { color: string; bg: string; arrow: string }> = {
  leading: { color: "#2f7d8a", bg: "rgba(47,125,138,0.10)", arrow: "↑" },
  stable:  { color: "#707070", bg: "#f4f4f4",               arrow: "→" },
  lagging: { color: "#c0492f", bg: "rgba(192,73,47,0.10)",  arrow: "↓" },
}

export function Top8Bars({ drivers, ticker, peerLabel }: Props) {
  return (
    <div>
      {/* Legend */}
      <div className="flex items-baseline justify-between gap-4 flex-wrap mb-2">
        <h2 className="text-[19px] font-semibold tracking-tight">Top 8 material factors vs sector peers</h2>
        <div className="flex items-center gap-4 text-xs" style={{ color: "#9a9a9a" }}>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-2 rounded-sm" style={{ background: "#171717" }} />
            {ticker}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-0.5 h-3" style={{ background: "#9a9a9a" }} />
            peer avg ({peerLabel})
          </span>
        </div>
      </div>
      <p className="text-[13px] mb-5" style={{ color: "#707070", lineHeight: 1.5 }}>
        Financial-materiality score per driver (0–1), from the Maxwell Data FTSE 100 survey.
        The marker is the average across same-sector peers that also score the driver.
      </p>

      {/* Rows */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #ededed" }}>
        {drivers.map((d, i) => {
          const barPct   = d.score * 100
          const mrkPct   = d.peerAvg != null ? d.peerAvg * 100 : null
          const scoreIn  = barPct > 40
          const dir      = DIR_STYLE[d.direction]

          return (
            <div
              key={d.driver}
              className="grid items-center gap-3.5"
              style={{
                gridTemplateColumns: "28px 200px 1fr 96px",
                padding: "13px 18px",
                borderTop: i === 0 ? "none" : "1px solid #f4f4f4",
              }}
            >
              {/* Pillar badge */}
              <span
                className="inline-flex items-center justify-center w-5 h-5 rounded text-xs font-bold text-white shrink-0"
                style={{ background: PILLAR_BG[d.pillar] ?? "#9a9a9a" }}
              >
                {d.pillar}
              </span>

              {/* Label */}
              <div className="min-w-0">
                <div className="text-[13px] font-medium" style={{ color: "#171717", lineHeight: 1.2 }}>{d.label}</div>
                <div className="font-mono text-[10.5px] mt-0.5" style={{ color: "#9a9a9a" }}>
                  rank {d.rank} · {d.coverageLabel}
                </div>
              </div>

              {/* Bar */}
              <div className="relative h-[22px] rounded-md" style={{ background: "#f6f6f6" }}>
                {/* Fill */}
                <div
                  className="absolute inset-y-0 left-0 rounded-md"
                  style={{ width: `${barPct}%`, background: "#171717" }}
                />
                {/* Peer marker */}
                {mrkPct != null && (
                  <div
                    className="absolute top-[-3px] bottom-[-3px] w-[2px]"
                    style={{ left: `${mrkPct}%`, background: "#9a9a9a" }}
                  />
                )}
                {/* Score label */}
                <span
                  className="absolute top-1/2 -translate-y-1/2 right-2 font-mono text-[11px] font-semibold"
                  style={{ color: scoreIn ? "#fff" : "#171717" }}
                >
                  {d.score.toFixed(3)}
                </span>
              </div>

              {/* Deviation + direction */}
              <div className="flex items-center justify-end gap-2 shrink-0">
                <span className="font-mono text-xs font-semibold" style={{ color: d.devColor }}>{d.devLabel}</span>
                <span
                  className="text-[10.5px] font-semibold px-2 py-0.5 rounded-md"
                  style={{ color: dir.color, background: dir.bg }}
                >
                  {dir.arrow}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
