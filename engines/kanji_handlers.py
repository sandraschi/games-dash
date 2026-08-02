"""
Kanji Handlers for AI-Games-Collection Web Server
Extracted from web-server.py for better maintainability.
"""

import json
import logging
import sqlite3

logger = logging.getLogger(__name__)


def handle_kanji_all(query_params, db_path="games.db"):
    """Handle GET /api/kanji/all"""
    try:
        limit = int(query_params.get("limit", ["100"])[0])
        offset = int(query_params.get("offset", ["0"])[0])
        grade = query_params.get("grade", [None])[0]
        jouyou_only = query_params.get("jouyou_only", ["false"])[0].lower() == "true"

        with sqlite3.connect(db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            query = """
                SELECT kanji, onyomi, kunyomi, meanings, jlpt, grade, strokes,
                       categories, frequency, radical, is_jouyou, is_jinmeiyou
                FROM kanji
                WHERE 1=1
            """
            params = []

            if jouyou_only:
                query += " AND is_jouyou = 1"
            if grade:
                query += " AND grade = ?"
                params.append(grade)

            query += " ORDER BY frequency ASC LIMIT ? OFFSET ?"
            params.extend([limit, offset])

            cursor.execute(query, params)
            kanji_list = [dict(row) for row in cursor.fetchall()]

            # Parse JSON fields - optimized to avoid repeated try-except if possible,
            # but JSON fields can be inconsistently formatted in sqlite.
            for kanji in kanji_list:
                for field in ["onyomi", "kunyomi", "meanings", "categories"]:
                    val = kanji[field]
                    if (
                        val
                        and isinstance(val, str)
                        and (val.startswith("[") or val.startswith("{"))
                    ):
                        try:
                            kanji[field] = json.loads(val)
                        except json.JSONDecodeError:
                            kanji[field] = []
                    elif not val:
                        kanji[field] = []

            return {
                "success": True,
                "kanji": kanji_list,
                "total": len(kanji_list),
                "limit": limit,
                "offset": offset,
            }
    except (sqlite3.Error, ValueError, TypeError) as e:
        logger.exception("Error in handle_kanji_all: %s", e)
        return {"success": False, "error": str(e)}


def handle_kanji_search(query_params, db_path="games.db"):
    """Handle GET /api/kanji/search"""
    try:
        search_query = query_params.get("q", [""])[0]
        category = query_params.get("category", [None])[0]
        grade = query_params.get("grade", [None])[0]
        strokes = query_params.get("strokes", [None])[0]

        with sqlite3.connect(db_path) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            sql_query = """
                SELECT kanji, onyomi, kunyomi, meanings, jlpt, grade, strokes,
                       categories, frequency, radical, is_jouyou, is_jinmeiyou
                FROM kanji
                WHERE 1=1
            """
            params = []

            if search_query:
                sql_query += " AND (kanji LIKE ? OR meanings LIKE ?)"
                params.extend([f"%{search_query}%", f"%{search_query}%"])

            if category:
                sql_query += " AND categories LIKE ?"
                params.append(f"%{category}%")

            if grade:
                sql_query += " AND grade = ?"
                params.append(grade)

            if strokes:
                sql_query += " AND strokes = ?"
                params.append(strokes)

            sql_query += " ORDER BY frequency ASC LIMIT 50"

            cursor.execute(sql_query, params)
            results = [dict(row) for row in cursor.fetchall()]

            # Parse JSON fields
            for kanji in results:
                for field in ["onyomi", "kunyomi", "meanings", "categories"]:
                    if field not in kanji:
                        continue
                    val = kanji[field]
                    if (
                        val
                        and isinstance(val, str)
                        and (val.startswith("[") or val.startswith("{"))
                    ):
                        try:
                            kanji[field] = json.loads(val)
                        except json.JSONDecodeError:
                            kanji[field] = []
                    elif not val:
                        kanji[field] = []

            return {"success": True, "results": results, "count": len(results)}
    except (sqlite3.Error, ValueError, TypeError) as e:
        logger.exception("Error in handle_kanji_search: %s", e)
        return {"success": False, "error": str(e)}
