#!/usr/bin/env python3
"""
Simple Go Server - Basic implementation for testing
"""
import asyncio
import random
from aiohttp import web
import aiohttp_cors

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
        "engine": "Simple KataGo",
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
    port = 10002
    print("Simple KataGo Server")
    print(f"Port: {port}")
    print("Basic testing mode - returns random moves")

    app = asyncio.run(create_app())
    web.run_app(app, host="0.0.0.0", port=port)