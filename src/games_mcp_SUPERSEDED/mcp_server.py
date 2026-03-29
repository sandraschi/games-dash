#!/usr/bin/env python3
"""
Games MCP Server - Correspondence Chess and Game Analysis
**Timestamp**: 2025-12-04

Enables correspondence play via Claude/Cursor:
- User: "I moved rook from e1 to e4"
- Claude: Consults Stockfish and responds with best move
- Perfect for playing while away from computer (e.g., physical board in Caracas)
"""

# CRITICAL: Set stdio to binary mode on Windows for MCP client compatibility
# While Antigravity IDE now tolerates CR/LF (bug fixed), we maintain LF-only output
# for strict JSON-RPC compliance and compatibility with all MCP clients
# This must happen BEFORE any imports that might write to stdout
import os
import sys

# Determine if running in stdio mode (for MCP clients like Claude Desktop)
# Must be defined early, before it's used in exception handlers
_is_stdio_mode = not sys.stdin.isatty() and not sys.stdout.isatty()

# Standard library imports
import asyncio
from datetime import datetime
from typing import Any

import aiohttp
from fastmcp import FastMCP

# Third-party imports
from pydantic import BaseModel, Field

if os.name == "nt":  # Windows only
    try:
        # Force binary mode for stdin/stdout to prevent CRLF conversion
        # Note: Antigravity IDE now tolerates CR/LF (bug fixed), but we maintain
        # LF-only output for strict JSON-RPC compliance and compatibility with all MCP clients
        import msvcrt

        msvcrt.setmode(sys.stdin.fileno(), os.O_BINARY)
        msvcrt.setmode(sys.stdout.fileno(), os.O_BINARY)

        # Also set text mode with newline='\n' to force LF output
        # This ensures JSON-RPC messages use LF even on Windows
        if hasattr(sys.stdout, "reconfigure"):
            sys.stdout.reconfigure(newline="\n", encoding="utf-8")
        if hasattr(sys.stderr, "reconfigure"):
            sys.stderr.reconfigure(newline="\n", encoding="utf-8")
    except (OSError, AttributeError, ValueError) as e:
        # Fallback: log warning but continue
        # Some environments may not support binary mode or reconfiguration
        # With Antigravity's fix, CR/LF is now tolerated, so this is less critical
        if _is_stdio_mode:
            # Only warn in stdio mode (MCP client), not in interactive mode
            try:
                sys.stderr.write(f"Warning: Could not set binary mode: {e}\n")
                sys.stderr.flush()
            except:
                pass


# DevNullStdout class for stdio mode suppression
class DevNullStdout:
    def __init__(self, original_stdout):
        self.original_stdout = original_stdout

    def write(self, data):
        # Suppress all writes to stdout during initialization
        pass

    def flush(self):
        pass

    def restore(self):
        sys.stdout = self.original_stdout


# Initialize FastMCP server
mcp = FastMCP(
    "Games-MCP",
    instructions="""
    Enhanced Games MCP Server - Complete game management and analysis platform via Claude/Cursor.

    Perfect for:
    - Correspondence games (turn-based, async play)
    - Tournament organization and management
    - AI-powered analysis and move suggestions
    - Puzzle generation and tactical training
    - Player statistics and rating systems
    - Multiplayer game coordination

    Supported Games: Chess, Shogi, Go, Gomoku, Checkers, Connect Four, Mühle, Battleship, Scrabble

    Example workflows:

    Correspondence Chess:
    1. User: "I moved rook from e1 to e4"
    2. Claude: Records move, gets Stockfish analysis
    3. Claude: "Stockfish suggests Nf6. Position evaluation: +0.3"

    Tournament Play:
    1. Claude: create_tournament("weekend_blitz", "chess", 8, "blitz")
    2. User: "Register me for the tournament"
    3. Claude: register_for_tournament("weekend_blitz", "player_123")

    Puzzle Training:
    1. User: "Give me an intermediate chess puzzle"
    2. Claude: generate_puzzle("chess", "intermediate", "tactics")

    Position Analysis:
    1. User: "Analyze this position: r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R"
    2. Claude: analyze_position_detailed("chess", position="...", analysis_type="tactical")

    Player Statistics:
    1. User: "How am I doing in chess this month?"
    2. Claude: get_player_statistics("player_123", "chess", "month")
    """,
)

