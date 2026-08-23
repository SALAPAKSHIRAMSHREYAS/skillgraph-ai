"""Shared pytest fixtures."""

import pytest


@pytest.fixture(autouse=True)
def clear_rate_limits():
    """Reset in-memory IP and SlowAPI rate limiters between tests."""
    from main import _ip_request_log, limiter

    _ip_request_log.clear()
    limiter._storage.reset()
    yield
    _ip_request_log.clear()
    limiter._storage.reset()
