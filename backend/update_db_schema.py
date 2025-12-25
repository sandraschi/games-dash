#!/usr/bin/env python3
"""Update database schema to add favorites and settings tables"""

import sqlite3
from pathlib import Path


def update_database():
    db_path = Path("data/multiplayer.db")

    if not db_path.exists():
        print(f"Database not found: {db_path}")
        return

    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()

    try:
        # Check if favorites table exists
        cursor.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='player_favorites'"
        )
        if not cursor.fetchone():
            print("Creating player_favorites table...")
            cursor.execute("""
                CREATE TABLE player_favorites (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    player_id TEXT NOT NULL,
                    game_name TEXT NOT NULL,
                    game_category TEXT NOT NULL,
                    favorited_at TEXT NOT NULL,
                    FOREIGN KEY (player_id) REFERENCES players(player_id),
                    UNIQUE(player_id, game_name)
                )
            """)
        else:
            print("player_favorites table already exists")

        # Check if settings table exists
        cursor.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='player_settings'"
        )
        if not cursor.fetchone():
            print("Creating player_settings table...")
            cursor.execute("""
                CREATE TABLE player_settings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    player_id TEXT NOT NULL,
                    setting_key TEXT NOT NULL,
                    setting_value TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    FOREIGN KEY (player_id) REFERENCES players(player_id),
                    UNIQUE(player_id, setting_key)
                )
            """)
        else:
            print("player_settings table already exists")

        conn.commit()
        print("Database schema updated successfully!")

    except Exception as e:
        print(f"Error updating database: {e}")
        conn.rollback()
    finally:
        conn.close()


if __name__ == "__main__":
    update_database()
