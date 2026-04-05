import logging
from mcp.server.fastmcp import FastMCP

from .config import LOG_LEVEL
from .services.db_service import db_service
from .services.engine_service import engine_service
from .services.sync_service import sync_manager
from .tools.gameplay import register_gameplay_tools
from .tools.analysis import register_analysis_tools
from .tools.management import register_management_tools
from .tools.orchestration import register_orchestration_tools

from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("games_mcp")

@asynccontextmanager
async def lifespan(server: FastMCP):
    """Server lifespan - handles initialization and cleanup."""
    logger.info("Games MCP Server starting up...")
    # Initialize services
    await db_service.initialize()
    await engine_service.initialize()
    sync_manager.initialize()
    logger.info("All services (DB, Engine, Sync) initialized.")
    yield
    logger.info("Games MCP Server shutting down...")

# Initialize FastMCP server
mcp = FastMCP(
    "Games MCP Server",
    dependencies=["aiohttp", "pydantic", "firebase-admin", "python-dotenv"],
    lifespan=lifespan,
)

# Register tools from modules
register_gameplay_tools(mcp)
register_analysis_tools(mcp)
register_management_tools(mcp)
register_orchestration_tools(mcp)


def main():
    """Main entry point for the server."""
    mcp.run()

if __name__ == "__main__":
    main()
