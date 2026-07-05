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
import subprocess
import sys
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.staticfiles import StaticFiles
from starlette.types import Receive, Send

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


@app.get("/api/config")
async def api_config():
    return JSONResponse(
        {
            "ai_server_host": os.environ.get("AI_SERVER_HOST", "localhost"),
            "is_remote": False,
            "ports": {
                "stockfish": int(os.environ.get("AI_STOCKFISH_PORT", "10001")),
                "go": int(os.environ.get("AI_GO_PORT", "10002")),
                "shogi": int(os.environ.get("AI_SHOGI_PORT", "10003")),
                "web": int(os.environ.get("WEB_PORT", "9876")),
            },
        }
    )


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


@app.get("/")
async def root():
    from starlette.responses import FileResponse
    index = Path(__file__).resolve().parent.parent / "index.html"
    if index.is_file():
        return FileResponse(str(index))
    return JSONResponse({"error": "games collection not found"}, status_code=404)


@app.post("/api/v1/start-engines")
async def start_engines():
    script = Path(__file__).resolve().parent.parent / "START_GAMES.ps1"
    if not script.is_file():
        raise HTTPException(404, f"Start script not found: {script}")
    try:
        proc = await asyncio.create_subprocess_exec(
            "pwsh", "-NoProfile", "-File", str(script),
            stdout=subprocess.PIPE, stderr=subprocess.PIPE,
        )
        stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=30)
        return JSONResponse({
            "success": proc.returncode == 0,
            "exit_code": proc.returncode,
            "stdout": stdout.decode(errors="replace"),
            "stderr": stderr.decode(errors="replace"),
        })
    except TimeoutError:
        proc.kill()
        raise HTTPException(504, "Engine startup timed out after 30s") from None
    except Exception as e:
        raise HTTPException(500, f"Failed to start engines: {e}") from e


@app.post("/api/v1/docker-up")
async def docker_up():
    compose = Path(__file__).resolve().parent.parent / "docker-compose.yml"
    if not compose.is_file():
        raise HTTPException(404, f"docker-compose.yml not found at {compose}")
    try:
        proc = await asyncio.create_subprocess_exec(
            "docker", "compose", "-f", str(compose), "up", "-d",
            stdout=subprocess.PIPE, stderr=subprocess.PIPE,
        )
        stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=120)
        return JSONResponse({
            "success": proc.returncode == 0,
            "exit_code": proc.returncode,
            "stdout": stdout.decode(errors="replace"),
            "stderr": stderr.decode(errors="replace"),
        })
    except TimeoutError:
        proc.kill()
        raise HTTPException(504, "Docker stack startup timed out after 120s") from None
    except Exception as e:
        raise HTTPException(500, f"Failed to start Docker stack: {e}") from e


@app.post("/api/v1/docker-down")
async def docker_down():
    compose = Path(__file__).resolve().parent.parent / "docker-compose.yml"
    try:
        proc = await asyncio.create_subprocess_exec(
            "docker", "compose", "-f", str(compose), "down",
            stdout=subprocess.PIPE, stderr=subprocess.PIPE,
        )
        stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=60)
        return JSONResponse({
            "success": proc.returncode == 0,
            "exit_code": proc.returncode,
            "stdout": stdout.decode(errors="replace"),
            "stderr": stderr.decode(errors="replace"),
        })
    except TimeoutError:
        proc.kill()
        raise HTTPException(504, "Docker stack shutdown timed out") from None
    except Exception as e:
        raise HTTPException(500, f"Failed to stop Docker stack: {e}") from e
from starlette.types import ASGIApp, Scope, Receive, Send


class NoCacheStaticFiles(StaticFiles):
    """StaticFiles that prevents caching for JS/CSS files (dev convenience)."""

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] == "http" and scope["path"].endswith((".js", ".css", ".html")):
            original_send = send

            async def no_cache_send(message):
                if message["type"] == "http.response.start":
                    headers = dict(message.get("headers", []))
                    headers[b"cache-control"] = b"no-cache, no-store, must-revalidate"
                    message["headers"] = list(headers.items())
                await original_send(message)

            return await super().__call__(scope, receive, no_cache_send)
        await super().__call__(scope, receive, send)


_GAMES_ROOT = str(Path(__file__).resolve().parent.parent)
if Path(_GAMES_ROOT).is_dir():
    app.mount("/", NoCacheStaticFiles(directory=_GAMES_ROOT, html=True), name="games")
    logger.info(f"Serving game collection from {_GAMES_ROOT}")

# Serve React build at /mcp-dashboard (production PyInstaller or Tauri)
_FRONTEND_DIST = os.environ.get(
    "GAMES_FRONTEND_DIST",
    str(Path(__file__).resolve().parent / "dist"),
)
if Path(_FRONTEND_DIST).is_dir():
    app.mount("/mcp-dashboard", StaticFiles(directory=_FRONTEND_DIST, html=True), name="frontend")
    logger.info(f"Serving MCP dashboard from {_FRONTEND_DIST}")
