import json
import logging
import os
from datetime import datetime
from pathlib import Path
from typing import Any

try:
    import firebase_admin
    from firebase_admin import credentials, db

    _FIREBASE_AVAILABLE = True
except ImportError:
    firebase_admin = None  # type: ignore[assignment]
    credentials = None  # type: ignore[assignment]
    db = None  # type: ignore[assignment]
    _FIREBASE_AVAILABLE = False

from ..config import FIREBASE_DATABASE_URL, FIREBASE_SERVICE_ACCOUNT_JSON

logger = logging.getLogger(__name__)

# Canonical node prefix for shared multiplayer sessions. The browser games
# collection (games/multiplayer/multiplayer.js, chess-multiplayer.js) writes
# game rooms under games/{game_id} — the MCP backend must use the SAME path
# or join_shared_session can never find a UI-created session.
_SESSIONS_ROOT = "games"


def _resolve_service_account() -> str | None:
    """Resolve the service account credential to an absolute path or JSON string."""
    raw = FIREBASE_SERVICE_ACCOUNT_JSON
    if not raw:
        return None
    candidate = Path(raw)
    if candidate.is_absolute() and candidate.is_file():
        return str(candidate)
    # Relative to the repo root AND to the ai-games-collection-mcp directory (the .env
    # convention value is "firebase-service-account.json" next to ai-games-collection-mcp/).
    config_dir = Path(__file__).resolve().parent.parent.parent  # .../ai-games-collection-mcp
    for base in (Path.cwd(), config_dir, config_dir.parent):
        p = base / raw
        if p.is_file():
            return str(p)
    return raw  # not a file — treat as inline JSON string


