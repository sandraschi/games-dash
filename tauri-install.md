# AI Game Chest — Tauri Single-Installer Plan

Bundle the entire games collection + AI engines into one Windows `.exe` installer.

## Architecture

```
User downloads → {Product}_{version}_x64-setup.exe
                        ↓
              {product}-operator.exe
                  │
        ┌─────────┼─────────┐
        ▼         ▼         ▼
  WebView2     Gateway     Engine .exe
  (React)   (PyInstaller)  (resources)
```

## Two Variants

| Component | Compact | Full |
|-----------|---------|------|
| Rust + WebView2 | 5 MB | 5 MB |
| React games dist | 2 MB | 2 MB |
| Gateway (FastAPI) | 15 MB | 15 MB |
| Stockfish.exe | 3 MB | 3 MB |
| Edax.exe | 1 MB | 1 MB |
| MoHex.exe | 4 MB | 4 MB |
| YaneuraOu.exe | — | 15 MB |
| KataGo.exe | — | 50 MB |
| GNU Bg.exe | — | 30 MB |
| **Total** | **~30 MB** | **~125 MB** |

## File Layout

```
ai-games-collection/
├── native/
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── build.ps1              # Full build pipeline
│   ├── build-compact.ps1       # Compact variant
│   ├── build-full.ps1          # Full variant
│   ├── src/main.rs             # Tauri app shell
│   ├── src/backend.rs          # Spawn engines from bundle
│   ├── windows/hooks.nsh       # Process kill hooks
│   └── resources/
│       ├── gateway.exe          # PyInstaller frozen
│       ├── stockfish.exe
│       ├── edax.exe
│       ├── mohex.exe
│       ├── yaneuraou.exe       # full only
│       ├── katago.exe          # full only
│       └── gnubg.exe           # full only
├── engines/
│   ├── stockfish.exe
│   ├── edax/
│   ├── mohex/
│   ├── yaneuraou/
│   ├── katago/
│   └── gnubg/
├── run_server.py                # PyInstaller entry
├── web_sota/
│   ├── server.py
│   └── dist/                    # React build
└── ai-games-collection-backend.spec       # PyInstaller spec
```

## Implementation Steps

### Step 1: Engine Binaries

Replace Docker-based engine servers with native Windows `.exe` binaries:

| Engine | Source | Size |
|--------|--------|------|
| Stockfish | `stockfish-windows-x86-64.exe` | 3 MB |
| Edax | Already has `wEdax-x86-64-v2.exe` | 1 MB |
| MoHex | Build from source → `mohex.exe` | 4 MB |
| YaneuraOu | Windows build from GitHub | 15 MB |
| KataGo | `katago-v1.14.0-opencl-windows-x64.zip` | 50 MB |
| GNU Bg | `gnubg-1.08.xxx-setup.exe` → extract | 30 MB |

Each binary needs a thin Python or Node wrapper that:
- Listens on its assigned port
- Translates HTTP `/api/move` requests to the engine's native protocol
- Returns JSON

The wrappers already exist (`engines/stockfish-server.py`, etc.) — they just need to call the `.exe` instead of a Docker container.

### Step 2: PyInstaller Gateway

Freeze `web_sota/server.py` + `engines/open_spiel_server.py` into one `.exe`:

```python
# run_server.py
import sys, os
sys.path.insert(0, "web_sota")
sys.path.insert(0, "engines")
from server import app
import uvicorn

port = int(os.getenv("AI_GAMES_COLLECTION_PORT", "10987"))
uvicorn.run(app, host="127.0.0.1", port=port)
```

Spec: `ai-games-collection-backend.spec` — `noarchive=True`, `strip=False`, `upx=False`.

### Step 3: Tauri Shell

Copy from `pywinauto-mcp/web_sota/src-tauri/` (fleet reference impl):

- `main.rs` — window setup, tray icon
- `backend.rs` — materialize `resources/*.exe` to `%LOCALAPPDATA%\{identifier}\cache\`, spawn child processes
- `tauri.conf.json` — `bundle.resources` lists all engine `.exe` files

**`backend.rs`** spawns on launch:
```rust
fn spawn_engines(app: &AppHandle) {
    let cache = app.path().app_cache_dir().unwrap();
    for name in &["stockfish", "edax", "mohex"] {
        let src = app.path().resolve(format!("resources/{}.exe", name), BaseDirectory::Resource).unwrap();
        let dst = cache.join(format!("{}.exe", name));
        std::fs::copy(&src, &dst).ok();
        Command::new(&dst).spawn().ok();
    }
}
```

### Step 4: Build Pipeline

**`native/build.ps1`**:

1. `npm --prefix ../web_sota run build` → `web_sota/dist/`
2. `pyinstaller ../ai-games-collection-backend.spec` → `dist/gateway.exe`
3. Copy engine `.exe` files to `native/resources/`
4. `npx tauri build --bundles nsis`

**Variants**:
- `just build-compact` — steps 1-4, engines: stockfish + edax + mohex
- `just build-full` — same + yaneuraou + katago + gnubg

### Step 5: NSIS Hooks

`native/windows/hooks.nsh`:
- PREINSTALL: Kill any running engine processes
- PREUNINSTALL: Kill + clean cache
- POSTINSTALL: Optional MCP registration

## What Changes

| | Before | After |
|---|---|---|
| Install | Python + git + Docker | One `.exe` |
| Launch | `start.ps1` | Desktop shortcut |
| Engines | Docker containers | Spawned `.exe` |
| Backend | `uv run uvicorn` | Frozen `.exe` |
| Frontend | `npm run dev` | Embedded in Tauri |
| MCP | Separate autohotkey-mcp | Built-in `/mcp` endpoint |

## Open Questions

1. License compatibility — bundling KataGo and Stockfish is fine (MIT/GPL). GNU Backgammon is GPL. Need to include license notices.
2. CUDA vs CPU for KataGo — CUDA binary is 200 MB+. Use OpenCL variant (~50 MB) which works on any GPU.
3. MoHex Windows build — needs to be compiled from source. The existing `engines/mohex-server.py` calls a binary via HTP protocol.
4. Code signing — NSIS installer should be Authenticode-signed to avoid SmartScreen warnings.
