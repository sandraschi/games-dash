# Games-App Cleanup TODO

Generated: 2026-02-28  
Based on: REPO_ASSESSMENT_2026-02-28.md + CHANGELOG review

Status legend: `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked

---

## CRITICAL — Do first (breaks things or misleads users)

### Git bloat — committed binaries
These shouldn't be in git at all. They balloon clone size and slow everything.

- [ ] **Remove `electron/node_modules/` from git tracking**
  - `git rm -r --cached electron/node_modules/`
  - Add `electron/node_modules/` to `.gitignore`
  - Document: run `npm install` in `electron/` after clone
- [ ] **Remove `dist/` Electron installer binaries from git**
  - Move to GitHub Releases instead
  - Add `dist/` to `.gitignore`
  - Update README_ELECTRON / install docs accordingly
- [ ] **Remove `electron/python-embed/` from git**
  - Add a download script or note that Python 3.13 must be installed
  - Add `electron/python-embed/` to `.gitignore`
- [ ] **Remove `stockfish/src/` C++ source from git** (never compiled here)
  - Add to `.gitignore`, document that binary comes from Stockfish releases

### Dual source tree — games-mcp
There are two copies of the MCP server source:
- `src/games_mcp/` (repo root)
- `games-mcp/src/games_mcp/` (canonical)
- `src/games_mcp_SUPERSEDED/` (dead)

- [ ] Confirm `games-mcp/` is the canonical location (check which pyproject.toml is active)
- [ ] Delete `src/games_mcp/` and `src/games_mcp_SUPERSEDED/`
- [ ] Delete or archive the root-level `pyproject.toml` if it's the old one
- [ ] Delete `pyproject.toml.backup`

### Committed junk files
- [ ] Delete `backend/ruff_errors.txt`
- [ ] Delete `games-mcp/validation.log`
- [ ] Add `*.log`, `ruff_errors.txt` to `.gitignore`

---

## HIGH — Do this week

### FastMCP version
Fleet standard as of 2026-02-18 is `fastmcp>=3.0.0`.

- [ ] Update `games-mcp/pyproject.toml`: change `fastmcp>=2.14.3,<3.0.0` to `fastmcp>=3.0.0`
- [ ] Test MCP server still starts and tools work
- [ ] Check for any FastMCP 3.0 breaking changes (sampling API, tool registration)

### Duplicate databases
Multiple copies of the same DB in different directories cause confusion about which is authoritative.

- [ ] Audit locations of `crosswords.db`, `multiplayer.db`
  - Check: `data/`, `backend/data/`, `scripts/data/`
  - Determine which is actually used at runtime
- [ ] Pick one canonical location per DB, update all references
- [ ] Check `kanji_database.db` vs `kanji.db` — v2.1.0 migrated kanji into `games.db`; if migration is complete, `kanji_database.db` may be dead
- [ ] After consolidation, add old paths to `.gitignore` or delete

### DB scripts after reorganization
Scripts moved to `scripts/db/` in 2026-02-28 session may have broken relative paths.

- [ ] Grep for `../data/`, `./data/`, `../../data/` in `scripts/db/*.py`
- [ ] Fix any broken paths (use absolute or configurable paths)
- [ ] Quick smoke-test: run each script with `--help` or dry-run if available

### Duplicate game files (root vs subdirectories)
After v2.0.0 reorganization, 5 game files were left in `games/` root as duplicates.

- [ ] Identify remaining duplicates: compare `games/*.html` against `games/*/`
- [ ] Verify index.html navigation links point to the subdirectory versions
- [ ] Delete root-level duplicates

---

## MEDIUM — Do next week

### Start script consolidation
10+ launcher scripts covering the same ground:
`start-server.ps1`, `start-servers.ps1`, `START_ALL_SERVERS.ps1`, `START_ALL_SERVERS_BACKGROUND.ps1`, `START_EVERYTHING.ps1`, `START_SERVERS_RESILIENT.ps1`, `START_WEB_SERVER.ps1`, plus `.bat` equivalents.

- [ ] Decide on canonical: `Start-GamesApp.ps1 -Mode (dev|prod|mcp)`
- [ ] Consolidate logic into one script
- [ ] Keep `.bat` shim for non-PowerShell users if needed
- [ ] Archive/delete redundant scripts, update docs

### Dual web_sota frontend
Two copies of the React dashboard:
- `web_sota/` (repo root)
- `games-mcp/web_sota/`

- [ ] Determine which is the live one (check which has recent changes)
- [ ] Delete the other (or symlink if games-mcp needs to reference it)
- [ ] Remove extra `node_modules/` from whichever is deleted

### Backend subpackage organization
`backend/` is a flat namespace of ~20 Python files with no internal structure.

- [ ] (Optional, not urgent) Sketch target structure:
  - `backend/chess/` — stockfish server, chess logic
  - `backend/go/` — katago server
  - `backend/shogi/` — yaneuraou server
  - `backend/lang/` — kanji API, JLPT API, vocabulary
  - `backend/core/` — multiplayer, auth, security, sound
- [ ] This is a refactor, not a cleanup — only do if actively working in backend
- [ ] If not refactoring: add a `backend/README.md` documenting what each file does

### KenKen trademark
"KenKen" is trademarked by Nextoy LLC.

- [ ] Rename game to "Math Grid" or "Calcudoku" in UI, filenames, and docs
- [ ] Check if puzzle data/clue sources have copyright concerns (see PUZZLEPHIL_SOURCES.md)

### Docker docs cleanup
6 Docker deployment guides exist for an architecture that was reconsidered.

- [ ] Add a note to top of each Docker doc: "This describes an earlier deployment approach. Current recommended setup is venv + PowerShell. Docker is useful for public server deployment (Linux host) but not recommended for local Windows dev."
- [ ] Or consolidate into one `docs/DOCKER.md` with clear scope

### Phase documents in docs/development/
Development diary entries (PHASE_7 through PHASE_14) are not user-facing documentation.

- [ ] Move to `docs/project/archive/phases/`
- [ ] Keep only if useful as historical reference

---

## LOW — Someday

### Testing
- [ ] Add `pytest` + `pytest-asyncio` to backend dependencies
- [ ] Move `_llm_test_scripts/` to `tests/mcp/`
- [ ] Write `scripts/Run-Tests.ps1`: start backend, run Jest + Playwright, stop backend
- [ ] Increase Jest game coverage from ~6% toward 20 most complex games

### Database migrations
7+ SQLite databases with no schema versioning.

- [ ] Add Alembic to backend dependencies
- [ ] Create initial migration from current schema
- [ ] Document migration workflow

### Electron modernization
- [ ] Update embedded Python from 3.12 to 3.13
- [ ] Audit `electron/main.js` against current backend architecture
- [ ] Test Electron build end-to-end

### Docs rationalization
- [ ] Update `docs/README.md` game count (says 75, actual is 150+)
- [ ] Archive stale progress reports in `docs/project/` to `docs/project/archive/`
- [ ] Verify all links in `docs/README.md` point to files that actually exist

### RAG for docs
150+ docs files — worth making searchable.

- [ ] Evaluate: ingest into existing mcp-central-docs LanceDB store vs separate instance
- [ ] Use Ollama nomic-embed-text on Goliath
- [ ] Estimated effort: 2-4h

---

## Done in 2026-02-28 session

- [x] Root README.md — rewrote from MCP-only doc to proper project overview
- [x] DB scripts — moved 12 scripts from `backend/` and `scripts/` root to `scripts/db/`
- [x] Assessment doc created at `docs/project/REPO_ASSESSMENT_2026-02-28.md`
