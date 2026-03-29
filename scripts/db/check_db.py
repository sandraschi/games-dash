import sqlite3

db_paths = ["kanji.db", "kanji_database.db"]
for db_path in db_paths:
    print(f"--- {db_path} ---")
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        print(f"Tables: {tables}")
        for table in tables:
            tname = table[0]
            cursor.execute(f"SELECT COUNT(*) FROM {tname}")
            print(f"  {tname}: {cursor.fetchone()[0]} rows")
        conn.close()
    except Exception as e:
        print(f"Error: {e}")
