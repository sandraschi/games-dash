"""PyInstaller entry point for ai-games-collection backend (embedded in Tauri).

Run via: uv run python run_server.py
Frozen: embedded in Tauri resources, run from app_cache_dir.
"""

import os
import sys
from pathlib import Path


def _patch_frozen_path():
    import _datetime  # noqa: F401
    import _strptime  # noqa: F401


if getattr(sys, "frozen", False):
    _patch_frozen_path()
    base = Path(getattr(sys, "_MEIPASS", Path(sys.executable).parent))
    sys.path.insert(0, str(base))
    sys.path.insert(0, str(base))
    backend_cwd = base
else:
    root = Path(__file__).resolve().parent
    sys.path.insert(0, str(root / "ai-games-collection-mcp" / "src"))
    sys.path.insert(0, str(root / "web_sota"))
    backend_cwd = root / "web_sota"
    os.chdir(str(backend_cwd))


def _run_http():
    import uvicorn
    from server import app
    port = int(os.environ.get("AI_GAMES_COLLECTION_BACKEND_PORT", os.environ.get("PORT", "10987")))
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="info")


if __name__ == "__main__":
    _run_http()
