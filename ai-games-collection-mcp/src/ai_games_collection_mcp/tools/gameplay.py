import asyncio
import logging
from typing import Any

from mcp.server.fastmcp import FastMCP

from ..services.db_service import db_service
from ..services.game_service import game_service
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
        game_type: str = "chess", game_id: str | None = None, host_name: str = "MCP"
    ) -> dict[str, Any]:
        """
        Start a new correspondence game (optionally shared via Firebase).

        ## Return Format
        {"success": bool, "game_id": str, "message": str, "firebase": {...}}

        ## Examples
        new_game(game_type="chess")
        new_game(game_type="shogi", host_name="Sandra")
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

            # Push to Firebase (games/{id} node, browser-compatible shape)
            await sync_manager.create_session(game_id, game_type, game_service.active_games[game_id], host_name=host_name)

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
                "firebase": sync_manager.status(),
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    @mcp.tool()
    async def list_shared_sessions(
        limit: int = 20, status_filter: str = "active"
    ) -> dict[str, Any]:
        """
        List shared multiplayer sessions from Firebase (games/ root).

        Reads the same Realtime Database node the browser games collection uses,
        so sessions created in the web UI (multiplayer.js / chess-multiplayer.js)
        appear here, and vice versa.

        ## Return Format
        {"success": bool, "sessions": [{"game_id", "type", "status", "host_name",
         "created_at", "player_count", "last_move"}], "count": int,
         "firebase": {"configured": bool, "mock": bool}}

        ## Examples
        list_shared_sessions(limit=20)
        list_shared_sessions(status_filter="waiting")
        """
        try:
            sessions = await sync_manager.list_sessions(status_filter=status_filter, limit=limit)
            return {
                "success": True,
                "sessions": sessions,
                "count": len(sessions),
                "firebase": sync_manager.status(),
            }
        except Exception as e:
            return {"success": False, "error": str(e)}

    @mcp.tool()
    async def join_shared_session(game_id: str) -> dict[str, Any]:
        """
        Join a shared P2P session via Firebase (games/{game_id}).

        ## Return Format
        {"success": bool, "game_id": str, "message": str, "state": {...},
         "firebase": {"configured": bool, "mock": bool}}

        ## Examples
        join_shared_session("ABC123")
        """
        try:
            status = sync_manager.status()
            if not status["configured"]:
                return {
                    "success": False,
                    "error": "Firebase sync not configured - set FIREBASE_SERVICE_ACCOUNT_JSON and FIREBASE_DATABASE_URL.",
                    "firebase": status,
                }

            # Pull state from Firebase
            remote_state = await sync_manager.get_latest_state(game_id)
            if not remote_state:
                return {"success": False, "error": f"Session {game_id} not found in Firebase.", "firebase": status}

            # Sync local state
            await game_service.update_state_from_remote(game_id, remote_state)

            return {
                "success": True,
                "game_id": game_id,
                "message": f"Successfully joined session {game_id}. Syncing state...",
                "state": remote_state.get("state"),
                "firebase": status,
            }
        except Exception as e:
            return {"success": False, "error": str(e)}
