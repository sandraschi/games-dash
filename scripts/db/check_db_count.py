import os
import sqlite3

DATABASE_PATH = "d:/Dev/repos/ai-games-collection/kanji.db"


def check_db():
    if not os.path.exists(DATABASE_PATH):
        print("DB not found")
        return

    db = sqlite3.connect(DATABASE_PATH)
    try:
        count = db.execute("SELECT COUNT(*) FROM examples").fetchone()[0]
        print(f"Current example count: {count}")
    except Exception as e:
        print(f"Error querying examples: {e}")

    db.close()


if __name__ == "__main__":
    check_db()
