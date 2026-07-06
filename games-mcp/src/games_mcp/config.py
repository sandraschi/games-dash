import os

from dotenv import load_dotenv

load_dotenv()

# Engine URLs (external)
STOCKFISH_URL = os.environ.get("STOCKFISH_URL", "http://localhost:8000")
SHOGI_URL = os.environ.get("SHOGI_URL", "http://localhost:8001")
GO_URL = os.environ.get("GO_URL", "http://localhost:8002")

# New game engines (added 2026-07-02)
EDAX_URL = os.environ.get("EDAX_URL", "http://localhost:10785")
GNUBG_URL = os.environ.get("GNUBG_URL", "http://localhost:10786")
OPENSPIEL_URL = os.environ.get("OPENSPIEL_URL", "http://localhost:10787")
MOHEX_URL = os.environ.get("MOHEX_URL", "http://localhost:10775")

# Firebase Config
FIREBASE_SERVICE_ACCOUNT_JSON = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")
FIREBASE_DATABASE_URL = os.environ.get("FIREBASE_DATABASE_URL")

# Logging
LOG_LEVEL = os.environ.get("GAMES_MCP_LOG_LEVEL", "INFO").upper()
