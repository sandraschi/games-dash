#!/usr/bin/env python3
"""
Security Middleware for Public Internet Access
Provides rate limiting, authentication, and request validation
"""

import hashlib
import hmac
import os
import secrets
import time
from collections import defaultdict

from aiohttp import web

# Rate limiting configuration
RATE_LIMIT_CONFIG = {
    "move_requests": {
        "tokens_per_minute": 30,  # 30 moves per minute per IP
        "burst_size": 5,  # Allow 5 rapid requests
        "window_seconds": 60,
    },
    "status_requests": {
        "tokens_per_minute": 120,  # Status checks more frequent
        "burst_size": 10,
        "window_seconds": 60,
    },
}

# Authentication configuration
AUTH_ENABLED = os.environ.get("AI_AUTH_ENABLED", "false").lower() == "true"
API_KEY_SECRET = os.environ.get("AI_API_KEY_SECRET", secrets.token_urlsafe(32))

# IP-based rate limiting storage
rate_limit_buckets = defaultdict(dict)
rate_limit_lock = {}  # Per-IP locks (simplified, in production use proper locking)

# Blocked IPs (can be populated from logs or admin interface)
blocked_ips = set()

# Request logging for security monitoring
request_log = []


class TokenBucketRateLimiter:
    """Token bucket rate limiter for per-IP rate limiting"""

    def __init__(
        self, tokens_per_minute: int, burst_size: int, window_seconds: int = 60
    ):
        self.tokens_per_minute = tokens_per_minute
        self.burst_size = burst_size
        self.window_seconds = window_seconds
        self.refill_rate = tokens_per_minute / 60.0  # Tokens per second

    def check_rate_limit(self, ip: str, endpoint: str) -> tuple[bool, str]:
        """
        Check if request should be allowed based on rate limits
        Returns: (allowed: bool, message: str)
        """
        # Check if IP is blocked
        if ip in blocked_ips:
            return False, "IP address is blocked"

        # Get or create bucket for this IP+endpoint combination
        bucket_key = f"{ip}:{endpoint}"
        now = time.time()

        if bucket_key not in rate_limit_buckets:
            rate_limit_buckets[bucket_key] = {
                "tokens": self.burst_size,
                "last_refill": now,
            }

        bucket = rate_limit_buckets[bucket_key]

        # Refill tokens based on time passed
        time_passed = now - bucket["last_refill"]
        tokens_to_add = time_passed * self.refill_rate
        bucket["tokens"] = min(bucket["tokens"] + tokens_to_add, self.burst_size)
        bucket["last_refill"] = now

        # Check if we have tokens
        if bucket["tokens"] < 1:
            wait_time = int((1 - bucket["tokens"]) / self.refill_rate)
            return False, f"Rate limit exceeded. Please wait {wait_time} seconds."

        # Consume a token
        bucket["tokens"] -= 1

        return True, "OK"


class APIKeyAuth:
    """Simple API key authentication"""

    @staticmethod
    def generate_api_key(user_id: str) -> str:
        """Generate an API key for a user"""
        timestamp = str(int(time.time()))
        message = f"{user_id}:{timestamp}"
        signature = hmac.new(
            API_KEY_SECRET.encode(), message.encode(), hashlib.sha256
        ).hexdigest()
        return f"{user_id}:{timestamp}:{signature}"

    @staticmethod
    def validate_api_key(api_key: str) -> tuple[bool, str | None]:
        """
        Validate an API key
        Returns: (valid: bool, user_id: Optional[str])
        """
        if not AUTH_ENABLED:
            return True, "anonymous"  # Auth disabled, allow all

        try:
            parts = api_key.split(":")
            if len(parts) != 3:
                return False, None

            user_id, timestamp, signature = parts

            # Check timestamp (keys expire after 1 year)
            key_age = time.time() - int(timestamp)
            if key_age > 31536000:  # 1 year
                return False, None

            # Verify signature
            message = f"{user_id}:{timestamp}"
            expected_signature = hmac.new(
                API_KEY_SECRET.encode(), message.encode(), hashlib.sha256
            ).hexdigest()

            if not hmac.compare_digest(signature, expected_signature):
                return False, None

            return True, user_id
        except (ValueError, TypeError):
            return False, None


