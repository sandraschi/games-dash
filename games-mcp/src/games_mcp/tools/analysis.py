import logging
import asyncio
import aiohttp
from typing import Any
from mcp.server.fastmcp import FastMCP

from ..services.game_service import game_service
from ..services.engine_service import engine_service

logger = logging.getLogger(__name__)

def register_analysis_tools(mcp: FastMCP):
    @mcp.tool()
    async def get_ai_move(
        game_type: str = "chess",
        position: str | None = None,
        game_id: str | None = None,
        difficulty: str = "intermediate",
        depth: int = 15,
        player: int = 1,
    ) -> dict[str, Any]:
        """
        Request the next move from the integrated AI engine.

        Routes to high-fidelity external engines (Chess/Shogi/Go) or 
        optimized internal Python engines (Tic-Tac-Toe, Connect4, etc.).
        """
        try:
            # 1. Resolve the position/board data
            board_data = None
            if position:
                board_data = position
            elif game_id:
                game = await game_service.get_game_state(game_id)
                if not game:
                    return {"success": False, "error": f"Game {game_id} not found."}
                # Use FEN for board games, or full state for others
                board_data = game.get("fen") or game.get("position") or game.get("board")
                if not board_data:
                    return {"success": False, "error": f"No valid board state found for game {game_id}"}
            else:
                return {"success": False, "error": "Must provide either position or game_id"}

            # 2. Call the Engine Service (Mock Purge: uses real internal engines)
            logger.info(f"Requesting AI move for {game_type} (depth={depth}, player={player})")
            result = await engine_service.get_ai_move(
                game_type=game_type,
                board_data=board_data,
                player=player,
                depth=depth
            )

            if "error" in result:
                return {"success": False, "error": result["error"]}

            # 3. Update game state if game_id provided
            move = result.get("move")
            if move and game_id:
                if game_id in game_service.active_games:
                    game_service.active_games[game_id]["last_ai_move"] = move
                    game_service.active_games[game_id]["last_update"] = asyncio.get_event_loop().time()

            return {
                "success": True,
                "move": move,
                "evaluation": result.get("evaluation"),
                "engine": result.get("engine", "Integrated Engine"),
                "game_type": game_type,
                "position_processed": board_data[:50] + "..." if isinstance(board_data, str) and len(board_data) > 50 else board_data
            }

        except Exception as e:
            logger.error(f"Error in get_ai_move: {e}")
            return {"success": False, "error": str(e)}

    @mcp.tool()
    async def analyze_position_detailed(
        game_type: str = "chess",
        position: str | None = None,
        game_id: str | None = None,
        depth: int = 20,
    ) -> dict[str, Any]:
        """
        Perform detailed position analysis with multiple lines and evaluations.
        Currently fully supported for Chess (Stockfish), Shogi (Yaneuraou), and Go (Katago).
        """
        try:
            # Resolve position
            board_data = position
            if not board_data and game_id:
                game = await game_service.get_game_state(game_id)
                if game:
                    board_data = game.get("fen") or game.get("position") or game.get("board")

            if not board_data:
                return {"success": False, "error": "Position or valid game_id required."}

            # Check engine health first
            status = await engine_service.get_engine_status(game_type)
            if status.get("status") != "online":
                # Attempt a quick check
                await engine_service.check_engines_health()
                status = await engine_service.get_engine_status(game_type)

            # If external engine is offline, return health status
            if status.get("status") != "online" and game_type in engine_service.external_urls:
                 return {
                    "success": False, 
                    "error": f"{game_type.capitalize()} engine is offline.",
                    "engine_status": status
                }

            # For high-fidelity engines, we use the external API
            if game_type in engine_service.external_urls:
                url = engine_service.external_urls[game_type]
                async with aiohttp.ClientSession() as session:
                    async with session.post(f"{url}/api/analyze", json={
                        "fen": board_data if isinstance(board_data, str) else None,
                        "board": board_data if not isinstance(board_data, str) else None,
                        "depth": depth
                    }, timeout=30) as response:
                        if response.status == 200:
                            data = await response.json()
                            return {"success": True, **data}

            # Fallback for internal engines (provide basic evaluation)
            move_data = await engine_service.get_ai_move(game_type, board_data, depth=5)
            return {
                "success": True,
                "message": f"Detailed analysis not supported for {game_type}; providing best move suggestion instead.",
                "best_move": move_data.get("move"),
                "engine": move_data.get("engine")
            }

        except Exception as e:
            return {"success": False, "error": str(e)}

    @mcp.tool()
    async def check_engine_health(game_type: str | None = None) -> dict[str, Any]:
        """
        Check the status and availability of game engines.
        """
        await engine_service.check_engines_health()
        if game_type:
            return await engine_service.get_engine_status(game_type)
        return {
            "status": "summary",
            "engines": engine_service.health_status,
            "internal_engines": ["tic_tac_toe", "connect4", "battleship", "scrabble"]
        }
