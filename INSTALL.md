# Installation

## Prerequisites

| Dependency | Windows | macOS |
|------------|---------|-------|
| **Python 3.13+** | `winget install Python.Python.3.13 --accept-source-agreements` | `brew install python@3.13` |
| **uv** | `winget install astral-sh.uv --accept-source-agreements` | `brew install uv` |
| **Node.js 20+** | `winget install OpenJS.NodeJS.LTS --accept-source-agreements` | `brew install node@20` |
| **just** | `winget install Casey.Just --accept-source-agreements` | `brew install just` |
| **Rust (Tauri build)** | `winget install Rustlang.Rustup --accept-source-agreements` | `brew install rustup-init` |
| **Docker (MoHex, GNU Backgammon)** | [Docker Desktop](https://www.docker.com/products/docker-desktop/) | [Docker Desktop](https://www.docker.com/products/docker-desktop/) |

## Game Engines

| Engine | Game | Windows Native | macOS | Docker Required? |
|--------|------|----------------|-------|------------------|
| **Stockfish 16** | Chess | ✅ Built-in | ✅ Built-in | No |
| **KataGo 1.16.5** | Go | ✅ Built-in | ✅ Built-in | No |
| **YaneuraOu 9.40** | Shogi | ✅ Built-in | ✅ Built-in | No |
| **Edax 4.6** | Othello | ✅ Built-in | ❌ Docker | No (Windows) |
| **OpenSpiel 1.6** | 119 games | ✅ pip | ✅ pip | No |
| **GNU Backgammon** | Backgammon | ❌ Docker | ❌ Docker | **Yes** |
| **MoHex** | Hex | ❌ Docker | ❌ Docker | **Yes** |

**Run without Docker:** Stockfish, KataGo, YaneuraOu, Edax, OpenSpiel work natively.

**Run with Docker:** `just docker-up` for the full 7-engine stack. MoHex and GNU Backgammon require Docker.

---

## Option A — MCPB Drag-and-Drop (Recommended for Claude Desktop)

1. Download the latest `.mcpb` from [GitHub Releases](https://github.com/sandraschi/games-app/releases)
2. Open Claude Desktop > Settings > Developer > Edit Config
3. Drag the `.mcpb` file onto the config editor
4. Restart Claude Desktop

---

## Option B — MCPB CLI

```powershell
npx @anthropic-ai/mcpb install https://github.com/sandraschi/games-app
```

---

## Option C — Manual Configuration

```powershell
git clone https://github.com/sandraschi/games-app
cd games-app
uv sync --all-extras
npm --prefix web_sota install
```

### Claude Desktop Config

Edit `%APPDATA%\Claude\claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "games-mcp": {
      "command": "uv",
      "args": [
        "--directory", "D:\\Dev\\repos\\games-app",
        "run", "python", "-m", "games_mcp"
      ]
    }
  }
}
```

### Verify

```powershell
uv run python -m games_mcp
```

Expected output: "Games MCP Server starting up..."

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
| `GAMES_BACKEND_PORT` | 10987 | Backend HTTP port |
| `STOCKFISH_URL` | http://localhost:8000 | Stockfish engine URL |
| `SHOGI_URL` | http://localhost:8001 | Shogi engine URL |
| `GO_URL` | http://localhost:8002 | Go engine URL |
| `GAMES_MCP_LOG_LEVEL` | INFO | Logging level |

---

## Option E — Tauri Desktop App (NSIS Installer)

Download the latest `Games_Collection_x64-setup.exe` from [GitHub Releases](https://github.com/sandraschi/games-app/releases).

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
| Backend won't start | Check `GAMES_BACKEND_PORT` is not in use |