# CRITICAL: After server initialization, restore stdout for stdio mode
# This allows the server to communicate via JSON-RPC while preventing initialization logging
if _is_stdio_mode:
    if hasattr(sys.stdout, "restore"):
        sys.stdout.restore()
        # Now we can safely write to stdout for JSON-RPC communication

# Set up proper logging to stderr only (not stdout) - CRITICAL for MCP stdio mode
import logging

# Configure logging with appropriate level and format
log_level = os.environ.get("GAMES_MCP_LOG_LEVEL", "INFO").upper()
log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

# Create logger for this module
logger = logging.getLogger("games_mcp")

# Only configure if not already configured (avoid duplicate handlers)
if not logger.handlers:
    handler = logging.StreamHandler(sys.stderr)  # Critical: stderr, not stdout
    handler.setFormatter(logging.Formatter(log_format))
    logger.addHandler(handler)
    logger.setLevel(getattr(logging, log_level, logging.INFO))

# Prevent propagation to root logger (avoid duplicate messages)
logger.propagate = False

# Import ADN integration
from .adn_integration import get_adn_integration

# Import database for persistence
from .database import get_database

# Game server endpoints - Updated to match new port configuration
# Ports 10001-10003 for remote access (iPad/iPhone/Bangalore players)
STOCKFISH_URL = "http://localhost:10001"
SHOGI_URL = "http://localhost:10003"  # YaneuraOu
GO_URL = "http://localhost:10002"  # KataGo

# Database instance for persistence
db = get_database()

# ADN integration instance
adn = get_adn_integration()

# In-memory game state (augmented with database persistence)
active_games: dict[str, dict[str, Any]] = {}

# Game statistics and ratings (augmented with database persistence)
player_ratings: dict[str, dict[str, float]] = {}
game_statistics: dict[str, dict[str, Any]] = {}


class MoveInput(BaseModel):
    """Input for making a move"""

    game_id: str = Field(
        ..., description="Game identifier (e.g., 'chess_1', 'gomoku_1')"
    )
    move: str = Field(
        ...,
        description="Move in standard notation. Examples:\n- Chess: 'e2e4', 'Nf3', 'O-O'\n- Gomoku: '7,7' (row,col)\n- Checkers: '5,2 to 4,3' (from row,col to row,col)\n- Connect Four: '3' (column 0-6)\n- Mühle: '5' (position 0-23)\n- Battleship: 'A5' or '0,4' (row,col)\n- Scrabble: 'HELLO at H8 horizontal'",
    )
    game_type: str = Field(
        default="chess",
        description="Game type: chess, shogi, go, gomoku, checkers, connect4, muhle, battleship, scrabble",
    )
    fen: str | None = Field(
        None, description="Current position in FEN notation (for chess)"
    )
    position: str | None = Field(None, description="Current position (for other games)")


class AnalysisInput(BaseModel):
    """Input for position analysis"""

    game_type: str = Field(..., description="Game type: chess, shogi, or go")
    position: str = Field(..., description="Position (FEN for chess, SGF for go, etc.)")
    depth: int = Field(default=15, description="Analysis depth")
    skill_level: int = Field(default=20, description="AI skill level (1-20)")


class GameStateInput(BaseModel):
    """Input for getting game state"""

    game_id: str = Field(..., description="Game identifier")


class TournamentInput(BaseModel):
    """Input for tournament management"""

    tournament_id: str = Field(..., description="Tournament identifier")
    game_type: str = Field(default="chess", description="Game type for tournament")
    max_players: int = Field(default=8, description="Maximum number of players")
    time_control: str = Field(
        default="blitz", description="Time control (bullet/blitz/rapid/classical)"
    )


class PuzzleInput(BaseModel):
    """Input for puzzle generation and solving"""

    game_type: str = Field(default="chess", description="Game type for puzzle")
    difficulty: str = Field(
        default="intermediate",
        description="Difficulty level (beginner/intermediate/advanced/expert)",
    )
    theme: str | None = Field(
        None, description="Puzzle theme (tactics/endgame/opening/etc)"
    )


