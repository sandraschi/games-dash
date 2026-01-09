#!/usr/bin/env python3
"""
Test script for Games MCP Server
Validates all functionality and provides usage examples.
"""

import asyncio
import sys
import json
from pathlib import Path

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent / "src"))

# Import the MCP server instance directly
from games_mcp.mcp_server import mcp

# Import tool functions by accessing the MCP server's internal tools
async def call_tool(tool_name: str, *args, **kwargs):
    """Call a tool by name through the MCP server"""
    for tool in mcp.tools:
        if hasattr(tool, 'name') and tool.name == tool_name:
            return await tool(*args, **kwargs)
    raise AttributeError(f"Tool {tool_name} not found")

async def test_basic_functionality():
    """Test basic MCP server functionality"""
    print("🧪 Testing Games MCP Server Functionality")
    print("=" * 50)
    
    tests = []
    
    # Test 1: Create new game
    print("\n1️⃣ Testing new_game creation...")
    try:
        result = await call_tool("new_game", game_type="chess", game_id="test_game_1")
        if result["success"]:
            print("✅ New game created successfully")
            tests.append("✅ new_game")
        else:
            print(f"❌ New game failed: {result.get('error', 'Unknown error')}")
            tests.append("❌ new_game")
    except Exception as e:
        print(f"❌ New game exception: {e}")
        tests.append("❌ new_game")
    
    # Test 2: Make a move
    print("\n2️⃣ Testing make_move...")
    try:
        result = await call_tool("make_move",
            game_id="test_game_1",
            move="e2e4",
            game_type="chess"
        )
        if result["success"]:
            print("✅ Move recorded successfully")
            tests.append("✅ make_move")
        else:
            print(f"❌ Move failed: {result.get('error', 'Unknown error')}")
            tests.append("❌ make_move")
    except Exception as e:
        print(f"❌ Move exception: {e}")
        tests.append("❌ make_move")
    
    # Test 3: Check engine status (will fail if engines not running)
    print("\n3️⃣ Testing check_engine_status...")
    try:
        result = await call_tool("check_engine_status", "chess")
        if result["success"] and result["running"]:
            print("✅ Chess engine is running")
            tests.append("✅ check_engine_status")
        else:
            print("⚠️ Chess engine not running (expected if not started)")
            tests.append("⚠️ check_engine_status")
    except Exception as e:
        print(f"❌ Engine status exception: {e}")
        tests.append("❌ check_engine_status")
    
    # Test 4: System status
    print("\n4️⃣ Testing get_system_status...")
    try:
        result = await call_tool("get_system_status",
            include_engines=True,
            include_database=True,
            include_adn=True
        )
        if result["success"]:
            print("✅ System status retrieved")
            print(f"   - Components: {list(result['components'].keys())}")
            print(f"   - Active games: {result['statistics']['active_games']}")
            tests.append("✅ get_system_status")
        else:
            print(f"❌ System status failed: {result.get('error', 'Unknown error')}")
            tests.append("❌ get_system_status")
    except Exception as e:
        print(f"❌ System status exception: {e}")
        tests.append("❌ get_system_status")
    
    # Test 5: Search game knowledge
    print("\n5️⃣ Testing search_game_knowledge...")
    try:
        result = await call_tool("search_game_knowledge",
            query="Sicilian defense",
            game_type="chess",
            max_results=3
        )
        if result["success"]:
            print(f"✅ Knowledge search successful: {result['results_count']} results")
            tests.append("✅ search_game_knowledge")
        else:
            print(f"❌ Knowledge search failed: {result.get('error', 'Unknown error')}")
            tests.append("❌ search_game_knowledge")
    except Exception as e:
        print(f"❌ Knowledge search exception: {e}")
        tests.append("❌ search_game_knowledge")
    
    # Test 6: Cache cleanup
    print("\n6️⃣ Testing cleanup_cache...")
    try:
        result = await call_tool("cleanup_cache", older_than_hours=24)
        if result["success"]:
            print("✅ Cache cleanup successful")
            tests.append("✅ cleanup_cache")
        else:
            print(f"❌ Cache cleanup failed: {result.get('error', 'Unknown error')}")
            tests.append("❌ cleanup_cache")
    except Exception as e:
        print(f"❌ Cache cleanup exception: {e}")
        tests.append("❌ cleanup_cache")
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    
    passed = sum(1 for test in tests if test.startswith("✅"))
    warnings = sum(1 for test in tests if test.startswith("⚠️"))
    failed = sum(1 for test in tests if test.startswith("❌"))
    
    print(f"✅ Passed: {passed}")
    print(f"⚠️ Warnings: {warnings}")
    print(f"❌ Failed: {failed}")
    print(f"📈 Success Rate: {passed/(passed+warnings+failed)*100:.1f}%")
    
    return passed, warnings, failed

