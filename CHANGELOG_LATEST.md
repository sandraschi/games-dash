# CHANGELOG_LATEST.md — ai-games-collection

## [Unreleased]

### Added
- **UNO** — color-matching card game vs AI (2-4 players, full action cards, UNO call penalty, match scoring to 500). `games/card-games/uno.html` + `uno.js`; registered in `games/shared/dashboard.js` and `index.html` Card Games section.

## [2.6.0] - 2026-07-03

### Added
- **Edax 4.6** — Othello/Reversi engine. Port 10785.
- **GNU Backgammon 1.08** — Backgammon engine. Port 10786.
- **OpenSpiel 1.6.15** — 119-game framework. Port 10787.
- **MoHex** — Hex engine (Fuego+Benzene). Port 10775.
- Python aiohttp server wrappers for all four new engines.
- `docker-compose.yml` engine services for all new engines.
- Gateway env vars for all engine URLs.

### Changed
- `README.md`: Game AI Engines section with full port table.
- `AGENTS.md`: updated ports table for all 7 engines.
- `start.ps1`: launches new engine servers outside Docker.
- Root `pyproject.toml`: `package-dir` now points to `ai-games-collection-mcp/src` (canonical source).
- `justfile`: migrated from `npm`/`npx` to `bun`/`bunx`.
- `.gitignore`: anchored `/src/` rule; added `*.bak`, `*.backup`, credential paths.
- CI: fixed tag-trigger conditions; migrated from `pip` to `uv`; replaced `zip` with `Compress-Archive`.
- `mcpb-pack`: version read from `ai-games-collection-mcp/pyproject.toml`; `mcpb/src/` generated at pack time.
- Version unified at 2.6.0 across `ai-games-collection-mcp/pyproject.toml`, root `pyproject.toml`, `mcpb/manifest.json`.

### Removed
- Legacy `src/` directory (duplicate source tree, superseded by `ai-games-collection-mcp/src/`).
- Hand-maintained `mcpb/src/` copy (generated at pack time now).
- CI `mypy`, `pre-commit` steps (not fleet standard).
- `npm`/`npx` references in justfile (now `bun`/`bunx`).
