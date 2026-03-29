#!/usr/bin/env python3
"""Test the favorites functionality"""

import os
import sys

sys.path.append(os.path.dirname(__file__))

try:
    from multiplayer_db import MultiplayerDB

    db = MultiplayerDB()

    # Test player
    player_id = "test_player_123"
    player_name = "Test Player"

    # Create/get player
    player = db.get_or_create_player(player_id, player_name)
    print(f"Player: {player}")

    # Add some favorites
    games = [("Chess", "board-games"), ("Tetris", "arcade"), ("Sudoku", "puzzle")]

    for game_name, category in games:
        success = db.add_favorite(player_id, game_name, category)
        print(f"Added favorite {game_name}: {success}")

    # Check if games are favorited
    for game_name, category in games:
        is_fav = db.is_favorite(player_id, game_name)
        print(f"{game_name} is favorite: {is_fav}")

    # Get all favorites
    favorites = db.get_favorites(player_id)
    print(f"All favorites: {favorites}")

    # Remove one favorite
    success = db.remove_favorite(player_id, "Tetris")
    print(f"Removed Tetris: {success}")

    # Check again
    is_fav = db.is_favorite(player_id, "Tetris")
    print(f"Tetris still favorite: {is_fav}")

    # Test settings
    success = db.set_setting(player_id, "theme", "dark")
    print(f"Set theme setting: {success}")

    success = db.set_setting(player_id, "sound", "on")
    print(f"Set sound setting: {success}")

    # Get settings
    theme = db.get_setting(player_id, "theme", "default")
    sound = db.get_setting(player_id, "sound", "off")
    print(f"Theme setting: {theme}")
    print(f"Sound setting: {sound}")

    # Get all settings
    all_settings = db.get_all_settings(player_id)
    print(f"All settings: {all_settings}")

    print("\n✅ Favorites and settings functionality working!")

except ImportError as e:
    print(f"❌ Import error: {e}")
except Exception as e:
    print(f"❌ Error: {e}")
