#!/usr/bin/env python3
"""
Test script for Games MCP Server
Validates all functionality and provides usage examples.
"""

import asyncio
import logging
import sys
from pathlib import Path

# Configure logging for test script
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("test_mcp_server")

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent / "src"))

# Import the MCP server instance directly
from games_mcp.mcp_server import mcp


# Import tool functions by accessing the MCP server's internal tools
async def call_tool(tool_name: str, *args, **kwargs):
    """Call a tool by name through the MCP server"""
    for tool in mcp.tools:
        if hasattr(tool, "name") and tool.name == tool_name:
            return await tool(*args, **kwargs)
    raise AttributeError(f"Tool {tool_name} not found")


async def test_basic_functionality():
    """Test basic MCP server functionality"""
    logger.info("Testing Games MCP Server Functionality")
    logger.info("=" * 50)

    tests = []

    # Test 1: Create new game
    logger.info("1. Testing new_game creation...")
    try:
        result = await call_tool("new_game", game_type="chess", game_id="test_game_1")
        if result["success"]:
            logger.info("OK: New game created successfully")
            tests.append("OK new_game")
        else:
            logger.error(
                f"FAILED: New game failed: {result.get('error', 'Unknown error')}"
            )
            tests.append("ERROR new_game")
    except Exception as e:
        logger.error(f"FAILED: New game exception: {e}", exc_info=True)
        tests.append("ERROR new_game")

    # Test 2: Make a move
    logger.info("2. Testing make_move...")
    try:
        result = await call_tool(
            "make_move", game_id="test_game_1", move="e2e4", game_type="chess"
        )
        if result["success"]:
            logger.info("OK: Move recorded successfully")
            tests.append("OK make_move")
        else:
            logger.error(f"FAILED: Move failed: {result.get('error', 'Unknown error')}")
            tests.append("ERROR make_move")
    except Exception as e:
        logger.error(f"FAILED: Move exception: {e}", exc_info=True)
        tests.append("ERROR make_move")

    # Test 3: Check engine status (will fail if engines not running)
    logger.info("3. Testing check_engine_status...")
    try:
        result = await call_tool("check_engine_status", "chess")
        if result["success"] and result["running"]:
            logger.info("OK: Chess engine is running")
            tests.append("OK check_engine_status")
        else:
            logger.warning(
                "WARNING: Chess engine not running (expected if not started)"
            )
            tests.append("WARNING check_engine_status")
    except Exception as e:
        logger.error(f"FAILED: Engine status exception: {e}", exc_info=True)
        tests.append("ERROR check_engine_status")

    # Test 4: System status
    logger.info("4. Testing get_system_status...")
    try:
        result = await call_tool(
            "get_system_status",
            include_engines=True,
            include_database=True,
            include_adn=True,
        )
        if result["success"]:
            logger.info("OK: System status retrieved")
            logger.info(f"   - Components: {list(result['components'].keys())}")
            logger.info(f"   - Active games: {result['statistics']['active_games']}")
            tests.append("OK get_system_status")
        else:
            logger.error(
                f"FAILED: System status failed: {result.get('error', 'Unknown error')}"
            )
            tests.append("ERROR get_system_status")
    except Exception as e:
        logger.error(f"FAILED: System status exception: {e}", exc_info=True)
        tests.append("ERROR get_system_status")

    # Test 5: Search game knowledge
    logger.info("5. Testing search_game_knowledge...")
    try:
        result = await call_tool(
            "search_game_knowledge",
            query="Sicilian defense",
            game_type="chess",
            max_results=3,
        )
        if result["success"]:
            logger.info(
                f"OK: Knowledge search successful: {result['results_count']} results"
            )
            tests.append("OK search_game_knowledge")
        else:
            logger.error(
                f"FAILED: Knowledge search failed: {result.get('error', 'Unknown error')}"
            )
            tests.append("ERROR search_game_knowledge")
    except Exception as e:
        logger.error(f"FAILED: Knowledge search exception: {e}", exc_info=True)
        tests.append("ERROR search_game_knowledge")

    # Test 6: Cache cleanup
    logger.info("6. Testing cleanup_cache...")
    try:
        result = await call_tool("cleanup_cache", older_than_hours=24)
        if result["success"]:
            logger.info("OK: Cache cleanup successful")
            tests.append("OK cleanup_cache")
        else:
            logger.error(
                f"FAILED: Cache cleanup failed: {result.get('error', 'Unknown error')}"
            )
            tests.append("ERROR cleanup_cache")
    except Exception as e:
        logger.error(f"FAILED: Cache cleanup exception: {e}", exc_info=True)
        tests.append("ERROR cleanup_cache")

    # Summary
    logger.info("\n" + "=" * 50)
    logger.info("TEST SUMMARY")
    logger.info("=" * 50)

    passed = sum(1 for test in tests if test.startswith("OK"))
    warnings = sum(1 for test in tests if test.startswith("WARNING"))
    failed = sum(1 for test in tests if test.startswith("ERROR"))

    logger.info(f"OK: Passed: {passed}")
    logger.info(f"WARNING: Warnings: {warnings}")
    logger.info(f"ERROR: Failed: {failed}")
    if (passed + warnings + failed) > 0:
        logger.info(f"Success Rate: {passed / (passed + warnings + failed) * 100:.1f}%")

    return passed, warnings, failed


