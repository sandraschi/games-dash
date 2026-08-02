# Bridge AI — Implementation Plan

## Goal

Add bridge to ai-games-collection's engine lineup: LLM-based bridge AI that automates
WBridge5 via pywinauto-mcp as the table simulator.

## Architecture

```
ai-games-collection MCP bridge tool
    │
    ├── LLM bridge agent (bidding + play decisions)
    │   └── ctx.sample() for reasoning over hidden cards
    │
    └── pywinauto-mcp automation_task (GUI actuator)
        └── WBridge5.exe (rules engine + opponent)
```

WBridge5 is the **table** — it validates bids, enforces rules, and acts as
the opponent. The LLM bridge agent decides what to bid/play, then pywinauto
clicks the corresponding UI elements.

## Phases

### Phase 1 — Discovery (read-only, no code)

1. Download WBridge5 installer
2. Install and launch
3. Map GUI tree with `get_window_state(capture_mode="som")`
4. Identify all elements: buttons, text areas, card positions
5. Test keyboard shortcuts: F5 (new deal), arrows in bidding
6. Test PBN import/export
7. Locate Wbridge5.ini config file
8. Identify stable regions for wait_stable polling
9. Test OCR on bidding display and played cards

**Deliverable:** Element map + shortcut registry draft

### Phase 2 — App infrastructure

1. Add WBridge5 app profile to pywinauto-mcp's `app_profiles.py`
2. Create `app_shortcuts/wbridge5.py` with semantic shortcut definitions
3. Verify: launch, focus, re-deal, read state all work

### Phase 3 — Bridge engine server

Create `engines/bridge-server.py` with tools:
- `bridge_deal_board` — deal a board (PBN or deal generator)
- `bridge_get_state` — read current table state (bids, cards, turn)
- `bridge_play_card` — click a card
- `bridge_make_bid` — enter a bid
- `bridge_get_result` — final score
- `bridge_analyze` — LLM sampling for optimal line

### Phase 4 — LLM bridge agent

The LLM receives board state as structured text:

```
You are South. Vulnerability: None.
West     North    East     South
─        ─        ─        1♣
Pass     1♥       Pass     ?
Hand: ♠KQ72 ♥A3 ♦J84 ♣K952
```

- Bidding = pattern matching (point count + distribution + conventions)
- Card play = probability reasoning over hidden hands
- Uses `ctx.sample()` for autonomous reasoning
- No alpha-beta search needed — imperfect information is LLM-native

### Phase 5 — Webapp integration

Bridge tab in the React dashboard:
- Board display (South visible, others face-down)
- Bidding box
- Card play area
- Result / analysis panel
- PBN import/export buttons

## Files

```
engines/bridge-server.py        — FastAPI server (pywinauto orchestration)
ai-games-collection-mcp/src/ai_games_collection_mcp/
    tools/bridge.py              — MCP bridge tools
    services/bridge_service.py   — Bridge state machine + LLM agent
docs/bridge/
    RESEARCH.md                  — This document
    PLAN.md                     — Implementation plan
    ELEMENT_MAP.md              — Auto-generated GUI element map
    SHORTCUTS.md                — Keyboard shortcuts discovered
```

## Related fleet servers

- **pywinauto-mcp** — GUI automation actuator (port 10789)
- **speech-mcp** — potential TTS for "GAME OVER, PARTNER" voice feedback
