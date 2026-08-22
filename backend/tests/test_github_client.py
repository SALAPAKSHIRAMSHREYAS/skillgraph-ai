"""Unit tests for services/github_client.py — uses httpx mock transport."""

import pytest
import httpx
from unittest.mock import AsyncMock, patch

from services.github_client import (
    fetch_repos,
    fetch_commits,
    fetch_languages,
)


def _mock_client(status: int, body):
    """Return an AsyncClient backed by a mock transport."""
    content = body if isinstance(body, bytes) else str(body).encode()

    class MockTransport(httpx.AsyncBaseTransport):
        async def handle_async_request(self, request):
            import json as _json
            if isinstance(body, (dict, list)):
                data = _json.dumps(body).encode()
                headers = {"content-type": "application/json"}
            else:
                data = content
                headers = {}
            return httpx.Response(status, content=data, headers=headers)

    return httpx.AsyncClient(transport=MockTransport())


class TestFetchRepos:
    @pytest.mark.asyncio
    async def test_success(self):
        payload = [{"name": "repo1", "language": "Python"}]
        async with _mock_client(200, payload) as client:
            result = await fetch_repos(client, "testuser")
        assert result == payload

    @pytest.mark.asyncio
    async def test_missing_user_raises(self):
        async with _mock_client(404, {"message": "Not Found"}) as client:
            with pytest.raises(ValueError, match="not found"):
                await fetch_repos(client, "nonexistent_user_xyz")

    @pytest.mark.asyncio
    async def test_empty_result(self):
        async with _mock_client(200, []) as client:
            result = await fetch_repos(client, "emptyuser")
        assert result == []

    @pytest.mark.asyncio
    async def test_api_error_raises(self):
        async with _mock_client(500, {"message": "server error"}) as client:
            with pytest.raises(httpx.HTTPStatusError):
                await fetch_repos(client, "testuser")


class TestFetchCommits:
    @pytest.mark.asyncio
    async def test_success(self):
        payload = [{"commit": {"author": {"date": "2024-01-01T00:00:00Z"}}}]
        async with _mock_client(200, payload) as client:
            result = await fetch_commits(client, "u", "repo")
        assert len(result) == 1

    @pytest.mark.asyncio
    async def test_404_returns_empty(self):
        async with _mock_client(404, {"message": "Not Found"}) as client:
            result = await fetch_commits(client, "u", "missing")
        assert result == []

    @pytest.mark.asyncio
    async def test_409_empty_repo_returns_empty(self):
        async with _mock_client(409, {"message": "Git Repository is empty"}) as client:
            result = await fetch_commits(client, "u", "empty_repo")
        assert result == []


class TestFetchLanguages:
    @pytest.mark.asyncio
    async def test_success(self):
        payload = {"Python": 12345, "Shell": 500}
        async with _mock_client(200, payload) as client:
            result = await fetch_languages(client, "u", "repo")
        assert result["Python"] == 12345

    @pytest.mark.asyncio
    async def test_404_returns_empty(self):
        async with _mock_client(404, {}) as client:
            result = await fetch_languages(client, "u", "missing")
        assert result == {}
