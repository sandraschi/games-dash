#!/usr/bin/env python3
"""
Test importing OBS-related modules to isolate the hanging issue.
"""

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

def test_obs_imports():
    """Test importing OBS websocket modules."""
    try:
        print("Testing OBS websocket import...")
        import obswebsocket
        print("OBS websocket imported successfully")
        return True
    except Exception as e:
        print(f"OBS websocket import failed: {e}")
        return False

def test_obs_mcp_partial_import():
    """Test importing parts of the OBS MCP server."""
    try:
        print("Testing partial OBS MCP import...")

        # Import just the basic FastMCP setup
        from fastmcp import FastMCP
        print("FastMCP imported")

        # Try importing the server module step by step
        from obs_mcp import mcp_server
        print("OBS MCP module imported")

        # Try accessing the MCP instance
        mcp = mcp_server.mcp
        print("MCP instance accessed")

        return True
    except Exception as e:
        print(f"Partial import failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_obs_connection_manager():
    """Test the OBS connection manager class."""
    try:
        print("Testing OBS connection manager...")
        from obs_mcp.mcp_server import OBSConnectionManager

        manager = OBSConnectionManager()
        print("OBS connection manager created")
        return True
    except Exception as e:
        print(f"OBS connection manager failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    tests = [
        ("OBS Imports", test_obs_imports),
        ("Partial OBS MCP Import", test_obs_mcp_partial_import),
        ("OBS Connection Manager", test_obs_connection_manager),
    ]

    results = []
    for test_name, test_func in tests:
        print(f"\n--- {test_name} ---")
        try:
            result = test_func()
            results.append((test_name, result))
            print(f"Result: {'PASSED' if result else 'FAILED'}")
        except Exception as e:
            print(f"Test crashed: {e}")
            results.append((test_name, False))

    print(f"\n{'='*50}")
    print("SUMMARY:")
    for test_name, result in results:
        status = "PASS" if result else "FAIL"
        print(f"  {status} {test_name}")

    passed = sum(1 for _, result in results if result)
    total = len(results)
    print(f"\nPassed: {passed}/{total}")

    if passed == total:
        print("All import tests passed!")
    else:
        print("Some import tests failed - this may indicate the source of the hang.")