from .models import ESGRating


def calculate_divergence_score(ratings: list[ESGRating]) -> float:
    """
    Measures agreement across ESG rating providers.
    High spread → low score (signal is unreliable).
    Returns 0–100 where 100 = perfect agreement.

    Grounded in Berg et al. (2022): most ESG disagreement stems from
    measurement and scope differences, so divergence = noisy signal.
    """
    if len(ratings) < 2:
        return 50.0  # neutral if only one source

    totals = [r.total for r in ratings]
    spread = max(totals) - min(totals)

    # 50-point spread is treated as maximum meaningful divergence
    # (Berg et al. show typical spreads of 20–45 points between major raters)
    normalized_spread = min(spread / 50.0, 1.0)
    return round((1 - normalized_spread) * 100, 1)


def calculate_component_divergence(ratings: list[ESGRating]) -> dict:
    """Returns per-component (E, S, G) divergence for the breakdown chart."""
    if len(ratings) < 2:
        return {"environmental": 100.0, "social": 100.0, "governance": 100.0}

    def component_score(values: list[float]) -> float:
        spread = max(values) - min(values)
        return round((1 - min(spread / 50.0, 1.0)) * 100, 1)

    return {
        "environmental": component_score([r.environmental for r in ratings]),
        "social": component_score([r.social for r in ratings]),
        "governance": component_score([r.governance for r in ratings]),
    }
