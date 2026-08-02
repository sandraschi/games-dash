# AI-Games-Collection Repository Assessment

Date: 2026-02-28  
Version assessed: 2.4.2  
Sources: codebase inspection, README.md, CHANGELOG.md, docs/

---

## TL;DR

Genuinely impressive personal project — largest free browser game collection I've seen, serious Japanese learning suite, real AI engines properly integrated. Needs a focused cleanup sprint before it's presentable publicly. Core issues are git bloat (committed binaries), a dual source tree for the MCP server, and a root README that described the wrong thing entirely (now fixed).

---

## What's here

- **150+ browser game titles** across 8 categories (200+ HTML files counting variants)
- **Japanese learning suite**: full JLPT N5–N1, kanji wall (2,500+), 3D kanji cosmos, stroke order, flashcards, Karuta, Yojijukugo
- **3 professional AI engines**: Stockfish (chess, ~3500 Elo), KataGo (go), YaneuraOu (shogi)
- **FastMCP server**: correspondence play, position analysis, tournaments, ELO, puzzles
- **React dashboard** (web_sota/): Vite, TypeScript
- **Multiplayer**: WebSocket room management + SQLite persistence
- **150+ docs files** across 6 subdirectories

### Game categories summary

| Category | Approx count | Notable titles |
|----------|-------------|----------------|
| Arcade | 25 | Pac-Man 2D+3D, Galaga, Tetris, Robotron, Joust, Tempest |
| Board | 30 | Chess 2D+3D+education, Go, Shogi, Backgammon, Xiangqi, Senet, Royal Game of Ur, Hnefatafl |
| Card | 15 | Bridge, Canasta, Skat, Tarock, Hanafuda, FreeCell, Spider Solitaire |
| Casino | 6 | Blackjack, Roulette, Baccarat, Craps, Cho-Han |
| Strategy | 8 | Catan, Carcassonne, Monopoly, Risk, Ticket to Ride, Clue |
| Puzzle | 20 | Sudoku (3 variants), Crossword, Kenken, Sokoban, Pipe Connect, Maze, Arukone, Hashi |
| Educational | 20 | Hiragana/Katakana, Pub Quiz, Text Adventure, Word Search, Tongue Twisters |
| Japanese Language | 10 | Kanji Master, JLPT Practice, Flashcards, Grammar, Listening, Stroke Order, Karuta |

Most board/puzzle games include an `-education.html` variant with encyclopedic history, rules, strategy, cultural context. This is a genuine differentiator in open-source collections.

---

## Changelog perspective (important context)

The changelog shows this is **actively and rapidly developed**: 8 releases from Dec 2025 to Feb 2026. That changes how some "structural issues" should be read:

- **v2.0.0** was a deliberate architecture consolidation (358+ files into 9 categories). The current directory structure is the *result* of intentional refactoring, not drift.
- **v2.1.0** migrated kanji from a separate DB into `games.db`. The `kanji_database.db` file may already be a dead artifact of that migration.
- **v2.2.0** established the "Real AI or No AI" philosophy explicitly — no JS fallbacks is a deliberate quality decision.
- **v1.3.4** explicitly catalogued 1,227 TODO/FIXME items and 375 errors. The team knows about the debt.
- **v2.3.0** fixed 276 broken internal links. Link hygiene has been addressed.

The codebase is messier than it could be, but it's being actively improved and the major structural decisions are intentional.

---

## Genuine structural problems

These are real issues worth fixing, not just aesthetic preferences:

### 1. Git bloat (highest impact)

Committed binaries that shouldn't be in version control:
- `electron/node_modules/` (~300 npm packages)
- `dist/` — Electron installer binaries (100MB+)
- `electron/python-embed/` — full Python 3.12 distribution (~50MB)
- `stockfish/src/` — C++ source that's never compiled here

Impact: slow clones, bloated repo history, confusion about what's actually needed. Fix: `git rm --cached`, `.gitignore` additions, document what to run after clone.

### 2. Dual MCP source tree

Two copies of the ai-games-collection-mcp Python source:
- `src/ai_games_collection_mcp/` (repo root — unclear if active)
- `ai-games-collection-mcp/src/ai_games_collection_mcp/` (likely canonical)
- `src/ai_games_collection_mcp_SUPERSEDED/` (dead)
- Two pyproject.toml files, one with a `.backup` copy

Until this is resolved it's hard to know which code is actually running. Fix: confirm canonical location, delete the others.

### 3. Root README was wrong

The root README described only the MCP server (correspondence play, analysis tools, ADN integration). A visitor had no idea 150+ games exist, or how to run the web app. **Fixed in this session.**

### 4. FastMCP version

`ai-games-collection-mcp/pyproject.toml` pins `fastmcp>=2.14.3,<3.0.0`. Fleet standard since 2026-02-18 is `fastmcp>=3.0.0`. One-line fix, needs testing.

### 5. Committed junk
- `backend/ruff_errors.txt`
- `ai-games-collection-mcp/validation.log`
- `pyproject.toml.backup`

Small but sloppy. Add to `.gitignore`.

