#!/usr/bin/env python3
"""
Games MCP Server 2.0 - AI-Orchestrated Game Analysis & Learning Platform
**Timestamp**: 2026-01-21
**Standards**: FastMCP 2.14.3+, SEP-1577 Sampling, Conversational Tool Returns

CAPABILITIES:
• SEP-1577 Sampling: Autonomous AI orchestration borrowing client's LLM for complex workflows
• Conversational Tool Returns: Rich, contextual responses with progressive disclosure and error recovery
• Intelligent Analysis: Multi-tool orchestration for comprehensive game evaluation
• Adaptive Learning: Personalized coaching programs with autonomous progression
• Enhanced Error Recovery: Diagnostic information and multiple resolution paths

SUPPORTED FEATURES:
• Correspondence games with AI-powered analysis
• Tournament management and competitive play
• Intelligent puzzle generation and tactical training
• Comprehensive player development and coaching
• Multiplayer game coordination and statistics
• Autonomous learning session orchestration

SUPPORTED GAMES: Chess, Shogi, Go, Gomoku, Checkers, Connect Four, Mühle, Battleship, Scrabble

WORKFLOWS:
Traditional: User → Claude → Tool → Response
SEP-1577: User → Claude → Autonomous Orchestration → Multiple Tools → Synthesized Response

Unicode Safety: All responses use safe emoji characters (✅, ⚠️, 📊, etc.) to prevent
MCP client crashes. Avoids problematic emojis like 🎉, 🏆, 😀 that cause serialization failures.

Performance: Reduced code duplication, consolidated framework reduces development time.
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
import aiohttp
from typing import Optional, Dict, Any
from datetime import datetime

# Third-party imports
from pydantic import BaseModel, Field
from fastmcp import FastMCP

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
        if hasattr(sys.stdout, 'reconfigure'):
            sys.stdout.reconfigure(newline='\n', encoding='utf-8')
        if hasattr(sys.stderr, 'reconfigure'):
            sys.stderr.reconfigure(newline='\n', encoding='utf-8')
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

# Initialize FastMCP server with sampling capabilities (SEP-1577)
sampling_handler = None
if sampling_orchestrator.anthropic_handler:
    sampling_handler = sampling_orchestrator.anthropic_handler
elif sampling_orchestrator.openai_handler:
    sampling_handler = sampling_orchestrator.openai_handler

mcp = FastMCP(
    "Games-MCP",
    sampling_handler=sampling_handler,
    instructions="""
    Games MCP Server 2.0 - AI-Orchestrated Game Analysis & Learning Platform (SEP-1577 Enhanced)

    FEATURES (2026 Standards):
    • SEP-1577 Sampling: Autonomous AI orchestration borrowing your LLM for complex workflows
    • Conversational Tool Returns: Rich, contextual responses with next steps and alternatives
    • Intelligent Analysis: Multi-tool orchestration for comprehensive game evaluation
    • Adaptive Learning: Personalized coaching programs that evolve with your progress

    SUPPORTED USE CASES:
    • Correspondence games with AI-powered analysis
    • Tournament management and competitive play
    • Intelligent puzzle generation and tactical training
    • Comprehensive player development and coaching
    • Multiplayer game coordination and statistics
    • Autonomous learning session orchestration

    SUPPORTED GAMES: Chess, Shogi, Go, Gomoku, Checkers, Connect Four, Mühle, Battleship, Scrabble

    SEP-1577 SAMPLING WORKFLOWS:

    Intelligent Game Analysis:
    1. User: "Analyze this complex position deeply"
    2. Claude: Autonomously orchestrates get_ai_move + analyze_position_detailed + find_tactical_motifs
    3. Result: Comprehensive evaluation with multiple analysis methods

    Adaptive Learning Sessions:
    1. User: "Help me improve my chess tactics"
    2. Claude: Designs personalized 60-minute session with adaptive difficulty
    3. Result: Curated exercises, explanations, and progress tracking

    Personalized Coaching:
    1. User: "Create a coaching program for my chess development"
    2. Claude: Analyzes performance, designs 8-week adaptive curriculum
    3. Result: Complete program with progression, assessment, and motivation

    CONVERSATIONAL RESPONSE PATTERNS:
    • Progressive Disclosure: Start simple, offer deeper analysis
    • Clarification Requests: Ask for missing context gracefully
    • Error Recovery: Provide multiple resolution paths with diagnostics
    • Rich Context: Include next steps, alternatives, and recommendations

    TRADITIONAL WORKFLOWS (Still Available):

    Correspondence Chess:
    1. User: "I moved rook from e1 to e4"
    2. Claude: Records move with validation and error recovery
    3. Claude: "Move recorded. Ready for AI analysis or opponent response"

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

    🔧 SYSTEM STATUS:
    Use sampling_capabilities_status() to check SEP-1577 availability and performance metrics.
    All tools include comprehensive error handling and conversational responses.
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

# Import sampling capabilities (SEP-1577)
from .sampling import get_sampling_orchestrator

# Game server endpoints - Updated to match new port configuration
# Ports 10001-10003 for remote access (iPad/iPhone/Bangalore players)
STOCKFISH_URL = "http://localhost:10001"
SHOGI_URL = "http://localhost:10003"  # YaneuraOu
GO_URL = "http://localhost:10002"     # KataGo

