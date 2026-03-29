# Intelligent Orchestration (SEP-1577 Sampling)

The Games MCP server leverages advanced LLM sampling to autonomously manage complex game analysis and learning workflows.

## Autonomous Orchestration

Tools like `intelligent_game_analysis` borrow the client's LLM to:
1. **Analyze Requirements**: Understand what kind of evaluation is needed for a specific position.
2. **Coordinate Tools**: Select, execute, and combine output from multiple underlying analysis engines.
3. **Synthesize Findings**: Provide a high-level summary that is more than the sum of individual tool outputs.

## Learning sessions (`strategic_game_session`)

An autonomous learning session follows a structured pedagogical cycle:
- **Skill Assessment**: Initial evaluation of current knowledge.
- **Content Selection**: Dynamic generation of puzzles and positions.
- **Guided Feedback**: Step-by-step coaching through complex lines.
- **Adaptation**: Scaling difficulty in real-time based on performance.

## Adaptive Coaching (`adaptive_game_coaching`)

Creates a multi-session curriculum tailored to a specific `player_id`.
- **Baseline Metrics**: Establishes initial strength.
- **Progression Plan**: Defines milestones and session goals.
- **Motivation Strategy**: Encourages long-term habit building.
- **Meta-Orchestration**: Self-adjusts the coaching curriculum as the player evolves.

## Technical Details

All sampling tools use `ctx.sample()` with a rich `tools` parameter, enabling the LLM to call back into the Games MCP server to perform atomic operations like `get_ai_move` or `find_tactical_motifs`.
