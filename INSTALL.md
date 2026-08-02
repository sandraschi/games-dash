# Installation

## Prerequisites

| Dependency | Windows | macOS |
|------------|---------|-------|
| **Python 3.13+** | `winget install Python.Python.3.13 --accept-source-agreements` | `brew install python@3.13` |
| **uv** | `winget install astral-sh.uv --accept-source-agreements` | `brew install uv` |
| **Node.js 20+** | `winget install OpenJS.NodeJS.LTS --accept-source-agreements` | `brew install node@20` |
| **just** | `winget install Casey.Just --accept-source-agreements` | `brew install just` |
| **Rust (Tauri build)** | `winget install Rustlang.Rustup --accept-source-agreements` | `brew install rustup-init` |
| **GNU Backgammon (macOS)** | — | `brew install gnubg` |
| **Stockfish (macOS)** | — | `brew install stockfish` |
| **KataGo (macOS)** | — | `brew install katago` |
| **Docker (MoHex)** | [Docker Desktop](https://www.docker.com/products/docker-desktop/) | [Docker Desktop](https://www.docker.com/products/docker-desktop/) |

## Game Engines

| Engine | Game | Windows | macOS | Docker Required? |
|--------|------|---------|-------|------------------|
| **Stockfish 16** | Chess | ✅ Built-in | ✅ Built-in | No |
| **KataGo 1.16.5** | Go | ✅ Built-in | ✅ `brew install katago` | No |
| **YaneuraOu 9.40** | Shogi | ✅ Built-in | ✅ Built-in | No |
| **Edax 4.6** | Othello | ✅ Built-in | ❌ | Docker (Linux) |
| **OpenSpiel 1.6** | 119 games | ✅ pip | ✅ pip | No |
| **GNU Backgammon** | Backgammon | ❌ Docker | ✅ `brew install gnubg` | Docker (Windows/Linux) |
| **MoHex** | Hex | ❌ Docker | ✅ Build from source | **Yes** (or build native) |

**Windows native:** Stockfish, KataGo, YaneuraOu, Edax, OpenSpiel work out of the box.

**macOS:** All engines work. For GNU Backgammon: `brew install gnubg`. For Stockfish: `brew install stockfish`. For KataGo: `brew install katago`. For MoHex: `bash scripts/build-mohex-macos.sh` (requires Homebrew, builds in ~2 min).

**Linux (Docker):** `just docker-up` for the full 7-engine stack. Required for MoHex on Linux unless you run the native build.

## Building MoHex on macOS

```bash
# Requires Homebrew. Builds Fuego (pre-built bottle) + Benzene from source.
bash scripts/build-mohex-macos.sh
# Sets MOHEX_PATH automatically. Then:
just serve
```

---

## Option A — MCPB Drag-and-Drop (Recommended for Claude Desktop)

1. Download the latest `.mcpb` from [GitHub Releases](https://github.com/sandraschi/ai-games-collection/releases)
2. Open Claude Desktop > Settings > Developer > Edit Config
3. Drag the `.mcpb` file onto the config editor
4. Restart Claude Desktop

---

## Option B — MCPB CLI

```powershell
npx @anthropic-ai/mcpb install https://github.com/sandraschi/ai-games-collection
```

---

## Option C — Manual Configuration

```powershell
git clone https://github.com/sandraschi/ai-games-collection
cd ai-games-collection
uv sync --all-extras
npm --prefix web_sota install
```

### Claude Desktop Config

Edit `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ai-games-collection-mcp": {
      "command": "uv",
      "args": [
        "--directory", "D:\\Dev\\repos\\ai-games-collection",
        "run", "python", "-m", "ai_games_collection_mcp"
      ]
    }
  }
}
```

### Verify

```powershell
uv run python -m ai_games_collection_mcp
```

Expected output: "AI Games Collection MCP Server starting up..."

---

## Option D — Developer Mode

```powershell
just serve        # Start backend on 10987
just dev-web      # Start frontend on 10986
just lint         # Ruff lint
just typecheck    # TypeScript typecheck
just e2e          # Playwright tests
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `AI_GAMES_COLLECTION_BACKEND_PORT` | 10987 | Backend HTTP port |
| `STOCKFISH_URL` | http://localhost:8000 | Stockfish engine URL |
| `SHOGI_URL` | http://localhost:8001 | Shogi engine URL |
| `GO_URL` | http://localhost:8002 | Go engine URL |
| `AI_GAMES_COLLECTION_MCP_LOG_LEVEL` | INFO | Logging level |

---

## Option E — Tauri Desktop App (NSIS Installer)

Download the latest `Games_Collection_x64-setup.exe` from [GitHub Releases](https://github.com/sandraschi/ai-games-collection/releases).

```powershell
# Or build from source:
just build-native
```

The installer contains:
- Tauri 2.0 operator shell (WebView2)
- React webapp (embedded)
- Python backend (frozen with PyInstaller)

**One shortcut, two processes** (operator + backend child). No separate Python install needed.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Port conflict | `just serve` clears port zombies automatically |
| `uv` not found | `winget install astral-sh.uv` |
| Tauri build fails | Ensure Rustup + MSVC build tools installed |
| Backend won't start | Check `AI_GAMES_COLLECTION_BACKEND_PORT` is not in use |
