import asyncio
import logging
from typing import Any, List, Optional
from mcp.server.fastmcp import FastMCP

from ..services.game_service import game_service
from ..services.db_service import db_service
from ..services.sync_service import sync_manager

logger = logging.getLogger(__name__)

def register_gameplay_tools(mcp: FastMCP):
    @mcp.tool()
    async def make_move(
        game_id: str,
        move: str,
        game_type: str = "chess",
        player_id: str | None = None,
    ) -> dict[str, Any]:
        """
        Record a move in a specific game.
        """
        try:
            # Basic validation
            if not game_id or not move:
                return {"success": False, "error": "Invalid game_id or move."}

            # Update local game state
            result = await game_service.process_move(game_id, move, game_type)
            
            # Sync with Firebase if session is shared
            if result.get("success"):
                await sync_manager.push_move(game_id, move, result.get("state", {}))
                
                # Persist to local DB
                await db_service.save_game(
                    game_id=game_id,
                    game_type=game_type,
                    position=result.get("new_position"),
                    moves=result.get("moves", []),
                    status="active"
                )

            return result
        except Exception as e:
            logger.error(f"Error in make_move for {game_id}: {e}")
            return {"success": False, "error": str(e)}

    @mcp.tool()
    async def get_game_state(game_id: str) -> dict[str, Any]:
        """
        Retrieve the current state of a specific game.
        """
        try:
            # Sync from Firebase first to get latest remote moves
            remote_state = await sync_manager.get_latest_state(game_id)
            if remote_state:
                # Update local cache
                await game_service.update_state_from_remote(game_id, remote_state)

            state = await game_service.get_game_state(game_id)
            if not state:
                return {"success": False, "error": f"Game {game_id} not found."}
            
            return {
                "success": True,
                "game_id": game_id,
                "game_type": state.get("game_type"),
                "status": state.get("status", "active"),
                "moves": state.get("moves", []),
                "current_position": state.get("fen") or state.get("position"),
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    @mcp.tool()
    async def new_game(
        game_type: str = "chess", game_id: str | None = None
    ) -> dict[str, Any]:
        """
        Start a new correspondence game.
        """
        import uuid
        if not game_id:
            game_id = f"{game_type}_{uuid.uuid4().hex[:8]}"

        try:
            # Initialize locally
            game_service.active_games[game_id] = {
                "game_type": game_type,
                "moves": [],
                "status": "active",
                "created_at": asyncio.get_event_loop().time(),
            }

            # Push to Firebase
            await sync_manager.create_session(game_id, game_type, game_service.active_games[game_id])

            # Persist to local DB
            await db_service.save_game(
                game_id=game_id,
                game_type=game_type,
                position=None, # will be set on first move or init
                moves=[],
                status="active"
            )

            return {
                "success": True,
                "game_id": game_id,
                "message": f"New {game_type} game created and synchronized.",
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    @mcp.tool()
    async def join_shared_session(game_id: str) -> dict[str, Any]:
        """
        Join a shared P2P session via Firebase.
        """
        try:
            # Pull state from Firebase
            remote_state = await sync_manager.get_latest_state(game_id)
            if not remote_state:
                return {"success": False, "error": f"Session {game_id} not found in Firebase."}
            
            # Sync local state
            await game_service.update_state_from_remote(game_id, remote_state)
            
            return {
                "success": True,
                "game_id": game_id,
                "message": f"Successfully joined session {game_id}. Syncing state...",
                "state": remote_state.get('state')
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