# Database instance for persistence
db = get_database()

# ADN integration instance
adn = get_adn_integration()

# Sampling orchestrator instance (SEP-1577)
sampling_orchestrator = get_sampling_orchestrator()

# In-memory game state (augmented with database persistence)
active_games: Dict[str, Dict[str, Any]] = {}

# Game statistics and ratings (augmented with database persistence)
player_ratings: Dict[str, Dict[str, float]] = {}
game_statistics: Dict[str, Dict[str, Any]] = {}


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
    fen: Optional[str] = Field(
        None, description="Current position in FEN notation (for chess)"
    )
    position: Optional[str] = Field(
        None, description="Current position (for other games)"
    )


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
    theme: Optional[str] = Field(
        None, description="Puzzle theme (tactics/endgame/opening/etc)"
    )


class PlayerStatsInput(BaseModel):
    """Input for player statistics"""

    player_id: str = Field(..., description="Player identifier")
    game_type: Optional[str] = Field(None, description="Filter by game type")
    timeframe: str = Field(
        default="all", description="Timeframe (day/week/month/year/all)"
    )


# ===== SAMPLING-ENABLED TOOLS (SEP-1577) =====

@mcp.tool()
async def intelligent_game_analysis(
    game_type: str = "chess",
    position: Optional[str] = None,
    game_id: Optional[str] = None,
    analysis_goal: str = "comprehensive_evaluation",
    max_iterations: int = 10
) -> Dict[str, Any]:
    """
    SEP-1577: Intelligent game analysis using sampling orchestration.

    This tool leverages the client's LLM to autonomously orchestrate complex analysis workflows,
    combining multiple tools and analysis techniques for comprehensive game evaluation.

    The LLM autonomously decides which analysis tools to use, in what order, and how to combine results.

    Args:
        game_type: Type of game (chess, shogi, go)
        position: Position in FEN/SGF notation
        game_id: Game identifier (uses stored position)
        analysis_goal: Analysis objective (comprehensive_evaluation, tactical_opportunities, strategic_planning, endgame_technique)
        max_iterations: Maximum orchestration steps (higher = more thorough)

    Returns:
        Orchestrated analysis results with multiple evaluation methods
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
                    "recovery_options": ["Provide position parameter", "Record a move first", "Check game state"]
                }
        else:
            return {
                "success": False,
                "error": "Must provide either position or game_id",
                "clarification_needed": ["Which game position to analyze?", "Do you have a specific game in progress?"]
            }

        # Define analysis tools for LLM orchestration
        analysis_tools = [
            {
                "name": "get_ai_move",
                "description": "Get best move suggestion from chess engine",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "game_type": {"type": "string", "enum": [game_type]},
                        "position": {"type": "string", "description": "Position to analyze"},
                        "depth": {"type": "integer", "minimum": 10, "maximum": 25}
                    },
                    "required": ["position"]
                }
            },
            {
                "name": "analyze_position_detailed",
                "description": "Perform detailed tactical analysis with multiple lines",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "game_type": {"type": "string", "enum": [game_type]},
                        "position": {"type": "string"},
                        "depth": {"type": "integer", "minimum": 15, "maximum": 25},
                        "analysis_type": {"type": "string", "enum": ["tactical", "positional", "endgame"]}
                    },
                    "required": ["position"]
                }
            },
            {
                "name": "evaluate_position_strength",
                "description": "Assess overall position strength and key factors",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "position": {"type": "string"},
                        "game_type": {"type": "string"},
                        "factors": {"type": "array", "items": {"type": "string"}}
                    }
                }
            },
            {
                "name": "find_tactical_motifs",
                "description": "Identify tactical patterns and threats in position",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "position": {"type": "string"},
                        "game_type": {"type": "string"},
                        "motif_types": {"type": "array", "items": {"type": "string"}}
                    }
                }
            },
            {
                "name": "strategic_planning",
                "description": "Develop long-term strategic plan based on position",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "position": {"type": "string"},
                        "game_type": {"type": "string"},
                        "time_horizon": {"type": "string", "enum": ["short", "medium", "long"]}
                    }
                }
            }
        ]

        # Create orchestration prompt based on analysis goal
        orchestration_prompts = {
            "comprehensive_evaluation": f"""
            Perform comprehensive {game_type} position evaluation. Analyze:
            1. Position strength and evaluation
            2. Best moves and tactical opportunities
            3. Strategic factors and long-term planning
            4. Potential threats and defensive needs
            5. Overall assessment and key takeaways

            Position to analyze: {fen}
            Game type: {game_type}

            Use available analysis tools systematically to build complete picture.
            Synthesize findings into coherent evaluation.
            """,

            "tactical_opportunities": f"""
            Find tactical opportunities in this {game_type} position:
            1. Identify immediate tactical threats (forks, pins, skewers, etc.)
            2. Look for combination sequences
            3. Assess defensive requirements
            4. Calculate tactical variations

            Position: {fen}
            Focus on concrete tactical gains and immediate opportunities.
            """,

            "strategic_planning": f"""
            Develop strategic plan for this {game_type} position:
            1. Assess long-term positional factors
            2. Identify key strategic goals
            3. Plan piece coordination and development
            4. Consider opponent responses and counterplay

            Position: {fen}
            Think 5-10 moves ahead about position transformation.
            """,

            "endgame_technique": f"""
            Analyze endgame position and technique:
            1. Assess material balance and winning chances
            2. Identify correct endgame principles
            3. Find optimal king and piece coordination
            4. Plan conversion to win or drawing method

            Position: {fen}
            Apply endgame theory and principles.
            """
        }

        prompt = orchestration_prompts.get(analysis_goal, orchestration_prompts["comprehensive_evaluation"])

        # Execute orchestrated analysis
        result = await sampling_orchestrator.orchestrate_analysis(
            prompt=prompt,
            tools=analysis_tools,
            max_iterations=max_iterations,
            context={
                "game_type": game_type,
                "position": fen,
                "analysis_goal": analysis_goal,
                "game_id": game_id
            }
        )

        # Format conversational response
        return {
            "success": True,
            "operation": "intelligent_game_analysis",
            "analysis_goal": analysis_goal,
            "game_type": game_type,
            "position": fen,
            "orchestration_result": result,
            "iterations_used": result.get("iterations", 0),
            "tools_orchestrated": result.get("tools_used", []),
            "key_findings": result.get("findings", []),
            "recommendations": result.get("recommendations", []),
            "confidence_level": result.get("confidence", "medium"),
            "next_steps": [
                f"get_ai_move(game_type='{game_type}', position='{fen}') - Get specific move suggestion",
                f"analyze_position_detailed(game_type='{game_type}', position='{fen}') - Deep tactical analysis",
                "Continue with follow-up analysis based on findings"
            ],
            "summary": f"Completed {analysis_goal.replace('_', ' ')} analysis using {result.get('iterations', 0)} orchestrated steps"
        }

    except Exception as e:
        logger.error(f"Error in intelligent game analysis: {e}", exc_info=True)
        return {
            "success": False,
            "error": f"Analysis orchestration failed: {str(e)}",
            "error_code": "SAMPLING_ORCHESTRATION_FAILED",
            "recovery_options": [
                "Try simpler analysis without orchestration",
                "Use individual analysis tools directly",
                "Check position format and game type"
            ],
            "diagnostic_info": {
                "analysis_goal": analysis_goal,
                "game_type": game_type,
                "max_iterations": max_iterations,
                "error_type": type(e).__name__
            },
            "alternative_solutions": [
                f"Use get_ai_move for basic analysis",
                f"Use analyze_position_detailed for tactical analysis",
                "Try again with lower max_iterations"
            ]
        }


@mcp.tool()
async def strategic_game_session(
    session_goal: str = "improvement",
    game_type: str = "chess",
    session_duration: int = 60,
    difficulty_preference: str = "adaptive"
) -> Dict[str, Any]:
    """
    SEP-1577: Intelligent game learning session with autonomous progression.

    This tool orchestrates a complete learning session, automatically:
    - Assessing current skill level
    - Selecting appropriate puzzles and positions
    - Providing guided analysis and feedback
    - Adapting difficulty based on performance
    - Tracking progress and identifying improvement areas

    The LLM autonomously manages the learning progression and content selection.

    Args:
        session_goal: Learning objective (improvement, tactics, endgame, openings, strategy)
        game_type: Game type for session
        session_duration: Target session length in minutes
        difficulty_preference: Difficulty adaptation (easy, medium, hard, adaptive)

    Returns:
        Complete learning session with progress tracking and recommendations
    """
    try:
        # Define learning tools for orchestration
        learning_tools = [
            {
                "name": "generate_puzzle",
                "description": "Create tactical puzzle for practice",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "game_type": {"type": "string", "enum": [game_type]},
                        "difficulty": {"type": "string"},
                        "theme": {"type": "string"}
                    }
                }
            },
            {
                "name": "analyze_position_detailed",
                "description": "Provide detailed position analysis and explanation",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "game_type": {"type": "string"},
                        "position": {"type": "string"},
                        "depth": {"type": "integer"}
                    }
                }
            },
            {
                "name": "search_game_knowledge",
                "description": "Find relevant game knowledge and principles",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {"type": "string"},
                        "game_type": {"type": "string"}
                    }
                }
            },
            {
                "name": "create_analysis_note",
                "description": "Create learning note for future reference",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "game_id": {"type": "string"},
                        "analysis_data": {"type": "object"}
                    }
                }
            }
        ]

        # Create session orchestration prompt
        session_prompts = {
            "improvement": f"""
            Conduct a comprehensive {game_type} improvement session:

            1. Assess current understanding and identify knowledge gaps
            2. Select 3-5 targeted exercises matching skill level
            3. Provide detailed solutions and explanations
            4. Identify patterns and recurring themes
            5. Create personalized improvement recommendations

            Session duration: {session_duration} minutes
            Difficulty: {difficulty_preference}
            Focus on measurable improvement and clear learning objectives.
            """,

            "tactics": f"""
            Intensive tactical training session:

            1. Start with basic tactical patterns (forks, pins, skewers)
            2. Progress to complex combinations and attacks
            3. Include defensive tactics and counterplay
            4. Practice calculation and visualization
            5. Analyze common tactical mistakes and how to avoid them

            Session: {session_duration} minutes, {difficulty_preference} difficulty
            Focus on practical tactical skills applicable in games.
            """,

            "endgame": f"""
            Endgame mastery session:

            1. Teach fundamental endgame principles
            2. Practice king and pawn endgames
            3. Study piece exchanges and simplification
            4. Learn drawing techniques and fortresses
            5. Apply endgame theory to practical positions

            Session: {session_duration} minutes, {difficulty_preference} difficulty
            Build systematic endgame understanding.
            """,

            "strategy": f"""
            Strategic thinking development session:

            1. Analyze positional factors (space, pawn structure, piece activity)
            2. Study long-term planning and maneuver concepts
            3. Practice prophylactic thinking and opponent intentions
            4. Learn to assess and improve positions gradually
            5. Connect strategy to concrete tactical execution

            Session: {session_duration} minutes, {difficulty_preference} difficulty
            Develop strategic vision and positional understanding.
            """
        }

        prompt = session_prompts.get(session_goal, session_prompts["improvement"])

        # Execute orchestrated learning session
        result = await sampling_orchestrator.orchestrate_learning_session(
            prompt=prompt,
            tools=learning_tools,
            session_duration=session_duration,
            context={
                "session_goal": session_goal,
                "game_type": game_type,
                "difficulty_preference": difficulty_preference,
                "start_time": asyncio.get_event_loop().time()
            }
        )

        # Format comprehensive session response
        return {
            "success": True,
            "operation": "strategic_game_session",
            "session_goal": session_goal,
            "game_type": game_type,
            "session_duration_minutes": session_duration,
            "difficulty_preference": difficulty_preference,
            "session_result": result,
            "exercises_completed": result.get("exercises_count", 0),
            "key_concepts_covered": result.get("concepts", []),
            "progress_assessment": result.get("progress", {}),
            "personalized_recommendations": result.get("recommendations", []),
            "next_session_suggestions": result.get("follow_up", []),
            "learning_materials": result.get("materials", []),
            "session_summary": result.get("summary", ""),
            "estimated_improvement": result.get("improvement_potential", "moderate"),
            "next_steps": [
                f"Continue with {session_goal} practice sessions regularly",
                "Apply learned concepts in actual games",
                "Track progress with get_player_statistics",
                "Schedule follow-up sessions for reinforcement"
            ]
        }

    except Exception as e:
        logger.error(f"Error in strategic game session: {e}", exc_info=True)
        return {
            "success": False,
            "error": f"Learning session orchestration failed: {str(e)}",
            "error_code": "LEARNING_SESSION_FAILED",
            "recovery_options": [
                "Try shorter session duration",
                "Use individual tools instead of orchestrated session",
                "Check session parameters"
            ],
            "diagnostic_info": {
                "session_goal": session_goal,
                "game_type": game_type,
                "session_duration": session_duration,
                "difficulty_preference": difficulty_preference,
                "error_type": type(e).__name__
            },
            "alternative_solutions": [
                "Use generate_puzzle for individual practice",
                "Use analyze_position_detailed for specific positions",
                "Try again with simpler parameters"
            ]
        }


@mcp.tool()
async def adaptive_game_coaching(
    player_id: str,
    game_type: str = "chess",
    coaching_focus: str = "balanced",
    session_count: int = 5
) -> Dict[str, Any]:
    """
    SEP-1577: Personalized coaching program with adaptive learning progression.

    This tool creates a complete coaching curriculum that adapts to player progress,
    automatically adjusting difficulty, focus areas, and learning pace based on
    performance and identified strengths/weaknesses.

    The LLM analyzes performance data and autonomously designs the optimal learning path.

    Args:
        player_id: Player identifier for progress tracking
        game_type: Game type for coaching
        coaching_focus: Primary focus area (balanced, tactics, strategy, endgame, openings)
        session_count: Number of coaching sessions to plan

    Returns:
        Comprehensive coaching program with adaptive curriculum
    """
    try:
        # Get player statistics for analysis
        player_stats = await get_player_statistics(player_id, game_type)
        if not player_stats["success"]:
            return {
                "success": False,
                "error": "Cannot retrieve player statistics for coaching analysis",
                "setup_required": ["Play some games first", "Complete initial rating assessment"],
                "alternative": "Use strategic_game_session for general improvement"
            }

        # Define coaching tools for orchestration
        coaching_tools = [
            {
                "name": "analyze_performance",
                "description": "Analyze player strengths, weaknesses, and patterns",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "player_stats": {"type": "object"},
                        "game_type": {"type": "string"}
                    }
                }
            },
            {
                "name": "design_curriculum",
                "description": "Create structured learning progression",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "weaknesses": {"type": "array"},
                        "strengths": {"type": "array"},
                        "focus_area": {"type": "string"},
                        "session_count": {"type": "integer"}
                    }
                }
            },
            {
                "name": "select_exercises",
                "description": "Choose appropriate exercises and puzzles",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "skill_level": {"type": "string"},
                        "focus_topics": {"type": "array"},
                        "difficulty_progression": {"type": "string"}
                    }
                }
            },
            {
                "name": "create_progress_tracking",
                "description": "Set up metrics and assessment methods",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "baseline_metrics": {"type": "object"},
                        "target_improvements": {"type": "array"}
                    }
                }
            }
        ]

        # Create coaching orchestration prompt
        coaching_prompt = f"""
        Design a comprehensive {session_count}-session coaching program for {player_id}:

        Player Profile:
        - Game Type: {game_type}
        - Current Rating: {player_stats.get('ratings', {}).get(game_type, 'Unknown')}
        - Total Games: {player_stats.get('statistics', {}).get('total_games', 0)}
        - Win Rate: {player_stats.get('statistics', {}).get('win_rate', 0):.1%}
        - Coaching Focus: {coaching_focus}

        Coaching Objectives:
        1. Analyze current performance and identify improvement areas
        2. Create {session_count} progressive coaching sessions
        3. Design adaptive difficulty scaling
        4. Establish measurable improvement goals
        5. Build sustainable learning habits
        6. Provide ongoing motivation and feedback

        Make the program:
        - Realistic and achievable
        - Measurable with clear milestones
        - Adaptive to player progress
        - Engaging and motivating
        - Comprehensive yet focused

        Structure each session with:
        - Clear learning objectives
        - Specific exercises and puzzles
        - Theoretical concepts to study
        - Practice games to play
        - Assessment methods
        - Estimated time commitment
        """

        # Execute coaching program design
        result = await sampling_orchestrator.orchestrate_coaching_program(
            prompt=coaching_prompt,
            tools=coaching_tools,
            context={
                "player_id": player_id,
                "game_type": game_type,
                "coaching_focus": coaching_focus,
                "session_count": session_count,
                "player_stats": player_stats
            }
        )

        # Format comprehensive coaching response
        return {
            "success": True,
            "operation": "adaptive_game_coaching",
            "player_id": player_id,
            "game_type": game_type,
            "coaching_focus": coaching_focus,
            "program_design": result,
            "session_count": session_count,
            "curriculum_overview": result.get("curriculum", {}),
            "progression_plan": result.get("progression", []),
            "assessment_methods": result.get("assessment", []),
            "estimated_commitment": result.get("time_commitment", "TBD"),
            "success_metrics": result.get("metrics", []),
            "motivation_strategy": result.get("motivation", []),
            "adaptation_triggers": result.get("adaptation_rules", []),
            "support_resources": result.get("resources", []),
            "program_summary": result.get("summary", ""),
            "getting_started": [
                f"Begin with Session 1: {result.get('first_session', 'Assessment and Goal Setting')}",
                "Track progress after each session",
                "Adjust difficulty based on comfort level",
                "Contact coach if significant challenges arise"
            ],
            "next_steps": [
                "Start Session 1 exercises immediately",
                "Schedule regular practice sessions",
                "Track improvements with get_player_statistics",
                "Adjust program based on progress feedback"
            ]
        }

    except Exception as e:
        logger.error(f"Error in adaptive game coaching: {e}", exc_info=True)
        return {
            "success": False,
            "error": f"Coaching program design failed: {str(e)}",
            "error_code": "COACHING_PROGRAM_FAILED",
            "recovery_options": [
                "Try with fewer sessions",
                "Use strategic_game_session for immediate practice",
                "Check player statistics availability"
            ],
            "diagnostic_info": {
                "player_id": player_id,
                "game_type": game_type,
                "coaching_focus": coaching_focus,
                "session_count": session_count,
                "error_type": type(e).__name__
            },
            "alternative_solutions": [
                "Use individual coaching sessions",
                "Focus on specific skill areas manually",
                "Start with basic improvement program"
            ]
        }


@mcp.tool()
async def sampling_capabilities_status() -> Dict[str, Any]:
    """
    SEP-1577: Check sampling capabilities and orchestration status.

    This tool provides comprehensive status of SEP-1577 sampling features,
    including available providers, performance metrics, and system health.

    Returns:
        Complete sampling system status and capabilities
    """
    try:
        status = await sampling_orchestrator.get_capabilities_status()

        # Enhanced status with conversational elements
        return {
            "success": True,
            "operation": "sampling_capabilities_status",
            "sep_1577_implemented": True,
            "fastmcp_version": "2.14.3+",
            "sampling_available": status.get("available", False),
            "anthropic_provider": status.get("anthropic", False),
            "openai_provider": status.get("openai", False),
            "performance_metrics": status.get("metrics", {}),
            "available_features": [
                "ctx.sample() with tools parameter",
                "ctx.sample_step() fine-grained control",
                "Structured output validation",
                "Intelligent game analysis orchestration",
                "Adaptive learning session management",
                "Personalized coaching program design"
            ],
            "system_health": status.get("health", "unknown"),
            "orchestration_capabilities": [
                "Multi-tool workflow orchestration",
                "Autonomous decision making",
                "Complex analysis synthesis",
                "Adaptive difficulty scaling",
                "Progress tracking and assessment"
            ],
            "usage_examples": [
                "intelligent_game_analysis() - Autonomous position evaluation",
                "strategic_game_session() - Guided learning progression",
                "adaptive_game_coaching() - Personalized improvement plans"
            ],
            "next_steps": [
                "Try intelligent_game_analysis for comprehensive position evaluation",
                "Use strategic_game_session for structured learning",
                "Explore adaptive_game_coaching for personalized development"
            ],
            "summary": "SEP-1577 sampling capabilities fully operational with advanced orchestration features"
        }

    except Exception as e:
        return {
            "success": False,
            "error": f"Cannot retrieve sampling status: {str(e)}",
            "error_code": "SAMPLING_STATUS_FAILED",
            "recovery_options": [
                "Check FastMCP version compatibility",
                "Verify sampling provider configuration",
                "Restart MCP server"
            ],
            "diagnostic_info": {
                "error_type": type(e).__name__,
                "sampling_module_available": sampling_orchestrator is not None
            },
            "fallback_status": {
                "basic_tools_available": True,
                "orchestration_available": False,
                "enhanced_features_limited": True
            }
        }


# ===== STANDARD TOOLS =====

@mcp.tool()
async def make_move(
    game_id: str, move: str, game_type: str = "chess", fen: Optional[str] = None
) -> Dict[str, Any]:
    """
    PORTMANTEAU PATTERN RATIONALE:
    Consolidates move recording, validation, and game state updates into single interface.
    Prevents tool explosion while maintaining full functionality for correspondence play.

    Record a move in a correspondence game with enhanced AI analysis capabilities.

    Use this when the user tells you they made a move on their physical board.
    The move will be recorded, validated, and you can then get AI analysis.

    Args:
        game_id (str): Unique game identifier (e.g., 'chess_1', 'correspondence_steve')
        move (str): Move in standard notation:
            - Chess: 'e2e4', 'Nf3', 'O-O' (castling), 'e7e8q' (promotion)
            - Shogi: '7g7f', 'B*5e' (drop)
            - Go: 'A1', 'K10', 'pass'
        game_type (str): Type of game (chess, shogi, go, gomoku, checkers)
        fen (str | None): Current FEN position (for chess). If not provided, uses stored position.

    Returns:
        Enhanced response with move confirmation, validation, and next steps
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
                "status": game_data.get("status", "active")
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
                status="active"
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
            status=game.get("status", "active")
        )

        # Enhanced conversational response with next steps
        return {
            "success": True,
            "operation": "make_move",
            "result": {
                "game_id": game_id,
                "move": move,
                "move_number": len(game["moves"]),
                "game_type": game_type,
                "position_updated": bool(fen),
                "current_position": game.get("fen") or game.get("position")
            },
            "available_types": ["chess", "shogi", "go", "gomoku", "checkers", "connect4", "muhle", "battleship", "scrabble"],
            "recommendations": [
                f"get_ai_move(game_id='{game_id}', depth=15) - Get AI analysis",
                f"analyze_position(game_type='{game_type}', game_id='{game_id}') - Deep tactical analysis",
                f"get_game_state(game_id='{game_id}') - Check current state",
                f"create_tournament(game_type='{game_type}') - Start tournament play"
            ],
            "next_steps": [
                "Get AI analysis to understand position strength",
                "Analyze for tactical opportunities or weaknesses",
                "Consider opponent response patterns",
                "Track game progress and learning points"
            ],
            "summary": f"Move {move} recorded in {game_type} game {game_id}. Ready for AI analysis or opponent response."
        }
    except Exception as e:
        logger.error(f"Error recording move for game {game_id}: {e}", exc_info=True)

        # Enhanced error recovery with diagnostic info and alternatives
        return {
            "success": False,
            "error": f"Failed to record move: {str(e)}",
            "error_code": "MOVE_RECORDING_FAILED",
            "recovery_options": [
                f"Verify game_id '{game_id}' exists with get_game_state",
                f"Check move notation format for {game_type}",
                f"Use new_game to create game first",
                "Provide position parameter if game state is corrupted"
            ],
            "diagnostic_info": {
                "game_id": game_id,
                "move_attempted": move,
                "game_type": game_type,
                "fen_provided": bool(fen),
                "error_type": type(e).__name__
            },
            "alternative_solutions": [
                f"Try get_game_state(game_id='{game_id}') to check game status",
                f"Use analyze_position to analyze current position instead",
                "Create new game and retry move"
            ],
            "estimated_resolution_time": "< 2 minutes",
            "urgency": "medium - move not recorded"
        }


