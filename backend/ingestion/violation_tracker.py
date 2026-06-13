"""
Violation Tracker Global wrapper.
Source: https://violationtrackerglobal.goodjobsfirst.org
Open data — no API key required. Python scraper approach.

Returns 5-year total fines split by category:
  labor_fines    — wage & hour, labour, health & safety violations
  other_fines    — environmental, consumer protection, financial, other

Falls back to wem_inputs.csv values when scraping fails.

Reference scraper pattern: https://github.com/chenyangfinance/violation_tracker
"""
import httpx
from bs4 import BeautifulSoup

BASE_URL = "https://violationtrackerglobal.goodjobsfirst.org"

LABOR_CATEGORIES = {"labor relations", "wage and hour", "workplace safety and health"}


class ViolationTrackerIngestor:
    def fetch(self, ticker: str) -> dict:
        try:
            return self._scrape(ticker)
        except Exception as e:
            return {"status": "csv_fallback", "reason": str(e)}

    def _scrape(self, ticker: str) -> dict:
        # Company name lookup — Violation Tracker uses company name, not ticker
        name_map = {
            "BP": "BP", "SHEL": "Shell", "ORSTED": "Orsted",
            "XOM": "ExxonMobil", "TTE": "TotalEnergies",
            "ULVR": "Unilever", "NESN": "Nestle", "AMZN": "Amazon",
        }
        company_name = name_map.get(ticker)
        if not company_name:
            return {"status": "csv_fallback", "reason": f"No name mapping for {ticker}"}

        with httpx.Client(timeout=15.0, follow_redirects=True) as client:
            r = client.get(
                f"{BASE_URL}/parent-company-summary",
                params={"company": company_name, "year_introduced": 5},
            )
            if r.status_code != 200:
                return {"status": "csv_fallback", "reason": f"HTTP {r.status_code}"}

        soup = BeautifulSoup(r.text, "html.parser")
        labor_fines = 0.0
        other_fines = 0.0

        for row in soup.select("table tbody tr"):
            cols = [c.get_text(strip=True) for c in row.find_all("td")]
            if len(cols) < 3:
                continue
            category = cols[1].lower()
            try:
                amount = float(cols[2].replace("$", "").replace(",", ""))
            except ValueError:
                continue
            if category in LABOR_CATEGORIES:
                labor_fines += amount
            else:
                other_fines += amount

        return {
            "status": "ok",
            "company": company_name,
            "labor_fines_usd_5y": labor_fines,
            "other_fines_usd_5y": other_fines,
        }
