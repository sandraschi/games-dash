#!/usr/bin/env python3
"""
Web Bridge for Games MCP - Exposes internal state via FastAPI.
**Port**: 10741
**Registry**: Referenced in WEBAPP_PORTS.md
"""

import asyncio
import logging
import os
import sys

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Ensure the root src is in path for imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Import state from mcp_server (we need to be careful with circular imports)
# In a real scenario, state should be in a separate shared module.
# For now, we'll try to import active_games if possible,
# but if it causes circular issues we'll use the singleton pattern.
try:
    from games_mcp.mcp_server import active_games, game_statistics, player_ratings
except ImportError:
    # Fallback placeholders if direct import fails during initialization
    active_games = {}
    player_ratings = {}
    game_statistics = {}

app = FastAPI(title="Games MCP Web Bridge", version="1.0.0")

# Enable CORS for the webapp (port 10740)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to http://localhost:10740
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": str(asyncio.get_event_loop().time())}


@app.get("/state")
async def get_state():
    """Returns the full internal state for the dashboard."""
    return {
        "active_games": active_games,
        "player_ratings": player_ratings,
        "game_statistics": game_statistics,
        "summary": {
            "active_count": len(active_games),
            "player_count": len(player_ratings),
        },
    }


@app.get("/games/{game_id}")
async def get_game(game_id: str):
    """Returns state for a specific game."""
    if game_id not in active_games:
        raise HTTPException(status_code=404, detail="Game not found")
    return active_games[game_id]


def main():
    """Launch the web bridge server."""
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger("web_bridge")
    logger.info("Starting Games MCP Web Bridge on port 10741")
    uvicorn.run(app, host="0.0.0.0", port=10741, log_level="info")


if __name__ == "__main__":
    main()
