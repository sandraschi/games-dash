#!/usr/bin/env python3
"""
Test what happens when Claude calls tools/list - the operation that was hanging.
"""

import asyncio
import json
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

async def test_tools_list():
    """Test the tools/list operation that was hanging."""
    try:
        print("Testing tools/list operation...")

        from obs_mcp import mcp_server

        # Get the MCP instance
        mcp = mcp_server.mcp

        # This is what happens when Claude calls tools/list
        print("Calling mcp.get_tools()...")
        tools = await mcp.get_tools()

        print(f"Successfully retrieved {len(tools)} tools")

        # Print some tool names to verify
        tool_names = list(tools.keys())[:5]  # First 5 tools
        print(f"Sample tools: {tool_names}")

        # Try to serialize the tools (what MCP protocol does)
        print("Testing tool serialization...")
        tools_json = json.dumps(list(tools.keys()))
        print(f"Successfully serialized {len(tools)} tool names")

        print("tools/list operation completed successfully")
        return True

    except Exception as e:
        print(f"tools/list test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_tools_list())
    print(f"Test result: {'PASSED' if success else 'FAILED'}")
    sys.exit(0 if success else 1)