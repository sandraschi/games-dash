#!/usr/bin/env python3
"""
Simple Stockfish Server - Basic implementation without subprocess complexity
"""
import asyncio
import random
from aiohttp import web
import aiohttp_cors

# Simple chess move responses for testing
BASIC_MOVES = ["e2e4", "d2d4", "Nf3", "Nc3", "Bc4", "Qh5", "O-O"]

async def handle_move(request):
    """Handle chess move requests with basic responses"""
    try:
        data = await request.json()
        fen = data.get("fen", "")

        # Return a random basic move for testing
        move = random.choice(BASIC_MOVES)

        return web.json_response({
            "success": True,
            "move": move,
            "engine": "Simple Stockfish",
            "strength": "Basic testing mode"
        })
    except Exception as e:
        return web.json_response({"success": False, "error": str(e)}, status=500)

async def handle_status(request):
    """Status endpoint"""
    return web.json_response({
        "status": "online",
        "engine": "Simple Stockfish",
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
    port = 10001
    print("Simple Stockfish Server")
    print(f"Port: {port}")
    print("Basic testing mode - returns random moves")

    app = asyncio.run(create_app())
    web.run_app(app, host="0.0.0.0", port=port)