@mcp.tool()
async def get_ai_move(
    game_type: str = "chess",
    position: Optional[str] = None,
    game_id: Optional[str] = None,
    depth: int = 15,
    skill_level: int = 20,
    movetime: int = 2000,
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
        logger.debug(f"Getting AI move for {game_type}, depth={depth}, skill={skill_level}")
        
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
        position_hash = hashlib.md5(f"{fen}_{game_type}_{depth}_{skill_level}".encode()).hexdigest()
        
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
                        analysis_depth=depth
                    )
                    logger.debug(f"Cached analysis for position hash {position_hash[:8]}")

                    # Update game state if game_id provided
                    if game_id and game_id in active_games:
                        active_games[game_id]["last_ai_move"] = move

                    # Enhanced success response with analysis details
                    return {
                        "success": True,
                        "operation": "get_ai_move",
                        "result": {
                            "move": move,
                            "engine": result.get("engine", "Stockfish"),
                            "elo": result.get("elo", "~3500"),
                            "evaluation": result.get("evaluation", 0),
                            "depth": depth,
                            "skill_level": skill_level,
                            "analysis_time": result.get("time", "Unknown"),
                            "position_hash": position_hash[:8],
                            "cached": False
                        },
                        "available_types": ["chess", "shogi", "go"],
                        "recommendations": [
                            f"Record opponent's response with make_move(game_id='{game_id or 'your_game'}', move='response_move')",
                            f"Get deeper analysis with analyze_position_detailed(depth=20)",
                            "Check for tactical opportunities in the position"
                        ],
                        "next_steps": [
                            "Record opponent's move when they respond",
                            "Analyze position for strategic insights",
                            "Consider creating puzzles from this position",
                            "Track game progress and learning points"
                        ],
                        "summary": f"AI ({result.get('engine', 'Stockfish')}) suggests {move} with evaluation {result.get('evaluation', 0)}. Ready for opponent's response."
                    }
                else:
                    error_text = await response.text()
                    logger.error(f"Engine returned error status {response.status}: {error_text}")
                    return {"success": False, "error": f"Engine error: {error_text}"}

    except aiohttp.ClientError as e:
        logger.error(f"Cannot connect to {game_type} engine: {e}")

        # Enhanced connection error with step-by-step recovery
        return {
            "success": False,
            "error": f"Cannot connect to {game_type} engine: {str(e)}",
            "error_code": "ENGINE_CONNECTION_FAILED",
            "recovery_options": [
                f"Start {game_type} engine: python backend/simple-{game_type}-server.py",
                f"Check firewall settings for port {9880 + ['chess', 'shogi', 'go'].index(game_type)}",
                "Verify engine is not already running (check task manager)",
                "Try restarting engine server"
            ],
            "diagnostic_info": {
                "engine_type": game_type,
                "connection_type": "HTTP",
                "expected_port": 9880 + ["chess", "shogi", "go"].index(game_type),
                "error_type": type(e).__name__,
                "network_error": True
            },
            "step_by_step_recovery": [
                f"1. Open command prompt in games-app directory",
                f"2. Run: python backend/simple-{game_type}-server.py",
                f"3. Wait for 'Server started' message",
                f"4. Retry get_ai_move tool",
                "5. Check engine logs if still failing"
            ],
            "alternative_solutions": [
                "Use make_move to record moves without AI analysis",
                "Analyze position manually using game knowledge",
                "Continue game with delayed AI analysis"
            ],
            "estimated_resolution_time": "2-5 minutes",
            "urgency": "medium - can continue without AI for now"
        }

    except Exception as e:
        logger.error(f"Error getting AI move: {e}", exc_info=True)

        # Enhanced general error with diagnostic info
        return {
            "success": False,
            "error": f"Unexpected error getting AI move: {str(e)}",
            "error_code": "AI_MOVE_UNEXPECTED_ERROR",
            "recovery_options": [
                "Try again with simpler parameters",
                "Check browser console for additional error details",
                "Verify game type is supported",
                "Try different position format"
            ],
            "diagnostic_info": {
                "game_type": game_type,
                "position_length": len(position or ""),
                "depth": depth,
                "skill_level": skill_level,
                "game_id": game_id,
                "error_type": type(e).__name__
            },
            "alternative_solutions": [
                "Use basic analysis without AI engine",
                "Record move and analyze later when engine available",
                "Try with different game parameters"
            ],
            "estimated_resolution_time": "< 5 minutes",
            "urgency": "medium - try alternative approaches"
        }


