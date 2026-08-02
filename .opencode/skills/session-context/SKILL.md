---
name: session-context
description: Games MCP session context — engine status check and Docker gateway (port 10987) recall prompt for the games-app fleet server.
---

## Session Context (Games MCP)

You have access to a games analysis server (150+ browser games, Stockfish/KataGo/YaneuraOu
engines) served from the Docker stack on port 10987.

**Before starting work:**
1. Check engine health: `check_engine_health(game_type="chess")`
2. Verify the gateway is up: `GET http://127.0.0.1:10987/health`

**At end of work:**
- Close out any started games or tournament sessions
- Report which engines/positions were analyzed
