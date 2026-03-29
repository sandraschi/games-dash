#!/usr/bin/env python3
"""
Seed JLPT vocabulary from open-anki-jlpt-decks (GitHub).
Downloads n5.csv, n4.csv, n3.csv, n2.csv, n1.csv and populates kanji.db jlpt_vocabulary table.
"""

import csv
import io
import os
import sqlite3
import sys
import urllib.request

JLPT_CSV_URLS = {
    "N5": "https://raw.githubusercontent.com/jamsinclair/open-anki-jlpt-decks/main/src/n5.csv",
    "N4": "https://raw.githubusercontent.com/jamsinclair/open-anki-jlpt-decks/main/src/n4.csv",
    "N3": "https://raw.githubusercontent.com/jamsinclair/open-anki-jlpt-decks/main/src/n3.csv",
    "N2": "https://raw.githubusercontent.com/jamsinclair/open-anki-jlpt-decks/main/src/n2.csv",
    "N1": "https://raw.githubusercontent.com/jamsinclair/open-anki-jlpt-decks/main/src/n1.csv",
}

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_DB = os.path.join(SCRIPT_DIR, "..", "data", "kanji.db")


def fetch_csv(url: str) -> str:
    """Fetch CSV content from URL."""
    req = urllib.request.Request(url, headers={"User-Agent": "Games-App/1.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8")


def parse_csv_content(content: str) -> list[dict]:
    """Parse CSV with expression, reading, meaning, tags columns."""
    reader = csv.DictReader(io.StringIO(content))
    rows = []
    for row in reader:
        expr = (row.get("expression") or "").strip()
        if not expr or expr.startswith("#"):
            continue
        reading = (row.get("reading") or "").strip()
        meaning = (row.get("meaning") or "").strip()
        if not meaning:
            continue
        rows.append({"expression": expr, "reading": reading, "meaning": meaning})
    return rows


def ensure_jlpt_vocabulary_table(db: sqlite3.Connection):
    """Create jlpt_vocabulary table if not exists."""
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS jlpt_vocabulary (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            expression TEXT NOT NULL,
            reading TEXT NOT NULL,
            meaning TEXT NOT NULL,
            jlpt_level TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(expression, jlpt_level)
        )
        """
    )
    db.execute(
        "CREATE INDEX IF NOT EXISTS idx_jlpt_vocab_level ON jlpt_vocabulary(jlpt_level)"
    )
    db.execute(
        "CREATE INDEX IF NOT EXISTS idx_jlpt_vocab_expression ON jlpt_vocabulary(expression)"
    )


def seed_vocabulary(db_path: str) -> int:
    """Download CSVs and populate jlpt_vocabulary. Returns total rows inserted."""
    total = 0
    conn = sqlite3.connect(db_path)
    ensure_jlpt_vocabulary_table(conn)

    for level, url in JLPT_CSV_URLS.items():
        print(f"Fetching {level} from {url}...")
        try:
            content = fetch_csv(url)
            rows = parse_csv_content(content)
            cursor = conn.cursor()
            for row in rows:
                try:
                    cursor.execute(
                        """
                        INSERT OR REPLACE INTO jlpt_vocabulary (expression, reading, meaning, jlpt_level)
                        VALUES (?, ?, ?, ?)
                        """,
                        (row["expression"], row["reading"], row["meaning"], level),
                    )
                    total += 1
                except sqlite3.IntegrityError:
                    pass
            print(f"  Inserted {len(rows)} rows for {level}")
        except Exception as e:
            print(f"  ERROR fetching {level}: {e}")

    conn.commit()
    conn.close()
    return total


def main():
    db_path = os.environ.get("KANJI_DB_PATH", DEFAULT_DB)
    data_dir = os.path.dirname(db_path)
    if not os.path.exists(data_dir):
        os.makedirs(data_dir, exist_ok=True)
    n = seed_vocabulary(db_path)
    print(f"Total vocabulary rows: {n}")
    return 0 if n > 0 else 1


if __name__ == "__main__":
    sys.exit(main())