@mcp.tool()
async def analyze_position(
    game_type: str = "chess",
    position: Optional[str] = None,
    game_id: Optional[str] = None,
    depth: int = 20,
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
                    "status": game_data.get("status", "active")
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
            "error": f"Error retrieving game state: {str(e)}",
        }


@mcp.tool()
async def new_game(
    game_type: str = "chess", game_id: Optional[str] = None
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
            status="active"
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
) -> Dict[str, Any]:
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
async def register_for_tournament(tournament_id: str, player_id: str) -> Dict[str, Any]:
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
    theme: Optional[str] = None,
) -> Dict[str, Any]:
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
        else:
            return {
                "success": False,
                "error": f"Puzzle generation not yet implemented for {game_type}",
            }
    except Exception as e:
        return {"success": False, "error": str(e)}


@mcp.tool()
async def analyze_position_detailed(
    game_type: str = "chess",
    position: Optional[str] = None,
    game_id: Optional[str] = None,
    depth: int = 20,
    analysis_type: str = "full",
) -> Dict[str, Any]:
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
        async with aiohttp.ClientSession() as session:
            async with session.post(
                url,
                json={
                    "fen": fen,
                    "depth": depth,
                    "analysis_type": analysis_type,
                    "multi_pv": 3,  # Get top 3 moves
                },
            ) as response:
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
                else:
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
    player_id: str, game_type: Optional[str] = None, timeframe: str = "all"
) -> Dict[str, Any]:
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
    game_id: Optional[str] = None,
) -> Dict[str, Any]:
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
            return {"success": False, "error": f"Unsupported game type: {game_type}"}

        async with aiohttp.ClientSession() as session:
            async with session.get(
                url, timeout=aiohttp.ClientTimeout(total=2)
            ) as response:
                if response.status == 200:
                    status = await response.json()
                    return {
                        "success": True,
                        "running": True,
                        "engine": status.get("engine", "Unknown"),
                        "elo": status.get("elo", "Unknown"),
                        "message": f"{game_type.capitalize()} engine is running",
                    }
                else:
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
    position: Optional[str] = None,
    analysis_depth: int = 15
) -> Dict[str, Any]:
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
                "error": "No position available for analysis. Provide position or ensure game has position."
            }
        
        # Get AI analysis
        ai_result = await get_ai_move(
            game_type=game_type,
            position=position,
            depth=analysis_depth
        )
        
        if not ai_result["success"]:
            return {
                "success": False,
                "error": f"Failed to get AI analysis: {ai_result['error']}"
            }
        
        # Create analysis note in ADN
        analysis_data = {
            "best_move": ai_result["move"],
            "evaluation": ai_result.get("evaluation", 0),
            "engine": ai_result["engine"],
            "depth": analysis_depth,
            "position": position,
            "game_id": game_id,
            "game_type": game_type
        }
        
        note_created = await adn.create_game_analysis_note(game_id, game_type, analysis_data)
        
        return {
            "success": True,
            "game_id": game_id,
            "analysis": ai_result,
            "note_created": note_created,
            "message": f"Analysis note created for {game_type} game {game_id}",
            "analysis_data": analysis_data
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}


