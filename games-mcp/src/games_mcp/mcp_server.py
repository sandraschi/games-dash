"""
SOTA Games MCP Server - Modular Refactor (Phase 2)
Transitioning from monolith to modular package structure.
"""
import logging
import asyncio
from typing import Any

from .server import mcp, main

# For backward compatibility if any tool is directly imported from here
# and for the FastMCP entry point in pyproject.toml

if __name__ == "__main__":
    main()
