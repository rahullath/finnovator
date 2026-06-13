from .models import Claim


def calculate_verification_score(claims: list[Claim]) -> float:
    """
    Scores the ratio of verifiable-to-contradicted ESG claims.
    Returns 0–100 where 100 = all claims independently verified.

    Formula: ((verified - contradicted) / total + 1) / 2 × 100
    Range: −1 (all contradicted) → +1 (all verified), normalised to 0–100.
    """
    if not claims:
        return 50.0

    verified = sum(1 for c in claims if c.verification_status == "verified")
    contradicted = sum(1 for c in claims if c.verification_status == "contradicted")
    total = len(claims)

    raw = (verified - contradicted) / total
    return round(((raw + 1) / 2) * 100, 1)


def count_by_status(claims: list[Claim]) -> dict:
    return {
        "verified": sum(1 for c in claims if c.verification_status == "verified"),
        "unverifiable": sum(1 for c in claims if c.verification_status == "unverifiable"),
        "contradicted": sum(1 for c in claims if c.verification_status == "contradicted"),
    }
