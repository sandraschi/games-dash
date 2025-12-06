#!/usr/bin/env python3
"""
Games MCP Server - Correspondence Chess and Game Analysis
**Timestamp**: 2025-12-04

Enables correspondence play via Claude/Cursor:
- User: "I moved rook from e1 to e4"
- Claude: Consults Stockfish and responds with best move
- Perfect for playing while away from computer (e.g., physical board in Caracas)
"""

import asyncio
import aiohttp
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field
from fastmcp import FastMCP

# Initialize FastMCP server
mcp = FastMCP(
    "Games-MCP",
    instructions="""
    Games MCP Server - Play correspondence chess and get game analysis via Claude/Cursor.
    
    Perfect for:
    - Correspondence chess (turn-based, async)
    - Playing with physical board while away from computer
    - Getting AI analysis and move suggestions
    - Turn-based games (Chess, Shogi, Go)
    
    Example workflow:
    1. User: "I moved rook from e1 to e4"
    2. Claude: Records move, gets Stockfish analysis
    3. Claude: "Stockfish suggests Nf6. The position is equal."
    4. User: Makes move on physical board, tells Claude
    5. Repeat...
    """
)

# Game server endpoints
STOCKFISH_URL = "http://localhost:9543"
SHOGI_URL = "http://localhost:9544"
GO_URL = "http://localhost:9545"

# In-memory game state (can be persisted to SQLite later)
active_games: Dict[str, Dict[str, Any]] = {}


class MoveInput(BaseModel):
    """Input for making a move"""
    game_id: str = Field(..., description="Game identifier (e.g., 'chess_1', 'shogi_1')")
    move: str = Field(..., description="Move in standard notation (e.g., 'e2e4', 'Nf3', '1-1')")
    game_type: str = Field(default="chess", description="Game type: chess, shogi, or go")
    fen: Optional[str] = Field(None, description="Current position in FEN notation (for chess)")


class AnalysisInput(BaseModel):
    """Input for position analysis"""
    game_type: str = Field(..., description="Game type: chess, shogi, or go")
    position: str = Field(..., description="Position (FEN for chess, SGF for go, etc.)")
    depth: int = Field(default=15, description="Analysis depth")
    skill_level: int = Field(default=20, description="AI skill level (1-20)")


class GameStateInput(BaseModel):
    """Input for getting game state"""
    game_id: str = Field(..., description="Game identifier")


@mcp.tool()
async def make_move(
    game_id: str,
    move: str,
    game_type: str = "chess",
    fen: Optional[str] = None
) -> Dict[str, Any]:
    """
    Record a move in a correspondence game.
    
    Use this when the user tells you they made a move on their physical board.
    The move will be recorded and you can then get AI analysis.
    
    Args:
        game_id: Unique game identifier (e.g., 'chess_1', 'correspondence_steve')
        move: Move in standard notation:
            - Chess: 'e2e4', 'Nf3', 'O-O' (castling), 'e7e8q' (promotion)
            - Shogi: '7g7f', 'B*5e' (drop)
            - Go: 'A1', 'K10', 'pass'
        game_type: Type of game (chess, shogi, go)
        fen: Current FEN position (for chess). If not provided, uses stored position.
    
    Returns:
        Dict with move confirmation and updated position
    """
    try:
        # Initialize game if it doesn't exist
        if game_id not in active_games:
            active_games[game_id] = {
                'game_type': game_type,
                'moves': [],
                'fen': 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' if game_type == 'chess' else None,
                'position': None
            }
        
        game = active_games[game_id]
        
        # Record move
        game['moves'].append({
            'move': move,
            'timestamp': asyncio.get_event_loop().time()
        })
        
        # Update position if FEN provided
        if fen:
            game['fen'] = fen
        
        return {
            'success': True,
            'game_id': game_id,
            'move': move,
            'move_number': len(game['moves']),
            'message': f'Move {move} recorded. Use get_ai_move to get Stockfish analysis.'
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }


@mcp.tool()
async def get_ai_move(
    game_type: str = "chess",
    position: Optional[str] = None,
    game_id: Optional[str] = None,
    depth: int = 15,
    skill_level: int = 20,
    movetime: int = 2000
) -> Dict[str, Any]:
    """
    Get AI move suggestion from Stockfish/Shogi/Go engine.
    
    Use this after recording a user's move to get the best response.
    Perfect for correspondence chess - user makes move, you get AI suggestion.
    
    Args:
        game_type: Type of game (chess, shogi, go)
        position: Position in FEN/SGF notation. If not provided, uses game_id's stored position.
        game_id: Game identifier. If provided, uses stored position from that game.
        depth: Analysis depth (higher = stronger, slower)
        skill_level: AI skill level 1-20 (20 = maximum strength)
        movetime: Maximum thinking time in milliseconds
    
    Returns:
        Dict with suggested move, evaluation, and analysis
    """
    try:
        # Get position
        if position:
            fen = position
        elif game_id and game_id in active_games:
            fen = active_games[game_id].get('fen')
            if not fen:
                return {
                    'success': False,
                    'error': f'No position stored for game {game_id}. Provide position or use make_move first.'
                }
        else:
            return {
                'success': False,
                'error': 'Must provide either position or game_id'
            }
        
        # Route to appropriate engine
        if game_type == "chess":
            url = f"{STOCKFISH_URL}/api/move"
        elif game_type == "shogi":
            url = f"{SHOGI_URL}/api/move"
        elif game_type == "go":
            url = f"{GO_URL}/api/move"
        else:
            return {
                'success': False,
                'error': f'Unsupported game type: {game_type}'
            }
        
        # Request move from engine
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json={
                'fen': fen,
                'skill': skill_level,
                'depth': depth,
                'movetime': movetime
            }) as response:
                if response.status == 200:
                    result = await response.json()
                    move = result.get('move')
                    
                    # Update game state if game_id provided
                    if game_id and game_id in active_games:
                        active_games[game_id]['last_ai_move'] = move
                    
                    return {
                        'success': True,
                        'move': move,
                        'engine': result.get('engine', 'Unknown'),
                        'elo': result.get('elo', 'Unknown'),
                        'depth': depth,
                        'skill_level': skill_level,
                        'message': f'AI suggests: {move}'
                    }
                else:
                    error_text = await response.text()
                    return {
                        'success': False,
                        'error': f'Engine error: {error_text}'
                    }
    
    except aiohttp.ClientError as e:
        return {
            'success': False,
            'error': f'Cannot connect to {game_type} engine. Is it running? (python {game_type}-server.py)'
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }


