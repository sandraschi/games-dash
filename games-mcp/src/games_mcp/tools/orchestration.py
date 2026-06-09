import logging
from typing import Any

from mcp.server.fastmcp import FastMCP

from ..services.game_service import game_service
from ..services.orchestration_service import orchestration_service

logger = logging.getLogger(__name__)

def register_orchestration_tools(mcp: FastMCP):
    @mcp.tool()
    async def intelligent_game_analysis(
        ctx,
        game_id: str,
        game_type: str = "chess",
        analysis_goal: str = "comprehensive_evaluation",
    ) -> dict[str, Any]:
        """
        Orchestrate a comprehensive AI analysis of a game position.

        This uses SEP-1577 sampling to coordinate multiple analysis tools
        and provide a synthesized expert report on the current status.
        """
        try:
            game = await game_service.get_game_state(game_id)
            if not game:
                return {"success": False, "error": f"Game {game_id} not found."}

            position = game.get("fen") or game.get("position") or game.get("board")

            # This tool calls the orchestration service which then samples
            # to coordinate move analysis, tactical scans, and strategic evaluation
            result = await orchestration_service.orchestrate_analysis(
                ctx=ctx,
                prompt=f"Perform a {analysis_goal.replace('_', ' ')} analysis of this {game_type} position.",
                tools=[], # The service will determine which tools to use if sampling is available
                context={"game_id": game_id, "game_type": game_type, "position": position}
            )
            return {
                "success": True,
                "game_id": game_id,
                "analysis": result,
                "message": f"Comprehensive {game_type} analysis completed via AI orchestration.",
            }
        except Exception as e:
            logger.error(f"Error in intelligent_game_analysis: {e}")
            return {"success": False, "error": str(e)}

    @mcp.tool()
    async def adaptive_learning_session(
        ctx,
        player_id: str,
        game_type: str = "chess",
        duration_minutes: int = 30,
    ) -> dict[str, Any]:
        """
        Conduct an adaptive learning session with AI-guided exercises.

        This uses AI sampling to analyze player history and provide
        real-time coaching and interactive exercises.
        """
        try:
            result = await orchestration_service.orchestrate_learning_session(
                ctx=ctx,
                prompt=f"Create a personalized {game_type} learning session for player {player_id}.",
                tools=[],
                session_duration=duration_minutes,
                context={"player_id": player_id, "game_type": game_type}
            )
            return {
                "success": True,
                "player_id": player_id,
                "session_data": result,
                "message": f"Adaptive {game_type} learning session completed.",
            }
        except Exception as e:
            logger.error(f"Error in adaptive_learning_session: {e}")
            return {"success": False, "error": str(e)}

    @mcp.tool()
    async def design_coaching_program(
        ctx,
        player_id: str,
        game_type: str = "chess",
        intensity: str = "regular",
    ) -> dict[str, Any]:
        """
        Design a multi-week coaching program with adaptive curriculum.

        Uses SEP-1577 sampling to create a structured training plan
        tailored to the player's specific strengths and weaknesses.
        """
        try:
            result = await orchestration_service.orchestrate_coaching_program(
                ctx=ctx,
                prompt=f"Design a {intensity} {game_type} coaching program for player {player_id}.",
                tools=[],
                context={"player_id": player_id, "game_type": game_type, "intensity": intensity}
            )
            return {
                "success": True,
                "player_id": player_id,
                "program_data": result,
                "message": f"Personalized {intensity} coaching program designed.",
            }
        except Exception as e:
            logger.error(f"Error in design_coaching_program: {e}")
            return {"success": False, "error": str(e)}
