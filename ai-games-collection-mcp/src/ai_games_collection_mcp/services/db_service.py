#!/usr/bin/env python3
"""
Database persistence for AI Games Collection MCP Server
Provides SQLite storage for correspondence games, tournaments, and player statistics.
"""

import json
import logging
import sqlite3
from datetime import datetime
from pathlib import Path
from typing import Any

logger = logging.getLogger(__name__)


class GamesDatabase:
    """SQLite database for persistent game storage"""

    def __init__(self, db_path: str = None):
        if db_path is None:
            db_path = Path(__file__).parent.parent.parent / "data" / "ai_games_collection_mcp.db"

        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)

        # Initialize database
        self._init_database()

    async def initialize(self):
        """Initialize database service (async)"""
        # Currently _init_database is synchronous, so we just log readiness here
        logger.info("Database service initialized and ready.")

    def _init_database(self):
        """Create database tables if they don't exist"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()

            # Games table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS games (
                    game_id TEXT PRIMARY KEY,
                    game_type TEXT NOT NULL,
                    position TEXT,
                    moves TEXT,
                    status TEXT DEFAULT 'active',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    metadata TEXT
                )
            """)

            # Tournaments table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS tournaments (
                    tournament_id TEXT PRIMARY KEY,
                    tournament_type TEXT NOT NULL,
                    status TEXT DEFAULT 'registration',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    metadata TEXT
                )
            """)

            # Tournament participants
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS tournament_participants (
                    tournament_id TEXT,
                    player_id TEXT,
                    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (tournament_id, player_id),
                    FOREIGN KEY (tournament_id) REFERENCES tournaments(tournament_id)
                )
            """)

            # Player ratings
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS player_ratings (
                    player_id TEXT,
                    game_type TEXT,
                    rating INTEGER DEFAULT 1200,
                    games_played INTEGER DEFAULT 0,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (player_id, game_type)
                )
            """)

            # Player statistics
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS player_statistics (
                    player_id TEXT,
                    game_type TEXT,
                    total_games INTEGER DEFAULT 0,
                    wins INTEGER DEFAULT 0,
                    losses INTEGER DEFAULT 0,
                    draws INTEGER DEFAULT 0,
                    win_rate REAL DEFAULT 0.0,
                    average_game_length INTEGER DEFAULT 0,
                    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    PRIMARY KEY (player_id, game_type)
                )
            """)

            # Game history
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS game_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    game_id TEXT,
                    player_id TEXT,
                    move_number INTEGER,
                    move TEXT,
                    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (game_id) REFERENCES games(game_id)
                )
            """)

            # AI analysis cache
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS ai_analysis_cache (
                    position_hash TEXT PRIMARY KEY,
                    game_type TEXT,
                    best_move TEXT,
                    evaluation TEXT,
                    analysis_depth INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP
                )
            """)

            conn.commit()
            logger.info(f"Database initialized at {self.db_path}")

    async def save_game(
        self,
        game_id: str,
        game_type: str,
        position: str = None,
        moves: list[str] = None,
        status: str = "active",
        metadata: dict[str, Any] = None,
    ) -> bool:
        """Save or update a game"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()

                cursor.execute(
                    """
                    INSERT OR REPLACE INTO games
                    (game_id, game_type, position, moves, status, updated_at, metadata)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                    (
                        game_id,
                        game_type,
                        position,
                        json.dumps(moves) if moves else None,
                        status,
                        datetime.now().isoformat(),
                        json.dumps(metadata) if metadata else None,
                    ),
                )

                conn.commit()
                return True

        except Exception as e:
            logger.error(f"Error saving game {game_id}: {e}")
            return False

    async def load_game(self, game_id: str) -> dict[str, Any] | None:
        """Load a game from database"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()

                cursor.execute(
                    """
                    SELECT * FROM games WHERE game_id = ?
                """,
                    (game_id,),
                )

                row = cursor.fetchone()
                if row:
                    result = dict(row)
                    if result["moves"]:
                        result["moves"] = json.loads(result["moves"])
                    if result["metadata"]:
                        result["metadata"] = json.loads(result["metadata"])
                    return result

                return None

        except Exception as e:
            logger.error(f"Error loading game {game_id}: {e}")
            return None

    async def save_tournament(
        self,
        tournament_id: str,
        tournament_type: str,
        status: str = "registration",
        metadata: dict[str, Any] = None,
    ) -> bool:
        """Save or update a tournament"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()

                cursor.execute(
                    """
                    INSERT OR REPLACE INTO tournaments
                    (tournament_id, tournament_type, status, metadata)
                    VALUES (?, ?, ?, ?)
                """,
                    (
                        tournament_id,
                        tournament_type,
                        status,
                        json.dumps(metadata) if metadata else None,
                    ),
                )

                conn.commit()
                return True

        except Exception as e:
            logger.error(f"Error saving tournament {tournament_id}: {e}")
            return False

    async def update_player_rating(
        self, player_id: str, game_type: str, rating: int
    ) -> bool:
        """Update player rating"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()

                cursor.execute(
                    """
                    INSERT OR REPLACE INTO player_ratings
                    (player_id, game_type, rating, games_played, last_updated)
                    VALUES (?, ?, ?,
                        COALESCE((SELECT games_played FROM player_ratings
                                 WHERE player_id = ? AND game_type = ?), 0) + 1,
                        ?
                    )
                """,
                    (
                        player_id,
                        game_type,
                        rating,
                        player_id,
                        game_type,
                        datetime.now().isoformat(),
                    ),
                )

                conn.commit()
                return True

        except Exception as e:
            logger.error(f"Error updating rating for {player_id}: {e}")
            return False

    async def get_player_rating(self, player_id: str, game_type: str) -> int:
        """Get player rating"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()

                cursor.execute(
                    """
                    SELECT rating FROM player_ratings
                    WHERE player_id = ? AND game_type = ?
                """,
                    (player_id, game_type),
                )

                result = cursor.fetchone()
                return result[0] if result else 1200  # Default ELO rating

        except Exception as e:
            logger.error(f"Error getting rating for {player_id}: {e}")
            return 1200

    async def cache_ai_analysis(
        self,
        position_hash: str,
        game_type: str,
        best_move: str,
        evaluation: dict[str, Any],
        analysis_depth: int,
        ttl_hours: int = 24,
    ) -> bool:
        """Cache AI analysis results"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()

                # Calculate expiry time
                from datetime import timedelta

                expires_at = datetime.now() + timedelta(hours=ttl_hours)

                cursor.execute(
                    """
                    INSERT OR REPLACE INTO ai_analysis_cache
                    (position_hash, game_type, best_move, evaluation, analysis_depth, expires_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                """,
                    (
                        position_hash,
                        game_type,
                        best_move,
                        json.dumps(evaluation),
                        analysis_depth,
                        expires_at.isoformat(),
                    ),
                )

                conn.commit()
                return True

        except Exception as e:
            logger.error(f"Error caching AI analysis: {e}")
            return False

    async def get_cached_analysis(
        self, position_hash: str, game_type: str
    ) -> dict[str, Any] | None:
        """Get cached AI analysis"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()

                cursor.execute(
                    """
                    SELECT * FROM ai_analysis_cache
                    WHERE position_hash = ? AND game_type = ? AND expires_at > ?
                """,
                    (position_hash, game_type, datetime.now().isoformat()),
                )

                row = cursor.fetchone()
                if row:
                    result = dict(row)
                    result["evaluation"] = json.loads(result["evaluation"])
                    return result

                return None

        except Exception as e:
            logger.error(f"Error getting cached analysis: {e}")
            return None

    async def cleanup_expired_cache(self):
        """Remove expired analysis cache entries"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()

                cursor.execute(
                    """
                    DELETE FROM ai_analysis_cache WHERE expires_at <= ?
                """,
                    (datetime.now().isoformat(),),
                )

                deleted_count = cursor.rowcount
                conn.commit()

                if deleted_count > 0:
                    logger.info(f"Cleaned up {deleted_count} expired cache entries")

        except Exception as e:
            logger.error(f"Error cleaning up cache: {e}")


# Global database instance
db_service = GamesDatabase()

def get_database() -> GamesDatabase:
    """Get the global database instance (deprecated, use db_service import)"""
    return db_service

async def get_player_statistics(player_id: str, game_type: str | None = None) -> dict[str, Any]:
    """Calculate and retrieve player statistics from history"""
    try:
        with sqlite3.connect(db_service.db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            query = "SELECT * FROM player_statistics WHERE player_id = ?"
            params = [player_id]
            if game_type:
                query += " AND game_type = ?"
                params.append(game_type)

            cursor.execute(query, params)
            rows = cursor.fetchall()

            if not rows:
                return {
                    "total_games": 0, "wins": 0, "losses": 0, "draws": 0,
                    "win_rate": 0.0, "average_game_length": 0
                }

            # Aggregate if multiple game types
            stats = {"total_games": 0, "wins": 0, "losses": 0, "draws": 0}
            for row in rows:
                stats["total_games"] += row["total_games"]
                stats["wins"] += row["wins"]
                stats["losses"] += row["losses"]
                stats["draws"] += row["draws"]

            if stats["total_games"] > 0:
                stats["win_rate"] = stats["wins"] / stats["total_games"]
            else:
                stats["win_rate"] = 0.0

            return stats
    except Exception as e:
        logger.error(f"Error getting stats for {player_id}: {e}")
        return {}
