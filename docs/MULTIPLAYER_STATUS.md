# Multiplayer Status & Next Steps

**Last updated**: 2026-08-02
**Component**: Shared multiplayer sessions (Firebase Realtime Database sync) across
the browser games collection, the MCP backend, and the dashboard lobby.

---

## Architecture (current, post-fix)

```
Browser games (multiplayer.js / chess-multiplayer.js / unified-multiplayer.js)
        │  browser SDK, public config (firebase-config.js)
        ▼
Firebase Realtime Database  (project games-collection-c2e25, europe-west1)
        ▲  nodes: games/{gameId} = {id, type, host, hostName, status,
        │         createdAt, players, state, moves, lastMove}
        │  admin SDK (firebase-admin, service account)
ai-games-collection-mcp backend  (sync_service.py, gameplay.py MCP tools)
        │
        ▼
Dashboard lobby (App.tsx)  — list_shared_sessions / new_game via /mcp/
```

- **Canonical path**: `games/{game_id}` — browser and backend now write/read the
  SAME nodes. (Backend previously used `sessions/{game_id}`; legacy reads are kept
  as a fallback.)
- **Transport priority** (unified-multiplayer.js): WebSocket (local network) first,
  Firebase (internet) fallback. The Firebase branches are now implemented
  (create/join/send/move).

## Status (2026-08-02)

| Item | Status |
|---|---|
| `firebase-admin` in required deps (`pyproject.toml`) | ✅ Done (`>=6.6.0`, installed 7.5.0) |
| `sync_service.py` uses `games/{id}` canonical path | ✅ Done |
| `list_sessions()` + `status()` (honest configured/mock/auth_error) | ✅ Done |
| MCP tool `list_shared_sessions(limit, status_filter)` | ✅ Done |
| MCP `new_game(host_name=...)` creates browser-compatible node | ✅ Done |
| MCP `join_shared_session` reports Firebase status on failure | ✅ Done |
| `config.py` loads `.env` from `ai-games-collection-mcp/` (not just CWD) | ✅ Done |
| `unified-multiplayer.js` Firebase branches (create/join/send/move) | ✅ Done |
| Dashboard lobby: real session list + Create New Game | ✅ Done |
| Dashboard lobby: honest Firebase status card (no fake sessions) | ✅ Done |

## Blocked / needs action

1. **Service account key is INVALID** — the local
   `ai-games-collection-mcp/firebase-service-account.json` is rejected by Firebase
   (`invalid_grant: Invalid JWT Signature`). The code path, paths, and tooling are
   correct; a **fresh key must be downloaded**:
   Firebase Console → Project settings → Service accounts → Generate new private key
   → replace `ai-games-collection-mcp/firebase-service-account.json` (gitignored, never commit).
   After replacing: restart the gateway and call `list_shared_sessions` — it must
   return `firebase.configured: true` with no `auth_error`.

2. **Browser games don't wire the unified system everywhere** —
   `multiplayer.js` and `chess-multiplayer.js` talk to Firebase directly (working
   shape), while `unified-multiplayer.js` is used by some games only. Decide one
   adapter per game; both write the same `games/{id}` shape so they interoperate.

3. **RTDB security rules** — verify rules allow anonymous/authenticated read/write
   on `games/{gameId}` for the browser SDK; admin SDK bypasses rules. If rules are
   locked down, browser play fails while MCP works.

## Next steps (proposed order)

1. **Refresh the service account key** (blocked item 1) — then verify a real
   end-to-end round trip: `new_game` (MCP) → visible in
   `list_shared_sessions` → join from a browser game via room code.
2. **Create game from the browser** (`multiplayer.js` `createGame`) → confirm it
   appears in the dashboard lobby (path/shape check) and in `join_shared_session`.
3. **Live board sync test**: two tabs, chess-multiplayer.js + MCP `make_move` —
   confirm `lastMove`/`moves` propagate to the other side via `on('value')`.
4. **RTDB security rules audit** (blocked item 3) — lock down to authenticated
   users + per-room access if desired.
5. **Chat**: `sendMessage` → `games/{id}/messages` is implemented; verify the
   `child_added` listener surfaces chat in the game HTML files that use
   `unified-multiplayer.js`.
6. **Reconnect UX**: `reconnectAttempts` exists for WS; add Firebase presence
   handling (`onDisconnect` cleanup of stale rooms) and a lobby "leave room" flow.
7. **Playwright e2e**: lobby renders sessions/empty state honestly
   (`data-testid="lobby-session"`, `lobby-empty`, `lobby-create`, `lobby-message`).
8. **PyInstaller/Tauri build note**: `firebase-admin` pulls `google.auth`, `grpc`,
   `protobuf` — confirm the `ai-games-collection-backend.spec` SKIP list does not strip them
   (spec currently has no SKIP list; keep it that way) and size-gate the backend.

## Verification commands

```powershell
uv run pytest tests/ -q                      # gateway tests
& "C:\Users\sandr\AppData\Local\Programs\Python\Python313\Scripts\ruff.exe" check ai-games-collection-mcp/src/ web_sota/
npx --prefix web_sota tsc -b                 # typecheck
npx --prefix web_sota vite build             # frontend build
# live: POST /mcp/ initialize + tools/list -> expect list_shared_sessions
```
