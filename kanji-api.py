#!/usr/bin/env python3
"""
Kanji Database API Server
Complete kanji reference with Jouyou and Jinmeiyou kanji
"""

import sqlite3
import json
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Database setup
DATABASE_PATH = os.path.join(os.path.dirname(__file__), "kanji.db")


def ensure_database_directory():
    """Ensure the database directory exists and is writable"""
    global DATABASE_PATH

    db_dir = os.path.dirname(DATABASE_PATH)
    if db_dir and not os.path.exists(db_dir):
        try:
            os.makedirs(db_dir, exist_ok=True)
        except Exception as e:
            print(f"Warning: Could not create database directory {db_dir}: {e}")

    # Test if we can write to the database location
    test_file = DATABASE_PATH + ".test"
    try:
        with open(test_file, "w") as f:
            f.write("test")
        os.remove(test_file)
        return True
    except Exception as e:
        print(f"Warning: Cannot write to database location {DATABASE_PATH}: {e}")
        # On Windows /tmp might not exist, and we want to fail if we can't write
        # to the real DB
        # DATABASE_PATH = "/tmp/kanji_database.db"
        # print(f"Using fallback database path: {DATABASE_PATH}")
        return True  # Try anyway? Or False?


def get_db():
    """Get database connection"""
    db = sqlite3.connect(DATABASE_PATH)
    db.row_factory = sqlite3.Row
    return db


