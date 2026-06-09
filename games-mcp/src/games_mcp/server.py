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
logger = logging.getLogger("games_mcp")


@asynccontextmanager
async def lifespan(_server: FastMCP):
    logger.info("Games MCP Server starting up...")
    await db_service.initialize()
    await engine_service.initialize()
    sync_manager.initialize()
    logger.info("All services (DB, Engine, Sync) initialized.")
    yield
    logger.info("Games MCP Server shutting down...")


mcp = FastMCP(
    "Games MCP Server",
    dependencies=["aiohttp", "pydantic", "firebase-admin", "python-dotenv"],
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
            allow_methods=["*"],
            allow_headers=["*"],
            expose_headers=["*"],
        )
    ]
    return mcp.http_app(middleware=middleware)


def main():
    """CLI entry point: runs FastMCP standalone."""
    mcp.run()


if __name__ == "__main__":
    main()
