"""
API-level tests for the FastAPI app.
Uses TestClient with patched service calls so no real HTTP requests are made.
"""

import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from fastapi.testclient import TestClient

from main import app
from models.schemas import LLMEvidence

client = TestClient(app)

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

_MOCK_REPOS = [
    {
        "name": "test-repo",
        "language": "Python",
        "default_branch": "main",
    }
]

_MOCK_COMMITS = [
    {"commit": {"author": {"date": "2024-01-01T00:00:00Z"}}},
    {"commit": {"author": {"date": "2024-01-15T00:00:00Z"}}},
    {"commit": {"author": {"date": "2024-02-01T00:00:00Z"}}},
]

_MOCK_LANGUAGES = {"Python": 5000}

_MOCK_TREE = [
    {"type": "blob", "path": "main.py"},
]

_MOCK_SOURCE = "def hello():\n    pass\n"


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------

class TestHealthEndpoint:
    def test_health_ok(self):
        resp = client.get("/health")
        assert resp.status_code == 200
        assert resp.json() == {"status": "ok"}


class TestAuditEndpoint:
    def test_missing_username_rejected(self):
        resp = client.post("/api/audit", json={"username": "  "})
        assert resp.status_code == 422

    def test_missing_body_rejected(self):
        resp = client.post("/api/audit", json={})
        assert resp.status_code == 422

    @patch("main.github_client.fetch_repos", new_callable=AsyncMock)
    @patch("main.github_client.fetch_commits", new_callable=AsyncMock)
    @patch("main.github_client.fetch_languages", new_callable=AsyncMock)
    @patch("main.github_client.fetch_repo_tree", new_callable=AsyncMock)
    @patch("main.github_client.fetch_file_content", new_callable=AsyncMock)
    @patch("main.llm_evidence.generate_evidence", new_callable=AsyncMock)
    def test_valid_request_returns_audit_response(
        self,
        mock_llm,
        mock_file,
        mock_tree,
        mock_langs,
        mock_commits,
        mock_repos,
    ):
        mock_repos.return_value = _MOCK_REPOS
        mock_commits.return_value = _MOCK_COMMITS
        mock_langs.return_value = _MOCK_LANGUAGES
        mock_tree.return_value = _MOCK_TREE
        mock_file.return_value = _MOCK_SOURCE
        mock_llm.return_value = LLMEvidence()

        resp = client.post("/api/audit", json={"username": "testuser"})
        assert resp.status_code == 200

        data = resp.json()
        # Schema validation — all required keys present
        for key in [
            "username", "authenticityScore", "complexityGrade",
            "riskLevel", "riskMessage", "totalRepos", "totalCommits",
            "linesAnalyzed", "skills", "techStack", "anomalies",
            "questions", "repos",
        ]:
            assert key in data, f"Missing key: {key}"

        assert data["username"] == "testuser"
        assert data["linesAnalyzed"] == "N/A"
        assert isinstance(data["repos"], list)

    @patch("main.github_client.fetch_repos", new_callable=AsyncMock)
    def test_unknown_github_user_returns_404(self, mock_repos):
        mock_repos.side_effect = ValueError("GitHub user 'nobody' not found")
        resp = client.post("/api/audit", json={"username": "nobody"})
        assert resp.status_code == 404

    @patch("main.github_client.fetch_repos", new_callable=AsyncMock)
    def test_github_api_failure_returns_502(self, mock_repos):
        import httpx
        mock_repos.side_effect = httpx.HTTPStatusError(
            "server error",
            request=MagicMock(),
            response=MagicMock(status_code=500),
        )
        resp = client.post("/api/audit", json={"username": "testuser"})
        assert resp.status_code == 502