def init_database():
    """Initialize database with kanji data"""
    # Ensure database directory exists and is writable
    ensure_database_directory()

    with get_db() as db:
        # Create kanji table
        db.execute(
            """
            CREATE TABLE IF NOT EXISTS kanji (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                kanji TEXT NOT NULL UNIQUE,
                onyomi TEXT, -- JSON array of onyomi readings
                kunyomi TEXT, -- JSON array of kunyomi readings
                meanings TEXT NOT NULL, -- JSON array of meanings
                jlpt TEXT, -- N5, N4, N3, N2, N1
                grade TEXT, -- 1-6, S (secondary), U (university)
                strokes INTEGER,
                categories TEXT, -- JSON array of categories
                frequency INTEGER, -- Frequency ranking (1 = most common)
                radical TEXT,
                is_jouyou BOOLEAN DEFAULT 0,
                is_jinmeiyou BOOLEAN DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """
        )

        # Create favorites table
        db.execute(
            """
            CREATE TABLE IF NOT EXISTS favorites (
                kanji TEXT PRIMARY KEY,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        # Create vocabulary favorites table
        db.execute(
            """
            CREATE TABLE IF NOT EXISTS vocab_favorites (
                vocab_id INTEGER PRIMARY KEY,
                expression TEXT,
                reading TEXT,
                translation TEXT,
                tags TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY(vocab_id) REFERENCES vocabulary(id)
            )
            """
        )

        # Create examples table
        db.execute(
            """
            CREATE TABLE IF NOT EXISTS examples (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                japanese TEXT,
                english TEXT,
                words TEXT -- JSON array of words for indexing
            )
            """
        )

        # Create jmdict table (official dictionary)
        db.execute(
            """
            CREATE TABLE IF NOT EXISTS jmdict (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                expression TEXT,
                reading TEXT,
                translation TEXT,
                tags TEXT
            )
            """
        )
        db.execute(
            "CREATE INDEX IF NOT EXISTS idx_jmdict_expression ON jmdict(expression)"
        )
        db.execute("CREATE INDEX IF NOT EXISTS idx_jmdict_reading ON jmdict(reading)")
        db.execute(
            "CREATE INDEX IF NOT EXISTS idx_jmdict_translation ON jmdict(translation)"
        )

        # Create indexes for performance
        db.execute("CREATE INDEX IF NOT EXISTS idx_kanji_jlpt ON kanji(jlpt)")
        db.execute("CREATE INDEX IF NOT EXISTS idx_kanji_grade ON kanji(grade)")
        db.execute("CREATE INDEX IF NOT EXISTS idx_kanji_strokes ON kanji(strokes)")
        db.execute("CREATE INDEX IF NOT EXISTS idx_kanji_frequency ON kanji(frequency)")
        db.execute("CREATE INDEX IF NOT EXISTS idx_kanji_jouyou ON kanji(is_jouyou)")
        db.execute(
            "CREATE INDEX IF NOT EXISTS idx_kanji_jinmeiyou ON kanji(is_jinmeiyou)"
        )

        # Check if data already exists
        count = db.execute("SELECT COUNT(*) as count FROM kanji").fetchone()["count"]
        if count == 0:
            populate_kanji_database(db)

        # Check if examples exist or if we have the sample set and need to upgrade
        example_count = db.execute("SELECT COUNT(*) as count FROM examples").fetchone()[
            "count"
        ]
        # Re-import if empty or less than 1000 (likely sample data)
        if example_count < 1000:
            if example_count > 0:
                print("Detected sample data. Clearing and re-importing full dataset...")
                db.execute("DELETE FROM examples")
                db.execute("DELETE FROM sqlite_sequence WHERE name='examples'")
            import_examples(db)

        db.commit()


def import_examples(db):
    """Import examples from JSON file"""
    json_path = os.path.join(os.path.dirname(__file__), "data", "examples.json")
    if not os.path.exists(json_path):
        print(f"Warning: Examples file not found at {json_path}")
        return

    try:
        print("Importing examples...")
        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        # Expected format: list of objects or list of [id, jpn, eng, words]
        # based on source
        # The mwhirls/tatoeba-json format is typically:
        # [ { "id": 1, "text": "...", "eng": "...", "words": [...] }, ... ]
        # Let's handle list of lists or list of dicts

        # Use bulk insert for speed
        rows_to_insert = []
        for item in data:
            # Handle different potential JSON structures from tatoeba-json
            japanese = item.get("text", "") or item.get("japanese", "")
            english = item.get("eng", "") or item.get("english", "")
            words = item.get("words", [])

            if japanese and english:
                rows_to_insert.append(
                    (japanese, english, json.dumps(words, ensure_ascii=False))
                )

        db.executemany(
            "INSERT INTO examples (japanese, english, words) VALUES (?, ?, ?)",
            rows_to_insert,
        )
        print(f"Imported {len(rows_to_insert)} examples")

    except Exception as e:
        print(f"Error importing examples: {e}")


def populate_kanji_database(db):
    """Note: Database is now populated via seed_kanji.py"""
    pass


def get_complete_kanji_data():
    """Deprecated: Data is now loaded from external JSON via seed_kanji.py"""
    return []


def parse_json(field_val):
    """Helper to parse JSON fields safely"""
    if not field_val:
        return []
    try:
        if isinstance(field_val, str):
            return json.loads(field_val)
        return field_val
    except (json.JSONDecodeError, TypeError):
        # Fallback for old comma-separated format if any remains
        return [s.strip() for s in str(field_val).split(",") if s.strip()]


@app.route("/api/kanji/all", methods=["GET"])
def get_all_kanji():
    """Get all kanji data"""
    try:
        with get_db() as db:
            rows = db.execute(
                """
                SELECT kanji, onyomi, kunyomi, meanings, jlpt, grade, strokes,
                       categories, frequency, radical, is_jouyou, is_jinmeiyou
                FROM kanji
                ORDER BY frequency ASC, strokes ASC
            """
            ).fetchall()

            kanji_list = []
            for row in rows:
                kanji_list.append(
                    {
                        "kanji": row["kanji"],
                        "onyomi": parse_json(row["onyomi"]),
                        "kunyomi": parse_json(row["kunyomi"]),
                        "meanings": parse_json(row["meanings"]),
                        "jlpt": row["jlpt"],
                        "grade": row["grade"],
                        "strokes": row["strokes"],
                        "categories": parse_json(row["categories"]),
                        "frequency": row["frequency"],
                        "radical": row["radical"],
                        "is_jouyou": bool(row["is_jouyou"]),
                        "is_jinmeiyou": bool(row["is_jinmeiyou"]),
                    }
                )

            return jsonify(
                {"success": True, "kanji": kanji_list, "count": len(kanji_list)}
            )

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/kanji/search", methods=["GET"])
def search_kanji():
    """Search kanji by various criteria"""
    query = request.args.get("q", "")
    jlpt = request.args.get("jlpt")
    grade = request.args.get("grade")
    category = request.args.get("category")
    min_strokes = request.args.get("min_strokes")
    max_strokes = request.args.get("max_strokes")
    limit = int(request.args.get("limit", 50))

    try:
        with get_db() as db:
            where_clauses = []
            params = []

            if query:
                where_clauses.append("(kanji LIKE ? OR meanings LIKE ?)")
                params.extend([f"%{query}%", f"%{query}%"])

            if jlpt:
                where_clauses.append("jlpt = ?")
                params.append(jlpt)

            if grade:
                where_clauses.append("grade = ?")
                params.append(grade)

            if category:
                where_clauses.append("categories LIKE ?")
                params.append(f"%{category}%")

            if min_strokes:
                where_clauses.append("strokes >= ?")
                params.append(int(min_strokes))

            if max_strokes:
                where_clauses.append("strokes <= ?")
                params.append(int(max_strokes))

            where_sql = " AND ".join(where_clauses) if where_clauses else "1=1"

            rows = db.execute(
                f"""
                SELECT kanji, onyomi, kunyomi, meanings, jlpt, grade, strokes,
                       categories, frequency, radical, is_jouyou, is_jinmeiyou
                FROM kanji
                WHERE {where_sql}
                ORDER BY frequency ASC, strokes ASC
                LIMIT ?
            """,
                params + [limit],
            ).fetchall()

            kanji_list = []
            for row in rows:
                kanji_list.append(
                    {
                        "kanji": row["kanji"],
                        "onyomi": parse_json(row["onyomi"]),
                        "kunyomi": parse_json(row["kunyomi"]),
                        "meanings": parse_json(row["meanings"]),
                        "jlpt": row["jlpt"],
                        "grade": row["grade"],
                        "strokes": row["strokes"],
                        "categories": parse_json(row["categories"]),
                        "frequency": row["frequency"],
                        "radical": row["radical"],
                        "is_jouyou": bool(row["is_jouyou"]),
                        "is_jinmeiyou": bool(row["is_jinmeiyou"]),
                    }
                )

            return jsonify(
                {
                    "success": True,
                    "kanji": kanji_list,
                    "count": len(kanji_list),
                    "query": {
                        "q": query,
                        "jlpt": jlpt,
                        "grade": grade,
                        "category": category,
                        "min_strokes": min_strokes,
                        "max_strokes": max_strokes,
                    },
                }
            )

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/vocabulary/<kanji_char>", methods=["GET"])
def get_vocabulary(kanji_char):
    """Get vocabulary words containing a specific kanji"""
    limit = int(request.args.get("limit", 50))
    tag_filter = request.args.get("tag")

    try:
        with get_db() as db:
            query = """
                SELECT expression, reading, translation, tags
                FROM vocabulary
                WHERE expression LIKE ?
            """
            params = [f"%{kanji_char}%"]

            if tag_filter:
                query += " AND tags LIKE ?"
                params.append(f"%{tag_filter}%")

            query += " ORDER BY length(expression) ASC, expression ASC LIMIT ?"
            params.append(limit)

            rows = db.execute(query, params).fetchall()

            vocab_list = []
            for row in rows:
                vocab_list.append(
                    {
                        "expression": row["expression"],
                        "reading": row["reading"],
                        "translation": row["translation"],
                        "tags": row["tags"],
                    }
                )

            return jsonify(
                {"success": True, "count": len(vocab_list), "vocabulary": vocab_list}
            )
    except Exception as e:
        print(f"Error fetching vocabulary: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/dictionary/search", methods=["GET"])
def search_dictionary():
    """Search the full dictionary with pagination and filtering"""
    page = int(request.args.get("page", 1))
    limit = int(request.args.get("limit", 50))
    search = request.args.get("search", "")
    tag_filter = request.args.get("tag", "")
    source_filter = request.args.get("source", "all")  # 'all', 'mine', 'official'
    offset = (page - 1) * limit

    try:
        with get_db() as db:
            results = []
            total_count = 0

            # --- Source Filtering Logic ---

            # 1. 'mine' Only (Personal Vocabulary)
            if source_filter == "mine":
                vocab_query = (
                    "SELECT id, expression, reading, translation, tags FROM vocabulary "
                    "WHERE 1=1"
                )
                vocab_params = []

                if search:
                    vocab_query += (
                        " AND (expression LIKE ? OR reading LIKE ? "
                        "OR translation LIKE ?)"
                    )
                    search_param = f"%{search}%"
                    vocab_params.extend([search_param, search_param, search_param])

                if tag_filter:
                    vocab_query += " AND tags LIKE ?"
                    vocab_params.append(f"%{tag_filter}%")

                # Count
                count_query = f"SELECT COUNT(*) FROM ({vocab_query})"
                total_count = db.execute(count_query, vocab_params).fetchone()[0]

                # Fetch
                vocab_query += (
                    " ORDER BY length(expression) ASC, expression ASC LIMIT ? OFFSET ?"
                )
                vocab_params.extend([limit, offset])

                rows = db.execute(vocab_query, vocab_params).fetchall()
                for row in rows:
                    is_fav = (
                        db.execute(
                            "SELECT 1 FROM vocab_favorites WHERE vocab_id = ?",
                            (row["id"],),
                        ).fetchone()
                        is not None
                    )
                    results.append(
                        {
                            "id": row["id"],
                            "expression": row["expression"],
                            "reading": row["reading"],
                            "translation": row["translation"],
                            "tags": row["tags"],
                            "is_favorite": is_fav,
                            "source": "my_vocab",
                        }
                    )

            # 2. 'official' Only (JMdict)
            elif source_filter == "official":
                jmdict_query = (
                    "SELECT id, expression, reading, translation, tags FROM jmdict "
                    "WHERE 1=1"
                )
                jmdict_params = []

                if search:
                    jmdict_query += (
                        " AND (expression LIKE ? OR reading LIKE ? "
                        "OR translation LIKE ?)"
                    )
                    search_param = f"%{search}%"
                    jmdict_params.extend([search_param, search_param, search_param])

                # Count
                count_query = f"SELECT COUNT(*) FROM ({jmdict_query})"
                total_count = db.execute(count_query, jmdict_params).fetchone()[0]

                # Fetch
                jmdict_query += (
                    " ORDER BY length(expression) ASC, expression ASC LIMIT ? OFFSET ?"
                )
                jmdict_params.extend([limit, offset])

                rows = db.execute(jmdict_query, jmdict_params).fetchall()
                for row in rows:
                    results.append(
                        {
                            "id": row["id"],
                            "expression": row["expression"],
                            "reading": row["reading"],
                            "translation": row["translation"],
                            "tags": row["tags"],
                            "is_favorite": False,
                            "source": "jmdict",
                        }
                    )

            # 3. 'all' (Combined)
            else:
                full_query = """
                    SELECT id, expression, reading, translation, tags, 'my_vocab' as source
                    FROM vocabulary WHERE 1=1
                """
                full_params = []

                if search:
                    full_query += (
                        " AND (expression LIKE ? OR reading LIKE ? "
                        "OR translation LIKE ?)"
                    )
                    search_param = f"%{search}%"
                    full_params.extend([search_param, search_param, search_param])
                if tag_filter:
                    full_query += " AND tags LIKE ?"
                    full_params.append(f"%{tag_filter}%")

                full_query += """
                    UNION ALL
                    SELECT id, expression, reading, translation, tags, 'jmdict' as source
                    " FROM jmdict WHERE 1=1"
                    "\n                """

                if search:
                    full_query += (
                        " AND (expression LIKE ? OR reading LIKE ? "
                        "OR translation LIKE ?)"
                    )
                    full_params.extend([search_param, search_param, search_param])

                if tag_filter:
                    full_query += " AND tags LIKE ?"
                    full_params.append(f"%{tag_filter}%")

                # Count
                count_sql = f"SELECT COUNT(*) FROM ({full_query})"
                total_count = db.execute(count_sql, full_params).fetchone()[0]

                # Fetch
                full_query += (
                    " ORDER BY CASE WHEN source='my_vocab' THEN 0 ELSE 1 END, "
                    "length(expression) ASC, expression ASC LIMIT ? OFFSET ?"
                )
                full_params.extend([limit, offset])

                rows = db.execute(full_query, full_params).fetchall()

                for row in rows:
                    is_fav = False
                    if row["source"] == "my_vocab":
                        is_fav = (
                            db.execute(
                                "SELECT 1 FROM vocab_favorites WHERE vocab_id = ?",
                                (row["id"],),
                            ).fetchone()
                            is not None
                        )

                    results.append(
                        {
                            "id": row["id"],
                            "expression": row["expression"],
                            "reading": row["reading"],
                            "translation": row["translation"],
                            "tags": row["tags"],
                            "source": row["source"],
                            "is_favorite": is_fav,
                        }
                    )

            return jsonify(
                {
                    "success": True,
                    "results": results,
                    "total": total_count,
                    "page": page,
                    "limit": limit,
                    "pages": (total_count + limit - 1) // limit if limit > 0 else 0,
                }
            )

    except Exception as e:
        print(f"Error searching dictionary: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/examples/search", methods=["GET"])
def search_examples():
    """Search for example sentences containing a word"""
    word = request.args.get("word", "")
    limit = int(request.args.get("limit", 10))

    if not word:
        return jsonify({"success": False, "error": "No word provided"}), 400

    try:
        with get_db() as db:
            # Simple LIKE query for now.
            # We check both the full japanese text and the 'words' array column
            rows = db.execute(
                """
                SELECT japanese, english
                FROM examples
                WHERE japanese LIKE ? OR words LIKE ?
                LIMIT ?
                """,
                (f"%{word}%", f'%"{word}"%', limit),
            ).fetchall()

            results = [
                {"japanese": row["japanese"], "english": row["english"]} for row in rows
            ]

            return jsonify(
                {"success": True, "count": len(results), "examples": results}
            )

    except Exception as e:
        print(f"Error searching examples: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/dictionary/favorites", methods=["GET", "POST", "DELETE"])
def handle_vocab_favorites():
    """Manage personal vocabulary list"""
    try:
        with get_db() as db:
            if request.method == "POST":
                data = request.json
                vocab_id = data.get("vocab_id")

                # We need to copy the vocab data to the favorites table so it's
                # self-contained or just link it. Linking is better as we have
                # foreign key.
                # However, for the user list, we might want to cache the text to avoid joins if performance issues arise.
                # But for now, let's just insert the ID and rely on the link.
                # Wait, my schema definition:
                # CREATE TABLE IF NOT EXISTS vocab_favorites (
                #     vocab_id INTEGER PRIMARY KEY,
                #     expression TEXT, ...
                # )
                # It duplicates data. This is good for "snapshotting" or if we want to edit meanings later.

                # Fetch original data first
                vocab = db.execute(
                    "SELECT * FROM vocabulary WHERE id = ?", (vocab_id,)
                ).fetchone()
                if not vocab:
                    return jsonify(
                        {"success": False, "error": "Vocabulary not found"}
                    ), 404

                db.execute(
                    """
                    INSERT OR IGNORE INTO vocab_favorites
                    (vocab_id, expression, reading, translation, tags)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    (
                        vocab["id"],
                        vocab["expression"],
                        vocab["reading"],
                        vocab["translation"],
                        vocab["tags"],
                    ),
                )
                db.commit()
                return jsonify({"success": True})

            elif request.method == "DELETE":
                vocab_id = request.args.get("id")
                db.execute(
                    "DELETE FROM vocab_favorites WHERE vocab_id = ?", (vocab_id,)
                )
                db.commit()
                return jsonify({"success": True})

            elif request.method == "GET":
                # List favorites
                rows = db.execute(
                    "SELECT * FROM vocab_favorites ORDER BY created_at DESC"
                ).fetchall()
                results = [dict(row) for row in rows]
                return jsonify({"success": True, "favorites": results})

    except Exception as e:
        print(f"Error handling favorites: {e}")
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/kanji/stats", methods=["GET"])
def get_kanji_stats():
    """Get kanji database statistics"""
    try:
        with get_db() as db:
            stats = db.execute(
                """
                SELECT
                    COUNT(*) as total_kanji,
                    COUNT(CASE WHEN is_jouyou THEN 1 END) as jouyou_kanji,
                    COUNT(CASE WHEN is_jinmeiyou THEN 1 END) as jinmeiyou_kanji,
                    AVG(strokes) as avg_strokes,
                    MAX(strokes) as max_strokes,
                    MIN(strokes) as min_strokes
                FROM kanji
            """
            ).fetchone()

            jlpt_stats = db.execute(
                """
                SELECT jlpt, COUNT(*) as count
                FROM kanji
                WHERE jlpt IS NOT NULL
                GROUP BY jlpt
                ORDER BY jlpt
            """
            ).fetchall()

            grade_stats = db.execute(
                """
                SELECT grade, COUNT(*) as count
                FROM kanji
                GROUP BY grade
                ORDER BY grade
            """
            ).fetchall()

            return jsonify(
                {
                    "success": True,
                    "stats": {
                        "total_kanji": stats["total_kanji"],
                        "jouyou_kanji": stats["jouyou_kanji"],
                        "jinmeiyou_kanji": stats["jinmeiyou_kanji"],
                        "avg_strokes": round(stats["avg_strokes"] or 0, 1),
                        "max_strokes": stats["max_strokes"],
                        "min_strokes": stats["min_strokes"],
                    },
                    "jlpt_breakdown": {row["jlpt"]: row["count"] for row in jlpt_stats},
                    "grade_breakdown": {
                        row["grade"]: row["count"] for row in grade_stats
                    },
                }
            )

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint"""
    return jsonify(
        {
            "status": "healthy",
            "service": "Kanji Database API",
            "database": "connected" if os.path.exists(DATABASE_PATH) else "not found",
        }
    )


if __name__ == "__main__":
    try:
        init_database()
        print("Kanji database initialized successfully")
    except Exception as e:
        print(f"Database initialization failed: {e}")
    app.run(host="0.0.0.0", port=5003, debug=True)