async def test_ai_integration():
    """Test AI integration features"""
    print("\n🤖 Testing AI Integration Features")
    print("=" * 50)
    
    # Test AI move (will fail if Stockfish not running)
    print("\n7️⃣ Testing get_ai_move...")
    try:
        result = await call_tool("get_ai_move",
            game_type="chess",
            position="rnbqkbnr/pppppppp/8/8/4P3/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1",
            depth=10
        )
        if result["success"]:
            if result.get("cached"):
                print("✅ AI move (cached) retrieved successfully")
            else:
                print("✅ AI move (fresh) retrieved successfully")
            print(f"   Suggested move: {result['move']}")
        else:
            print("⚠️ AI move failed (engine not running - expected)")
            print(f"   Error: {result.get('error', 'Unknown error')}")
    except Exception as e:
        print(f"❌ AI move exception: {e}")

async def test_advanced_features():
    """Test advanced features like analysis notes"""
    print("\n🧠 Testing Advanced Features")
    print("=" * 50)
    
    # Test analysis note creation
    print("\n8️⃣ Testing create_analysis_note...")
    try:
        result = await call_tool("create_analysis_note",
            game_id="test_game_1",
            game_type="chess",
            position="rnbqkbnr/pppppppp/8/8/4P3/8/8/PPPPPPPP/RNBQKBNR b KQkq - 0 1",
            analysis_depth=10
        )
        if result["success"]:
            print("✅ Analysis note creation initiated")
            print(f"   Note created: {result['note_created']}")
        else:
            print(f"⚠️ Analysis note creation failed: {result.get('error', 'Unknown error')}")
    except Exception as e:
        print(f"❌ Analysis note exception: {e}")

def print_usage_examples():
    """Print usage examples for the MCP server"""
    print("\n📚 USAGE EXAMPLES")
    print("=" * 50)
    
    examples = [
        {
            "tool": "make_move",
            "description": "Record a move in correspondence game",
            "example": 'make_move(game_id="chess_1", move="e2e4", game_type="chess")'
        },
        {
            "tool": "get_ai_move", 
            "description": "Get AI move suggestion",
            "example": 'get_ai_move(game_type="chess", game_id="chess_1", depth=15)'
        },
        {
            "tool": "create_analysis_note",
            "description": "Create detailed analysis note in ADN",
            "example": 'create_analysis_note(game_id="chess_1", game_type="chess", analysis_depth=20)'
        },
        {
            "tool": "search_game_knowledge",
            "description": "Search game knowledge base",
            "example": 'search_game_knowledge(query="Sicilian defense", game_type="chess")'
        },
        {
            "tool": "get_system_status",
            "description": "Get comprehensive system status",
            "example": 'get_system_status(include_engines=True, include_database=True)'
        }
    ]
    
    for i, example in enumerate(examples, 1):
        print(f"\n{i}. {example['tool']}")
        print(f"   Description: {example['description']}")
        print(f"   Example: {example['example']}")

async def main():
    """Main test function"""
    print("🎮 Games MCP Server Test Suite")
    print("Testing enhanced AI integration and persistence features")
    print("Make sure Stockfish server is running for full functionality:")
    print("   python backend/stockfish-server.py")
    print()
    
    # Run tests
    passed, warnings, failed = await test_basic_functionality()
    await test_ai_integration()
    await test_advanced_features()
    
    # Print usage examples
    print_usage_examples()
    
    # Final summary
    print("\n" + "=" * 50)
    print("🏁 FINAL RESULTS")
    print("=" * 50)
    print(f"Tests completed: {passed + warnings + failed}")
    print(f"Success rate: {passed/(passed+warnings+failed)*100:.1f}%")
    
    if failed == 0:
        print("🎉 All critical tests passed! MCP server is ready for use.")
    else:
        print("⚠️ Some tests failed. Check error messages above.")
    
    print("\n📖 Next Steps:")
    print("1. Start AI engines: python backend/stockfish-server.py")
    print("2. Configure MCP client with games-mcp server")
    print("3. Use tools in Claude/Cursor for correspondence games")

if __name__ == "__main__":
    asyncio.run(main())
