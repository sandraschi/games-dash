#!/usr/bin/env python3
"""
Simple Go Server - Basic implementation for testing
SECURITY: Includes rate limiting and authentication for public internet access
"""
import asyncio
import random
from aiohttp import web
import aiohttp_cors
import sys
import os

# Add parent directory to path for security_middleware import
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger("katago_server")

try:
    from security_middleware import security_middleware, get_security_stats
    SECURITY_ENABLED = True
except ImportError:
    logger.warning("security_middleware not found, running without security")
    SECURITY_ENABLED = False

# Simple Go move responses
BASIC_GO_MOVES = ["A1", "B2", "C3", "D4", "E5", "F6", "G7", "H8", "J9", "K10"]

async def handle_move(request):
    """Handle Go move requests with basic responses"""
    try:
        data = await request.json()

        # Return a random basic move for testing
        move = random.choice(BASIC_GO_MOVES)

        return web.json_response({
            "success": True,
            "move": move,
            "engine": "Simple KataGo",
            "strength": "Basic testing mode"
        })
    except Exception as e:
        return web.json_response({"success": False, "error": str(e)}, status=500)

async def handle_status(request):
    """Status endpoint"""
    return web.json_response({
        "status": "online",
        "ready": True,  # Critical: JavaScript checks status.ready
        "engine": "Simple KataGo",
        "version": "Testing Mode",
        "strength": "Basic responses"
    })

async def handle_security_stats(request):
    """Security statistics endpoint (admin only)"""
    if SECURITY_ENABLED:
        stats = get_security_stats()
        return web.json_response(stats)
    return web.json_response({"error": "Security not enabled"}, status=503)

async def create_app():
    app = web.Application()

    # Add security middleware if available
    if SECURITY_ENABLED:
        app.middlewares.append(security_middleware)
        logger.info("Security middleware enabled: Rate limiting and authentication active")

    # CORS - Configured for public access but with security
    cors = aiohttp_cors.setup(app, defaults={
        "*": aiohttp_cors.ResourceOptions(
            allow_credentials=True,
            expose_headers="*",
            allow_headers="*",
            allow_methods="*",
        )
    })

    # Routes
    app.router.add_post("/api/move", handle_move)
    app.router.add_get("/api/status", handle_status)
    app.router.add_get("/api/security/stats", handle_security_stats)

    # Add CORS to routes
    for route in list(app.router.routes()):
        cors.add(route)

    return app

if __name__ == "__main__":
    port = 10002
    logger.info("Simple KataGo Server")
    logger.info(f"Starting on port {port}")
    logger.info("Basic testing mode - returns random moves")
    logger.info("Remote access enabled: 0.0.0.0 (iPad/iPhone/Bangalore players)")

    app = asyncio.run(create_app())
    web.run_app(app, host="0.0.0.0", port=port)