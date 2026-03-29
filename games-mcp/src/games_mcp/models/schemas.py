from typing import Any
from pydantic import BaseModel, Field

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
