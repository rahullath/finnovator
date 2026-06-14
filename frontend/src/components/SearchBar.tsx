import { useState, useEffect, useRef } from "react"

export interface FTSESearchResult {
  ticker: string
  name: string
  industry: string
  sector: string
  has_full_score: boolean
}

interface Props {
  allCompanies: FTSESearchResult[]
  onSelect: (ticker: string) => void
  selectedTicker: string
}

export function SearchBar({ allCompanies, onSelect, selectedTicker }: Props) {
  const [query, setQuery]   = useState("")
  const [open, setOpen]     = useState(false)
  const [focused, setFocused] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const filtered = query.trim()
    ? allCompanies.filter(c =>
        c.ticker.toLowerCase().includes(query.toLowerCase()) ||
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.industry.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10)
    : allCompanies.slice(0, 10)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false); setFocused(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const selected = allCompanies.find(c => c.ticker === selectedTicker)

  function handleSelect(ticker: string) {
    setQuery(""); setOpen(false); setFocused(false); onSelect(ticker)
  }

  return (
    <div ref={ref} className="relative flex-1 max-w-[440px]">
      {/* Input */}
      <div
        className="flex items-center gap-2 rounded-lg px-3"
        style={{
          background: "#fafafa",
          border: `1px solid ${focused ? "#c7c7c7" : "#ededed"}`,
        }}
      >
        <span className="text-whisper text-sm font-mono shrink-0">⌕</span>
        <input
          type="text"
          placeholder={selected ? `${selected.ticker}: ${selected.name}` : "Search by name or ticker (e.g. BP, Barclays, Tesco)"}
          value={query}
          onFocus={() => { setOpen(true); setFocused(true) }}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          className="flex-1 border-none bg-transparent py-2.5 text-[13.5px] text-ink focus:outline-none placeholder-whisper"
        />
        <span className="font-mono text-xs text-whisper shrink-0">{allCompanies.length} cos</span>
      </div>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute top-[46px] left-0 right-0 z-50 overflow-hidden"
          style={{ background: "#fff", border: "1px solid #e4e4e4", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
        >
          {filtered.length === 0 ? (
            <div className="px-4 py-3.5 text-[13px] text-faint">No company in the coverage universe matches that.</div>
          ) : (
            filtered.map((c, i) => (
              <button
                key={c.ticker}
                onClick={() => handleSelect(c.ticker)}
                className="flex items-center gap-3 w-full text-left px-4 py-2.5 hover:bg-secondary transition-colors"
                style={{ borderTop: i > 0 ? "1px solid #f0f0f0" : "none" }}
              >
                <span className="font-mono text-xs font-semibold text-ink w-16 shrink-0 text-left">{c.ticker}</span>
                <span className="flex-1 text-[13px] text-ink truncate">{c.name}</span>
                <span className="text-xs text-faint shrink-0 truncate max-w-[120px]">{c.industry}</span>
                {c.has_full_score && (
                  <span className="shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ background: "#3ecf8e", color: "#fff" }}>full</span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
