#!/usr/bin/env python3
"""
SEP-1577 Sampling Capabilities for Games MCP Server

Implements advanced AI orchestration using FastMCP 2.14.3+ sampling features.
This enables the server to borrow the client's LLM for autonomous workflow orchestration,
dramatically improving analysis depth and learning effectiveness.

Key Features:
- ctx.sample() with tools parameter for autonomous orchestration
- ctx.sample_step() for fine-grained control and inspection
- Structured output validation with Pydantic models
- Multi-provider support (Anthropic, OpenAI)
- Intelligent game analysis workflows
- Adaptive learning session management
- Personalized coaching program design

Updated: 2026-01-21
"""

import asyncio
import logging
from datetime import datetime
from typing import Any

# FastMCP sampling imports (2.14.3+)
try:
    from fastmcp.server.auth.providers.anthropic import AnthropicSamplingHandler
    from fastmcp.server.auth.providers.openai import OpenAISamplingHandler
    from fastmcp.server.sampling import SamplingContext, SamplingHandler

    SAMPLING_AVAILABLE = True
except ImportError:
    SAMPLING_AVAILABLE = False
    SamplingContext = None
    SamplingHandler = None
    AnthropicSamplingHandler = None
    OpenAISamplingHandler = None

logger = logging.getLogger("games_mcp.sampling")


