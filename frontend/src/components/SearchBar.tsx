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

const SECTOR_COLORS: Record<string, string> = {
  energy: "bg-amber-100 text-amber-800",
  consumer: "bg-green-100 text-green-800",
  financials: "bg-blue-100 text-blue-800",
  technology: "bg-purple-100 text-purple-800",
  defence: "bg-red-100 text-red-800",
  industrial: "bg-orange-100 text-orange-800",
  media: "bg-pink-100 text-pink-800",
  utilities: "bg-teal-100 text-teal-800",
  healthcare: "bg-cyan-100 text-cyan-800",
}

function sectorColor(sector: string): string {
  return SECTOR_COLORS[sector.toLowerCase()] ?? "bg-gray-100 text-gray-700"
}

export function SearchBar({ allCompanies, onSelect, selectedTicker }: Props) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const filtered = query.trim()
    ? allCompanies.filter(
        (c) =>
          c.ticker.toLowerCase().includes(query.toLowerCase()) ||
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.industry.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10)
    : allCompanies.slice(0, 10)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  const selected = allCompanies.find((c) => c.ticker === selectedTicker)

  function handleSelect(ticker: string) {
    setQuery("")
    setOpen(false)
    onSelect(ticker)
  }

  return (
    <div ref={ref} className="relative w-72">
      {/* Input */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder={selected ? `${selected.name} (${selected.ticker})` : "Search FTSE 100…"}
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-border rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-forest-600/20 focus:border-forest-600 shadow-sm"
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-border rounded-xl shadow-card-hover z-50 overflow-hidden max-h-80 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">No results found</div>
          ) : (
            <>
              <div className="px-3 pt-2 pb-1">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">
                  {query ? `${filtered.length} results` : "All FTSE 100 companies"}
                </p>
              </div>
              {filtered.map((c) => (
                <button
                  key={c.ticker}
                  onClick={() => handleSelect(c.ticker)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 text-left transition-colors ${
                    c.ticker === selectedTicker ? "bg-forest-50" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-gray-700">{c.ticker}</span>
                      {c.has_full_score && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-forest-100 text-forest-800 font-medium">Full analysis</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-900 truncate">{c.name}</p>
                    <p className="text-xs text-gray-500 truncate">{c.industry}</p>
                  </div>
                  <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${sectorColor(c.sector)}`}>
                    {c.sector}
                  </span>
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}
