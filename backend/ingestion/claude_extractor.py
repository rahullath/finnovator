"""
Claude API claim extractor — used for live analysis of new companies.
For pre-baked demo companies, the claims CSV is used directly.

Requires ANTHROPIC_API_KEY in environment.
"""
import os
import json
import anthropic

SYSTEM_PROMPT = """You are an ESG claims auditor.
Extract specific, verifiable ESG claims from the provided filing text.
Return ONLY a JSON array. Each element must have these exact fields:
  - claim_text: the exact claim as stated
  - category: "environmental" | "social" | "governance"
  - verifiable_metric: what specific metric could verify or contradict this
  - stated_value: the specific number, target, or date claimed

Rules:
- Only include claims with a specific number, target, percentage, or date
- Ignore vague statements like "we are committed to sustainability"
- Ignore forward-looking aspirations with no specific metric
- Maximum 8 claims per filing
- Return valid JSON array, nothing else"""


async def extract_claims(filing_text: str) -> list[dict]:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return []

    client = anthropic.Anthropic(api_key=api_key)
    try:
        message = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1500,
            system=SYSTEM_PROMPT,
            messages=[{
                "role": "user",
                "content": f"Extract ESG claims from this filing:\n\n{filing_text[:40000]}"
            }],
        )
        raw = message.content[0].text.strip()
        # Strip markdown code fences if present
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        return json.loads(raw)
    except Exception:
        return []