---

## Things that look like problems but probably aren't

### Multiple start scripts
10+ PowerShell/bat launcher scripts. Looks chaotic but each was written for a specific context (background mode, resilient restart, MCP-only, web-only). Consolidation is nice but not urgent.

### "Duplicate" databases
Multiple DB files in different directories. Given v2.1.0's kanji consolidation and active development, some of these are likely migration artifacts that are no longer used. Audit before deleting.

### Flat backend/ directory
20 Python files with no subpackages. Messy to navigate but not functionally broken. Refactoring adds risk without immediate payoff unless you're doing sustained backend work.

### Docker docs
6 Docker deployment guides for an approach that was reconsidered. Add a deprecation note to each rather than deleting — they may still be useful for Goliath/Linux deployment scenarios.

---

## Multiplayer and competitive gaming

### Current state
- WebSocket room management (`backend/multiplayer-server.py`)
- SQLite persistence (`backend/multiplayer_db.py`)
- API-key auth, rate limiting, CORS
- Works for 2–10 concurrent users on LAN or via tunnel

### Gaps vs competitive-grade
- No ELO/rating system (MCP server has it; web multiplayer doesn't)
- Client-side move validation (rules enforced in JS, not backend)
- No server-authoritative game clocks
- SQLite write serialization limits at ~10 concurrent games
- No spectator mode, no persistent user accounts

For casual friend play: fine. For public competition: would need PostgreSQL/Redis for state, server-side validation, and server-authoritative timers. Estimated 3–5 days of focused work.

---

## Testing

**Current:**
- Jest unit tests for ~13 games (roughly 6% of titles)
- Playwright e2e tests (main page, chess, arcade, puzzles)
- `_llm_test_scripts/` — 4 MCP validation scripts (wrong location)
- `.github/workflows/test.yml` — CI configured

**Missing:**
- No backend Python tests (pytest not in dependencies)
- No easy local test runner
- MCP scripts not in `tests/` and likely not in CI
- No multiplayer/WebSocket integration tests

Improving this is a 2–3 day effort (add pytest, move MCP scripts, write a test runner script).

---

## Documentation fleet

150+ markdown files. Strengths: per-game deep-dives, AI engine setup, deployment guides. Weaknesses: `docs/README.md` states "75 games" (actual: 150+), phase documents (PHASE_7–PHASE_14) are development diary entries not user docs, progress reports should be archived.

The `docs/README.md` doc hub is decent structure but link-rot risk is high with this many files. Worth a periodic link check.

---

## Copyright notes

- **KenKen**: Trademarked by Nextoy LLC. Rename to "Calcudoku" or "Math Grid" before public release.
- **Crossword data**: Check provenance of clue data in `data/crossword/` (PUZZLEPHIL_SOURCES.md references commercial sites).
- Attribution in PUZZLEPHIL_SOURCES.md needs cleanup.

---

## Scorecard

| Dimension | Score | Notes |
|-----------|-------|-------|
| Content depth | 9/10 | Enormous game library, real AI engines, serious Japanese learning suite |
| Code quality | 6/10 | Inconsistent across games, but systematic cleanup work shown in changelog |
| Structure | 5/10 | v2.0.0 reorganization was real; dual source tree and committed binaries are the main remaining issues |
| Documentation | 6/10 | Voluminous and partly well-organized; game count wrong, root README was broken (now fixed) |
| Testing | 3/10 | Frontend unit tests for ~6% of games, no backend tests |
| Install experience | 5/10 | Multiple paths, none fully polished; Electron packager needs Python version update |
| Multiplayer | 5/10 | Works for casual LAN use, not competitive-grade |
| Maintenance posture | 7/10 | Active development, changelogs maintained, known debt tracked — better than raw code suggests |

---

## Priority action list

See [CLEANUP_TODO.md](CLEANUP_TODO.md) for the full tracked list.

**This week (critical):**
1. Remove committed binaries from git tracking (electron/node_modules, dist/, python-embed/, stockfish/src/)
2. Resolve dual source tree — confirm canonical ai-games-collection-mcp location, delete duplicates
3. Delete committed junk files (ruff_errors.txt, validation.log, pyproject.toml.backup)
4. Update FastMCP to >=3.0.0

**Next week (high):**
5. Audit and fix DB script paths broken by scripts/db/ move
6. Audit "duplicate" databases — confirm which are dead migration artifacts
7. Pick canonical web_sota/ location, remove the other
8. Rename KenKen → Calcudoku/Math Grid

**Someday (low):**
9. Consolidate start scripts
10. Add pytest to backend
11. Archive phase documents and old progress reports
12. Correct docs/README.md game count (75 → 150+)
13. Alembic for DB schema versioning

---

## Changes made in this session (2026-02-28)

- Root `README.md` — rewrote from MCP-server-only doc to proper project overview
- `docs/project/CLEANUP_TODO.md` — created prioritized action plan
- `scripts/db/` — created, moved 12 DB-related scripts from backend/ and scripts/ root
- `docs/project/REPO_ASSESSMENT_2026-02-28.md` — this document
