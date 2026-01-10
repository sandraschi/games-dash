#!/usr/bin/env python3
"""
Simple Shogi Server - Basic implementation for testing
"""
import asyncio
import random
from aiohttp import web
import aiohttp_cors

# Simple Shogi move responses (basic moves)
BASIC_SHOGI_MOVES = ["1a-1b", "2c-2d", "3e-3f", "4g-4h", "5i-5h", "6a-6b", "7c-7d", "8e-8f", "9g-9h"]

async def handle_move(request):
    """Handle Shogi move requests with basic responses"""
    try:
        data = await request.json()
        sfen = data.get("sfen", "")

        # Return a random basic move for testing
        move = random.choice(BASIC_SHOGI_MOVES)

        return web.json_response({
            "success": True,
            "move": move,
            "engine": "Simple YaneuraOu",
            "strength": "Basic testing mode"
        })
    except Exception as e:
        return web.json_response({"success": False, "error": str(e)}, status=500)

async def handle_status(request):
    """Status endpoint"""
    return web.json_response({
        "status": "online",
        "engine": "Simple YaneuraOu",
        "version": "Testing Mode",
        "strength": "Basic responses"
    })

async def create_app():
    app = web.Application()

    # CORS
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

    # Add CORS to routes
    for route in list(app.router.routes()):
        cors.add(route)

    return app

if __name__ == "__main__":
    port = 10003
    print("Simple YaneuraOu Server")
    print(f"Port: {port}")
    print("Basic testing mode - returns random moves")

    app = asyncio.run(create_app())
    web.run_app(app, host="0.0.0.0", port=port)