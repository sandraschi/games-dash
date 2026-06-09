# Installation

## Prerequisites

| Dependency | Windows |
|------------|---------|
| **Python 3.13+** | `winget install Python.Python.3.13 --accept-source-agreements` |
| **uv** | `winget install astral-sh.uv --accept-source-agreements` |
| **Node.js 20+** | `winget install OpenJS.NodeJS.LTS --accept-source-agreements` |
| **just** | `winget install Casey.Just --accept-source-agreements` |
| **Rust (Tauri build)** | `winget install Rustlang.Rustup --accept-source-agreements` |

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
