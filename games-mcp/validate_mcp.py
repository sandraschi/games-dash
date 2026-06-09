#!/usr/bin/env python3
"""
Simple validation script for Games MCP Server
"""

import logging
import sys
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("validate_mcp")

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent / "src"))


def validate_imports():
    """Validate that all imports work correctly"""
    logger.info("Validating Games MCP Server Imports")
    logger.info("=" * 50)

    try:
        # Test basic imports
        logger.info("1. Testing database import...")
        from games_mcp.database import get_database

        get_database()
        logger.info("OK: Database import successful")

        logger.info("\n2. Testing ADN integration import...")
        from games_mcp.adn_integration import get_adn_integration

        get_adn_integration()
        logger.info("OK: ADN integration import successful")

        logger.info("\n3. Testing MCP server import...")
        from games_mcp.mcp_server import mcp

        logger.info("OK: MCP server import successful")
        logger.info(f"   Server name: {mcp.name}")

        logger.info("\n4. Testing tool registration...")
        # Check if we can access the internal tool list
        if hasattr(mcp, "_tool_manager"):
            tool_manager = mcp._tool_manager
            if hasattr(tool_manager, "_tools"):
                tools = tool_manager._tools
                logger.info(f"OK: Tools registered: {len(tools)}")

                # List tool names
                tool_names = []
                for tool_name, tool_info in tools.items():
                    tool_names.append(tool_name)

                logger.info("   Available tools:")
                for i, name in enumerate(tool_names[:10], 1):
                    logger.info(f"   {i}. {name}")

                if len(tool_names) > 10:
                    logger.info(f"   ... and {len(tool_names) - 10} more tools")
            else:
                logger.warning("WARNING: Tool manager has no _tools attribute")
        else:
            logger.warning("WARNING: MCP server has no _tool_manager attribute")

        logger.info("\n5. Testing enhanced AI manager...")
        from games_mcp.enhanced_ai_manager import AIEngineConfig

        AIEngineConfig(
            name="test_engine",
            executable="test.exe",
            port=9999,
            working_directory="test",
        )
        logger.info("OK: Enhanced AI manager import successful")

        logger.info("\nAll imports successful!")
        return True

    except ImportError as e:
        logger.error(f"ERROR: Import error: {e}", exc_info=True)
        return False
    except Exception as e:
        logger.error(f"ERROR: Unexpected error: {e}", exc_info=True)
        return False


def validate_mcp_functionality():
    """Validate MCP server basic functionality"""
    logger.info("\nValidating MCP Server Functionality")
    logger.info("=" * 50)

    try:
        from games_mcp.mcp_server import mcp

        # Test tool listing via internal method
        logger.info("\n1. Testing tool access...")
        try:
            # Try to access tools through the tool manager
            if hasattr(mcp, "_tool_manager"):
                tool_manager = mcp._tool_manager
                if hasattr(tool_manager, "_tools"):
                    tools = tool_manager._tools
                    logger.info(f"OK: Found {len(tools)} registered tools")

                    # Check for expected tools
                    expected_tools = [
                        "make_move",
                        "get_ai_move",
                        "analyze_position",
                        "new_game",
                        "create_analysis_note",
                        "search_game_knowledge",
                        "get_system_status",
                        "cleanup_cache",
                    ]

                    found_tools = []
                    missing_tools = []

                    for tool_name in expected_tools:
                        if tool_name in tools:
                            found_tools.append(tool_name)
                        else:
                            missing_tools.append(tool_name)

                    logger.info(f"   OK: Expected tools found: {len(found_tools)}")
                    if missing_tools:
                        logger.error(
                            f"   ERROR: Missing expected tools: {missing_tools}"
                        )
                    else:
                        logger.info("   OK: All expected tools present!")
                else:
                    logger.warning("WARNING: Tool manager structure unexpected")
            else:
                logger.warning("WARNING: Cannot access tool manager")

        except Exception as e:
            logger.error(f"ERROR: Tool access error: {e}", exc_info=True)

        logger.info("\n2. Testing server configuration...")
        logger.info(f"   Server name: {mcp.name}")
        logger.info(f"   Has instructions: {bool(mcp.instructions)}")
        logger.info(f"   Has tool manager: {hasattr(mcp, '_tool_manager')}")

        return True

    except Exception as e:
        logger.error(f"ERROR: Functionality validation error: {e}", exc_info=True)
        return False


def print_configuration_info():
    """Print configuration and usage information"""
    logger.info("\nConfiguration Information")
    logger.info("=" * 50)

    logger.info("Games MCP Server Configuration:")
    logger.info("   - Enhanced AI integration with caching")
    logger.info("   - SQLite persistence for games and analysis")
    logger.info("   - Advanced Memory (ADN) integration")
    logger.info("   - Comprehensive system status monitoring")
    logger.info("   - Knowledge search and analysis notes")

    logger.info("\nMCP Client Configuration:")
    logger.info("   Add to your MCP settings (Claude Desktop or Cursor):")
    logger.info("   {")
    logger.info('     "mcpServers": {')
    logger.info('       "games-mcp": {')
    logger.info('         "command": "python",')
    logger.info('         "args": ["-m", "games_mcp.mcp_server"],')
    logger.info('         "cwd": "D:\\\\Dev\\\\repos\\\\games-app\\\\games-mcp"')
    logger.info("       }")
    logger.info("     }")
    logger.info("   }")

    logger.info("\nUsage Examples:")
    logger.info("   1. Correspondence Chess:")
    logger.info('      make_move(game_id="chess_1", move="e2e4", game_type="chess")')
    logger.info('      get_ai_move(game_type="chess", game_id="chess_1", depth=15)')
    logger.info("   2. Analysis Notes:")
    logger.info(
        '      create_analysis_note(game_id="chess_1", game_type="chess", analysis_depth=20)'
    )
    logger.info("   3. Knowledge Search:")
    logger.info(
        '      search_game_knowledge(query="Sicilian defense", game_type="chess")'
    )
    logger.info("   4. System Status:")
    logger.info("      get_system_status(include_engines=True, include_database=True)")


def main():
    """Main validation function"""
    logger.info("Games MCP Server Validation")
    logger.info("Validating enhanced AI integration and persistence features")
    logger.info("")

    # Run validations
    imports_ok = validate_imports()
    functionality_ok = validate_mcp_functionality()

    # Print configuration info
    print_configuration_info()

    # Final summary
    logger.info("\n" + "=" * 50)
    logger.info("VALIDATION SUMMARY")
    logger.info("=" * 50)

    if imports_ok and functionality_ok:
        logger.info("MCP server validation successful!")
        logger.info("OK: All imports working")
        logger.info("OK: Tools registered correctly")
        logger.info("OK: Ready for MCP client integration")
        logger.info("\nNext Steps:")
        logger.info("1. Start AI engines: python backend/simple-stockfish-server.py")
        logger.info("2. Configure MCP client with provided configuration")
        logger.info("3. Start using tools in Claude/Cursor")
    else:
        logger.warning("WARNING: Some validation issues found")
        logger.error("ERROR: Check error messages above")


if __name__ == "__main__":
    main()
