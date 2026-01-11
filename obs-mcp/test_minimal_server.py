#!/usr/bin/env python3
"""
Minimal OBS MCP server test - just a few tools to isolate the hanging issue.
"""

import asyncio
import logging
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

# Set up logging
logging.basicConfig(level=logging.INFO, stream=sys.stderr)
logger = logging.getLogger(__name__)

async def test_minimal_server():
    """Test with just a few basic tools."""
    try:
        from fastmcp import FastMCP

        # Create minimal server
        mcp = FastMCP(
            name="minimal-obs-mcp",
            instructions="Minimal OBS MCP server for testing",
            version="0.1.0",
        )

        @mcp.tool()
        async def test_tool() -> str:
            """A simple test tool."""
            return "Hello from minimal OBS MCP server"

        @mcp.tool()
        async def connect_obs() -> dict:
            """Connect to OBS Studio."""
            return {"success": True, "message": "Connected (simulated)"}

        # Test that tools are registered
        tools = await mcp.get_tools()
        print(f"Registered tools: {tools}")

        # Try to simulate what happens during MCP protocol
        print("Testing MCP server initialization...")

        # This is what would happen when Claude calls tools/list
        # The server should not hang here
        await asyncio.sleep(0.1)  # Small delay to test async

        print("Minimal server test completed successfully")
        return True

    except Exception as e:
        print(f"Minimal server test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_minimal_server())
    print(f"Test result: {'PASSED' if success else 'FAILED'}")
    sys.exit(0 if success else 1)