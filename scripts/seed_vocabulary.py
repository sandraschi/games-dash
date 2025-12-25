import sqlite3
import json
import os


def seed_vocabulary(db_path, json_path):
    if not os.path.exists(json_path):
        print(f"Error: {json_path} not found.")
        return

    print("Connecting to database...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Create vocabulary table
    print("Creating vocabulary table...")
    cursor.execute(
        """
    CREATE TABLE IF NOT EXISTS vocabulary (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        expression TEXT NOT NULL,
        reading TEXT,
        translation TEXT,
        tags TEXT
    )
    """
    )

    # Create indexes for fast lookup
    print("Creating indexes...")
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_vocab_expression ON vocabulary(expression)"
    )
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_vocab_reading ON vocabulary(reading)"
    )

    # Load data
    print(f"Loading data from {json_path}...")
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    print(f"Inserting {len(data)} entries...")
    # Using executemany for performance
    cursor.executemany(
        """
    INSERT INTO vocabulary (expression, reading, translation, tags)
    VALUES (?, ?, ?, ?)
    """,
        [
            (item["expression"], item["reading"], item["translation"], item["tags"])
            for item in data
        ],
    )

    conn.commit()
    print("Optimization...")
    cursor.execute("VACUUM")
    conn.close()
    print("Seeding complete.")


if __name__ == "__main__":
    db_path = "kanji.db"
    json_path = "wakan_vocab.json"
    seed_vocabulary(db_path, json_path)
