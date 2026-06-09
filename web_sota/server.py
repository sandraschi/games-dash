"""FastAPI gateway for games-app: REST API + FastMCP mount.

Serves:
  - /health          — liveness check
  - /api/v1/status   — system status
  - /mcp             — Games MCP (streamable HTTP)
  - Static files     — React webapp dist (production)

Embedded by Tauri via run_server.py on port 10987.
"""

import asyncio
import logging
import os
import sys
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.staticfiles import StaticFiles

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("games-webapp")

GAMES_TAURI = os.environ.get("GAMES_TAURI", "0") == "1"

_TAURI_ORIGINS = [
    "http://localhost:10986",
    "http://127.0.0.1:10986",
    "tauri://localhost",
    "http://tauri.localhost",
    "https://tauri.localhost",
]
_ALLOWED_ORIGINS = [*_TAURI_ORIGINS, "*"]


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Games webapp gateway starting...")
    _task = asyncio.create_task(_lazy_mount_mcp(app))  # noqa: RUF006
    yield
    logger.info("Games webapp gateway shutting down...")


async def _lazy_mount_mcp(app: FastAPI):
    try:
        sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "games-mcp" / "src"))
        from games_mcp.server import http_app as mcp_http_app
        mcp_asgi = mcp_http_app()
        app.mount("/mcp", mcp_asgi)
        logger.info("FastMCP mounted at /mcp")
    except Exception as e:
        logger.error(f"Failed to mount FastMCP: {e}")


app = FastAPI(
    title="Games MCP Operator",
    version="2.5.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


@app.get("/health")
async def health():
    return JSONResponse({"status": "ok", "service": "games-webapp", "tauri": GAMES_TAURI})


@app.get("/api/v1/status")
async def api_status():
    return JSONResponse(
        {
            "success": True,
            "server": "games-mcp-operator",
            "version": "2.5.0",
            "engines": {
                "stockfish": {"url": os.environ.get("STOCKFISH_URL", "http://localhost:10780")},
                "shogi": {"url": os.environ.get("SHOGI_URL", "http://localhost:10781")},
                "go": {"url": os.environ.get("GO_URL", "http://localhost:10782")},
            },
        }
    )


# Serve React build in production (PyInstaller bundle or Tauri)
_FRONTEND_DIST = os.environ.get(
    "GAMES_FRONTEND_DIST",
    str(Path(__file__).resolve().parent / "dist"),
)
if Path(_FRONTEND_DIST).is_dir():
    app.mount("/", StaticFiles(directory=_FRONTEND_DIST, html=True), name="frontend")
    logger.info(f"Serving frontend from {_FRONTEND_DIST}")