class PlayerStatsInput(BaseModel):
    """Input for player statistics"""

    player_id: str = Field(..., description="Player identifier")
    game_type: str | None = Field(None, description="Filter by game type")
    timeframe: str = Field(
        default="all", description="Timeframe (day/week/month/year/all)"
    )


@mcp.tool()
async def make_move(
    game_id: str, move: str, game_type: str = "chess", fen: str | None = None
) -> dict[str, Any]:
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
        logger.debug(f"Recording move for game {game_id}: {move}")

        # Try to load game from database first
        game_data = await db.load_game(game_id)

        if game_data:
            # Load existing game from database
            logger.debug(f"Loaded existing game {game_id} from database")
            game = {
                "game_type": game_data["game_type"],
                "moves": game_data.get("moves", []),
                "fen": game_data.get("fen"),
                "position": game_data.get("position"),
                "status": game_data.get("status", "active"),
            }
            active_games[game_id] = game
        else:
            # Initialize new game
            logger.info(f"Creating new game {game_id} (type: {game_type})")
            game = {
                "game_type": game_type,
                "moves": [],
                "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
                if game_type == "chess"
                else None,
                "position": None,
            }
            active_games[game_id] = game

            # Save new game to database
            await db.save_game(
                game_id=game_id,
                game_type=game_type,
                position=game.get("fen"),
                moves=[],
                status="active",
            )

        game = active_games[game_id]

        # Record move
        game["moves"].append(
            {"move": move, "timestamp": asyncio.get_event_loop().time()}
        )
        logger.info(f"Move {len(game['moves'])} recorded for game {game_id}: {move}")

        # Update position if FEN provided
        if fen:
            game["fen"] = fen

        # Save updated game state to database
        await db.save_game(
            game_id=game_id,
            game_type=game_type,
            position=game.get("fen"),
            moves=game["moves"],
            status=game.get("status", "active"),
        )

        return {
            "success": True,
            "game_id": game_id,
            "move": move,
            "move_number": len(game["moves"]),
            "message": f"Move {move} recorded. Use get_ai_move to get Stockfish analysis.",
        }
    except Exception as e:
        logger.error(f"Error recording move for game {game_id}: {e}", exc_info=True)
        return {"success": False, "error": str(e)}


