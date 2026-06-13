"""
Financial Modeling Prep API wrapper.
Free tier: 250 requests/day. Register at https://financialmodelingprep.com/developer/docs
"""
import os
import httpx

FMP_KEY = os.getenv("FMP_API_KEY", "")
BASE_URL = "https://financialmodelingprep.com/api/v3"


async def fetch_esg_ratings(ticker: str) -> dict | None:
    if not FMP_KEY:
        return None
    url = f"{BASE_URL}/esg-environmental-social-governance-data"
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.get(url, params={"symbol": ticker, "apikey": FMP_KEY})
        if r.status_code != 200:
            return None
        data = r.json()
        return data[0] if data else None


async def fetch_company_profile(ticker: str) -> dict | None:
    if not FMP_KEY:
        return None
    url = f"{BASE_URL}/profile/{ticker}"
    async with httpx.AsyncClient(timeout=10.0) as client:
        r = await client.get(url, params={"apikey": FMP_KEY})
        if r.status_code != 200:
            return None
        data = r.json()
        return data[0] if data else None
