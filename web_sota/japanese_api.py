"""Japanese reference data API for ai-games-collection.

Serves the Japanese-language games (kanji-master, jlpt-vocabulary,
jlpt-practice-test) from the real local databases instead of the tiny
hardcoded datasets the games shipped with, and instead of the retired
standalone kanji-api.py / jlpt-api.py services (whose default ports
11001/11003 collided with unrelated fleet servers per WEBAPP_PORTS.md).

Data files (repo data/ directory):
  - kanji.db          kanji (13K chars), jmdict (214K), jlpt_vocabulary (8K),
                      examples (278K Tatoeba pairs)
  - jlpt_questions.db questions (600), question_options, user_progress

Same-origin: games are static pages served by web_sota/server.py on :10987,
so all fetches here are relative /api/... calls with no port dependency.

Uses stdlib sqlite3 in asyncio.to_thread - no new dependencies. Read
queries open the DBs in read-only URI mode; only /api/jlpt/submit-answers
writes (to jlpt_questions.db user_progress).

All endpoints return {"success": bool, ...}. Failures return success=False
with an "error" string at HTTP 200 so the games' offline-fallback logic
(which checks data.success) engages cleanly.
"""

from __future__ import annotations

import asyncio
import json
import logging
import re
import sqlite3
from pathlib import Path

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

log = logging.getLogger("games-webapp.japanese")

router = APIRouter(prefix="/api", tags=["japanese"])

_DATA_DIR = Path(__file__).resolve().parent.parent / "data"
KANJI_DB = _DATA_DIR / "kanji.db"
JLPT_DB = _DATA_DIR / "jlpt_questions.db"

_JLPT_LEVELS = {"N5", "N4", "N3", "N2", "N1"}


def _parse_json_list(value: str | None) -> list:
    if not value:
        return []
    try:
        parsed = json.loads(value)
        return parsed if isinstance(parsed, list) else []
    except (TypeError, ValueError):
        return []


_ENTL_RE = re.compile(r"/?EntL\d+X?\s*$")


def _clean_gloss(text: str | None) -> str:
    """Strip trailing JMdict entry ids (.../EntL2153780) from a gloss."""
    return _ENTL_RE.sub("", text or "").strip()


def _missing(path: Path) -> JSONResponse:
    return JSONResponse(
        {"success": False, "error": f"{path.name} not found at {path}"}
    )


def _err(msg: str) -> JSONResponse:
    return JSONResponse({"success": False, "error": msg})


def _rows_ro(path: Path, sql: str, params: tuple = ()) -> list[sqlite3.Row]:
    """Run a read-only query synchronously. Call via asyncio.to_thread."""
    uri = f"file:{path.as_posix()}?mode=ro"
    con = sqlite3.connect(uri, uri=True)
    try:
        con.row_factory = sqlite3.Row
        return con.execute(sql, params).fetchall()
    finally:
        con.close()


async def _query(path: Path, sql: str, params: tuple = ()) -> list[sqlite3.Row]:
    return await asyncio.to_thread(_rows_ro, path, sql, params)


def _clamp(value: str | None, default: int, lo: int, hi: int) -> int:
    try:
        n = int(value) if value is not None else default
    except (TypeError, ValueError):
        n = default
    return max(lo, min(hi, n))


# ---------------------------------------------------------------- kanji

@router.get("/kanji/search")
@router.get("/kanji/all")
async def kanji_search(request: Request):
    """Search kanji by free text and/or JLPT level.

    Query params: q (matches kanji char or meanings), jlpt (N5-N1),
    limit (1-1000, default 60). Used by kanji-master to load real
    per-level kanji sets. Also answers /kanji/all (no filters), which
    kanji-3d-visualizer.js calls with limit=500.
    """
    if not KANJI_DB.exists():
        return _missing(KANJI_DB)

    q = request.query_params.get("q", "").strip()
    jlpt = request.query_params.get("jlpt", "").strip().upper()
    limit = _clamp(request.query_params.get("limit"), 60, 1, 1000)

    where = []
    params: list = []
    if q:
        where.append("(kanji LIKE ? OR meanings LIKE ?)")
        params.extend([f"%{q}%", f"%{q}%"])
    if jlpt:
        if jlpt not in _JLPT_LEVELS:
            return _err(f"invalid jlpt level {jlpt!r}, expected N5-N1")
        where.append("jlpt = ?")
        params.append(jlpt)
    where_sql = " AND ".join(where) if where else "1=1"

    try:
        rows = await _query(
            KANJI_DB,
            f"""
            SELECT kanji, onyomi, kunyomi, meanings, jlpt, grade, strokes,
                   categories, frequency, radical, is_jouyou, is_jinmeiyou
            FROM kanji
            WHERE {where_sql}
            ORDER BY (frequency IS NULL), frequency ASC, strokes ASC
            LIMIT ?
            """,
            (*params, limit),
        )
    except sqlite3.Error as e:
        log.warning("kanji_search failed: %s", e)
        return _err(str(e))

    items = [
        {
            "kanji": r["kanji"],
            "onyomi": _parse_json_list(r["onyomi"]),
            "kunyomi": _parse_json_list(r["kunyomi"]),
            "meanings": _parse_json_list(r["meanings"]),
            "jlpt": r["jlpt"],
            "grade": r["grade"],
            "strokes": r["strokes"],
            "categories": _parse_json_list(r["categories"]),
            "frequency": r["frequency"],
            "radical": r["radical"],
            "is_jouyou": bool(r["is_jouyou"]),
            "is_jinmeiyou": bool(r["is_jinmeiyou"]),
        }
        for r in rows
    ]
    return JSONResponse({"success": True, "kanji": items, "count": len(items)})


