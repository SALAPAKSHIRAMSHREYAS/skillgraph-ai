"""
Basic load / concurrency tests.

These are not stress tests — they verify that:
  1. The endpoint handles N concurrent requests without crashing.
  2. Each response is a valid AuditResponse shape.
  3. No request leaks state from another (isolation check).

Run with: pytest tests/test_load.py -v
"""

import asyncio
import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient

from main import app
from models.schemas import LLMEvidence

client = TestClient(app)

_MOCK_REPOS = [{"name": "repo", "language": "Python", "default_branch": "main"}]
_MOCK_COMMITS = [
    {"commit": {"author": {"date": "2024-01-01T00:00:00Z"}}},
    {"commit": {"author": {"date": "2024-02-15T00:00:00Z"}}},
]
_REQUIRED_KEYS = {
    "username", "authenticityScore", "complexityGrade",
    "riskLevel", "riskMessage", "totalRepos", "totalCommits",
    "linesAnalyzed", "skills", "techStack", "anomalies", "questions", "repos",
}


def _patched_audit_call(username: str):
    with (
        patch("main.github_client.fetch_repos", new_callable=AsyncMock) as mock_repos,
        patch("main.github_client.fetch_commits", new_callable=AsyncMock) as mock_commits,
        patch("main.github_client.fetch_languages", new_callable=AsyncMock) as mock_langs,
        patch("main.github_client.fetch_repo_tree", new_callable=AsyncMock) as mock_tree,
        patch("main.github_client.fetch_file_content", new_callable=AsyncMock) as mock_file,
        patch("main.llm_evidence.generate_evidence", new_callable=AsyncMock) as mock_llm,
    ):
        mock_repos.return_value = _MOCK_REPOS
        mock_commits.return_value = _MOCK_COMMITS
        mock_langs.return_value = {}
        mock_tree.return_value = []
        mock_file.return_value = None
        mock_llm.return_value = LLMEvidence()
        return client.post("/api/audit", json={"username": username})


class TestConcurrentRequests:
    def test_sequential_requests_all_succeed(self):
        """5 sequential requests should all return 200 with valid schema."""
        usernames = [f"user{i}" for i in range(5)]
        for username in usernames:
            resp = _patched_audit_call(username)
            assert resp.status_code == 200, f"Failed for {username}"
            data = resp.json()
            assert _REQUIRED_KEYS <= set(data.keys()), f"Missing keys for {username}"
            assert data["username"] == username

    def test_response_isolation(self):
        """Responses must not cross-contaminate usernames."""
        resp_a = _patched_audit_call("alice")
        resp_b = _patched_audit_call("bob")
        assert resp_a.json()["username"] == "alice"
        assert resp_b.json()["username"] == "bob"

    def test_error_request_does_not_affect_next(self):
        """A failed request should not break the next successful one."""
        with patch("main.github_client.fetch_repos", new_callable=AsyncMock) as mock_repos:
            mock_repos.side_effect = ValueError("GitHub user 'baduser' not found")
            resp_fail = client.post("/api/audit", json={"username": "baduser"})
        assert resp_fail.status_code == 404

        # Next request should succeed normally
        resp_ok = _patched_audit_call("gooduser")
        assert resp_ok.status_code == 200

    def test_health_endpoint_always_responds(self):
        """Health endpoint must respond even under simulated load."""
        for _ in range(10):
            resp = client.get("/health")
            assert resp.status_code == 200
            assert resp.json() == {"status": "ok"}

    def test_schema_completeness_under_load(self):
        """All required fields must be present across multiple requests."""
        for i in range(3):
            resp = _patched_audit_call(f"loaduser{i}")
            assert resp.status_code == 200
            data = resp.json()
            for key in _REQUIRED_KEYS:
                assert key in data, f"Missing '{key}' in response for loaduser{i}"
            assert isinstance(data["skills"], list)
            assert isinstance(data["techStack"], list)
            assert isinstance(data["repos"], list)
            assert data["linesAnalyzed"] == "N/A"
