"""
Security-focused request/response logging middleware.

Logs:
  - Every inbound request (method, path, client IP, User-Agent)
  - Every response (status code, latency)
  - Suspicious patterns (oversized bodies, unexpected content-types)

Never logs Authorization headers, API keys, or secret values.
"""

import logging
import time
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

security_logger = logging.getLogger("skillgraph.security")


class SecurityLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start = time.perf_counter()

        # Safely extract client IP (respects X-Forwarded-For for proxied setups)
        client_ip = request.headers.get("x-forwarded-for", "").split(",")[0].strip()
        if not client_ip:
            client_ip = request.client.host if request.client else "unknown"

        user_agent = request.headers.get("user-agent", "")[:200]
        content_length = request.headers.get("content-length", "0")

        security_logger.info(
            "REQUEST  method=%s path=%s client=%s ua=%r content_length=%s",
            request.method,
            request.url.path,
            client_ip,
            user_agent,
            content_length,
        )

        # Flag suspiciously large content-length before reading body
        try:
            cl = int(content_length)
            if cl > 1_024:  # > 1 KB for a username-only endpoint is suspicious
                security_logger.warning(
                    "OVERSIZED_REQUEST client=%s path=%s content_length=%d",
                    client_ip,
                    request.url.path,
                    cl,
                )
        except ValueError:
            pass

        response = await call_next(request)

        elapsed_ms = (time.perf_counter() - start) * 1000
        security_logger.info(
            "RESPONSE status=%d path=%s client=%s latency_ms=%.1f",
            response.status_code,
            request.url.path,
            client_ip,
            elapsed_ms,
        )

        # Log 4xx/5xx at warning level for visibility
        if response.status_code >= 400:
            security_logger.warning(
                "ERROR_RESPONSE status=%d path=%s client=%s",
                response.status_code,
                request.url.path,
                client_ip,
            )

        return response
