# Electron Standalone (Windows EXE)

Run the Games Collection as a native Windows app without Docker or Python.

## Quick Start

```powershell
cd D:\Dev\repos\games-app
npm install
npm run start:standalone
```

## Build Windows EXE

```powershell
npm run package
```

Output: `dist/Games Collection 1.4.0.exe` (NSIS installer)

## Modes

| Mode | Command | Requires |
|------|---------|----------|
| **Standalone** | `npm run start:standalone` | Node.js only |
| **Full AI** | Run `START_GAMES.ps1` first, then `npm start` | Python + engines |
| **Auto** | `npm start` | Uses existing server on :9876 if running, else standalone |

## Standalone Behavior

- Serves arcade games, puzzles, card games (no backend)
- Chess/Shogi/Go show "Local Setup Required" for AI
- No Docker, no Python required
- Built exe defaults to standalone when no server on :9876

## Full AI Mode

1. **Menu**: Tools > Start AI Servers (requires Python in PATH)
2. Run `.\START_GAMES.ps1` to start Python servers, then `npm start`
3. Or run `npm start -- --full` to spawn Python from Electron (requires Python in PATH)

When using the menu, Stockfish, KataGo, and Shogi servers start on ports 10001-10003. Reload (Ctrl+R) if games do not detect them.

**Bundled Python:** The packaged exe includes Python 3.12 embed + aiohttp/aiohttp-cors. No user install required. Run `npm run prepackage` manually to test the bundle before `npm run package`.
