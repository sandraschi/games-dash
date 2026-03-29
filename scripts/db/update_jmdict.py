import gzip
import os
import re
import sqlite3
import sys
import urllib.request

# Add parent directory to path to locate DB if needed, though we'll use absolute path logic
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

DATA_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data"
)
DB_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "kanji.db"
)
EDICT_URL = "ftp://ftp.edrdg.org/pub/Nihongo/edict2.gz"
EDICT_PATH = os.path.join(DATA_DIR, "edict2.gz")


def download_edict():
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)

    print(f"Downloading EDICT2 from {EDICT_URL}...")
    try:
        # Use urllib for FTP support
        with (
            urllib.request.urlopen(EDICT_URL) as response,
            open(EDICT_PATH, "wb") as out_file,
        ):
            data = response.read()
            out_file.write(data)
        print("Download complete.")
        return True
    except Exception as e:
        print(f"Failed to download EDICT2: {e}")
        return False


def init_db(conn):
    print("Creating jmdict table...")
    conn.execute("DROP TABLE IF EXISTS jmdict")  # Full refresh for now
    conn.execute(
        """
        CREATE TABLE jmdict (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            expression TEXT,
            reading TEXT,
            translation TEXT,
            tags TEXT
        )
    """
    )
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_jmdict_expression ON jmdict(expression)"
    )
    conn.execute("CREATE INDEX IF NOT EXISTS idx_jmdict_reading ON jmdict(reading)")
    conn.execute(
        "CREATE INDEX IF NOT EXISTS idx_jmdict_translation ON jmdict(translation)"
    )


def parse_and_import(conn):
    print(f"Parsing {EDICT_PATH}...")

    count = 0
    batch = []
    BATCH_SIZE = 5000

    try:
        # EDICT2 is typically EUC-JP
        with gzip.open(EDICT_PATH, "rt", encoding="euc-jp", errors="ignore") as f:
            for line in f:
                if line.startswith("#"):
                    continue  # Skip comments

                # Format: KANJI [KANA] /meaning1/meaning2/.../
                # Or: KANA /meaning1/meaning2/.../

                parts = line.split("/", 1)
                if len(parts) < 2:
                    continue

                header = parts[0].strip()
                meanings = (
                    "/" + parts[1].strip()
                )  # Keep the / format or clean it up? Let's clean up slightly.
                meanings = meanings.strip("/")

                # Parse Header
                # Check for brackets [ ] indicating reading
                match = re.match(r"(.+?)\s+\[(.+?)\]", header)
                if match:
                    expression = match.group(1).strip()
                    reading = match.group(2).strip()
                else:
                    expression = header.strip()
                    reading = ""  # If no explicit reading, it's usually kana-only entry or same as expression

                # Extract tags from meanings? EDICT has (P), (n), etc.
                # Let's keep meanings raw for now, but maybe extract (P) for priority/common
                tags = ""
                if "(P)" in meanings:
                    tags += "P,"

                batch.append((expression, reading, meanings, tags))
                count += 1

                if len(batch) >= BATCH_SIZE:
                    conn.executemany(
                        "INSERT INTO jmdict (expression, reading, translation, tags) VALUES (?, ?, ?, ?)",
                        batch,
                    )
                    batch = []
                    print(f"Imported {count} entries...", end="\r")

            # Insert remaining
            if batch:
                conn.executemany(
                    "INSERT INTO jmdict (expression, reading, translation, tags) VALUES (?, ?, ?, ?)",
                    batch,
                )

        print(f"\nImport complete. Total entries: {count}")
        conn.commit()

    except Exception as e:
        print(f"Error parsing EDICT2: {e}")


def main():
    if not os.path.exists(EDICT_PATH):
        if not download_edict():
            return

    conn = sqlite3.connect(DB_PATH)
    try:
        init_db(conn)
        parse_and_import(conn)
    finally:
        conn.close()


if __name__ == "__main__":
    main()
