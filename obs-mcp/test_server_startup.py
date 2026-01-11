#!/usr/bin/env python3
"""
Quick test to verify OBS MCP server can start without hanging.
"""

import asyncio
import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

async def test_server_startup():
    """Test that the server can be imported and initialized."""
    try:
        print("Importing OBS MCP server...")
        from obs_mcp.mcp_server import mcp

        print(f"Server name: {mcp.name}")

        tools = await mcp.get_tools()
        print(f"Number of tools: {len(tools)}")

        print("Server initialized successfully!")
        return True

    except Exception as e:
        print(f"Server startup failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_server_startup())
    sys.exit(0 if success else 1)