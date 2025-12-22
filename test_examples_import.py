import os
import sys
import sqlite3
import time

# Add repo path to sys.path to allow importing kanji-api
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Wrapper to suppress stdout during import if needed, but we want to see "Importing examples..."
# Actually, let's just use the functions.

import importlib.util

spec = importlib.util.spec_from_file_location(
    "kanji_api", "d:/Dev/repos/games-app/kanji-api.py"
)
kanji_api = importlib.util.module_from_spec(spec)
spec.loader.exec_module(kanji_api)


def test_import():
    print("Testing database initialization and import...")
    start_time = time.time()

    # Initialize database (this should trigger the import logic we added)
    kanji_api.init_database()

    duration = time.time() - start_time
    print(f"Initialization took {duration:.2f} seconds.")

    # Verify count
    with kanji_api.get_db() as db:
        count = db.execute("SELECT COUNT(*) FROM examples").fetchone()[0]
        print(f"Total examples in DB: {count}")

        # Test Search
        test_word = "cat"  # Common word
        print(f"Searching for '{test_word}'...")
        rows = db.execute(
            """
            SELECT japanese, english
            FROM examples
            WHERE japanese LIKE ? OR words LIKE ?
            LIMIT 5
            """,
            (f"%{test_word}%", f'%"{test_word}"%'),
        ).fetchall()

        for row in rows:
            print(f"J: {row['japanese']} | E: {row['english']}")

        if count > 1000 and len(rows) > 0:
            print("SUCCESS: Full dataset imported and searchable.")
        else:
            print("FAILURE: Dataset not imported correctly or search failed.")


if __name__ == "__main__":
    test_import()
