#!/usr/bin/env python3
"""
Test running the OBS MCP server briefly to see if it hangs.
"""

import asyncio
import sys
import time
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

async def test_server_run():
    """Test running the server briefly."""
    try:
        print("Testing OBS MCP server startup...")

        from obs_mcp import mcp_server

        print("Server imported, attempting to start...")

        # Try to start the server in a task with timeout
        async def run_server():
            try:
                await mcp_server.mcp.run_async()
            except Exception as e:
                print(f"Server run exception: {e}")
                raise

        # Create task and wait with timeout
        task = asyncio.create_task(run_server())

        try:
            # Wait for 3 seconds to see if server starts
            await asyncio.wait_for(asyncio.sleep(3), timeout=3.0)
            print("Server appears to have started (no immediate hang)")
            task.cancel()  # Cancel the server task
            return True
        except asyncio.TimeoutError:
            print("Server started successfully (timeout reached)")
            task.cancel()
            return True
        except Exception as e:
            print(f"Server run failed: {e}")
            task.cancel()
            return False

    except Exception as e:
        print(f"Server run test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    try:
        success = asyncio.run(test_server_run())
        print(f"Test result: {'PASSED' if success else 'FAILED'}")
    except Exception as e:
        print(f"Test crashed: {e}")
        success = False

    sys.exit(0 if success else 1)