@router.get("/kanji/compounds")
async def kanji_compounds(request: Request):
    """Real JMdict compounds containing a given kanji character.

    Query params: kanji (single char, required), limit (1-20, default 6).
    Used by kanji-master's Show Compounds panel, lazily per kanji.
    """
    if not KANJI_DB.exists():
        return _missing(KANJI_DB)

    char = request.query_params.get("kanji", "").strip()
    if not char:
        return _err("kanji query param required")
    limit = _clamp(request.query_params.get("limit"), 6, 1, 20)

    try:
        rows = await _query(
            KANJI_DB,
            """
            SELECT expression, reading, translation
            FROM jmdict
            WHERE expression LIKE ? AND expression != '？？？'
            ORDER BY length(expression) ASC, expression ASC
            LIMIT ?
            """,
            (f"%{char}%", limit),
        )
    except sqlite3.Error as e:
        log.warning("kanji_compounds failed: %s", e)
        return _err(str(e))

    items = [
        {
            "word": r["expression"],
            "reading": r["reading"],
            "meaning": _clean_gloss(r["translation"]),
        }
        for r in rows
    ]
    return JSONResponse({"success": True, "compounds": items, "count": len(items)})


# ---------------------------------------------------------------- vocab

@router.get("/vocab/jlpt")
async def vocab_jlpt(request: Request):
    """JLPT-graded vocabulary for one level, randomly sampled.

    Query params: level (N5-N1, default N5), limit (1-200, default 50).
    Used by jlpt-vocabulary to load a real word set per level.
    """
    if not KANJI_DB.exists():
        return _missing(KANJI_DB)

    level = request.query_params.get("level", "N5").strip().upper()
    if level not in _JLPT_LEVELS:
        return _err(f"invalid level {level!r}, expected N5-N1")
    limit = _clamp(request.query_params.get("limit"), 50, 1, 200)

    try:
        rows = await _query(
            KANJI_DB,
            """
            SELECT expression, reading, meaning, jlpt_level
            FROM jlpt_vocabulary
            WHERE jlpt_level = ?
            ORDER BY RANDOM()
            LIMIT ?
            """,
            (level, limit),
        )
    except sqlite3.Error as e:
        log.warning("vocab_jlpt failed: %s", e)
        return _err(str(e))

    items = [
        {
            "japanese": r["expression"],
            "reading": r["reading"],
            "meaning": r["meaning"],
            "jlpt_level": r["jlpt_level"],
        }
        for r in rows
    ]
    return JSONResponse({"success": True, "vocab": items, "count": len(items)})


@router.get("/examples/search")
async def examples_search(request: Request):
    """Tatoeba example sentences containing a word.

    Query params: word (required), limit (1-20, default 4).
    Used by jlpt-vocabulary's Show Examples panel, lazily per word.
    """
    if not KANJI_DB.exists():
        return _missing(KANJI_DB)

    word = request.query_params.get("word", "").strip()
    if not word:
        return _err("word query param required")
    limit = _clamp(request.query_params.get("limit"), 4, 1, 20)

    try:
        rows = await _query(
            KANJI_DB,
            """
            SELECT japanese, english
            FROM examples
            WHERE japanese LIKE ? OR words LIKE ?
            LIMIT ?
            """,
            (f"%{word}%", f'%"{word}"%', limit),
        )
    except sqlite3.Error as e:
        log.warning("examples_search failed: %s", e)
        return _err(str(e))

    items = [{"japanese": r["japanese"], "english": r["english"]} for r in rows]
    return JSONResponse({"success": True, "examples": items, "count": len(items)})


# ---------------------------------------------------------------- JLPT quiz