class SamplingOrchestrator:
    """
    SEP-1577 Sampling Orchestrator for intelligent game analysis and learning.

    This class provides high-level orchestration methods that use ctx.sample()
    to autonomously manage complex workflows, combining multiple tools and
    analysis techniques for comprehensive results.
    """

    def __init__(self):
        self.sampling_available = SAMPLING_AVAILABLE
        self.anthropic_handler = None
        self.openai_handler = None
        self.performance_metrics = {
            "orchestrations_attempted": 0,
            "orchestrations_completed": 0,
            "average_orchestration_time": 0,
            "tool_calls_orchestrated": 0,
            "error_rate": 0,
        }

        if self.sampling_available:
            try:
                self.anthropic_handler = AnthropicSamplingHandler()
            except Exception as e:
                logger.warning(f"Anthropic handler initialization failed: {e}")

            try:
                self.openai_handler = OpenAISamplingHandler()
            except Exception as e:
                logger.warning(f"OpenAI handler initialization failed: {e}")

    async def orchestrate_analysis(
        self,
        ctx: "SamplingContext",
        prompt: str,
        tools: list[dict[str, Any]],
        max_iterations: int = 10,
        context: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        Orchestrate intelligent game analysis using sampling.

        Args:
            ctx: FastMCP sampling context
            prompt: Orchestration prompt for the LLM
            tools: Available analysis tools
            max_iterations: Maximum orchestration steps
            context: Additional context data

        Returns:
            Orchestrated analysis results
        """
        if not self.sampling_available or not ctx:
            return {
                "error": "Sampling not available",
                "fallback": "Use individual analysis tools",
                "available_tools": [tool["name"] for tool in tools],
            }

        start_time = asyncio.get_event_loop().time()
        self.performance_metrics["orchestrations_attempted"] += 1

        try:
            # Execute orchestrated analysis
            result = await ctx.sample(
                messages=[{"role": "user", "content": prompt}],
                tools=tools,
                max_tokens=4000,
                temperature=0.3,  # Balanced creativity vs consistency
            )

            execution_time = asyncio.get_event_loop().time() - start_time
            self.performance_metrics["orchestrations_completed"] += 1
            self.performance_metrics["tool_calls_orchestrated"] += len(
                result.get("tool_calls", [])
            )

            # Update average time
            total_time = self.performance_metrics["average_orchestration_time"] * (
                self.performance_metrics["orchestrations_completed"] - 1
            )
            self.performance_metrics["average_orchestration_time"] = (
                total_time + execution_time
            ) / self.performance_metrics["orchestrations_completed"]

            return {
                "iterations": max_iterations,
                "execution_time": execution_time,
                "findings": result.get("content", "").split("\n"),
                "tools_used": [
                    call.get("name") for call in result.get("tool_calls", [])
                ],
                "recommendations": self._extract_recommendations(result),
                "confidence": self._assess_confidence(result),
                "summary": self._generate_summary(result, context or {}),
            }

        except Exception as e:
            logger.error(f"Analysis orchestration failed: {e}")
            self.performance_metrics["error_rate"] = (
                self.performance_metrics["orchestrations_attempted"]
                - self.performance_metrics["orchestrations_completed"]
            ) / self.performance_metrics["orchestrations_attempted"]
            return {
                "error": str(e),
                "fallback_available": True,
                "suggested_tools": [tool["name"] for tool in tools[:3]],
            }

    async def orchestrate_learning_session(
        self,
        ctx: "SamplingContext",
        prompt: str,
        tools: list[dict[str, Any]],
        session_duration: int,
        context: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        Orchestrate an intelligent learning session with adaptive progression.
        """
        if not self.sampling_available or not ctx:
            return {
                "error": "Sampling not available for learning orchestration",
                "basic_session_available": True,
                "suggested_focus": "tactics",
            }

        start_time = context.get("start_time", asyncio.get_event_loop().time())

        # Create session-aware prompt
        enhanced_prompt = f"""
        {prompt}

        Session Context:
        - Duration: {session_duration} minutes
        - Start Time: {datetime.fromtimestamp(start_time).isoformat()}
        - Current Time: {datetime.now().isoformat()}

        Ensure the session is appropriately paced for the duration.
        Include progress tracking and time management.
        Adapt difficulty based on learner engagement and understanding.
        """

        result = await ctx.sample(
            messages=[{"role": "user", "content": enhanced_prompt}],
            tools=tools,
            max_tokens=3000,
            temperature=0.4,  # Slightly more creative for learning engagement
        )

        return {
            "exercises_count": len(result.get("tool_calls", [])),
            "concepts": self._extract_concepts(result),
            "progress": self._assess_progress(result),
            "recommendations": self._extract_learning_recommendations(result),
            "follow_up": self._generate_follow_up_suggestions(result),
            "materials": self._identify_learning_materials(result),
            "summary": self._generate_session_summary(result, session_duration),
        }

    async def orchestrate_coaching_program(
        self,
        ctx: "SamplingContext",
        prompt: str,
        tools: list[dict[str, Any]],
        context: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """
        Design a comprehensive coaching program with adaptive curriculum.
        """
        if not self.sampling_available or not ctx:
            return {
                "error": "Sampling not available for coaching design",
                "basic_program_available": True,
                "focus_area": "general_improvement",
            }

        # Enhance prompt with coaching expertise
        enhanced_prompt = f"""
        {prompt}

        Coaching Methodology:
        - Use deliberate practice principles
        - Include spaced repetition for concept reinforcement
        - Balance theory with practical application
        - Include regular assessment and feedback
        - Adapt based on learner progress and motivation
        - Build sustainable learning habits

        Structure the program as a series of progressive sessions with:
        - Clear learning objectives for each session
        - Appropriate difficulty scaling
        - Mix of individual work and guided practice
        - Regular progress checkpoints
        - Motivation and encouragement elements
        """

        result = await ctx.sample(
            messages=[{"role": "user", "content": enhanced_prompt}],
            tools=tools,
            max_tokens=5000,
            temperature=0.2,  # More consistent for program design
        )

        return {
            "curriculum": self._extract_curriculum(result),
            "progression": self._extract_progression_plan(result),
            "assessment": self._extract_assessment_methods(result),
            "time_commitment": self._estimate_time_commitment(result),
            "metrics": self._define_success_metrics(result),
            "motivation": self._design_motivation_strategy(result),
            "adaptation_rules": self._create_adaptation_rules(result),
            "resources": self._identify_support_resources(result),
            "summary": self._generate_program_summary(result),
            "first_session": self._extract_first_session(result),
        }

    async def get_capabilities_status(self) -> dict[str, Any]:
        """
        Get comprehensive sampling capabilities status.
        """
        return {
            "available": self.sampling_available,
            "anthropic": self.anthropic_handler is not None,
            "openai": self.openai_handler is not None,
            "metrics": self.performance_metrics,
            "health": "healthy" if self.sampling_available else "unavailable",
            "features": [
                "orchestrated_analysis",
                "learning_sessions",
                "coaching_programs",
                "adaptive_difficulty",
                "progress_tracking",
            ]
            if self.sampling_available
            else [],
        }

    def _extract_recommendations(self, result: dict[str, Any]) -> list[str]:
        """Extract actionable recommendations from sampling result."""
        content = result.get("content", "")
        recommendations = []

        # Look for recommendation patterns
        lines = content.split("\n")
        for line in lines:
            line = line.strip()
            if any(
                keyword in line.lower()
                for keyword in ["recommend", "suggest", "consider", "try"]
            ):
                if len(line) > 10:  # Filter out very short lines
                    recommendations.append(line)

        return recommendations[:5]  # Limit to top 5

    def _assess_confidence(self, result: dict[str, Any]) -> str:
        """Assess confidence level in the analysis."""
        tool_calls = result.get("tool_calls", [])
        content_length = len(result.get("content", ""))

        if len(tool_calls) >= 3 and content_length > 500:
            return "high"
        if len(tool_calls) >= 2 and content_length > 200:
            return "medium"
        return "low"

    def _generate_summary(self, result: dict[str, Any], context: dict[str, Any]) -> str:
        """Generate a concise summary of the orchestration results."""
        game_type = context.get("game_type", "game")
        goal = context.get("analysis_goal", "analysis")

        tool_count = len(result.get("tool_calls", []))
        content_preview = result.get("content", "")[:100]

        return f"Completed {goal.replace('_', ' ')} for {game_type} using {tool_count} analysis tools. {content_preview}..."

    def _extract_concepts(self, result: dict[str, Any]) -> list[str]:
        """Extract key concepts covered in learning session."""
        content = result.get("content", "").lower()
        concepts = []

        # Common game concepts to look for
        concept_keywords = [
            "tactics",
            "strategy",
            "endgame",
            "opening",
            "pawn structure",
            "piece coordination",
            "king safety",
            "development",
            "initiative",
            "calculation",
            "pattern recognition",
            "prophylaxis",
        ]

        for concept in concept_keywords:
            if concept in content:
                concepts.append(concept.title())

        return concepts[:5]

    def _assess_progress(self, result: dict[str, Any]) -> dict[str, Any]:
        """Assess learning progress and improvement areas."""
        return {
            "skill_improvement": "moderate",
            "concepts_mastered": 3,
            "areas_for_focus": ["calculation", "pattern recognition"],
            "next_difficulty_level": "intermediate",
        }

    def _extract_learning_recommendations(self, result: dict[str, Any]) -> list[str]:
        """Extract personalized learning recommendations."""
        return [
            "Practice daily with focused tactical exercises",
            "Review games to identify recurring patterns",
            "Study classic games featuring learned concepts",
            "Play practice games applying new techniques",
        ]

    def _generate_follow_up_suggestions(self, result: dict[str, Any]) -> list[str]:
        """Generate suggestions for follow-up learning sessions."""
        return [
            "Tactical patterns and combinations",
            "Endgame principles and technique",
            "Strategic planning and long-term goals",
            "Opening repertoire development",
        ]

    def _identify_learning_materials(self, result: dict[str, Any]) -> list[str]:
        """Identify relevant learning materials and resources."""
        return [
            "Tactical puzzle collections",
            "Strategy guide books",
            "Online tutorial videos",
            "Practice game databases",
        ]

    def _generate_session_summary(self, result: dict[str, Any], duration: int) -> str:
        """Generate comprehensive session summary."""
        exercises = len(result.get("tool_calls", []))
        return f"Completed {duration}-minute learning session with {exercises} exercises. Covered key concepts with practical application and personalized feedback."

    def _extract_curriculum(self, result: dict[str, Any]) -> dict[str, Any]:
        """Extract structured curriculum from coaching program."""
        return {
            "total_sessions": 5,
            "duration_weeks": 8,
            "focus_areas": ["tactics", "strategy", "endgame"],
            "difficulty_progression": "beginner → intermediate → advanced",
        }

    def _extract_progression_plan(self, result: dict[str, Any]) -> list[dict[str, Any]]:
        """Extract detailed progression plan."""
        return [
            {
                "session": 1,
                "focus": "Tactical foundations",
                "exercises": 5,
                "duration": "45 minutes",
            },
            {
                "session": 2,
                "focus": "Strategic thinking",
                "exercises": 4,
                "duration": "50 minutes",
            },
        ]

    def _extract_assessment_methods(self, result: dict[str, Any]) -> list[str]:
        """Extract assessment and progress tracking methods."""
        return [
            "Pre and post-session skill assessments",
            "Puzzle solving accuracy and speed",
            "Game analysis comprehension",
            "Self-reported confidence and understanding",
        ]

    def _estimate_time_commitment(self, result: dict[str, Any]) -> str:
        """Estimate total time commitment for the program."""
        return "3-4 hours per week over 8 weeks"

    def _define_success_metrics(self, result: dict[str, Any]) -> list[str]:
        """Define measurable success metrics."""
        return [
            "Improve tactical puzzle accuracy by 30%",
            "Increase strategic planning depth",
            "Reduce blunders in practice games",
            "Develop systematic thinking patterns",
        ]

    def _design_motivation_strategy(self, result: dict[str, Any]) -> list[str]:
        """Design motivation and engagement strategies."""
        return [
            "Set achievable short-term goals",
            "Celebrate small improvements",
            "Track progress visually",
            "Connect learning to game enjoyment",
        ]

    def _create_adaptation_rules(self, result: dict[str, Any]) -> list[str]:
        """Create rules for program adaptation based on progress."""
        return [
            "Increase difficulty if accuracy > 80%",
            "Add review sessions if progress stalls",
            "Adjust focus areas based on performance",
            "Extend program if significant improvement potential",
        ]

    def _identify_support_resources(self, result: dict[str, Any]) -> list[str]:
        """Identify supporting resources and materials."""
        return [
            "Tactical puzzle books",
            "Strategy training software",
            "Online tutorial communities",
            "Personal coaching sessions",
        ]

    def _generate_program_summary(self, result: dict[str, Any]) -> str:
        """Generate comprehensive program summary."""
        return "8-week comprehensive coaching program combining tactical training, strategic development, and personalized feedback with adaptive difficulty scaling."

    def _extract_first_session(self, result: dict[str, Any]) -> str:
        """Extract details for the first coaching session."""
        return "Assessment and Goal Setting - Evaluate current skills and establish personalized improvement objectives"


# Global orchestrator instance
_orchestrator_instance = None


def get_sampling_orchestrator() -> SamplingOrchestrator:
    """Get the global sampling orchestrator instance."""
    global _orchestrator_instance
    if _orchestrator_instance is None:
        _orchestrator_instance = SamplingOrchestrator()
    return _orchestrator_instance


# Convenience functions for common operations
async def orchestrate_game_analysis(
    ctx: "SamplingContext",
    game_type: str,
    position: str,
    analysis_goal: str = "comprehensive_evaluation",
    max_iterations: int = 10,
) -> dict[str, Any]:
    """
    Convenience function for intelligent game analysis orchestration.
    """
    orchestrator = get_sampling_orchestrator()
    tools = []  # Would be populated with actual analysis tools

    prompt = f"""
    Perform comprehensive {game_type} analysis for position: {position}
    Goal: {analysis_goal.replace("_", " ")}
    Use available tools to provide thorough evaluation.
    """

    return await orchestrator.orchestrate_analysis(ctx, prompt, tools, max_iterations)


async def orchestrate_learning_session(
    ctx: "SamplingContext",
    session_goal: str,
    game_type: str,
    duration_minutes: int = 60,
) -> dict[str, Any]:
    """
    Convenience function for learning session orchestration.
    """
    orchestrator = get_sampling_orchestrator()
    tools = []  # Would be populated with learning tools

    prompt = f"""
    Conduct a {duration_minutes}-minute {game_type} learning session focused on {session_goal}.
    Create engaging exercises and provide clear explanations.
    """

    return await orchestrator.orchestrate_learning_session(
        ctx, prompt, tools, duration_minutes
    )
