# Screenshots

Dashboard and game screenshots for games-app README preview.

## Files

| File | Description | Size |
|------|-------------|------|
| `dashboard.png` | Main game collection dashboard (vanilla HTML) | 63 KB |
| `chess-ai.png` | Chess with Stockfish 16 AI opponent | 90 KB |
| `chess-3d.png` | 3D Chess — Three.js rendered board | 34 KB |
| `td-chess.png` | Tri-Dimensional Chess (Star Trek style) | 46 KB |
| `rubiks-cube.png` | 3D Rubik's Cube with auto-solver | 34 KB |
| `pacman-3d.png` | Pac-Man 3D — Three.js maze | 56 KB |
| `hanafuda.png` | Hanafuda — Japanese flower cards | 27 KB |
| `japanese-knowledge-tree.png` | Japanese Knowledge Tree (culture/trivia) | 220 KB |
| `schnapsen.png` | Schnapsen — Austrian card game | 63 KB |

## How to Regenerate

From repo root:

```powershell
# Start the container (already running on 10726)
just docker-up

# Or start dev:
just serve && just dev-web

# Capture:
npx playwright test --project=chromium --grep @screenshot
```

Or manually:

```powershell
npx playwright open http://localhost:PORT
# Navigate to each game, wait for 3D render, screenshot
```

## Requirements

- Server running on port 10726 (Docker), 10986 (Vite) or 10987 (gateway)
- Playwright installed: `npm --prefix web_sota install && npx playwright install chromium`