@mcp.tool()
async def analyze_position(
    game_type: str = "chess",
    position: Optional[str] = None,
    game_id: Optional[str] = None,
    depth: int = 20
) -> Dict[str, Any]:
    """
    Analyze a position and get evaluation.
    
    Use this to understand the current position, get evaluation, and see best moves.
    
    Args:
        game_type: Type of game (chess, shogi, go)
        position: Position in FEN/SGF notation
        game_id: Game identifier (uses stored position)
        depth: Analysis depth
    
    Returns:
        Dict with position evaluation and analysis
    """
    # For now, use get_ai_move for analysis
    # Can be extended with dedicated analysis endpoint later
    result = await get_ai_move(
        game_type=game_type,
        position=position,
        game_id=game_id,
        depth=depth,
        skill_level=20
    )
    
    if result.get('success'):
        return {
            'success': True,
            'best_move': result.get('move'),
            'evaluation': 'See move suggestion',
            'depth': depth,
            'message': f"Best move: {result.get('move')}. Position evaluation available via engine."
        }
    else:
        return result


@mcp.tool()
async def get_game_state(game_id: str) -> Dict[str, Any]:
    """
    Get current state of a correspondence game.
    
    Args:
        game_id: Game identifier
    
    Returns:
        Dict with game state, move history, and current position
    """
    if game_id not in active_games:
        return {
            'success': False,
            'error': f'Game {game_id} not found. Use make_move to start a game.'
        }
    
    game = active_games[game_id]
    return {
        'success': True,
        'game_id': game_id,
        'game_type': game.get('game_type'),
        'move_count': len(game.get('moves', [])),
        'moves': [m['move'] for m in game.get('moves', [])],
        'current_position': game.get('fen') or game.get('position'),
        'last_ai_move': game.get('last_ai_move')
    }


@mcp.tool()
async def new_game(
    game_type: str = "chess",
    game_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Start a new correspondence game.
    
    Args:
        game_type: Type of game (chess, shogi, go)
        game_id: Optional game identifier. If not provided, generates one.
    
    Returns:
        Dict with new game information
    """
    import uuid
    
    if not game_id:
        game_id = f"{game_type}_{uuid.uuid4().hex[:8]}"
    
    # Starting positions
    starting_positions = {
        'chess': 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        'shogi': None,  # Shogi uses different notation
        'go': None  # Go starts empty
    }
    
    active_games[game_id] = {
        'game_type': game_type,
        'moves': [],
        'fen': starting_positions.get(game_type),
        'position': None,
        'created_at': asyncio.get_event_loop().time()
    }
    
    return {
        'success': True,
        'game_id': game_id,
        'game_type': game_type,
        'message': f'New {game_type} game started. Use make_move to record moves.'
    }


@mcp.tool()
async def check_engine_status(game_type: str = "chess") -> Dict[str, Any]:
    """
    Check if game engine (Stockfish/Shogi/Go) is running.
    
    Args:
        game_type: Type of game (chess, shogi, go)
    
    Returns:
        Dict with engine status
    """
    try:
        if game_type == "chess":
            url = f"{STOCKFISH_URL}/api/status"
        elif game_type == "shogi":
            url = f"{SHOGI_URL}/api/status"
        elif game_type == "go":
            url = f"{GO_URL}/api/status"
        else:
            return {
                'success': False,
                'error': f'Unsupported game type: {game_type}'
            }
        
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=2)) as response:
                if response.status == 200:
                    status = await response.json()
                    return {
                        'success': True,
                        'running': True,
                        'engine': status.get('engine', 'Unknown'),
                        'elo': status.get('elo', 'Unknown'),
                        'message': f'{game_type.capitalize()} engine is running'
                    }
                else:
                    return {
                        'success': False,
                        'running': False,
                        'error': f'Engine returned status {response.status}'
                    }
    
    except (aiohttp.ClientError, asyncio.TimeoutError):
        return {
            'success': False,
            'running': False,
            'error': f'{game_type.capitalize()} engine not running. Start it with: python {game_type}-server.py'
        }


# Main entry point for FastMCP
def main():
    """Main entry point for MCP server"""
    mcp.run()

if __name__ == "__main__":
    main()