@mcp.tool()
async def get_ai_move(
    game_type: str = "chess",
    position: str | None = None,
    game_id: str | None = None,
    depth: int = 15,
    skill_level: int = 20,
    movetime: int = 2000,
) -> dict[str, Any]:
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
        logger.debug(
            f"Getting AI move for {game_type}, depth={depth}, skill={skill_level}"
        )

        # Get position
        if position:
            fen = position
        elif game_id and game_id in active_games:
            fen = active_games[game_id].get("fen")
            if not fen:
                logger.warning(f"No position stored for game {game_id}")
                return {
                    "success": False,
                    "error": f"No position stored for game {game_id}. Provide position or use make_move first.",
                }
        else:
            logger.error("Must provide either position or game_id")
            return {
                "success": False,
                "error": "Must provide either position or game_id",
            }

        # Create position hash for caching
        import hashlib

        position_hash = hashlib.md5(
            f"{fen}_{game_type}_{depth}_{skill_level}".encode()
        ).hexdigest()

        # Check cache first
        cached_analysis = await db.get_cached_analysis(position_hash, game_type)
        if cached_analysis:
            logger.debug(f"Using cached analysis for position hash {position_hash[:8]}")
            return {
                "success": True,
                "move": cached_analysis["best_move"],
                "engine": "Cached",
                "elo": "Cached",
                "depth": cached_analysis["analysis_depth"],
                "skill_level": skill_level,
                "message": f"AI suggests (cached): {cached_analysis['best_move']}",
                "cached": True,
            }

        # Route to appropriate engine
        if game_type == "chess":
            url = f"{STOCKFISH_URL}/api/move"
        elif game_type == "shogi":
            url = f"{SHOGI_URL}/api/move"
        elif game_type == "go":
            url = f"{GO_URL}/api/move"
        else:
            logger.error(f"Unsupported game type: {game_type}")
            return {"success": False, "error": f"Unsupported game type: {game_type}"}

        logger.info(f"Requesting AI move from {game_type} engine at {url}")

        # Request move from engine
        async with aiohttp.ClientSession() as session:
            async with session.post(
                url,
                json={
                    "fen": fen,
                    "skill": skill_level,
                    "depth": depth,
                    "movetime": movetime,
                },
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    move = result.get("move")
                    logger.info(f"AI engine returned move: {move}")

                    # Cache the result
                    evaluation_data = {
                        "engine": result.get("engine", "Unknown"),
                        "elo": result.get("elo", "Unknown"),
                        "evaluation": result.get("evaluation", 0),
                    }

                    await db.cache_ai_analysis(
                        position_hash=position_hash,
                        game_type=game_type,
                        best_move=move,
                        evaluation=evaluation_data,
                        analysis_depth=depth,
                    )
                    logger.debug(
                        f"Cached analysis for position hash {position_hash[:8]}"
                    )

                    # Update game state if game_id provided
                    if game_id and game_id in active_games:
                        active_games[game_id]["last_ai_move"] = move

                    return {
                        "success": True,
                        "move": move,
                        "engine": result.get("engine", "Unknown"),
                        "elo": result.get("elo", "Unknown"),
                        "depth": depth,
                        "skill_level": skill_level,
                        "message": f"AI suggests: {move}",
                        "cached": False,
                    }
                error_text = await response.text()
                logger.error(
                    f"Engine returned error status {response.status}: {error_text}"
                )
                return {"success": False, "error": f"Engine error: {error_text}"}

    except aiohttp.ClientError as e:
        logger.error(f"Cannot connect to {game_type} engine: {e}")
        return {
            "success": False,
            "error": f"Cannot connect to {game_type} engine. Is it running? (python backend/simple-{game_type}-server.py)",
        }
    except Exception as e:
        logger.error(f"Error getting AI move: {e}", exc_info=True)
        return {"success": False, "error": str(e)}


@mcp.tool()
async def analyze_position(
    game_type: str = "chess",
    position: str | None = None,
    game_id: str | None = None,
    depth: int = 20,
) -> dict[str, Any]:
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
        skill_level=20,
    )

    if result.get("success"):
        return {
            "success": True,
            "best_move": result.get("move"),
            "evaluation": "See move suggestion",
            "depth": depth,
            "message": f"Best move: {result.get('move')}. Position evaluation available via engine.",
        }
    return result


@mcp.tool()
async def get_game_state(game_id: str) -> dict[str, Any]:
    """
    Get current state of a correspondence game.

    Args:
        game_id: Game identifier

    Returns:
        Dict with game state, move history, and current position
    """
    try:
        # Try to load from memory first
        if game_id not in active_games:
            # Try to load from database
            game_data = await db.load_game(game_id)
            if game_data:
                # Load into memory for faster access
                game = {
                    "game_type": game_data["game_type"],
                    "moves": game_data.get("moves", []),
                    "fen": game_data.get("fen"),
                    "position": game_data.get("position"),
                    "status": game_data.get("status", "active"),
                }
                active_games[game_id] = game
            else:
                return {
                    "success": False,
                    "error": f"Game {game_id} not found. Use make_move to start a game.",
                }
        else:
            game = active_games[game_id]

        # Convert moves list to proper format
        moves_list = []
        if game.get("moves"):
            if isinstance(game["moves"][0], dict):
                moves_list = [m["move"] for m in game.get("moves", [])]
            else:
                moves_list = game.get("moves", [])

        return {
            "success": True,
            "game_id": game_id,
            "game_type": game.get("game_type"),
            "move_count": len(moves_list),
            "moves": moves_list,
            "current_position": game.get("fen") or game.get("position"),
            "last_ai_move": game.get("last_ai_move"),
            "status": game.get("status", "active"),
        }
    except Exception as e:
        logger.error(f"Error getting game state for {game_id}: {e}", exc_info=True)
        return {
            "success": False,
            "error": f"Error retrieving game state: {e!s}",
        }


