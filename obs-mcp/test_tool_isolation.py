#!/usr/bin/env python3
"""
Test individual tools to isolate which one causes the hanging issue.
"""

import asyncio
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

async def test_basic_tools():
    """Test just the basic connection tools."""
    try:
        from fastmcp import FastMCP

        mcp = FastMCP("test-obs-basic", instructions="Basic OBS tools", version="0.1.0")

        @mcp.tool()
        async def connect_obs() -> dict:
            """Connect to OBS Studio via websocket."""
            return {"success": True, "message": "Connected"}

        @mcp.tool()
        async def disconnect_obs() -> dict:
            """Disconnect from OBS Studio."""
            return {"success": True, "message": "Disconnected"}

        @mcp.tool()
        async def get_obs_status() -> dict:
            """Get comprehensive OBS status."""
            return {"success": True, "streaming": False, "recording": False}

        tools = await mcp.get_tools()
        print(f"Basic tools registered: {len(tools)}")
        return True

    except Exception as e:
        print(f"Basic tools test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_scene_tools():
    """Test scene management tools."""
    try:
        from fastmcp import FastMCP

        mcp = FastMCP("test-obs-scenes", instructions="Scene tools", version="0.1.0")

        @mcp.tool()
        async def list_scenes() -> dict:
            """List all scenes."""
            return {"success": True, "scenes": []}

        @mcp.tool()
        async def switch_scene(scene_name: str) -> dict:
            """Switch to scene."""
            return {"success": True, "message": f"Switched to {scene_name}"}

        @mcp.tool()
        async def create_scene(scene_name: str) -> dict:
            """Create new scene."""
            return {"success": True, "message": f"Created {scene_name}"}

        tools = await mcp.get_tools()
        print(f"Scene tools registered: {len(tools)}")
        return True

    except Exception as e:
        print(f"Scene tools test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_problematic_imports():
    """Test if the issue is with OBS websocket imports in tools."""
    try:
        from fastmcp import FastMCP
        from obs_mcp.mcp_server import OBSConnectionManager

        mcp = FastMCP("test-obs-imports", instructions="Import test", version="0.1.0")

        # Create manager but don't use it
        manager = OBSConnectionManager()

        @mcp.tool()
        async def test_obs_connection() -> dict:
            """Test OBS connection without actually connecting."""
            return {"success": True, "message": "Connection manager created"}

        tools = await mcp.get_tools()
        print(f"Import tools registered: {len(tools)}")
        return True

    except Exception as e:
        print(f"Import tools test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_pydantic_models():
    """Test if Pydantic models cause issues."""
    try:
        from fastmcp import FastMCP
        from pydantic import BaseModel, Field
        from typing import Optional

        class TestModel(BaseModel):
            name: str = Field(..., description="Test name")
            value: Optional[int] = Field(None, description="Test value")

        mcp = FastMCP("test-pydantic", instructions="Pydantic test", version="0.1.0")

        @mcp.tool()
        async def test_with_model(name: str, value: Optional[int] = None) -> dict:
            """Test tool with Pydantic model."""
            return {"success": True, "name": name, "value": value}

        tools = await mcp.get_tools()
        print(f"Pydantic tools registered: {len(tools)}")
        return True

    except Exception as e:
        print(f"Pydantic tools test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    """Run all tool isolation tests."""
    tests = [
        ("Basic Tools", test_basic_tools),
        ("Scene Tools", test_scene_tools),
        ("Problematic Imports", test_problematic_imports),
        ("Pydantic Models", test_pydantic_models),
    ]

    results = []
    for test_name, test_func in tests:
        print(f"\n--- {test_name} ---")
        try:
            result = await test_func()
            results.append((test_name, result))
            print(f"Result: {'PASSED' if result else 'FAILED'}")
        except Exception as e:
            print(f"Test crashed: {e}")
            results.append((test_name, False))

    print(f"\n{'='*50}")
    print("TOOL ISOLATION SUMMARY:")
    for test_name, result in results:
        status = "PASS" if result else "FAIL"
        print(f"  {status} {test_name}")

    passed = sum(1 for _, result in results if result)
    total = len(results)
    print(f"\nPassed: {passed}/{total}")

    if passed == total:
        print("All tool isolation tests passed!")
    else:
        print("Some tool tests failed - this indicates the issue.")

if __name__ == "__main__":
    asyncio.run(main())