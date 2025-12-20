#!/usr/bin/env python3
"""Check database contents"""

import sqlite3
from pathlib import Path

db_path = Path("data/multiplayer.db")

if db_path.exists():
    conn = sqlite3.connect(str(db_path))
    cursor = conn.cursor()

    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()

    print(f"Database: {db_path}")
    print(f"Size: {db_path.stat().st_size} bytes")
    print(f"Tables: {len(tables)}")
    print()

    for (table_name,) in tables:
        if table_name.startswith("sqlite_"):
            continue  # Skip internal SQLite tables

        print(f"Table: {table_name}")

        # Get column info
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        col_names = [col[1] for col in columns]
        print(f"  Columns ({len(col_names)}): {', '.join(col_names)}")

        # Get record count
        cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
        count = cursor.fetchone()[0]
        print(f"  Records: {count}")

        if count > 0 and count < 5:  # Only show sample for small tables
            cursor.execute(f"SELECT * FROM {table_name} LIMIT 1")
            sample = cursor.fetchone()
            print(f"  Sample: {sample}")

        print()

    conn.close()
else:
    print(f"Database file does not exist: {db_path}")
