import logging
from datetime import datetime
from typing import Any

import aiohttp

from ..config import EDAX_URL, GNUBG_URL, GO_URL, MOHEX_URL, OPENSPIEL_URL, SHOGI_URL, STOCKFISH_URL
from .ai.heuristics import battleship_ai, scrabble_ai
from .ai.minimax import minimax_ai

logger = logging.getLogger(__name__)

class AIEngineConfig:
    def __init__(self, name: str, executable: str, port: int, working_dir: str = "."):
        self.name = name
        self.executable = executable
        self.port = port
        self.working_dir = working_dir

class EngineService:
    """Manages external game engines and local "Real AI" services."""

    def __init__(self):
        self.engines: dict[str, Any] = {}
        self.health_status: dict[str, dict] = {}
        self.external_urls = {
            "chess": STOCKFISH_URL,
            "shogi": SHOGI_URL,
            "go": GO_URL,
            "othello": EDAX_URL,
            "backgammon": GNUBG_URL,
            "open_spiel": OPENSPIEL_URL,
            "hex": MOHEX_URL,
        }

    async def initialize(self):
        """Initialize engine management."""
        logger.info("Engine service initializing...")
        # Populate initial health status
        for name in self.external_urls:
            self.health_status[name] = {"status": "initializing", "last_check": None}

    async def get_engine_status(self, name: str) -> dict[str, Any]:
        """Get the health status of a specific engine."""
        return self.health_status.get(name, {"status": "unknown"})

    async def check_engines_health(self):
        """Perform health checks on all registered external engines."""
        async with aiohttp.ClientSession() as session:
            for name, url in self.external_urls.items():
                try:
                    async with session.get(f"{url}/api/status", timeout=2) as response:
                        if response.status == 200:
                            data = await response.json()
                            self.health_status[name] = {
                                "status": "online",
                                "engine": data.get("engine"),
                                "last_check": datetime.now().isoformat()
                            }
                        else:
                            self.health_status[name] = {"status": "error", "code": response.status}
                except Exception as e:
                    self.health_status[name] = {"status": "offline", "error": str(e)}

    async def get_ai_move(self, game_type: str, board_data: Any, player: int = 1, depth: int = 4) -> dict[str, Any]:
        """Route to appropriate AI engine (External or Internal)."""
        # 1. Check for External Engine (High Fidelity)
        if game_type in self.external_urls:
            url = self.external_urls[game_type]
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.post(f"{url}/api/move", json={
                        "fen": board_data if isinstance(board_data, str) else None,
                        "board": board_data if not isinstance(board_data, str) else None,
                        "depth": depth
                    }, timeout=10) as response:
                        if response.status == 200:
                            return await response.json()
            except Exception as e:
                logger.warning(f"External {game_type} engine failed, falling back to internal if available: {e}")

        # 2. Check for Internal Engine (Medium/Real Fidelity - No Mock Purge)
        if game_type in ["tic_tac_toe", "connect4"]:
            move = minimax_ai.get_best_move(game_type, board_data, player, depth)
            return {"move": move, "engine": f"Internal Minimax ({game_type})"}

        if game_type == "battleship":
            move = battleship_ai.get_move(board_data)
            return {"move": move, "engine": "Internal Heuristic (Battleship)"}

        if game_type == "scrabble":
            move = scrabble_ai.get_best_move(board_data, None)
            return {"move": move, "engine": "Internal Dictionary (Scrabble)"}

        return {"error": f"No real AI implemented for game type: {game_type}"}

engine_service = EngineService()
