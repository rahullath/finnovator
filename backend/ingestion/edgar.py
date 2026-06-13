"""
SEC EDGAR API wrapper — no key required, 10 req/s limit.
Used to fetch filing text for LLM claim extraction.
"""
import httpx

EDGAR_BASE = "https://data.sec.gov"
HEADERS = {"User-Agent": "UKFinnovator hackathon@team.imperial.ac.uk"}

TICKER_TO_CIK = {
    "BP": "0000313807",
    "SHEL": "0001306965",
    "XOM": "0000034088",
    "TTE": "0001141309",
    "AMZN": "0001018724",
}


async def fetch_filing_text(ticker: str, form_type: str = "10-K") -> str | None:
    cik = TICKER_TO_CIK.get(ticker.upper())
    if not cik:
        return None

    async with httpx.AsyncClient(timeout=15.0, headers=HEADERS) as client:
        r = await client.get(f"{EDGAR_BASE}/submissions/CIK{cik.zfill(10)}.json")
        if r.status_code != 200:
            return None
        data = r.json()

    filings = data.get("filings", {}).get("recent", {})
    forms = filings.get("form", [])
    accessions = filings.get("accessionNumber", [])
    docs = filings.get("primaryDocument", [])

    for i, form in enumerate(forms):
        if form == form_type:
            accession = accessions[i].replace("-", "")
            doc = docs[i]
            filing_url = f"https://www.sec.gov/Archives/edgar/data/{int(cik)}/{accession}/{doc}"
            async with httpx.AsyncClient(timeout=20.0, headers=HEADERS) as client:
                r = await client.get(filing_url)
                if r.status_code == 200:
                    return r.text[:60000]  # First 60k chars covers ESG sections
    return None
