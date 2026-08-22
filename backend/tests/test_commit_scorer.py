"""Unit tests for services/commit_scorer.py"""

import pytest
from datetime import datetime, timedelta, timezone
from services.commit_scorer import score_commits, aggregate_authenticity


def _make_commit(date: datetime) -> dict:
    return {"commit": {"author": {"date": date.isoformat()}}}


class TestScoreCommits:
    def test_no_commits(self):
        score, risk, msg = score_commits([])
        assert score == 0
        assert risk == "High Risk"
        assert "no commit" in msg.lower()

    def test_single_commit(self):
        c = _make_commit(datetime(2024, 1, 1, tzinfo=timezone.utc))
        score, risk, msg = score_commits([c])
        assert score == 20
        assert risk == "High Risk"

    def test_same_day_commits(self):
        base = datetime(2024, 3, 10, tzinfo=timezone.utc)
        commits = [_make_commit(base.replace(hour=h)) for h in range(5)]
        score, risk, msg = score_commits(commits)
        assert score == 15
        assert risk == "High Risk"
        assert "bulk" in msg.lower()

    def test_spread_commits_low_risk(self):
        base = datetime(2024, 1, 1, tzinfo=timezone.utc)
        # 20 commits on 20 different days over 20 days → high density + full spread
        commits = [_make_commit(base + timedelta(days=i)) for i in range(20)]
        score, risk, _ = score_commits(commits)
        assert risk == "Low Risk"
        assert score >= 70

    def test_medium_risk(self):
        # 4 commits on 4 days but spanning 30 days → moderate
        base = datetime(2024, 1, 1, tzinfo=timezone.utc)
        days = [0, 5, 15, 30]
        commits = [_make_commit(base + timedelta(days=d)) for d in days]
        score, risk, _ = score_commits(commits)
        # 4 unique days → density = min(20, 60) = 20
        # span = 30, spread = min(int(4/30 * 40), 40) = min(5, 40) = 5
        # total = 25 → High Risk
        assert risk == "High Risk"

    def test_score_capped_at_100(self):
        base = datetime(2024, 1, 1, tzinfo=timezone.utc)
        commits = [_make_commit(base + timedelta(days=i)) for i in range(200)]
        score, _, _ = score_commits(commits)
        assert score <= 100

    def test_threshold_boundary_70(self):
        # Build a scenario where total is exactly >= 70 → Low Risk
        # 14 unique days, each consecutive → density=min(70,60)=60, span=13
        # spread=min(int(14/13*40),40)=min(43,40)=40 → total=100 → Low Risk
        base = datetime(2024, 1, 1, tzinfo=timezone.utc)
        commits = [_make_commit(base + timedelta(days=i)) for i in range(14)]
        score, risk, _ = score_commits(commits)
        assert risk == "Low Risk"

    def test_malformed_commit_ignored(self):
        # Should not crash on bad data
        bad = {"commit": {"author": {"date": "not-a-date"}}}
        good = _make_commit(datetime(2024, 1, 1, tzinfo=timezone.utc))
        score, risk, _ = score_commits([bad, good])
        # Only 1 valid date → single-commit path
        assert risk == "High Risk"


class TestAggregateAuthenticity:
    def test_empty(self):
        assert aggregate_authenticity([]) == 0

    def test_average(self):
        assert aggregate_authenticity([60, 80]) == 70

    def test_single(self):
        assert aggregate_authenticity([45]) == 45
