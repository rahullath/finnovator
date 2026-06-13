"""
ESG claim extractor — uses Google Gemini Flash (free tier) via new google-genai SDK.
Free tier: 15 requests/minute, 1500/day.
Register: https://aistudio.google.com/

Falls back to empty list when GEMINI_API_KEY is absent.
"""
import os
import json

GEMINI_KEY = os.getenv("GEMINI_API_KEY", "")

CLAIM_PROMPT = """You are an ESG claims auditor. Extract specific, verifiable ESG claims from the provided filing text.

Return ONLY a valid JSON array. Each element must have exactly these fields:
  "claim_text": the exact claim as stated (string)
  "category": "environmental" | "social" | "governance"
  "verifiable_metric": what specific metric could verify or contradict this (string)
  "stated_value": the specific number, target, percentage, or date claimed (string)
  "verification_status": "unverifiable" — always set this; caller will update
  "verification_note": brief note on what independent data would confirm/deny (string)
  "source_filing": "10-K" or "20-F" (string)

Rules:
- Only include claims with a specific number, target, percentage, or date
- Ignore vague statements like "committed to sustainability"
- Maximum 8 claims per filing
- Return valid JSON array only, no markdown, no explanation"""

CONTROVERSY_PROMPT = """List the 5 most significant ESG controversies for {company} ({ticker}) between 2021 and 2024.
Include regulatory fines, environmental violations, labour disputes, greenwashing accusations, and legal settlements.
Be specific: include real dates, fine amounts where known, and the regulatory body involved.

Return ONLY a valid JSON array. Each element:
  "headline": short factual headline (string)
  "incident_date": "YYYY-MM-DD" format (string)
  "esg_category": "environmental" | "social" | "governance"
  "severity": "high" | "medium" | "low"
  "source_outlet": name of news outlet or regulatory body (string)

Return valid JSON array only, no markdown."""


MODELS = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.0-flash-lite"]


def _clean_json(raw: str) -> str:
    raw = raw.strip()
    if raw.startswith("```"):
        parts = raw.split("```")
        raw = parts[1] if len(parts) > 1 else raw
        if raw.startswith("json"):
            raw = raw[4:]
    return raw.strip()


def _gemini_client():
    from google import genai
    return genai.Client(api_key=GEMINI_KEY)


def _generate(client, model: str, contents: str, config=None) -> str:
    resp = client.models.generate_content(model=model, contents=contents, config=config)
    return resp.text


def _generate_with_fallback(contents: str, config=None) -> str | None:
    client = _gemini_client()
    for model in MODELS:
        try:
            return _generate(client, model, contents, config)
        except Exception as e:
            if "429" not in str(e) and "RESOURCE_EXHAUSTED" not in str(e):
                return None  # non-quota error, give up
    return None  # all models exhausted


async def extract_claims(filing_text: str) -> list[dict]:
    if not GEMINI_KEY:
        return []
    try:
        text = _generate_with_fallback(f"{CLAIM_PROMPT}\n\nExtract ESG claims from this filing:\n\n{filing_text[:40000]}")
        return json.loads(_clean_json(text)) if text else []
    except Exception:
        return []


async def fetch_controversies_for_company(company_name: str, ticker: str) -> list[dict]:
    """
    Use Gemini with Google Search grounding to get real ESG controversies.
    Returns list of dicts matching the Controversy Pydantic model.
    """
    if not GEMINI_KEY:
        return []
    try:
        from google.genai import types
        config = types.GenerateContentConfig(
            tools=[types.Tool(google_search=types.GoogleSearch())],
        )
        text = _generate_with_fallback(
            CONTROVERSY_PROMPT.format(company=company_name, ticker=ticker),
            config=config,
        )
        return json.loads(_clean_json(text)) if text else []
    except Exception:
        return []