def get_client_ip(request: web.Request) -> str:
    """Extract client IP from request, handling proxies"""
    # Check X-Forwarded-For header (from reverse proxy)
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        # Take first IP in chain
        return forwarded_for.split(",")[0].strip()

    # Check X-Real-IP header
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip.strip()

    # Fallback to direct connection
    return request.remote


import logging

# Configure logger for security middleware
security_logger = logging.getLogger("security_middleware")


def log_request(request: web.Request, response_status: int, user_id: str | None = None):
    """Log request for security monitoring"""
    ip = get_client_ip(request)
    log_entry = {
        "timestamp": time.time(),
        "ip": ip,
        "method": request.method,
        "path": str(request.path),
        "status": response_status,
        "user_agent": request.headers.get("User-Agent", "Unknown"),
        "user_id": user_id,
    }
    request_log.append(log_entry)

    # Log to logger based on status
    if response_status >= 500:
        security_logger.error(
            f"Request failed: {request.method} {request.path} from {ip} - Status {response_status}"
        )
    elif response_status >= 400:
        security_logger.warning(
            f"Request error: {request.method} {request.path} from {ip} - Status {response_status}"
        )
    else:
        security_logger.debug(
            f"Request: {request.method} {request.path} from {ip} - Status {response_status}"
        )

    # Keep only last 1000 entries
    if len(request_log) > 1000:
        request_log.pop(0)


@web.middleware
async def security_middleware(request: web.Request, handler):
    """
    Security middleware for all AI server requests
    Provides rate limiting, authentication, and logging
    """
    client_ip = get_client_ip(request)
    endpoint = request.path

    # Determine rate limit config based on endpoint
    if "/api/move" in endpoint:
        rate_limiter = TokenBucketRateLimiter(**RATE_LIMIT_CONFIG["move_requests"])
    elif "/api/status" in endpoint:
        rate_limiter = TokenBucketRateLimiter(**RATE_LIMIT_CONFIG["status_requests"])
    else:
        rate_limiter = TokenBucketRateLimiter(**RATE_LIMIT_CONFIG["move_requests"])

    # Check rate limits
    allowed, message = rate_limiter.check_rate_limit(client_ip, endpoint)
    if not allowed:
        security_logger.warning(f"Rate limit exceeded: {client_ip} on {endpoint}")
        log_request(request, 429, None)
        return web.json_response(
            {"success": False, "error": "Rate limit exceeded", "message": message},
            status=429,
        )

    # Check authentication (if enabled)
    if AUTH_ENABLED:
        api_key = request.headers.get("X-API-Key") or request.query.get("api_key")
        if not api_key:
            security_logger.warning(
                f"Authentication required but no API key provided from {client_ip}"
            )
            log_request(request, 401, None)
            return web.json_response(
                {
                    "success": False,
                    "error": "Authentication required",
                    "message": "API key required",
                },
                status=401,
            )

        valid, user_id = APIKeyAuth.validate_api_key(api_key)
        if not valid:
            security_logger.warning(f"Invalid API key attempt from {client_ip}")
            log_request(request, 401, None)
            return web.json_response(
                {"success": False, "error": "Invalid API key"}, status=401
            )
        security_logger.debug(
            f"Authenticated request from {client_ip} (user: {user_id})"
        )
    else:
        user_id = "anonymous"

    # Validate request size (prevent DoS)
    if request.content_length and request.content_length > 1024 * 1024:  # 1MB max
        log_request(request, 413, user_id)
        return web.json_response(
            {"success": False, "error": "Request too large"}, status=413
        )

    # Process request
    try:
        response = await handler(request)
        log_request(request, response.status, user_id)
        return response
    except Exception:
        log_request(request, 500, user_id)
        raise


def get_security_stats() -> dict:
    """Get security statistics for monitoring"""
    return {
        "total_requests": len(request_log),
        "blocked_ips": len(blocked_ips),
        "auth_enabled": AUTH_ENABLED,
        "rate_limit_config": RATE_LIMIT_CONFIG,
        "recent_requests": request_log[-100:] if request_log else [],
    }


def block_ip(ip: str):
    """Block an IP address"""
    blocked_ips.add(ip)


def unblock_ip(ip: str):
    """Unblock an IP address"""
    blocked_ips.discard(ip)