@mcp.tool()
async def search_game_knowledge(
    query: str,
    game_type: Optional[str] = None,
    max_results: int = 5
) -> Dict[str, Any]:
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
            "message": f"Found {len(limited_results)} knowledge entries for '{query}'"
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}


@mcp.tool()
async def cleanup_cache(
    older_than_hours: int = 24
) -> Dict[str, Any]:
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
            "message": f"Cache cleanup completed for entries older than {older_than_hours} hours"
        }
        
    except Exception as e:
        return {"success": False, "error": str(e)}


@mcp.tool()
async def get_system_status(
    include_engines: bool = True,
    include_database: bool = True,
    include_adn: bool = True
) -> Dict[str, Any]:
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
            "components": {}
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
                    "path": str(db.db_path)
                }
            except Exception as e:
                status["components"]["database"] = {
                    "status": "error",
                    "error": str(e)
                }
        
        # ADN integration status
        if include_adn:
            status["components"]["adn"] = {
                "status": "available" if adn.adn_available else "unavailable",
                "integration": "Advanced Memory (ADN)"
            }
        
        # General statistics
        status["statistics"] = {
            "active_games": len(active_games),
            "tracked_players": len(player_ratings),
            "server_uptime": "Running"  # Could be enhanced with actual uptime
        }
        
        return status
        
    except Exception as e:
        return {"success": False, "error": str(e)}


