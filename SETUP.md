# Shared Setup & API Tests

## Pre-event checklist (do this before 13 June)

### Accounts to create (free)
- [ ] Financial Modeling Prep: https://financialmodelingprep.com/developer/docs — get free API key
- [ ] Supabase: https://supabase.com — create a project, save the URL + anon key
- [ ] Anthropic API: https://console.anthropic.com — get API key (you need credits, ~$5 is fine for 2 days)
- [ ] Vercel: https://vercel.com — for deployment

### No key needed (but test these work)
- SEC EDGAR: `curl "https://data.sec.gov/submissions/CIK0000320193.json"` → should return Apple's filings
- GDELT: `curl "https://api.gdeltproject.org/api/v2/doc/doc?query=BP+ESG&mode=artlist&maxrecords=5&format=json"`
- DefiLlama: `curl "https://api.llama.fi/protocols"` → should return protocol list

---

## Quick Supabase setup
```bash
# Install Supabase CLI
npm install -g supabase

# Or just use the dashboard at supabase.com
# Create project → get URL and anon key → add to .env
```

```env
# .env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
ANTHROPIC_API_KEY=your-key
FMP_API_KEY=your-fmp-key
```

---

## Boilerplate: Python data fetcher

```python
# shared/fetcher.py
import httpx
import os

ANTHROPIC_KEY = os.getenv("ANTHROPIC_API_KEY")
FMP_KEY = os.getenv("FMP_API_KEY")

async def fetch_esg_ratings(ticker: str) -> dict:
    """Fetch ESG ratings from FMP"""
    url = f"https://financialmodelingprep.com/api/v3/esg-environmental-social-governance-data"
    params = {"symbol": ticker, "apikey": FMP_KEY}
    async with httpx.AsyncClient() as client:
        r = await client.get(url, params=params)
        return r.json()

async def fetch_sec_filing_text(cik: str, form_type: str = "10-K") -> str:
    """Fetch latest filing text from SEC EDGAR"""
    # Get filing list
    url = f"https://data.sec.gov/submissions/CIK{cik.zfill(10)}.json"
    async with httpx.AsyncClient() as client:
        r = await client.get(url, headers={"User-Agent": "UKFinnovator smoothcriminals@team.com"})
        data = r.json()
    # Find latest 10-K
    filings = data["filings"]["recent"]
    for i, ft in enumerate(filings["form"]):
        if ft == form_type:
            accession = filings["accessionNumber"][i].replace("-", "")
            doc = filings["primaryDocument"][i]
            filing_url = f"https://www.sec.gov/Archives/edgar/data/{cik}/{accession}/{doc}"
            async with httpx.AsyncClient() as client:
                r = await client.get(filing_url, headers={"User-Agent": "UKFinnovator smoothcriminals@team.com"})
                return r.text[:50000]  # First 50k chars — enough for ESG sections
    return ""

async def fetch_gdelt_incidents(company: str, days: int = 90) -> list:
    """Fetch news incidents from GDELT"""
    query = f"{company} ESG sustainability controversy"
    url = "https://api.gdeltproject.org/api/v2/doc/doc"
    params = {
        "query": query,
        "mode": "artlist",
        "maxrecords": 20,
        "format": "json",
        "timespan": f"{days}d"
    }
    async with httpx.AsyncClient() as client:
        r = await client.get(url, params=params)
        data = r.json()
        return data.get("articles", [])

async def call_claude(system: str, user: str) -> str:
    """Call Claude API"""
    import anthropic
    client = anthropic.Anthropic(api_key=ANTHROPIC_KEY)
    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1000,
        system=system,
        messages=[{"role": "user", "content": user}]
    )
    return message.content[0].text
```

---

## Boilerplate: React frontend shell

```tsx
// App.tsx
import { useState } from "react"

export default function App() {
  const [query, setQuery] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    setLoading(true)
    const res = await fetch(`/api/score?ticker=${query}`)
    const data = await res.json()
    setResult(data)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-3xl font-bold mb-2">ESG Integrity Score</h1>
      <p className="text-gray-400 mb-8">How credible are a company's ESG claims?</p>
      
      <div className="flex gap-2 mb-8">
        <input
          className="bg-gray-800 border border-gray-700 rounded px-4 py-2 flex-1"
          placeholder="Enter ticker (e.g. AAPL, BP, SHEL)"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
        />
        <button
          className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded font-medium"
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? "Analysing..." : "Score"}
        </button>
      </div>

      {result && <ScoreCard result={result} />}
    </div>
  )
}

function ScoreCard({ result }: { result: any }) {
  const score = result.integrity_score
  const color = score > 70 ? "text-green-400" : score > 40 ? "text-yellow-400" : "text-red-400"
  
  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">{result.company_name}</h2>
          <p className="text-gray-400">{result.ticker}</p>
        </div>
        <div className="text-right">
          <div className={`text-5xl font-bold ${color}`}>{Math.round(score)}</div>
          <div className="text-gray-400 text-sm">Integrity Score</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <Metric label="Rating Divergence" value={result.divergence_score} invert />
        <Metric label="Claims Verified" value={result.verification_score} />
        <Metric label="Clean News" value={result.controversy_score} />
      </div>

      {result.claims && (
        <div>
          <h3 className="font-semibold mb-3 text-gray-300">ESG Claim Verification</h3>
          <div className="space-y-2">
            {result.claims.map((c: any, i: number) => (
              <ClaimRow key={i} claim={c} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Metric({ label, value, invert = false }: any) {
  const display = invert ? 100 - Math.round(value * 100) : Math.round(value * 100)
  return (
    <div className="bg-gray-800 rounded-lg p-3">
      <div className="text-xl font-bold">{display}</div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  )
}

function ClaimRow({ claim }: any) {
  const icons: any = { verified: "✓", unverifiable: "?", contradicted: "✗" }
  const colors: any = { verified: "text-green-400", unverifiable: "text-yellow-400", contradicted: "text-red-400" }
  return (
    <div className="flex items-start gap-3 text-sm py-2 border-b border-gray-800">
      <span className={`font-bold ${colors[claim.verification_status]} mt-0.5`}>
        {icons[claim.verification_status]}
      </span>
      <span className="text-gray-300">{claim.claim_text}</span>
      <span className="text-gray-500 text-xs ml-auto whitespace-nowrap">{claim.category}</span>
    </div>
  )
}
```

---

## Python dependencies
```
# requirements.txt
httpx
anthropic
supabase
fastapi
uvicorn
python-dotenv
yfinance
beautifulsoup4
lxml
```

## Node dependencies
```json
{
  "dependencies": {
    "react": "^18",
    "typescript": "^5",
    "@supabase/supabase-js": "^2",
    "tailwindcss": "^3"
  }
}
```
