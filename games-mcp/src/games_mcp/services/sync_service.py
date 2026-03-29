import logging
import os
import json
import firebase_admin
from firebase_admin import credentials, db
from typing import Any, Dict, List, Optional
from datetime import datetime

from ..config import FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_DATABASE_URL

logger = logging.getLogger(__name__)

class FirebaseSyncManager:
    def __init__(self):
        self.app = None
        self._initialized = False

    def initialize(self):
        """Initialize Firebase Admin SDK."""
        if self._initialized:
            return

        try:
            if not FIREBASE_SERVICE_ACCOUNT_JSON or not FIREBASE_DATABASE_URL:
                logger.warning("Firebase credentials not fully configured. Sync service will run in MOCK mode.")
                return

            # Check if it's a path or a JSON string
            if os.path.exists(FIREBASE_SERVICE_ACCOUNT_JSON):
                cred = credentials.Certificate(FIREBASE_SERVICE_ACCOUNT_JSON)
            else:
                # Assume it's a JSON string
                cred_dict = json.loads(FIREBASE_SERVICE_ACCOUNT_JSON)
                cred = credentials.Certificate(cred_dict)

            self.app = firebase_admin.initialize_app(cred, {
                'databaseURL': FIREBASE_DATABASE_URL
            })
            self._initialized = True
            logger.info("Firebase Sync Service initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {e}")
            self._initialized = False

    async def create_session(self, game_id: str, game_type: str, initial_state: Dict[str, Any]) -> bool:
        """Create a new shared session in Firebase."""
        if not self._initialized:
            logger.debug(f"[MOCK] Created Firebase session for {game_id}")
            return True

        try:
            ref = db.reference(f'sessions/{game_id}')
            ref.set({
                'game_type': game_type,
                'state': initial_state,
                'created_at': datetime.now().isoformat(),
                'last_move': None,
                'moves': []
            })
            return True
        except Exception as e:
            logger.error(f"Firebase session creation failed for {game_id}: {e}")
            return False

    async def push_move(self, game_id: str, move: str, new_state: Dict[str, Any]) -> bool:
        """Push a move to the shared Firebase session."""
        if not self._initialized:
            logger.debug(f"[MOCK] Pushed move {move} to Firebase for {game_id}")
            return True

        try:
            ref = db.reference(f'sessions/{game_id}')
            # Update current state and append to moves
            ref.update({
                'state': new_state,
                'last_move': move,
                'last_updated': datetime.now().isoformat()
            })
            
            # Add to move history
            moves_ref = ref.child('moves')
            moves_ref.push({
                'move': move,
                'timestamp': datetime.now().isoformat()
            })
            return True
        except Exception as e:
            logger.error(f"Firebase move push failed for {game_id}: {e}")
            return False

    async def get_latest_state(self, game_id: str) -> Optional[Dict[str, Any]]:
        """Pull the latest state from Firebase."""
        if not self._initialized:
            return None

        try:
            ref = db.reference(f'sessions/{game_id}')
            return ref.get()
        except Exception as e:
            logger.error(f"Firebase state pull failed for {game_id}: {e}")
            return None

sync_manager = FirebaseSyncManager()
