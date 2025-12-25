import sqlite3
import json
import urllib.request
import os

DB_PATH = os.path.join(os.getcwd(), "kanji_database.db")
DATA_URL = (
    "https://raw.githubusercontent.com/davidluzgouveia/kanji-data/master/kanji.json"
)


def seed_database():
    print(f"Downloading kanji data from {DATA_URL}...")
    try:
        with urllib.request.urlopen(DATA_URL) as response:
            data = json.loads(response.read().decode())
    except Exception as e:
        print(f"Error downloading data: {e}")
        return

    print(f"Connecting to database at {DB_PATH}...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Create table if not exists (matching kanji-api.py schema)
    cursor.execute(
        """
    CREATE TABLE IF NOT EXISTS kanji (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kanji TEXT NOT NULL UNIQUE,
        onyomi TEXT,
        kunyomi TEXT,
        meanings TEXT NOT NULL,
        jlpt TEXT,
        grade TEXT,
        strokes INTEGER,
        categories TEXT,
        frequency INTEGER,
        radical TEXT,
        is_jouyou BOOLEAN DEFAULT 0,
        is_jinmeiyou BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """
    )

    # Add indexes for performance
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_kanji_char ON kanji(kanji)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_kanji_jlpt ON kanji(jlpt)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_kanji_grade ON kanji(grade)")

    print(f"Processing {len(data)} kanji entries...")

    count = 0
    for char, info in data.items():
        # Map fields
        # Note: the source JSON uses 'freq', 'jlpt_new', 'readings_on', 'readings_kun'
        strokes = info.get("strokes")
        grade = str(info.get("grade")) if info.get("grade") else None
        jlpt = f"N{info.get('jlpt_new')}" if info.get("jlpt_new") else None
        freq = info.get("freq")
        meanings = json.dumps(info.get("meanings", []))
        onyomi = json.dumps(info.get("readings_on", []))
        kunyomi = json.dumps(info.get("readings_kun", []))
        # Joyo status from grade (1-6 are primary school, 8 is high school/secondary)
        is_jouyou = 1 if grade in ["1", "2", "3", "4", "5", "6", "8"] else 0

        # Insert or replace
        cursor.execute(
            """
        INSERT OR REPLACE INTO kanji 
        (kanji, onyomi, kunyomi, meanings, jlpt, grade, strokes, frequency, is_jouyou)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
            (char, onyomi, kunyomi, meanings, jlpt, grade, strokes, freq, is_jouyou),
        )

        count += 1
        if count % 500 == 0:
            print(f"Inserted {count} entries...")

    conn.commit()
    conn.close()
    print(f"Success! Seeded {count} kanji into {DB_PATH}")


if __name__ == "__main__":
    seed_database()
