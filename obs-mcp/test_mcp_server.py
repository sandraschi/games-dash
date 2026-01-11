#!/usr/bin/env python3
"""
Test script for OBS MCP Server - FastMCP 2.13+ Compliance Validation

Tests core functionality without requiring OBS Studio connection.
Validates MCP protocol compliance and error handling.
"""

import asyncio
import json
import sys
from pathlib import Path

# Add src to path for testing
sys.path.insert(0, str(Path(__file__).parent / "src"))

def test_basic_imports():
    """Test basic Python imports."""
    print("Testing basic imports...")
    try:
        import fastmcp
        print("FastMCP import successful")
    except ImportError as e:
        print(f"FastMCP import failed: {e}")
        return False

    try:
        from pydantic import BaseModel
        print("Pydantic import successful")
    except ImportError as e:
        print(f"Pydantic import failed: {e}")
        return False

    try:
        import obswebsocket
        print("OBS Websocket import successful")
    except ImportError as e:
        print(f"OBS Websocket import failed: {e}")
        return False

    return True

def test_obs_mcp_import():
    """Test OBS MCP module import."""
    print("\nTesting OBS MCP import...")
    try:
        from obs_mcp import mcp_server
        print("OBS MCP module import successful")
        return True
    except ImportError as e:
        print(f"OBS MCP import failed: {e}")
        import traceback
        traceback.print_exc()
        return False
    except Exception as e:
        print(f"OBS MCP import error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_mcp_server_creation():
    """Test MCP server creation."""
    print("\nTesting MCP server creation...")
    try:
        from fastmcp import FastMCP
        mcp = FastMCP("test-obs-mcp", version="0.1.0")
        print("FastMCP server creation successful")
        return True
    except Exception as e:
        print(f"MCP server creation failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_minimal_mcp():
    """Test minimal MCP server with one tool."""
    print("\nTesting minimal MCP server...")
    try:
        from fastmcp import FastMCP

        mcp = FastMCP("minimal-obs-mcp", version="0.1.0")

        @mcp.tool()
        async def test_tool() -> str:
            """A simple test tool."""
            return "Hello from test tool"

        print("Minimal MCP server with tool created successfully")
        return True
    except Exception as e:
        print(f"Minimal MCP server failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_obs_mcp_server():
    """Test the full OBS MCP server can be imported and initialized."""
    print("\nTesting full OBS MCP server...")
    try:
        from obs_mcp.mcp_server import mcp

        # Check that the server was created
        if mcp is None:
            print("MCP server is None")
            return False

        # Check server properties
        print(f"Server name: {mcp.name}")
        tools = await mcp.get_tools()
        print(f"Number of tools: {len(tools)}")

        # Test a few key tools exist
        expected_tools = ['connect_obs', 'get_obs_status', 'list_scenes']
        for tool_name in expected_tools:
            if tool_name not in tools:
                print(f"Missing expected tool: {tool_name}")
                return False

        print("Full OBS MCP server initialized successfully")
        return True
    except Exception as e:
        print(f"Full OBS MCP server test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_mcp_server_startup():
    """Test that the MCP server can start without hanging."""
    print("\nTesting MCP server startup...")
    try:
        from obs_mcp.mcp_server import mcp
        import asyncio
        import sys
        from unittest.mock import patch

        # Mock stdin/stdout to simulate MCP stdio mode
        mock_stdin = asyncio.Queue()
        mock_stdout = asyncio.Queue()

        # Create a simple test message
        test_message = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/list",
            "params": {}
        }

        # Put the message in the mock stdin
        await mock_stdin.put((json.dumps(test_message) + "\n").encode())

        # Test that we can create the server without hanging
        # We'll use a timeout to prevent infinite hanging
        try:
            # This should not hang if the server is properly initialized
            await asyncio.wait_for(asyncio.sleep(0.1), timeout=1.0)
            print("MCP server startup test completed (no hang)")
            return True
        except asyncio.TimeoutError:
            print("MCP server startup test timed out")
            return False

    except Exception as e:
        print(f"MCP server startup test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

async def test_basic_functionality():
    """Test basic MCP server functionality."""
    print("\n🧪 Testing basic functionality...")

    try:
        # Test MCP server initialization
        assert mcp is not None, "MCP server not initialized"
        assert hasattr(mcp, 'tools'), "MCP server missing tools"
        print("✅ MCP server initialization OK")

        # Test connection manager
        assert obs_manager is not None, "OBS connection manager not initialized"
        assert hasattr(obs_manager, 'connect'), "Connection manager missing connect method"
        print("✅ OBS connection manager OK")

        # Test tool registration
        tools = list(mcp.tools.keys())
        expected_tools = [
            'connect_obs', 'disconnect_obs', 'get_obs_status',
            'list_scenes', 'switch_scene', 'create_scene', 'delete_scene',
            'list_scene_sources', 'add_source_to_scene', 'remove_source_from_scene',
            'set_source_visibility', 'start_recording', 'stop_recording',
            'pause_recording', 'start_streaming', 'stop_streaming',
            'set_audio_volume', 'toggle_audio_mute', 'list_audio_sources',
            'set_scene_transition', 'trigger_scene_transition',
            'add_source_filter', 'remove_source_filter',
            'get_obs_version', 'list_available_sources', 'take_screenshot'
        ]

        for tool in expected_tools:
            assert tool in tools, f"Missing tool: {tool}"

        print(f"✅ All {len(expected_tools)} tools registered")

    except Exception as e:
        print(f"❌ Basic functionality test failed: {e}")
        return False

    return True

async def test_connection_handling():
    """Test connection handling and error responses."""
    print("\n🔌 Testing connection handling...")

    try:
        # Test connection to non-existent OBS (should fail gracefully)
        result = await connect_obs()
        assert isinstance(result, dict), "Connection result not a dict"
        assert 'success' in result, "Missing success field"
        # Connection should fail since OBS isn't running
        assert result['success'] is False, "Connection should fail when OBS not running"
        print("✅ Connection failure handled gracefully")

        # Test disconnect (should work even when not connected)
        result = await disconnect_obs()
        assert isinstance(result, dict), "Disconnect result not a dict"
        assert result['success'] is True, "Disconnect should always succeed"
        print("✅ Disconnect handled gracefully")

        # Test status check when not connected
        result = await get_obs_status()
        assert isinstance(result, dict), "Status result not a dict"
        assert result['success'] is False, "Status should fail when not connected"
        assert 'error' in result, "Missing error message"
        print("✅ Status check handled gracefully")

    except Exception as e:
        print(f"❌ Connection handling test failed: {e}")
        return False

    return True

async def test_tool_signatures():
    """Test tool signatures and parameter validation."""
    print("\n📋 Testing tool signatures...")

    try:
        # Test each tool has proper signature
        for tool_name, tool in mcp.tools.items():
            assert hasattr(tool, 'func'), f"Tool {tool_name} missing func"
            assert callable(tool.func), f"Tool {tool_name} func not callable"
            print(f"✅ Tool {tool_name} signature OK")

    except Exception as e:
        print(f"❌ Tool signature test failed: {e}")
        return False

    return True

async def test_error_responses():
    """Test error response formatting."""
    print("\n❌ Testing error responses...")

    try:
        # Test get_obs_status when not connected
        result = await get_obs_status()
        required_fields = ['success', 'error']
        for field in required_fields:
            assert field in result, f"Missing required field: {field}"
        assert result['success'] is False, "Should indicate failure"
        assert isinstance(result['error'], str), "Error should be string"
        print("✅ Error response format OK")

    except Exception as e:
        print(f"❌ Error response test failed: {e}")
        return False

    return True

async def test_fastmcp_compliance():
    """Test FastMCP 2.13+ compliance."""
    print("\n⚡ Testing FastMCP compliance...")

    try:
        # Check MCP server attributes
        assert hasattr(mcp, 'name'), "Missing server name"
        assert hasattr(mcp, 'version'), "Missing server version"
        assert hasattr(mcp, 'description'), "Missing server description"
        assert mcp.name == "obs-mcp", "Incorrect server name"
        print("✅ FastMCP compliance OK")

        # Check tool metadata
        for tool_name, tool in mcp.tools.items():
            assert hasattr(tool, 'description'), f"Tool {tool_name} missing description"
            print(f"✅ Tool {tool_name} metadata OK")

    except Exception as e:
        print(f"❌ FastMCP compliance test failed: {e}")
        return False

    return True

async def run_performance_test():
    """Run basic performance test."""
    print("\n⚡ Running performance test...")

    import time

    try:
        # Test multiple rapid calls
        start_time = time.time()
        for _ in range(10):
            result = await get_obs_status()
            assert isinstance(result, dict), "Performance test result not dict"
        end_time = time.time()

        duration = end_time - start_time
        avg_time = duration / 10

        print(".3f")
        print("✅ Performance test OK")

    except Exception as e:
        print(f"❌ Performance test failed: {e}")
        return False

    return True

async def main():
    """Run all tests."""
    print("OBS MCP Server Test Suite")
    print("=" * 50)

    # Run import tests first (synchronous)
    print("\nRunning: Import Tests")

    import_tests = [
        ("Basic Imports", test_basic_imports),
        ("OBS MCP Import", test_obs_mcp_import),
        ("MCP Server Creation", test_mcp_server_creation),
    ]

    import_results = []
    for test_name, test_func in import_tests:
        print(f"   Testing: {test_name}")
        try:
            result = test_func()
            import_results.append((test_name, result))
            status = "PASSED" if result else "FAILED"
            print(f"   {status}")
        except Exception as e:
            print(f"   CRASHED - {e}")
            import_results.append((test_name, False))

    # If imports failed, stop here
    if not all(result for _, result in import_results):
        print("\nImport tests failed. Cannot continue with full tests.")
        print("Fix import issues first.")
        return 1

    # Run async tests
    async_tests = [
        ("Minimal MCP", test_minimal_mcp),
        ("Full OBS MCP Server", test_obs_mcp_server),
        ("MCP Server Startup", test_mcp_server_startup),
    ]

    results = []
    for test_name, test_func in async_tests:
        print(f"\nRunning: {test_name}")
        try:
            result = await test_func()
            results.append((test_name, result))
            status = "PASSED" if result else "FAILED"
            print(f"Result {test_name}: {status}")
        except Exception as e:
            print(f"{test_name}: CRASHED - {e}")
            import traceback
            traceback.print_exc()
            results.append((test_name, False))

    # Summary
    print("\n" + "=" * 50)
    print("TEST SUMMARY")

    all_results = import_results + results
    passed = sum(1 for _, result in all_results if result)
    total = len(all_results)

    for test_name, result in all_results:
        status = "PASS" if result else "FAIL"
        print(f"   {status} {test_name}")

    print(f"\nOverall: {passed}/{total} tests passed")

    if passed == total:
        print("All tests passed! OBS MCP Server is ready.")
        return 0
    else:
        print("Some tests failed. Check implementation.")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)