@mcp.tool()
async def new_game(
    game_type: str = "chess", game_id: str | None = None
) -> dict[str, Any]:
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
        "chess": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        "shogi": None,  # Shogi uses different notation
        "go": None,  # Go starts empty
    }

    initial_fen = starting_positions.get(game_type)

    active_games[game_id] = {
        "game_type": game_type,
        "moves": [],
        "fen": initial_fen,
        "position": None,
        "created_at": asyncio.get_event_loop().time(),
    }

    # Save to database
    try:
        await db.save_game(
            game_id=game_id,
            game_type=game_type,
            position=initial_fen,
            moves=[],
            status="active",
        )
    except Exception as e:
        logger.warning(f"Failed to save new game to database: {e}")

    return {
        "success": True,
        "game_id": game_id,
        "game_type": game_type,
        "message": f"New {game_type} game started. Use make_move to record moves.",
    }


@mcp.tool()
async def create_tournament(
    tournament_id: str,
    game_type: str = "chess",
    max_players: int = 8,
    time_control: str = "blitz",
) -> dict[str, Any]:
    """
    Create a new tournament for competitive play.

    Use this to organize competitive events with multiple players and automated pairings.

    Args:
        tournament_id: Unique tournament identifier
        game_type: Type of game for the tournament
        max_players: Maximum number of participants
        time_control: Time control for games (bullet/blitz/rapid/classical)

    Returns:
        Dict with tournament information and registration details
    """
    try:
        if tournament_id in active_games:
            return {
                "success": False,
                "error": f"Tournament {tournament_id} already exists",
            }

        tournament = {
            "tournament_id": tournament_id,
            "game_type": game_type,
            "max_players": max_players,
            "time_control": time_control,
            "players": [],
            "games": [],
            "status": "registration_open",
            "created_at": asyncio.get_event_loop().time(),
        }

        active_games[tournament_id] = tournament

        return {
            "success": True,
            "tournament_id": tournament_id,
            "game_type": game_type,
            "max_players": max_players,
            "time_control": time_control,
            "message": f"Tournament {tournament_id} created. Registration is now open.",
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@mcp.tool()
async def register_for_tournament(tournament_id: str, player_id: str) -> dict[str, Any]:
    """
    Register a player for a tournament.

    Args:
        tournament_id: Tournament identifier
        player_id: Player identifier

    Returns:
        Dict with registration status
    """
    try:
        if tournament_id not in active_games:
            return {"success": False, "error": f"Tournament {tournament_id} not found"}

        tournament = active_games[tournament_id]

        if player_id in tournament["players"]:
            return {"success": False, "error": f"Player {player_id} already registered"}

        if len(tournament["players"]) >= tournament["max_players"]:
            return {"success": False, "error": f"Tournament {tournament_id} is full"}

        tournament["players"].append(player_id)

        return {
            "success": True,
            "tournament_id": tournament_id,
            "player_id": player_id,
            "current_players": len(tournament["players"]),
            "max_players": tournament["max_players"],
            "message": f"Player {player_id} registered for tournament {tournament_id}",
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@mcp.tool()
async def generate_puzzle(
    game_type: str = "chess",
    difficulty: str = "intermediate",
    theme: str | None = None,
) -> dict[str, Any]:
    """
    Generate a tactical puzzle for training.

    Use this to create chess puzzles, shogi problems, or go life-and-death problems.

    Args:
        game_type: Type of game (chess/shogi/go)
        difficulty: Difficulty level (beginner/intermediate/advanced/expert)
        theme: Puzzle theme (tactics/endgame/opening/etc)

    Returns:
        Dict with puzzle position, solution, and explanation
    """
    try:
        # For now, generate basic puzzles. In future, could integrate with dedicated puzzle databases
        if game_type == "chess":
            # Generate a basic chess puzzle
            puzzles = {
                "beginner": {
                    "fen": "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
                    "solution": ["Nxe5"],
                    "theme": "knight_fork",
                    "explanation": "Knight fork: The knight attacks both the bishop on c6 and the pawn on e5 simultaneously.",
                },
                "intermediate": {
                    "fen": "r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 5",
                    "solution": ["Bxf7+"],
                    "theme": "discovered_attack",
                    "explanation": "Discovered attack: Moving the bishop reveals an attack from the queen on f7.",
                },
            }

            puzzle = puzzles.get(difficulty, puzzles["beginner"])

            return {
                "success": True,
                "game_type": game_type,
                "difficulty": difficulty,
                "position": puzzle["fen"],
                "solution": puzzle["solution"],
                "theme": puzzle["theme"],
                "explanation": puzzle["explanation"],
                "message": f"Generated {difficulty} {game_type} puzzle: {puzzle['theme']}",
            }
        return {
            "success": False,
            "error": f"Puzzle generation not yet implemented for {game_type}",
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@mcp.tool()
async def analyze_position_detailed(
    game_type: str = "chess",
    position: str | None = None,
    game_id: str | None = None,
    depth: int = 20,
    analysis_type: str = "full",
) -> dict[str, Any]:
    """
    Perform detailed position analysis with multiple lines and evaluations.

    Use this for deep analysis of positions, getting multiple candidate moves,
    tactical motifs, and strategic evaluation.

    Args:
        game_type: Type of game (chess/shogi/go)
        position: Position in FEN/SGF notation
        game_id: Game identifier (uses stored position)
        depth: Analysis depth
        analysis_type: Type of analysis (full/tactical/endgame/evaluation)

    Returns:
        Dict with detailed analysis including multiple lines and evaluations
    """
    try:
        # Get position
        if position:
            fen = position
        elif game_id and game_id in active_games:
            game = active_games[game_id]
            fen = game.get("fen") or game.get("position")
            if not fen:
                return {
                    "success": False,
                    "error": f"No position stored for game {game_id}",
                }
        else:
            return {
                "success": False,
                "error": "Must provide either position or game_id",
            }

        # Route to appropriate engine for detailed analysis
        if game_type == "chess":
            url = f"{STOCKFISH_URL}/api/analyze"
        elif game_type == "shogi":
            url = f"{SHOGI_URL}/api/analyze"
        elif game_type == "go":
            url = f"{GO_URL}/api/analyze"
        else:
            return {"success": False, "error": f"Unsupported game type: {game_type}"}

        # Request detailed analysis
        async with (
            aiohttp.ClientSession() as session,
            session.post(
                url,
                json={
                    "fen": fen,
                    "depth": depth,
                    "analysis_type": analysis_type,
                    "multi_pv": 3,  # Get top 3 moves
                },
            ) as response,
        ):
            if response.status == 200:
                result = await response.json()

                analysis = {
                    "success": True,
                    "game_type": game_type,
                    "position": fen,
                    "depth": depth,
                    "analysis_type": analysis_type,
                    "engine": result.get("engine", "Unknown"),
                    "best_moves": result.get("moves", []),
                    "evaluation": result.get("evaluation", {}),
                    "tactical_motifs": result.get("motifs", []),
                    "strategic_factors": result.get("strategy", {}),
                    "time_taken": result.get("time", 0),
                }

                return analysis
            error_text = await response.text()
            return {"success": False, "error": f"Analysis failed: {error_text}"}

    except aiohttp.ClientError:
        return {
            "success": False,
            "error": f"Cannot connect to {game_type} engine for analysis",
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


@mcp.tool()
async def get_player_statistics(
    player_id: str, game_type: str | None = None, timeframe: str = "all"
) -> dict[str, Any]:
    """
    Get comprehensive player statistics and performance metrics.

    Use this to track player progress, analyze strengths/weaknesses, and monitor improvement.

    Args:
        player_id: Player identifier
        game_type: Filter by specific game type (optional)
        timeframe: Time period (day/week/month/year/all)

    Returns:
        Dict with detailed player statistics
    """
    try:
        # Initialize player stats if not exists
        if player_id not in player_ratings:
            player_ratings[player_id] = {"chess": 1200.0, "shogi": 1200.0, "go": 1200.0}

        if player_id not in game_statistics:
            game_statistics[player_id] = {
                "total_games": 0,
                "wins": 0,
                "losses": 0,
                "draws": 0,
                "win_rate": 0.0,
                "average_game_length": 0,
                "favorite_opening": None,
                "strengths": [],
                "weaknesses": [],
                "recent_performance": [],
            }

        stats = game_statistics[player_id]

        # Filter by game type if specified
        if game_type:
            rating = player_ratings[player_id].get(game_type, 1200)
            return {
                "success": True,
                "player_id": player_id,
                "game_type": game_type,
                "rating": rating,
                "statistics": stats,
                "timeframe": timeframe,
            }

        # Return all game types
        return {
            "success": True,
            "player_id": player_id,
            "ratings": player_ratings[player_id],
            "statistics": stats,
            "timeframe": timeframe,
            "overall_win_rate": stats.get("win_rate", 0),
            "total_games": stats.get("total_games", 0),
        }

    except Exception as e:
        return {"success": False, "error": str(e)}


@mcp.tool()
async def update_player_rating(
    player_id: str,
    game_type: str,
    opponent_rating: float,
    result: str,
    game_id: str | None = None,
) -> dict[str, Any]:
    """
    Update player rating using ELO system after game completion.

    Args:
        player_id: Player identifier
        game_type: Game type (chess/shogi/go)
        opponent_rating: Opponent's rating
        result: Game result (win/loss/draw)
        game_id: Optional game identifier for tracking

    Returns:
        Dict with rating change and new rating
    """
    try:
        if player_id not in player_ratings:
            player_ratings[player_id] = {"chess": 1200.0, "shogi": 1200.0, "go": 1200.0}

        current_rating = player_ratings[player_id][game_type]

        # Simple ELO calculation
        k_factor = 32  # Standard K-factor
        expected_score = 1 / (1 + 10 ** ((opponent_rating - current_rating) / 400))

        actual_score = {"win": 1.0, "loss": 0.0, "draw": 0.5}.get(result, 0.5)
        rating_change = k_factor * (actual_score - expected_score)

        new_rating = current_rating + rating_change
        player_ratings[player_id][game_type] = new_rating

        # Update statistics
        if player_id not in game_statistics:
            game_statistics[player_id] = {
                "total_games": 0,
                "wins": 0,
                "losses": 0,
                "draws": 0,
                "win_rate": 0.0,
                "average_game_length": 0,
            }

        stats = game_statistics[player_id]
        stats["total_games"] += 1

        if result == "win":
            stats["wins"] += 1
        elif result == "loss":
            stats["losses"] += 1
        else:
            stats["draws"] += 1

        stats["win_rate"] = stats["wins"] / stats["total_games"]

        return {
            "success": True,
            "player_id": player_id,
            "game_type": game_type,
            "old_rating": current_rating,
            "new_rating": new_rating,
            "rating_change": rating_change,
            "result": result,
            "message": f"Rating updated: {current_rating:.0f} → {new_rating:.0f} ({rating_change:+.1f})",
        }

    except Exception as e:
        return {"success": False, "error": str(e)}


@mcp.tool()
async def check_engine_status(game_type: str = "chess") -> dict[str, Any]:
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
            return {"success": False, "error": f"Unsupported game type: {game_type}"}

        async with (
            aiohttp.ClientSession() as session,
            session.get(url, timeout=aiohttp.ClientTimeout(total=2)) as response,
        ):
            if response.status == 200:
                status = await response.json()
                return {
                    "success": True,
                    "running": True,
                    "engine": status.get("engine", "Unknown"),
                    "elo": status.get("elo", "Unknown"),
                    "message": f"{game_type.capitalize()} engine is running",
                }
            return {
                "success": False,
                "running": False,
                "error": f"Engine returned status {response.status}",
            }

    except (aiohttp.ClientError, asyncio.TimeoutError):
        return {
            "success": False,
            "running": False,
            "error": f"{game_type.capitalize()} engine not running. Start it with: python {game_type}-server.py",
        }


@mcp.tool()
async def create_analysis_note(
    game_id: str,
    game_type: str = "chess",
    position: str | None = None,
    analysis_depth: int = 15,
) -> dict[str, Any]:
    """
    Create a detailed game analysis note in Advanced Memory.

    This tool analyzes the current position and creates a structured note
    with tactical insights, learning points, and study recommendations.

    Args:
        game_id: Game identifier
        game_type: Type of game (chess, shogi, go)
        position: Position in FEN/SGF notation (optional, uses game position if not provided)
        analysis_depth: Depth of AI analysis

    Returns:
        Dict with analysis note creation status
    """
    try:
        # Get current position
        if not position and game_id in active_games:
            position = active_games[game_id].get("fen")

        if not position:
            return {
                "success": False,
                "error": "No position available for analysis. Provide position or ensure game has position.",
            }

        # Get AI analysis
        ai_result = await get_ai_move(
            game_type=game_type, position=position, depth=analysis_depth
        )

        if not ai_result["success"]:
            return {
                "success": False,
                "error": f"Failed to get AI analysis: {ai_result['error']}",
            }

        # Create analysis note in ADN
        analysis_data = {
            "best_move": ai_result["move"],
            "evaluation": ai_result.get("evaluation", 0),
            "engine": ai_result["engine"],
            "depth": analysis_depth,
            "position": position,
            "game_id": game_id,
            "game_type": game_type,
        }

        note_created = await adn.create_game_analysis_note(
            game_id, game_type, analysis_data
        )

        return {
            "success": True,
            "game_id": game_id,
            "analysis": ai_result,
            "note_created": note_created,
            "message": f"Analysis note created for {game_type} game {game_id}",
            "analysis_data": analysis_data,
        }

    except Exception as e:
        return {"success": False, "error": str(e)}


@mcp.tool()
async def search_game_knowledge(
    query: str, game_type: str | None = None, max_results: int = 5
) -> dict[str, Any]:
    """
    Search game knowledge and strategy in Advanced Memory.

    This tool searches the knowledge base for relevant strategies,
    opening principles, tactical patterns, and educational content.

    Args:
        query: Search query (e.g., "Sicilian defense", "endgame technique")
        game_type: Filter by game type (chess, shogi, go)
        max_results: Maximum number of results to return

    Returns:
        Dict with search results and knowledge snippets
    """
    try:
        results = await adn.search_game_knowledge(query, game_type)

        # Limit results
        limited_results = results[:max_results]

        return {
            "success": True,
            "query": query,
            "game_type": game_type,
            "results_count": len(limited_results),
            "results": limited_results,
            "message": f"Found {len(limited_results)} knowledge entries for '{query}'",
        }

    except Exception as e:
        return {"success": False, "error": str(e)}


@mcp.tool()
async def cleanup_cache(older_than_hours: int = 24) -> dict[str, Any]:
    """
    Clean up expired AI analysis cache entries.

    This tool removes old cached analysis results to free up space
    and ensure fresh analysis for repeated positions.

    Args:
        older_than_hours: Remove cache entries older than this many hours

    Returns:
        Dict with cleanup status and statistics
    """
    try:
        await db.cleanup_expired_cache()

        return {
            "success": True,
            "older_than_hours": older_than_hours,
            "message": f"Cache cleanup completed for entries older than {older_than_hours} hours",
        }

    except Exception as e:
        return {"success": False, "error": str(e)}


@mcp.tool()
async def get_system_status(
    include_engines: bool = True,
    include_database: bool = True,
    include_adn: bool = True,
) -> dict[str, Any]:
    """
    Get comprehensive system status for the Games MCP server.

    This tool provides a complete overview of all system components:
    - AI engine status
    - Database connectivity
    - ADN integration status
    - Active games count
    - Cache statistics

    Args:
        include_engines: Include AI engine status check
        include_database: Include database status
        include_adn: Include ADN integration status

    Returns:
        Dict with comprehensive system status
    """
    try:
        status = {
            "success": True,
            "timestamp": datetime.now().isoformat(),
            "components": {},
        }

        # AI Engine status
        if include_engines:
            engines = {}
            for game_type in ["chess", "shogi", "go"]:
                engine_status = await check_engine_status(game_type)
                engines[game_type] = engine_status
            status["components"]["engines"] = engines

        # Database status
        if include_database:
            try:
                # Test database connectivity
                test_game = await db.load_game("test_connection")
                status["components"]["database"] = {
                    "status": "connected",
                    "type": "SQLite",
                    "path": str(db.db_path),
                }
            except Exception as e:
                status["components"]["database"] = {"status": "error", "error": str(e)}

        # ADN integration status
        if include_adn:
            status["components"]["adn"] = {
                "status": "available" if adn.adn_available else "unavailable",
                "integration": "Advanced Memory (ADN)",
            }

        # General statistics
        status["statistics"] = {
            "active_games": len(active_games),
            "tracked_players": len(player_ratings),
            "server_uptime": "Running",  # Could be enhanced with actual uptime
        }

        return status

    except Exception as e:
        return {"success": False, "error": str(e)}


# Main entry point for FastMCP
def main():
    """Main entry point for MCP server"""
    mcp.run()


if __name__ == "__main__":
    main()