class FirebaseSyncManager:
    def __init__(self):
        self.app = None
        self._initialized = False
        self._auth_error: str | None = None
        if not _FIREBASE_AVAILABLE:
            logger.warning(
                "firebase_admin not installed - Firebase sync disabled. "
                "Install with: uv add firebase-admin"
            )

    @property
    def configured(self) -> bool:
        """True when the SDK is present AND credentials + database URL are available."""
        return _FIREBASE_AVAILABLE and self._initialized and self._auth_error is None

    def _note_auth_failure(self, exc: Exception):
        """Mark auth failures (rotated/expired service account) so status() is honest."""
        msg = str(exc)
        if "invalid_grant" in msg or "Invalid JWT" in msg or "credential" in msg.lower():
            self._auth_error = msg[:300]
            self._initialized = False
            logger.error(
                "Firebase credential rejected - download a fresh service account "
                "from the Firebase console (Project settings > Service accounts): %s",
                msg,
            )

    def initialize(self):
        """Initialize Firebase Admin SDK (service account + Realtime Database)."""
        if self._initialized:
            return

        if not _FIREBASE_AVAILABLE:
            return

        try:
            sa = _resolve_service_account()
            if not sa or not FIREBASE_DATABASE_URL:
                logger.warning(
                    "Firebase credentials not fully configured "
                    "(need FIREBASE_SERVICE_ACCOUNT_JSON + FIREBASE_DATABASE_URL). "
                    "Sync service will run in MOCK mode."
                )
                return

            if sa and os.path.exists(sa):
                cred = credentials.Certificate(sa)
            else:
                cred_dict = json.loads(sa)
                cred = credentials.Certificate(cred_dict)

            self.app = firebase_admin.initialize_app(cred, {"databaseURL": FIREBASE_DATABASE_URL})
            self._initialized = True
            logger.info("Firebase Sync Service initialized (Realtime Database).")
        except Exception as e:
            logger.error("Failed to initialize Firebase: %s", e, exc_info=True)
            self._initialized = False

    def status(self) -> dict[str, Any]:
        """Honest sync status for tools/UI."""
        return {
            "configured": self.configured,
            "sdk_available": _FIREBASE_AVAILABLE,
            "mock": not self.configured,
            "auth_error": self._auth_error,
            "database_url": FIREBASE_DATABASE_URL,
            "root": _SESSIONS_ROOT,
        }

    async def create_session(
        self,
        game_id: str,
        game_type: str,
        initial_state: dict[str, Any],
        host_name: str = "MCP",
    ) -> bool:
        """Create a shared session node at games/{game_id} (browser-compatible shape)."""
        if not self.configured:
            logger.debug(f"[MOCK] Created Firebase session for {game_id}")
            return True

        try:
            ref = db.reference(f"{_SESSIONS_ROOT}/{game_id}")
            ref.set(
                {
                    "id": game_id,
                    "type": game_type,
                    "host": "mcp",
                    "hostName": host_name,
                    "status": "active",
                    "createdAt": int(datetime.now().timestamp() * 1000),
                    "players": {"mcp": host_name},
                    "state": initial_state,
                    "last_move": None,
                    "moves": [],
                }
            )
            return True
        except Exception as e:
            logger.error(f"Firebase session creation failed for {game_id}: {e}")
            return False

    async def push_move(
        self, game_id: str, move: str, new_state: dict[str, Any], player_id: str | None = None
    ) -> bool:
        """Push a move to the shared Firebase session."""
        if not self.configured:
            logger.debug(f"[MOCK] Pushed move {move} to Firebase for {game_id}")
            return True

        try:
            ref = db.reference(f"{_SESSIONS_ROOT}/{game_id}")
            ref.update({"state": new_state, "last_move": move, "lastMove": move})
            moves_ref = ref.child("moves")
            moves_ref.push(
                {"move": move, "player": player_id or "mcp", "timestamp": datetime.now().isoformat()}
            )
            return True
        except Exception as e:
            logger.error(f"Firebase move push failed for {game_id}: {e}")
            return False

    async def get_latest_state(self, game_id: str) -> dict[str, Any] | None:
        """Pull the latest state from Firebase (games/{id}, legacy sessions/{id} fallback)."""
        if not self.configured:
            return None

        try:
            ref = db.reference(f"{_SESSIONS_ROOT}/{game_id}")
            node = ref.get()
            if node is None:
                # Legacy path from the original backend-only implementation.
                legacy = db.reference(f"sessions/{game_id}").get()
                if legacy is not None:
                    logger.info(f"Session {game_id} found at legacy sessions/ path")
                    return legacy
                return None
            return node
        except Exception as e:
            logger.error(f"Firebase state pull failed for {game_id}: {e}")
            self._note_auth_failure(e)
            return None

    async def list_sessions(self, status_filter: str | None = "active", limit: int = 50) -> list[dict[str, Any]]:
        """List shared sessions from the games/ root (browser rooms + MCP sessions)."""
        if not self.configured:
            return []

        try:
            snapshot = db.reference(_SESSIONS_ROOT).get()
            if not isinstance(snapshot, dict):
                return []
            sessions = []
            for key, node in snapshot.items():
                if not isinstance(node, dict):
                    continue
                node_status = node.get("status", "active")
                if status_filter and node_status != status_filter:
                    continue
                players = node.get("players") or {}
                sessions.append(
                    {
                        "game_id": key,
                        "id": key,
                        "type": node.get("type", node.get("game_type", "unknown")),
                        "status": node_status,
                        "host": node.get("host", ""),
                        "host_name": node.get("hostName", node.get("host", "")),
                        "created_at": node.get("createdAt"),
                        "player_count": len(players) if isinstance(players, dict) else 0,
                        "players": players,
                        "last_move": node.get("last_move", node.get("lastMove")),
                    }
                )
            sessions.sort(key=lambda s: s.get("created_at") or 0, reverse=True)
            return sessions[:limit]
        except Exception as e:
            logger.error(f"Firebase session listing failed: {e}")
            self._note_auth_failure(e)
            return []


sync_manager = FirebaseSyncManager()
