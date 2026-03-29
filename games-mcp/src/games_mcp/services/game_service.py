import asyncio
import logging
from typing import Any
from .db_service import get_database

logger = logging.getLogger(__name__)

class GameService:
    """Service for managing game state and core gameplay logic"""
    
    def __init__(self):
        self.active_games: dict[str, dict[str, Any]] = {}

    async def get_game_state(self, game_id: str) -> dict[str, Any] | None:
        """Retrieve current game state, matching tool interface."""
        if game_id in self.active_games:
            return self.active_games[game_id]
            
        # Fallback to DB
        db = get_database()
        game_data = await db.load_game(game_id)
        if game_data:
            self.active_games[game_id] = game_data
            return game_data
        return None

    async def process_move(self, game_id: str, move: str, game_type: str = "chess") -> dict[str, Any]:
        """Validate and record a move, updating local state."""
        game = await self.get_game_state(game_id)
        if not game:
            game = {
                "game_id": game_id,
                "game_type": game_type,
                "moves": [],
                "status": "active"
            }
            self.active_games[game_id] = game

        game["moves"].append({
            "move": move,
            "timestamp": asyncio.get_event_loop().time()
        })
        
        return {"success": True, "state": game, "new_position": move}

    async def update_state_from_remote(self, game_id: str, remote_state: dict[str, Any]):
        """Merge remote state (e.g. from Firebase) into local cache."""
        self.active_games[game_id] = remote_state.get("state", remote_state)
        # Persist to local DB too
        db = get_database()
        await db.save_game(
            game_id=game_id,
            game_type=self.active_games[game_id].get("game_type", "unknown"),
            position=self.active_games[game_id].get("position"),
            moves=self.active_games[game_id].get("moves", []),
            status=self.active_games[game_id].get("status", "active")
        )

# Global instance
game_service = GameService()

def get_game_service() -> GameService:
    """Get the global game service instance (deprecated, use game_service import)"""
    return game_service
