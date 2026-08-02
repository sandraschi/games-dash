import logging
from contextlib import asynccontextmanager

from fastmcp import FastMCP

from .config import LOG_LEVEL
from .services.db_service import db_service
from .services.engine_service import engine_service
from .services.sync_service import sync_manager
from .tools.analysis import register_analysis_tools
from .tools.gameplay import register_gameplay_tools
from .tools.management import register_management_tools
from .tools.orchestration import register_orchestration_tools

logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("ai_games_collection_mcp")


@asynccontextmanager
async def lifespan(_server: FastMCP):
    logger.info("AI Games Collection MCP Server starting up...")
    await db_service.initialize()
    await engine_service.initialize()
    sync_manager.initialize()
    logger.info("All services (DB, Engine, Sync) initialized.")
    yield
    logger.info("AI Games Collection MCP Server shutting down...")


mcp = FastMCP(
    "AI Games Collection MCP Server",
    lifespan=lifespan,
)

register_gameplay_tools(mcp)
register_analysis_tools(mcp)
register_management_tools(mcp)
register_orchestration_tools(mcp)


def http_app():
    """Return ASGI app for HTTP/SSE transport (FastMCP 3.2+).

    Mounted by the FastAPI gateway at /mcp.
    """
    from starlette.middleware import Middleware  # noqa: PLC0415
    from starlette.middleware.cors import CORSMiddleware  # noqa: PLC0415

    allowed_origins = [
        "http://localhost:10986",
        "http://127.0.0.1:10986",
        "tauri://localhost",
        "http://tauri.localhost",
        "https://tauri.localhost",
    ]
    middleware = [
        Middleware(
            CORSMiddleware,
            allow_origins=allowed_origins,
            allow_origin_regex=r"https?://(?:[a-zA-Z0-9-]+\.ts\.net|.*?\.tail-[a-f0-9]+\.ts\.net|tauri\.localhost|localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|100\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::\d+)?$|^tauri://localhost$",
            allow_methods=["*"],
            allow_headers=["*"],
            expose_headers=["*"],
        )
    ]
    # path="/": this app is MOUNTED at /mcp by the FastAPI gateway, so its inner
    # route must be root; the default "/mcp" would produce /mcp/mcp → 404/405.
    return mcp.http_app(path="/", middleware=middleware)


def main():
    """CLI entry point: runs FastMCP standalone."""
    mcp.run()


if __name__ == "__main__":
    main()
