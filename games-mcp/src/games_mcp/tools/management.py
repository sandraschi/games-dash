from typing import Any
from mcp.server.fastmcp import FastMCP
import logging
import asyncio

from ..services.game_service import game_service
from ..services.db_service import db_service

logger = logging.getLogger(__name__)

def register_management_tools(mcp: FastMCP):
    @mcp.tool()
    async def create_tournament(
        tournament_id: str,
        game_type: str = "chess",
        max_players: int = 8,
        time_control: str = "blitz",
    ) -> dict[str, Any]:
        """
        Create a new tournament for competitive play.
        """
        try:
            if tournament_id in game_service.active_games:
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

            game_service.active_games[tournament_id] = tournament
            
            # Persist to DB
            await db_service.save_tournament(
                tournament_id=tournament_id,
                tournament_type=game_type,
                status="registration_open",
                metadata={
                    "max_players": max_players,
                    "time_control": time_control
                }
            )
            
            return {
                "success": True,
                "tournament_id": tournament_id,
                "game_type": game_type,
                "max_players": max_players,
                "time_control": time_control,
                "message": f"Tournament {tournament_id} created and persisted. Registration open.",
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    @mcp.tool()
    async def register_for_tournament(tournament_id: str, player_id: str) -> dict[str, Any]:
        """
        Register a player for a tournament.
        """
        try:
            if tournament_id not in game_service.active_games:
                return {"success": False, "error": f"Tournament {tournament_id} not found"}

            tournament = game_service.active_games[tournament_id]

            if player_id in tournament["players"]:
                return {"success": False, "error": f"Player {player_id} already registered"}

            if len(tournament["players"]) >= tournament.get("max_players", 8):
                return {"success": False, "error": f"Tournament {tournament_id} is full"}

            tournament["players"].append(player_id)

            return {
                "success": True,
                "tournament_id": tournament_id,
                "player_id": player_id,
                "current_players": len(tournament["players"]),
                "message": f"Player {player_id} registered.",
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    @mcp.tool()
    async def get_player_statistics(
        player_id: str, game_type: str | None = None, timeframe: str = "all"
    ) -> dict[str, Any]:
        """
        Get comprehensive player statistics and performance metrics from the database.
        """
        try:
            from ..services.db_service import get_player_statistics as fetch_stats
            
            stats = await fetch_stats(player_id, game_type)
            rating = await db_service.get_player_rating(player_id, game_type or "chess")
            
            return {
                "success": True,
                "player_id": player_id,
                "game_type": game_type,
                "current_rating": rating,
                "statistics": stats,
                "timeframe": timeframe,
                "overall_win_rate": stats.get("win_rate", 0.0),
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
        Update player rating using ELO system and persist to database.
        """
        try:
            # Elo Constant
            K = 32
            
            # Fetch current rating from DB
            current_rating = await db_service.get_player_rating(player_id, game_type)

            # Expected score
            expected_score = 1 / (1 + 10 ** ((opponent_rating - current_rating) / 400))
            
            # Actual score
            actual_score = 1.0 if result == "win" else (0.5 if result == "draw" else 0.0)
            
            # New rating
            new_rating = current_rating + K * (actual_score - expected_score)
            
            # Persist to DB
            await db_service.update_player_rating(player_id, game_type, int(new_rating))

            return {
                "success": True,
                "player_id": player_id,
                "game_type": game_type,
                "old_rating": current_rating,
                "new_rating": int(new_rating),
                "rating_change": int(new_rating - current_rating),
                "message": f"Rating updated after {result} against opponent with rating {opponent_rating}",
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
