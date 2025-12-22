import sqlite3
import os


def merge_databases():
    source_db = "kanji_database.db"
    dest_db = "kanji.db"

    if not os.path.exists(source_db):
        print(f"Error: {source_db} not found.")
        return

    print(f"Merging {source_db} into {dest_db}...")

    # We'll attach the source database to the destination connection
    conn = sqlite3.connect(dest_db)
    cursor = conn.cursor()

    # Check if kanji table already exists in dest
    cursor.execute(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='kanji';"
    )
    if cursor.fetchone():
        print("Kanji table already exists in destination. Dropping it to re-import...")
        cursor.execute("DROP TABLE kanji")

    cursor.execute(f"ATTACH DATABASE '{source_db}' AS src;")

    # Copy schema and data
    print("Copying kanji table...")
    cursor.execute("CREATE TABLE kanji AS SELECT * FROM src.kanji;")

    # Copy indexes is harder, let's just recreate them manually
    print("Creating indexes for kanji table...")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_kanji_jlpt ON kanji(jlpt)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_kanji_grade ON kanji(grade)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_kanji_strokes ON kanji(strokes)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_kanji_frequency ON kanji(frequency)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_kanji_jouyou ON kanji(is_jouyou)")
    cursor.execute(
        "CREATE INDEX IF NOT EXISTS idx_kanji_jinmeiyou ON kanji(is_jinmeiyou)"
    )
    cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_kanji_char ON kanji(kanji)")

    conn.commit()
    conn.close()
    print("Merge complete.")


if __name__ == "__main__":
    merge_databases()
