# ai-games-collection-mcp (MCPB Bundle)

SOTA AI Games Collection MCP Server - Complete chess, Go, Shogi analysis and game management via Claude/Cursor

## Usage

Add to \claude_desktop_config.json\:
\\\json
{
  "mcpServers": {
    "ai-games-collection-mcp": {
      "command": "uv",
      "args": ["run", "--directory", "\D:\Dev\repos", "python", "-m", "ai_games_collection_mcp"],
      "env": { "PYTHONPATH": "\D:\Dev\repos/src" }
    }
  }
}
\\\

## Tools

- **help**: help
- **intelligent_game_analysis**: intelligent_game_analysis
- **strategic_game_session**: strategic_game_session
- **adaptive_game_coaching**: adaptive_game_coaching
- **sampling_capabilities_status**: sampling_capabilities_status
- **make_move**: make_move
- **get_ai_move**: get_ai_move
- **analyze_position**: analyze_position
- **get_game_state**: get_game_state
- **new_game**: new_game
- **create_tournament**: create_tournament
- **register_for_tournament**: register_for_tournament
- **generate_puzzle**: generate_puzzle
- **analyze_position_detailed**: analyze_position_detailed
- **get_player_statistics**: get_player_statistics
- **update_player_rating**: update_player_rating
- **check_engine_status**: check_engine_status
- **create_analysis_note**: create_analysis_note
- **search_game_knowledge**: search_game_knowledge
- **cleanup_cache**: cleanup_cache
- **get_system_status**: get_system_status
- **health**: health
- **get_state**: Returns the full internal state for the dashboard.
- **get_game**: Returns state for a specific game.

## Requirements

- Python 3.12+
- uv