@router.get("/jlpt/questions")
async def jlpt_questions(request: Request):
    """JLPT practice questions in the shape jlpt-practice-test.js expects.

    Query params: level (N5-N1, default N5), type (question_type filter,
    'mixed' or empty = all), limit (1-50, default 10), exclude_ids
    (comma-separated ints), test_set (1-12, optional).
    """
    if not JLPT_DB.exists():
        return _missing(JLPT_DB)

    level = request.query_params.get("level", "N5").strip().upper()
    if level not in _JLPT_LEVELS:
        return _err(f"invalid level {level!r}, expected N5-N1")
    qtype = request.query_params.get("type", "").strip()
    limit = _clamp(request.query_params.get("limit"), 10, 1, 50)
    test_set = request.query_params.get("test_set", "").strip()
    exclude_raw = request.query_params.get("exclude_ids", "").strip()
    exclude_ids = [
        int(x) for x in exclude_raw.split(",") if x.strip().lstrip("-").isdigit()
    ]

    where = ["level = ?"]
    params: list = [level]
    if qtype and qtype.lower() != "mixed":
        where.append("question_type = ?")
        params.append(qtype)
    if test_set:
        if not test_set.isdigit() or not 1 <= int(test_set) <= 12:
            return _err(f"invalid test_set {test_set!r}, expected 1-12")
        where.append("test_set = ?")
        params.append(int(test_set))
    if exclude_ids:
        placeholders = ",".join("?" for _ in exclude_ids)
        where.append(f"id NOT IN ({placeholders})")
        params.extend(exclude_ids)

    try:
        q_rows = await _query(
            JLPT_DB,
            f"""
            SELECT id, level, question_type, question_text, correct_answer
            FROM questions
            WHERE {" AND ".join(where)}
            ORDER BY RANDOM()
            LIMIT ?
            """,
            (*params, limit),
        )
        ids = [r["id"] for r in q_rows]
        opts_by_q: dict[int, list[sqlite3.Row]] = {}
        if ids:
            placeholders = ",".join("?" for _ in ids)
            opt_rows = await _query(
                JLPT_DB,
                f"""
                SELECT question_id, option_letter, option_text, explanation
                FROM question_options
                WHERE question_id IN ({placeholders})
                """,
                tuple(ids),
            )
            for o in opt_rows:
                opts_by_q.setdefault(o["question_id"], []).append(o)
    except sqlite3.Error as e:
        log.warning("jlpt_questions failed: %s", e)
        return _err(str(e))

    questions = []
    for r in q_rows:
        opts = opts_by_q.get(r["id"], [])
        questions.append(
            {
                "id": r["id"],
                "level": r["level"],
                "type": r["question_type"],
                "question": r["question_text"],
                "correct": r["correct_answer"],
                "options": {o["option_letter"]: o["option_text"] for o in opts},
                "explanations": {o["option_letter"]: o["explanation"] for o in opts},
            }
        )
    return JSONResponse(
        {"success": True, "questions": questions, "count": len(questions)}
    )


def _record_answers(session_id: str, answers: list[dict]) -> dict:
    """Persist answers to user_progress. Sync; call via asyncio.to_thread."""
    con = sqlite3.connect(JLPT_DB)
    try:
        con.row_factory = sqlite3.Row
        saved = 0
        correct = 0
        for a in answers:
            qid = a.get("question_id")
            answer = str(a.get("answer", ""))
            rt = a.get("response_time_ms", 0)
            if not isinstance(qid, int):
                continue
            row = con.execute(
                "SELECT correct_answer FROM questions WHERE id = ?", (qid,)
            ).fetchone()
            if row is None:
                continue
            is_correct = int(answer == row["correct_answer"])
            correct += is_correct
            con.execute(
                """
                INSERT INTO user_progress
                    (session_id, question_id, user_answer, is_correct,
                     response_time_ms, timestamp)
                VALUES (?, ?, ?, ?, ?, datetime('now'))
                """,
                (session_id, qid, answer, is_correct, int(rt or 0)),
            )
            con.execute(
                """
                UPDATE questions
                SET times_asked = COALESCE(times_asked, 0) + 1,
                    times_correct = COALESCE(times_correct, 0) + ?
                WHERE id = ?
                """,
                (is_correct, qid),
            )
            saved += 1
        con.commit()
        return {"success": True, "saved": saved, "correct": correct}
    finally:
        con.close()


@router.post("/jlpt/submit-answers")
async def jlpt_submit_answers(request: Request):
    """Persist a test session's answers to user_progress.

    Body: {"session_id": str, "answers": [{"question_id": int,
    "answer": str, "response_time_ms": int}]}
    """
    if not JLPT_DB.exists():
        return _missing(JLPT_DB)

    try:
        body = await request.json()
    except (ValueError, UnicodeDecodeError):
        return _err("invalid JSON body")
    session_id = str(body.get("session_id", "")).strip()
    answers = body.get("answers")
    if not session_id:
        return _err("session_id required")
    if not isinstance(answers, list) or not answers:
        return _err("answers must be a non-empty list")

    try:
        result = await asyncio.to_thread(_record_answers, session_id, answers)
    except sqlite3.Error as e:
        log.warning("submit_answers failed: %s", e)
        return _err(str(e))
    return JSONResponse(result)
