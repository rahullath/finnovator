"""
CEO-to-worker pay ratio importer.
Source: SEC DEF 14A (proxy statements, mandated since 2017 Item 402(u))
Shortcut: PlainCEOPay aggregator — https://plainceopay.com

For US tickers we attempt the PlainCEOPay lookup.
Non-US companies (BP, SHEL, etc.) fall back to wem_inputs.csv which
has ratios from public annual reports.
"""
import httpx
from bs4 import BeautifulSoup

US_TICKERS = {"XOM", "AMZN"}


class CEOPayIngestor:
    def fetch(self, ticker: str) -> dict:
        if ticker not in US_TICKERS:
            return {"status": "csv_fallback", "reason": "Non-US company; using annual report data"}
        try:
            return self._fetch_plainceopay(ticker)
        except Exception as e:
            return {"status": "csv_fallback", "reason": str(e)}

    def _fetch_plainceopay(self, ticker: str) -> dict:
        with httpx.Client(timeout=10.0, follow_redirects=True) as client:
            r = client.get(f"https://plainceopay.com/company/{ticker.lower()}")
            if r.status_code != 200:
                return {"status": "csv_fallback", "reason": f"HTTP {r.status_code}"}

        soup = BeautifulSoup(r.text, "html.parser")
        ratio_el = soup.select_one("[data-ratio], .pay-ratio, .ceo-ratio")
        if not ratio_el:
            return {"status": "csv_fallback", "reason": "ratio element not found"}

        try:
            ratio = float(ratio_el.get_text(strip=True).replace(":", "").replace("x", ""))
            return {"status": "ok", "ticker": ticker, "ceo_pay_ratio": ratio}
        except ValueError:
            return {"status": "csv_fallback", "reason": "could not parse ratio value"}
