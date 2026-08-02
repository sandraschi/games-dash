# ai-games-collection-backend PyInstaller spec

import sys
from pathlib import Path

_root = Path(SPECPATH).parent

a = Analysis(
    [str(_root / "run_server.py")],
    pathex=[str(_root)],
    binaries=[],
    
    datas=[
        (str(_root / "ai-games-collection-mcp" / "src" / "ai_games_collection_mcp"), "ai_games_collection_mcp"),
        (str(_root / "web_sota" / "dist"), "web_sota/dist"),
    ],
    hiddenimports=[

        "_datetime",
        "sqlite3",
        "_sqlite3",
        "netrc",
        "fastmcp",
        "mcp",
        "fastapi",
        "starlette",
        "uvicorn",
        "uvicorn.logging",
        "uvicorn.loops",
        "uvicorn.loops.auto",
        "uvicorn.protocols",
        "uvicorn.protocols.http",
        "uvicorn.protocols.http.auto",
        "uvicorn.protocols.websockets",
        "uvicorn.protocols.websockets.auto",
        "uvicorn.lifespan",
        "uvicorn.lifespan.on",
        "h11",
        "httptools",
        "websockets",
        "aiohttp",
        "pydantic",
        "pydantic.deprecated.decorator",
        "firebase_admin",
        "python_dotenv",
        "cachetools",
        "beartype",
        "pytz",
        "jsonschema",
        "key_value",
        "ai_games_collection_mcp",
        "ai_games_collection_mcp.server",
        "ai_games_collection_mcp.config",
        "ai_games_collection_mcp.database",
        "ai_games_collection_mcp.services.db_service",
        "ai_games_collection_mcp.services.engine_service",
        "ai_games_collection_mcp.services.game_service",
        "ai_games_collection_mcp.services.sync_service",
        "ai_games_collection_mcp.services.ai.heuristics",
        "ai_games_collection_mcp.services.ai.minimax",
        "ai_games_collection_mcp.tools.gameplay",
        "ai_games_collection_mcp.tools.analysis",
        "ai_games_collection_mcp.tools.management",
        "ai_games_collection_mcp.tools.orchestration",
        "server",
    "_strptime",
],
    hookspath=[],
    
    hooksconfig={},
    runtime_hooks=[],
    excludes=["torch", "torchvision", "torchaudio", "tensorboard", "numpy"],
    noarchive=True,
    optimize=0,
)
pyz = PYZ(a.pure)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.datas,
    [],
    
    name="ai-games-collection-backend",
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=False,
    console=True,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)





