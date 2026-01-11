#!/usr/bin/env python3
"""
Test full OBS MCP server import without running the server.
"""

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

def test_full_import():
    """Test importing the full OBS MCP server."""
    try:
        print("Testing full OBS MCP server import...")

        # Import the full server module
        from obs_mcp import mcp_server

        print("Full server module imported")

        # Access the MCP instance
        mcp = mcp_server.mcp
        print("MCP instance accessed")

        # Check if it's a FastMCP instance
        from fastmcp import FastMCP
        if isinstance(mcp, FastMCP):
            print("MCP instance is correct type")
        else:
            print(f"MCP instance is wrong type: {type(mcp)}")
            return False

        print("Full OBS MCP server import successful")
        return True

    except Exception as e:
        print(f"Full import failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_full_import()
    print(f"Test result: {'PASSED' if success else 'FAILED'}")
    sys.exit(0 if success else 1)