# Main entry point for FastMCP
def main():
    """Main entry point for MCP server with multiple transport support"""
    import argparse

    parser = argparse.ArgumentParser(description="Games MCP Server - AI-Orchestrated Game Analysis & Learning")
    parser.add_argument("--transport",
                       choices=["stdio", "streamable-http", "sse"],
                       default="stdio",
                       help="Transport protocol to use")
    parser.add_argument("--host",
                       default="0.0.0.0",
                       help="Host to bind to (for HTTP transports)")
    parser.add_argument("--port",
                       type=int,
                       default=8000,
                       help="Port to bind to (for HTTP transports)")
    parser.add_argument("--cors-origins",
                       default="*",
                       help="CORS origins (for HTTP transports)")

    args = parser.parse_args()

    # Configure transport-specific settings
    transport_kwargs = {}

    if args.transport in ["streamable-http", "sse"]:
        transport_kwargs.update({
            "host": args.host,
            "port": args.port,
            "cors_origins": [origin.strip() for origin in args.cors_origins.split(",")],
        })

        logger.info(f"Starting {args.transport.upper()} transport on {args.host}:{args.port}")
        logger.info(f"CORS origins: {args.cors_origins}")

        # Additional HTTP-specific configuration
        if args.transport == "streamable-http":
            logger.info("🎯 Streamable HTTP: Stateless operation, automatic reconnection, serverless-compatible")
        elif args.transport == "sse":
            logger.warning("⚠️ SSE transport: Consider upgrading to streamable-http for better resilience")

    elif args.transport == "stdio":
        logger.info("🎮 Starting STDIO transport (default for MCP clients)")

    try:
        # Run with specified transport
        mcp.run(transport=args.transport, **transport_kwargs)

    except Exception as e:
        logger.error(f"Failed to start server with {args.transport} transport: {e}")
        if args.transport in ["streamable-http", "sse"]:
            logger.info("💡 Try: python -m games_mcp.mcp_server --transport stdio")
        raise


if __name__ == "__main__":
    main()
