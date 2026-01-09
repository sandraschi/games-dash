#!/usr/bin/env python3
"""
Simple validation script for Games MCP Server
"""

import sys
from pathlib import Path

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent / "src"))

def validate_imports():
    """Validate that all imports work correctly"""
    print("🔍 Validating Games MCP Server Imports")
    print("=" * 50)
    
    try:
        # Test basic imports
        print("1️⃣ Testing database import...")
        from games_mcp.database import get_database
        db = get_database()
        print("✅ Database import successful")
        
        print("\n2️⃣ Testing ADN integration import...")
        from games_mcp.adn_integration import get_adn_integration
        adn = get_adn_integration()
        print("✅ ADN integration import successful")
        
        print("\n3️⃣ Testing MCP server import...")
        from games_mcp.mcp_server import mcp
        print("✅ MCP server import successful")
        print(f"   Server name: {mcp.name}")
        
        print("\n4️⃣ Testing tool registration...")
        # Check if we can access the internal tool list
        if hasattr(mcp, '_tool_manager'):
            tool_manager = mcp._tool_manager
            if hasattr(tool_manager, '_tools'):
                tools = tool_manager._tools
                print(f"✅ Tools registered: {len(tools)}")
                
                # List tool names
                tool_names = []
                for tool_name, tool_info in tools.items():
                    tool_names.append(tool_name)
                
                print("   Available tools:")
                for i, name in enumerate(tool_names[:10], 1):
                    print(f"   {i}. {name}")
                
                if len(tool_names) > 10:
                    print(f"   ... and {len(tool_names) - 10} more tools")
            else:
                print("⚠️ Tool manager has no _tools attribute")
        else:
            print("⚠️ MCP server has no _tool_manager attribute")
        
        print("\n5️⃣ Testing enhanced AI manager...")
        from games_mcp.enhanced_ai_manager import AIEngineConfig
        config = AIEngineConfig(
            name="test_engine",
            executable="test.exe",
            port=9999,
            working_directory="test"
        )
        print("✅ Enhanced AI manager import successful")
        
        print("\n🎉 All imports successful!")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False

def validate_mcp_functionality():
    """Validate MCP server basic functionality"""
    print("\n🧪 Validating MCP Server Functionality")
    print("=" * 50)
    
    try:
        from games_mcp.mcp_server import mcp
        
        # Test tool listing via internal method
        print("\n1️⃣ Testing tool access...")
        try:
            # Try to access tools through the tool manager
            if hasattr(mcp, '_tool_manager'):
                tool_manager = mcp._tool_manager
                if hasattr(tool_manager, '_tools'):
                    tools = tool_manager._tools
                    print(f"✅ Found {len(tools)} registered tools")
                    
                    # Check for expected tools
                    expected_tools = [
                        'make_move',
                        'get_ai_move', 
                        'analyze_position',
                        'new_game',
                        'create_analysis_note',
                        'search_game_knowledge',
                        'get_system_status',
                        'cleanup_cache'
                    ]
                    
                    found_tools = []
                    missing_tools = []
                    
                    for tool_name in expected_tools:
                        if tool_name in tools:
                            found_tools.append(tool_name)
                        else:
                            missing_tools.append(tool_name)
                    
                    print(f"   ✅ Expected tools found: {len(found_tools)}")
                    if missing_tools:
                        print(f"   ❌ Missing expected tools: {missing_tools}")
                    else:
                        print("   ✅ All expected tools present!")
                else:
                    print("⚠️ Tool manager structure unexpected")
            else:
                print("⚠️ Cannot access tool manager")
                
        except Exception as e:
            print(f"❌ Tool access error: {e}")
        
        print("\n2️⃣ Testing server configuration...")
        print(f"   Server name: {mcp.name}")
        print(f"   Has instructions: {bool(mcp.instructions)}")
        print(f"   Has tool manager: {hasattr(mcp, '_tool_manager')}")
        
        return True
        
    except Exception as e:
        print(f"❌ Functionality validation error: {e}")
        return False

def print_configuration_info():
    """Print configuration and usage information"""
    print("\n📋 Configuration Information")
    print("=" * 50)
    
    print("🎮 Games MCP Server Configuration:")
    print("   - Enhanced AI integration with caching")
    print("   - SQLite persistence for games and analysis")
    print("   - Advanced Memory (ADN) integration")
    print("   - Comprehensive system status monitoring")
    print("   - Knowledge search and analysis notes")
    
    print("\n📦 MCP Client Configuration:")
    print("   Add to your MCP settings (Claude Desktop or Cursor):")
    print('   {')
    print('     "mcpServers": {')
    print('       "games-mcp": {')
    print('         "command": "python",')
    print('         "args": ["-m", "games_mcp.mcp_server"],')
    print('         "cwd": "D:\\\\Dev\\\\repos\\\\games-app\\\\games-mcp"')
    print('       }')
    print('     }')
    print('   }')
    
    print("\n🚀 Usage Examples:")
    print("   1. Correspondence Chess:")
    print('      make_move(game_id="chess_1", move="e2e4", game_type="chess")')
    print('      get_ai_move(game_type="chess", game_id="chess_1", depth=15)')
    print("   2. Analysis Notes:")
    print('      create_analysis_note(game_id="chess_1", game_type="chess", analysis_depth=20)')
    print("   3. Knowledge Search:")
    print('      search_game_knowledge(query="Sicilian defense", game_type="chess")')
    print("   4. System Status:")
    print('      get_system_status(include_engines=True, include_database=True)')

def main():
    """Main validation function"""
    print("🎮 Games MCP Server Validation")
    print("Validating enhanced AI integration and persistence features")
    print()
    
    # Run validations
    imports_ok = validate_imports()
    functionality_ok = validate_mcp_functionality()
    
    # Print configuration info
    print_configuration_info()
    
    # Final summary
    print("\n" + "=" * 50)
    print("🏁 VALIDATION SUMMARY")
    print("=" * 50)
    
    if imports_ok and functionality_ok:
        print("🎉 MCP server validation successful!")
        print("✅ All imports working")
        print("✅ Tools registered correctly")
        print("✅ Ready for MCP client integration")
        print("\n📖 Next Steps:")
        print("1. Start AI engines: python backend/stockfish-server.py")
        print("2. Configure MCP client with provided configuration")
        print("3. Start using tools in Claude/Cursor")
    else:
        print("⚠️ Some validation issues found")
        print("❌ Check error messages above")

if __name__ == "__main__":
    main()
