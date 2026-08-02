# AI Games Collection — General Improvements

## Fixes

- [ ] **Chess AI stops after ~6 moves** — Stockfish connection drops. Check API timeout in `js/api-config.js` and `engines/stockfish-server.py`.
- [ ] **OpenSpiel server crashes on param type errors** — Added type conversion by game spec, but some games still fail. Test all 107 games systematically.
- [ ] **Mahjong 3D tile symbols** — Emoji don't render well on Three.js CanvasTexture. Replace with simple colored shapes or SVG symbols.
- [ ] **Hex AI error handling** — When MoHex server is down, the page silently fails. Add connection timeout and retry UI.

## Game Improvements

- [ ] **Upgrade Othello/Reversi** — Replace local greedy AI with Edax engine (`engines/edax-server.py`). The page already exists at `games/board-games/reversi.html`.
- [ ] **Backgammon UI** — Create a proper board UI for `engines/gnubg-server.py`. Complex but the API is well-defined.
- [ ] **Hex difficulty levels** — Add board size selector (7×7, 9×9, 11×9) and AI strength control.
- [ ] **Jigsaw image selector** — Allow users to upload their own image or pick from presets.
- [ ] **Risk AI player** — Add simple AI opponent for Risk (territory assignment + basic attack logic).

## Infrastructure

- [ ] **Engine binary downloads** — Add a script to download pre-compiled engine binaries (Stockfish, Edax, MoHex) instead of relying on Docker.
- [ ] **Tauri build pipeline** — See `tauri-install.md`.
- [ ] **Remove Docker from start.ps1** — `start.ps1` launches engines natively. Docker compose and Dockerfiles can be archived.
- [ ] **Consistent error modals** — Some games use `alert()`, others show DOM modals. Unify with a shared toast/error component.
- [ ] **Unused file cleanup** — `docs/` has 50+ stale docs from 2025. `games/multiplayer/` has orphaned files. Scan and archive.

## OpenSpiel

- [ ] **Add game descriptions** — The `/api/game/{name}/info` endpoint has no description field. Add a curated short description for each game.
- [ ] **Fix known-broken games** — `quoridor` has known issues. `stones_and_gems` has no terminal rewards. Flag them in the UI.
- [ ] **Game save/load** — Allow saving serialized game state to localStorage and resuming later.

## Performance

- [ ] **Mahjong 3D texture atlas** — Create a single spritesheet instead of one CanvasTexture per tile (144 textures is wasteful).
- [ ] **OpenSpiel response caching** — Cache MCTS results for identical game states to avoid redundant simulations.
- [ ] **Prefetch engine binaries** — Download engine binaries in background on first visit.
