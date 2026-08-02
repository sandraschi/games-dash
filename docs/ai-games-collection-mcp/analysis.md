# AI Analysis & System Status

Documentation for AI evaluation tools and system health monitoring.

## AI Engine Integration

The AI Games Collection MCP server integrates with several industry-standard engines:

- **Chess**: Stockfish 16.1 (distributed via HTTP bridge).
- **Go**: Katago 1.15.0 with specialized SGF parsing.
- **Shogi**: Usi-compatible shogi engine.

### Evaluation Metrics

- **Score**: Numerical evaluation of the position (centi-pawns or win percentage).
- **Depth**: How far ahead the engine calculated.
- **PV (Principal Variation)**: The recommended line of best play.
- **Nodes/NPS**: Search speed and complexity metrics.

## Position Analysis (`analyze_position`)

A general-purpose tool for getting quick evaluations. It automatically detects the game type and routes to the correct engine.

## System Health (`get_system_status`)

Provides a comprehensive real-time view of the server ecosystem:
- **Engine Status**: Checks if Stockfish, Shogi, and Go bridges are reachable.
- **Database Status**: Reports on SQLite integrity and connection.
- **Resource Usage**: CPU and memory utilization metrics.

## Technical Details

All analysis tools return structured results that can be processed by the `adn_research` tool for deeper knowledge graph integration.
