#!/usr/bin/env python3
"""
Seed JLPT practice questions: 12 test sets per level from web (open-anki-jlpt-decks).
Generates vocabulary questions from fetched CSVs and merges with existing grammar/kanji.
"""

import csv
import io
import json
import os
import random
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
JSON_PATH = os.path.join(SCRIPT_DIR, "..", "data", "jlpt_questions.json")
DEFAULT_DB = os.path.join(SCRIPT_DIR, "..", "data", "jlpt_questions.db")
TESTS_PER_LEVEL = 12
QUESTIONS_PER_TEST = 10


def fetch_csv(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "Games-App/1.0"})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read().decode("utf-8")


def parse_vocab_csv(content: str) -> list[dict]:
    reader = csv.DictReader(io.StringIO(content))
    rows = []
    for row in reader:
        expr = (row.get("expression") or "").strip()
        if not expr or expr.startswith("#"):
            continue
        meaning = (row.get("meaning") or "").strip()
        if not meaning:
            continue
        rows.append({"expression": expr, "meaning": meaning})
    return rows


def vocab_to_question(vocab: dict, wrong_options: list[str]) -> dict:
    """Create a vocab question: 'What does X mean?' with 4 options."""
    expr = vocab["expression"]
    correct = vocab["meaning"]
    options = [correct]
    pool = [m for m in wrong_options if m != correct and len(m) < 80]
    random.shuffle(pool)
    for m in pool[:3]:
        if m not in options:
            options.append(m)
    while len(options) < 4 and wrong_options:
        c = random.choice(wrong_options)
        if c not in options:
            options.append(c)
    random.shuffle(options)
    letters = ["ア", "イ", "ウ", "エ"]
    opts = {letters[i]: options[i] for i in range(len(options))}
    correct_letter = (
        letters[options.index(correct)] if correct in options else letters[0]
    )
    return {
        "question": f"「{expr}」の意味は次のうちどれですか。",
        "options": opts,
        "correct": correct_letter,
        "explanations": {
            k: f"「{expr}」は{opts[k]}の意味です。" if k == correct_letter else ""
            for k in opts
        },
    }


def load_existing_questions() -> dict:
    with open(JSON_PATH, encoding="utf-8") as f:
        return json.load(f)


def generate_vocab_questions_per_level(level: str) -> list[dict]:
    url = JLPT_CSV_URLS.get(level)
    if not url:
        return []
    content = fetch_csv(url)
    rows = parse_vocab_csv(content)
    if len(rows) < 20:
        return []
    all_meanings = [r["meaning"] for r in rows]
    questions = []
    needed = TESTS_PER_LEVEL * QUESTIONS_PER_TEST
    for _ in range(needed):
        v = random.choice(rows)
        q = vocab_to_question(v, all_meanings)
        q["type"] = "vocabulary"
        questions.append(q)
    return questions


def ensure_test_set_column(db: sqlite3.Connection):
    try:
        db.execute("ALTER TABLE questions ADD COLUMN test_set INTEGER DEFAULT 1")
    except sqlite3.OperationalError:
        pass


def main():
    print("Fetching vocab from web...")
    all_vocab_q = {}
    for level in ["N5", "N4", "N3", "N2", "N1"]:
        qs = generate_vocab_questions_per_level(level)
        all_vocab_q[level] = qs
        print(f"  {level}: {len(qs)} vocab questions")

    existing = load_existing_questions()
    db_path = os.environ.get("JLPT_DB_PATH", DEFAULT_DB)
    os.makedirs(os.path.dirname(db_path), exist_ok=True)

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    ensure_test_set_column(conn)

    conn.execute("DELETE FROM question_options")
    conn.execute("DELETE FROM questions")

    total = 0
    for level in ["N5", "N4", "N3", "N2", "N1"]:
        vocab_qs = all_vocab_q.get(level, [])
        existing_data = existing.get(level, {})
        grammar = existing_data.get("grammar", [])
        kanji_q = existing_data.get("kanji", [])

        for test_set in range(1, TESTS_PER_LEVEL + 1):
            test_questions = []
            base = (test_set - 1) * QUESTIONS_PER_TEST
            for i in range(QUESTIONS_PER_TEST):
                if base + i < len(vocab_qs):
                    q = vocab_qs[base + i]
                    test_questions.append(
                        {
                            "question": q["question"],
                            "options": q["options"],
                            "correct": q["correct"],
                            "explanations": q.get("explanations", {}),
                            "type": "vocabulary",
                        }
                    )
            if len(test_questions) < QUESTIONS_PER_TEST and grammar:
                for g in grammar[:2]:
                    test_questions.append(
                        {
                            "question": g["question"],
                            "options": g["options"],
                            "correct": g["correct"],
                            "explanations": g.get("explanations", {}),
                            "type": "grammar",
                        }
                    )
            if len(test_questions) < QUESTIONS_PER_TEST and kanji_q:
                for k in kanji_q[:2]:
                    test_questions.append(
                        {
                            "question": k["question"],
                            "options": k["options"],
                            "correct": k["correct"],
                            "explanations": k.get("explanations", {}),
                            "type": "kanji",
                        }
                    )

            for q in test_questions:
                cursor = conn.execute(
                    """
                    INSERT INTO questions (level, question_type, question_text, correct_answer, test_set)
                    VALUES (?, ?, ?, ?, ?)
                    """,
                    [level, q["type"], q["question"], q["correct"], test_set],
                )
                qid = cursor.lastrowid
                for letter, text in q["options"].items():
                    expl = q["explanations"].get(letter, "")
                    conn.execute(
                        """
                        INSERT INTO question_options (question_id, option_letter, option_text, explanation)
                        VALUES (?, ?, ?, ?)
                        """,
                        [qid, letter, text, expl],
                    )
                total += 1

        print(f"  {level}: {TESTS_PER_LEVEL} tests seeded")

    conn.commit()
    conn.close()
    print(f"Total: {total} questions in database")
    return 0


if __name__ == "__main__":
    sys.exit(main())
