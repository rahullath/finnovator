// Navigator-style peer card grid + divergence narrative.
// Clicking a non-self card fires onSelectPeer(ticker) for the comparison panel.

interface PeerDriver { label: string; score: number }

interface PeerCard {
  ticker:    string
  sasb:      string
  isSelf:    boolean
  top3:      PeerDriver[]
}

interface Props {
  cards:          PeerCard[]
  sectorLabel:    string
  companyName:    string
  selfTicker:     string
  selectedPeer?:  string | null
  onSelectPeer?:  (ticker: string) => void
  explain:        string
  academic:       string
}

export function PeerCards({
  cards, sectorLabel, companyName, selfTicker,
  selectedPeer, onSelectPeer, explain, academic,
}: Props) {
  return (
    <div>
      <div className="flex items-baseline gap-3 mb-1.5 flex-wrap">
        <h2 className="text-[19px] font-semibold tracking-tight">Compare with another company</h2>
        <span className="text-[12.5px]" style={{ color: "#9a9a9a" }}>{cards.length} companies · click any card to compare</span>
      </div>
      <p className="text-[13px] mb-5" style={{ color: "#707070", lineHeight: 1.55 }}>
        Each card shows the 3 topics that most affect that company's stock price. Click any card to see a full side-by-side comparison with explanations.
      </p>

      {/* Cards grid */}
      <div className="grid gap-3 mb-5" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(192px,1fr))" }}>
        {cards.map(p => {
          const isSelected = !p.isSelf && selectedPeer === p.ticker
          return (
            <div
              key={p.ticker}
              className="rounded-xl p-4 transition-all"
              onClick={() => !p.isSelf && onSelectPeer?.(p.ticker)}
              style={{
                border: `1px solid ${p.isSelf ? "#171717" : isSelected ? "#3ecf8e" : "#ededed"}`,
                background: p.isSelf ? "#fafafa" : isSelected ? "rgba(62,207,142,0.06)" : "#fff",
                cursor: p.isSelf ? "default" : "pointer",
                boxShadow: isSelected ? "0 0 0 2px rgba(62,207,142,0.25)" : undefined,
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs font-semibold" style={{ color: "#171717" }}>{p.ticker}</span>
                {p.isSelf && (
                  <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#3ecf8e", color: "#fff" }}>
                    viewing
                  </span>
                )}
                {isSelected && (
                  <span className="text-[9.5px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#171717", color: "#fff" }}>
                    comparing
                  </span>
                )}
              </div>
              <div className="text-[11px] mb-3" style={{ color: "#9a9a9a" }}>{p.sasb}</div>
              <div className="flex flex-col gap-2">
                {p.top3.map(t => (
                  <div key={t.label}>
                    <div className="flex items-baseline justify-between gap-1.5 mb-1">
                      <span className="text-[11.5px] leading-tight" style={{ color: "#212121" }}>{t.label}</span>
                      <span className="font-mono text-[10.5px] shrink-0" style={{ color: "#707070" }}>{t.score.toFixed(2)}</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: "#f0f0f0" }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${t.score * 100}%`, background: p.isSelf ? "#171717" : isSelected ? "#3ecf8e" : "#c7c7c7" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {!p.isSelf && (
                <p className="text-[10px] mt-3" style={{ color: isSelected ? "#3ecf8e" : "#b2b2b2" }}>
                  {isSelected ? "← comparison below" : "click to compare →"}
                </p>
              )}
            </div>
          )
        })}
      </div>

      {/* Why-divergence callout */}
      <div className="rounded-xl p-6" style={{ background: "#1c1c1c" }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#3ecf8e", display: "block" }} />
          <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: "#9a9a9a" }}>
            Why these differences matter
          </span>
        </div>
        <p className="text-[14.5px] mb-3" style={{ color: "#ededed", lineHeight: 1.6, maxWidth: 820 }}>{explain}</p>
        <p className="text-[12.5px]" style={{ color: "#9a9a9a", lineHeight: 1.6, maxWidth: 820 }}>{academic}</p>
      </div>
    </div>
  )
}
