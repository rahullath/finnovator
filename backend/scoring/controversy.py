from datetime import datetime, date
from .models import Controversy

SEVERITY_WEIGHTS = {"high": 2.0, "medium": 1.0, "low": 0.4}
LOOKBACK_MONTHS = 36


def calculate_controversy_score(controversies: list[Controversy]) -> float:
    """
    Returns 0–100 where 100 = no controversies (clean record).
    Recent and severe incidents are weighted more heavily.
    Each weighted incident reduces the score; 5+ heavily-weighted incidents ≈ 0.
    """
    if not controversies:
        return 100.0

    now = datetime.now()
    weighted_total = 0.0

    for c in controversies:
        try:
            incident_date = datetime.strptime(c.incident_date, "%Y-%m-%d")
        except ValueError:
            continue

        months_ago = (now - incident_date).days / 30.0
        if months_ago > LOOKBACK_MONTHS:
            continue

        recency_weight = 1.0 - (months_ago / LOOKBACK_MONTHS) * 0.5
        severity_weight = SEVERITY_WEIGHTS.get(c.severity, 1.0)
        weighted_total += recency_weight * severity_weight

    # 10 weighted-incident-points → score of 0
    score = max(0.0, 100.0 - (weighted_total * 10.0))
    return round(score, 1)