async def test_ai_integration():
    """Test AI integration features"""
    logger.info("\nTesting AI Integration Features")
    logger.info("=" * 50)

    # Test AI move (will fail if Stockfish not running)
    logger.info("7. Testing get_ai_move...")
    try:
        result = await call_tool(
            "get_ai_move",
            game_type="chess",
            position="rnbqkbnr/pppppppp/8/8/4P3/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1",
            depth=10,
        )
        if result["success"]:
            if result.get("cached"):
                logger.info("OK: AI move (cached) retrieved successfully")
            else:
                logger.info("OK: AI move (fresh) retrieved successfully")
            logger.info(f"   Suggested move: {result['move']}")
        else:
            logger.warning("WARNING: AI move failed (engine not running - expected)")
            logger.warning(f"   Error: {result.get('error', 'Unknown error')}")
    except Exception as e:
        logger.error(f"FAILED: AI move exception: {e}", exc_info=True)


async def test_advanced_features():
    """Test advanced features like analysis notes"""
    logger.info("\nTesting Advanced Features")
    logger.info("=" * 50)

    # Test analysis note creation
    logger.info("8. Testing create_analysis_note...")
    try:
        result = await call_tool(
            "create_analysis_note",
            game_id="test_game_1",
            game_type="chess",
            position="rnbqkbnr/pppppppp/8/8/4P3/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1",
            analysis_depth=10,
        )
        if result["success"]:
            logger.info("OK: Analysis note creation initiated")
            logger.info(f"   Note created: {result['note_created']}")
        else:
            logger.warning(
                f"WARNING: Analysis note creation failed: {result.get('error', 'Unknown error')}"
            )
    except Exception as e:
        logger.error(f"FAILED: Analysis note exception: {e}", exc_info=True)


def print_usage_examples():
    """Print usage examples for the MCP server"""
    logger.info("\nUSAGE EXAMPLES")
    logger.info("=" * 50)

    examples = [
        {
            "tool": "make_move",
            "description": "Record a move in correspondence game",
            "example": 'make_move(game_id="chess_1", move="e2e4", game_type="chess")',
        },
        {
            "tool": "get_ai_move",
            "description": "Get AI move suggestion",
            "example": 'get_ai_move(game_type="chess", game_id="chess_1", depth=15)',
        },
        {
            "tool": "create_analysis_note",
            "description": "Create detailed analysis note in ADN",
            "example": 'create_analysis_note(game_id="chess_1", game_type="chess", analysis_depth=20)',
        },
        {
            "tool": "search_game_knowledge",
            "description": "Search game knowledge base",
            "example": 'search_game_knowledge(query="Sicilian defense", game_type="chess")',
        },
        {
            "tool": "get_system_status",
            "description": "Get comprehensive system status",
            "example": "get_system_status(include_engines=True, include_database=True)",
        },
    ]

    for i, example in enumerate(examples, 1):
        logger.info(f"\n{i}. {example['tool']}")
        logger.info(f"   Description: {example['description']}")
        logger.info(f"   Example: {example['example']}")


async def main():
    """Main test function"""
    logger.info("Games MCP Server Test Suite")
    logger.info("Testing enhanced AI integration and persistence features")
    logger.info("Make sure Stockfish server is running for full functionality:")
    logger.info("   python backend/simple-stockfish-server.py")
    logger.info("")

    # Run tests
    passed, warnings, failed = await test_basic_functionality()
    await test_ai_integration()
    await test_advanced_features()

    # Print usage examples
    print_usage_examples()

    # Final summary
    logger.info("\n" + "=" * 50)
    logger.info("FINAL RESULTS")
    logger.info("=" * 50)
    logger.info(f"Tests completed: {passed + warnings + failed}")
    logger.info(f"Success rate: {passed / (passed + warnings + failed) * 100:.1f}%")

    if failed == 0:
        logger.info("All critical tests passed! MCP server is ready for use.")
    else:
        logger.warning("Some tests failed. Check error messages above.")

    logger.info("\nNext Steps:")
    logger.info("1. Start AI engines: python backend/simple-stockfish-server.py")
    logger.info("2. Configure MCP client with games-mcp server")
    logger.info("3. Use tools in Claude/Cursor for correspondence games")


if __name__ == "__main__":
    asyncio.run(main())
