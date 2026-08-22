"""
GitHub REST API client.
All requests are async (httpx) and return plain dicts / lists so callers
stay decoupled from the transport layer.

Security notes:
  - GITHUB_TOKEN is read from env at call-time; never logged or exposed.
  - All timeouts are explicit — no request can hang indefinitely.
  - HTTP 403 (rate-limit) is surfaced as a distinct exception so callers
    can return a user-friendly 429 instead of a generic 502.
  - File paths from the GitHub tree API are validated before use.
"""

import os
import logging
import re
from typing import Any, Dict, List, Optional

import httpx

logger = logging.getLogger(__name__)

_BASE = "https://api.github.com"
_TIMEOUT = httpx.Timeout(connect=5.0, read=15.0, write=5.0, pool=5.0)

# Allowlist for file paths fetched from the tree API (prevents path traversal)
_SAFE_PATH_RE = re.compile(r"^[a-zA-Z0-9_./ -]+$")


def _headers() -> Dict[str, str]:
    """Build request headers. Token is read fresh each call (supports rotation)."""
    token = os.getenv("GITHUB_TOKEN", "")
    h = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    if token:
        h["Authorization"] = f"Bearer {token}"
    # Never log the Authorization header
    return h


def _is_safe_path(path: str) -> bool:
    """Reject paths with traversal sequences or unexpected characters."""
    if ".." in path or path.startswith("/"):
        return False
    return bool(_SAFE_PATH_RE.match(path))


async def fetch_repos(
    client: httpx.AsyncClient,
    username: str,
    limit: int = 8,
) -> List[Dict[str, Any]]:
    """Return up to `limit` repos sorted by recently updated."""
    url = f"{_BASE}/users/{username}/repos"
    params = {"sort": "updated", "per_page": limit, "type": "owner"}
    try:
        resp = await client.get(url, headers=_headers(), params=params, timeout=_TIMEOUT)
        if resp.status_code == 404:
            raise ValueError(f"GitHub user '{username}' not found")
        if resp.status_code == 403:
            logger.warning("GitHub rate-limit hit fetching repos for user=%s", username)
            raise httpx.HTTPStatusError("Rate limited", request=resp.request, response=resp)
        resp.raise_for_status()
        return resp.json()
    except httpx.HTTPStatusError as exc:
        logger.error("GitHub repos fetch failed: status=%d", exc.response.status_code)
        raise
    except httpx.TimeoutException:
        logger.error("GitHub repos fetch timed out for user=%s", username)
        raise httpx.RequestError("Timeout fetching repos")
    except httpx.RequestError as exc:
        logger.error("GitHub request error fetching repos: %s", type(exc).__name__)
        raise


async def fetch_commits(
    client: httpx.AsyncClient,
    username: str,
    repo_name: str,
    limit: int = 100,
) -> List[Dict[str, Any]]:
    """Return up to `limit` commits for a single repository."""
    url = f"{_BASE}/repos/{username}/{repo_name}/commits"
    params = {"per_page": limit, "author": username}
    try:
        resp = await client.get(url, headers=_headers(), params=params, timeout=_TIMEOUT)
        if resp.status_code in (404, 409):
            logger.warning("Commits unavailable for %s/%s: status=%d", username, repo_name, resp.status_code)
            return []
        if resp.status_code == 403:
            logger.warning("GitHub rate-limit hit fetching commits for %s/%s", username, repo_name)
            return []
        resp.raise_for_status()
        return resp.json()
    except httpx.TimeoutException:
        logger.warning("Commit fetch timed out for %s/%s", username, repo_name)
        return []
    except (httpx.HTTPStatusError, httpx.RequestError) as exc:
        logger.warning("Commit fetch failed for %s/%s: %s", username, repo_name, type(exc).__name__)
        return []


async def fetch_languages(
    client: httpx.AsyncClient,
    username: str,
    repo_name: str,
) -> Dict[str, int]:
    """Return language-bytes mapping for a repo."""
    url = f"{_BASE}/repos/{username}/{repo_name}/languages"
    try:
        resp = await client.get(url, headers=_headers(), timeout=_TIMEOUT)
        if resp.status_code in (404, 403):
            return {}
        resp.raise_for_status()
        return resp.json()
    except httpx.TimeoutException:
        logger.warning("Language fetch timed out for %s/%s", username, repo_name)
        return {}
    except (httpx.HTTPStatusError, httpx.RequestError) as exc:
        logger.warning("Language fetch failed for %s/%s: %s", username, repo_name, type(exc).__name__)
        return {}


async def fetch_repo_tree(
    client: httpx.AsyncClient,
    username: str,
    repo_name: str,
    default_branch: str = "main",
) -> List[Dict[str, Any]]:
    """Return the flat git tree for the repo's default branch."""
    url = f"{_BASE}/repos/{username}/{repo_name}/git/trees/{default_branch}"
    params = {"recursive": "1"}
    try:
        resp = await client.get(url, headers=_headers(), params=params, timeout=_TIMEOUT)
        if resp.status_code == 404:
            if default_branch == "main":
                return await fetch_repo_tree(client, username, repo_name, "master")
            return []
        if resp.status_code == 403:
            return []
        resp.raise_for_status()
        data = resp.json()
        return data.get("tree", [])
    except httpx.TimeoutException:
        logger.warning("Tree fetch timed out for %s/%s", username, repo_name)
        return []
    except (httpx.HTTPStatusError, httpx.RequestError) as exc:
        logger.warning("Tree fetch failed for %s/%s: %s", username, repo_name, type(exc).__name__)
        return []


async def fetch_file_content(
    client: httpx.AsyncClient,
    username: str,
    repo_name: str,
    file_path: str,
    max_bytes: int = 100_000,
) -> Optional[str]:
    """
    Fetch raw file content.
    - Validates file_path against an allowlist before making the request.
    - Returns None if the file is unsafe, too large, binary, or unavailable.
    """
    # Path traversal / injection guard
    if not _is_safe_path(file_path):
        logger.warning("Unsafe file path rejected: %r for %s/%s", file_path, username, repo_name)
        return None

    url = f"{_BASE}/repos/{username}/{repo_name}/contents/{file_path}"
    try:
        resp = await client.get(
            url,
            headers={**_headers(), "Accept": "application/vnd.github.raw+json"},
            timeout=_TIMEOUT,
        )
        if resp.status_code in (404, 403):
            return None
        resp.raise_for_status()
        content = resp.text
        if len(content) > max_bytes:
            return content[:max_bytes]
        return content
    except httpx.TimeoutException:
        logger.warning("File fetch timed out %s/%s/%s", username, repo_name, file_path)
        return None
    except (httpx.HTTPStatusError, httpx.RequestError) as exc:
        logger.warning("File fetch failed %s/%s/%s: %s", username, repo_name, file_path, type(exc).__name__)
        return None
