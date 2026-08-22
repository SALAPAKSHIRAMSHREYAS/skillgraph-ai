"""
Commit-pattern / authenticity scoring.

Treats the distribution of commit dates as a heuristic for iterative
development vs. a single bulk upload.  This is NOT a forensic authorship
determination.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Tuple


def _parse_date(commit: Dict[str, Any]) -> datetime | None:
    """Extract the author date from a GitHub commit object."""
    try:
        date_str = commit["commit"]["author"]["date"]
        return datetime.fromisoformat(date_str.replace("Z", "+00:00"))
    except (KeyError, TypeError, ValueError):
        return None


def score_commits(commits: List[Dict[str, Any]]) -> Tuple[int, str, str]:
    """
    Compute (score, risk_level, risk_message) from a list of raw GitHub
    commit objects.

    Score range: 0-100.
    Risk levels: "Low Risk" | "Medium Risk" | "High Risk"
    """
    if not commits:
        return 0, "High Risk", "No commit history found."

    dates = [d for c in commits if (d := _parse_date(c)) is not None]

    if len(dates) < 2:
        return 20, "High Risk", "Single-commit or insufficient commit history."

    unique_days = len({d.date() for d in dates})

    if unique_days == 1:
        return 15, "High Risk", "All commits on the same day — likely a bulk upload."

    earliest = min(dates)
    latest = max(dates)
    span_days = max((latest - earliest).days, 1)

    density_score = min(unique_days * 5, 60)
    spread_score = min(int(unique_days / span_days * 40), 40)
    total = density_score + spread_score

    if total >= 70:
        risk = "Low Risk"
        msg = f"Commits spread across {unique_days} days over {span_days} day(s)."
    elif total >= 40:
        risk = "Medium Risk"
        msg = f"Moderate commit spread — {unique_days} active day(s) over {span_days} day(s)."
    else:
        risk = "High Risk"
        msg = f"Low commit diversity — {unique_days} active day(s) over {span_days} day(s)."

    return min(total, 100), risk, msg


def aggregate_authenticity(repo_scores: List[int]) -> int:
    """
    Average individual repo scores into one portfolio-level
    authenticity score (0-100).
    """
    if not repo_scores:
        return 0
    return round(sum(repo_scores) / len(repo_scores))
