"""
GDELT API wrapper — free, no key required.
Used to fetch ESG-related news incidents for controversy scoring.
"""
import httpx

GDELT_BASE = "https://api.gdeltproject.org/api/v2/doc/doc"


async def fetch_controversies(company_name: str, days: int = 365) -> list[dict]:
    query = f'"{company_name}" (ESG OR greenwashing OR sustainability OR "climate" OR "environmental" OR controversy)'
    params = {
        "query": query,
        "mode": "artlist",
        "maxrecords": 25,
        "format": "json",
        "timespan": f"{days}d",
        "sort": "DateDesc",
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get(GDELT_BASE, params=params)
            if r.status_code != 200:
                return []
            data = r.json()
            return data.get("articles", [])
    except Exception:
        return []
