import os

from dotenv import load_dotenv

load_dotenv()

# Engine URLs
STOCKFISH_URL = os.environ.get("STOCKFISH_URL", "http://localhost:8000")
SHOGI_URL = os.environ.get("SHOGI_URL", "http://localhost:8001")
GO_URL = os.environ.get("GO_URL", "http://localhost:8002")

# Firebase Config
FIREBASE_SERVICE_ACCOUNT_JSON = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")
FIREBASE_DATABASE_URL = os.environ.get("FIREBASE_DATABASE_URL")

# Logging
LOG_LEVEL = os.environ.get("GAMES_MCP_LOG_LEVEL", "INFO").upper()
