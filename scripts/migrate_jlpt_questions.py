#!/usr/bin/env python3
"""
Migrate JLPT questions from JavaScript to database
"""

import sqlite3
import os

# Database path
DATABASE_PATH = os.path.join(os.path.dirname(__file__), "jlpt_questions.db")


def init_database():
    """Initialize database"""
    db = sqlite3.connect(DATABASE_PATH)
    db.row_factory = sqlite3.Row

    # Create tables
    db.execute("""
        CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            level TEXT NOT NULL,
            question_type TEXT NOT NULL,
            question_text TEXT NOT NULL,
            correct_answer TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            difficulty_rating INTEGER DEFAULT 1,
            times_asked INTEGER DEFAULT 0,
            times_correct INTEGER DEFAULT 0
        )
    """)

    db.execute("""
        CREATE TABLE IF NOT EXISTS question_options (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_id INTEGER NOT NULL,
            option_letter TEXT NOT NULL,
            option_text TEXT NOT NULL,
            explanation TEXT NOT NULL,
            FOREIGN KEY (question_id) REFERENCES questions (id)
        )
    """)

    db.execute("""
        CREATE TABLE IF NOT EXISTS user_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            question_id INTEGER NOT NULL,
            user_answer TEXT NOT NULL,
            is_correct BOOLEAN NOT NULL,
            response_time_ms INTEGER,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (question_id) REFERENCES questions (id)
        )
    """)

    # Create indexes
    db.execute("CREATE INDEX IF NOT EXISTS idx_questions_level ON questions(level)")
    db.execute(
        "CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(question_type)"
    )
    db.execute(
        "CREATE INDEX IF NOT EXISTS idx_user_progress_session ON user_progress(session_id)"
    )

    db.commit()
    db.close()


def migrate_questions():
    """Migrate questions from hardcoded JavaScript data"""
    # Current questions data (extracted from jlpt-practice-test.js)
    questions_data = {
        "N5": {
            "kanji": [
                {
                    "question": "次の文の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。\n\n田中さんは（　　）に本を読みます。",
                    "options": {
                        "ア": "図書館",
                        "イ": "レストラン",
                        "ウ": "病院",
                        "エ": "銀行",
                    },
                    "correct": "ア",
                    "explanations": {
                        "ア": "「図書館」は本を読む場所なので正解です。",
                        "イ": "「レストラン」は食べ物を食べる場所です。",
                        "ウ": "「病院」は病気の治療を受ける場所です。",
                        "エ": "「銀行」はお金を扱う場所です。",
                    },
                    "type": "kanji",
                },
                {
                    "question": "次の文の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。\n\n毎日（　　）で勉強します。",
                    "options": {
                        "ア": "学校",
                        "イ": "公園",
                        "ウ": "スーパー",
                        "エ": "駅",
                    },
                    "correct": "ア",
                    "explanations": {
                        "ア": "「学校」は勉強する場所なので正解です。",
                        "イ": "「公園」は散歩する場所です。",
                        "ウ": "「スーパー」は買い物をする場所です。",
                        "エ": "「駅」は電車に乗る場所です。",
                    },
                    "type": "kanji",
                },
                {
                    "question": "次の文の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。\n\n（　　）で手紙を書きます。",
                    "options": {"ア": "鉛筆", "イ": "時計", "ウ": "傘", "エ": "靴"},
                    "correct": "ア",
                    "explanations": {
                        "ア": "「鉛筆」は手紙を書くのに使う物なので正解です。",
                        "イ": "「時計」は時間を確認する物です。",
                        "ウ": "「傘」は雨よけです。",
                        "エ": "「靴」は足を保護する物です。",
                    },
                    "type": "kanji",
                },
            ],
            "grammar": [
                {
                    "question": "次の文の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。\n\n田中さんは毎日7時に（　　）。",
                    "options": {
                        "ア": "起きます",
                        "イ": "起きて",
                        "ウ": "起きる",
                        "エ": "起きた",
                    },
                    "correct": "ア",
                    "explanations": {
                        "ア": "「起きます」は現在形で、毎日の習慣を表すので正解です。",
                        "イ": "「起きて」はテ形接続で、不完全な文になります。",
                        "ウ": "「起きる」は辞書形です。",
                        "エ": "「起きた」は過去形です。",
                    },
                    "type": "grammar",
                },
                {
                    "question": "次の文の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。\n\nこの本は（　　）です。",
                    "options": {
                        "ア": "面白い",
                        "イ": "面白く",
                        "ウ": "面白かった",
                        "エ": "面白くない",
                    },
                    "correct": "ア",
                    "explanations": {
                        "ア": "「面白い」はイ形容詞の基本形で、名詞を修飾するので正解です。",
                        "イ": "「面白く」はイ形容詞の連用形で、動詞を修飾します。",
                        "ウ": "「面白かった」は過去形です。",
                        "エ": "「面白くない」は否定形です。",
                    },
                    "type": "grammar",
                },
                {
                    "question": "次の文の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。\n\n昨日、デパートへ（　　）。",
                    "options": {
                        "ア": "行きました",
                        "イ": "行きます",
                        "ウ": "行く",
                        "エ": "行った",
                    },
                    "correct": "ア",
                    "explanations": {
                        "ア": "「行きました」は過去の丁寧な表現なので正解です。",
                        "イ": "「行きます」は現在の表現です。",
                        "ウ": "「行く」は辞書形です。",
                        "エ": "「行った」はカジュアルな過去形です。",
                    },
                    "type": "grammar",
                },
            ],
            "vocab": [
                {
                    "question": "次の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。\n\nA: こんにちは。\nB: （　　）。",
                    "options": {
                        "ア": "こんにちは",
                        "イ": "さようなら",
                        "ウ": "ありがとう",
                        "エ": "すみません",
                    },
                    "correct": "ア",
                    "explanations": {
                        "ア": "挨拶に対して挨拶で返すのが自然なので正解です。",
                        "イ": "「さようなら」は別れの挨拶です。",
                        "ウ": "「ありがとう」は感謝を伝える言葉です。",
                        "エ": "「すみません」は謝罪の言葉です。",
                    },
                    "type": "vocab",
                },
                {
                    "question": "次の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。\n\n毎日（　　）を食べます。",
                    "options": {"ア": "野菜", "イ": "机", "ウ": "本", "エ": "時計"},
                    "correct": "ア",
                    "explanations": {
                        "ア": "「野菜」は食べ物なので正解です。",
                        "イ": "「机」は家具です。",
                        "ウ": "「本」は読む物です。",
                        "エ": "「時計」は時間を確認する物です。",
                    },
                    "type": "vocab",
                },
                {
                    "question": "次の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。\n\n（　　）で日本語を勉強します。",
                    "options": {"ア": "学校", "イ": "公園", "ウ": "病院", "エ": "銀行"},
                    "correct": "ア",
                    "explanations": {
                        "ア": "「学校」は勉強する場所なので正解です。",
                        "イ": "「公園」は散歩する場所です。",
                        "ウ": "「病院」は病気の治療を受ける場所です。",
                        "エ": "「銀行」はお金を扱う場所です。",
                    },
                    "type": "vocab",
                },
            ],
        },
        "N4": {
            "kanji": [
                {
                    "question": "次の文の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。\n\nこの問題はとても（　　）です。",
                    "options": {
                        "ア": "難しい",
                        "イ": "簡単だ",
                        "ウ": "きれいだ",
                        "エ": "大きい",
                    },
                    "correct": "ア",
                    "explanations": {
                        "ア": "「難しい」は「むずかしい」で、問題が複雑であることを表すので正解です。",
                        "イ": "「簡単だ」は「かんたんだ」で、問題が簡単であることを表します。",
                        "ウ": "「きれいだ」は「きれい」で、美しいことを表します。",
                        "エ": "「大きい」は「大きい」で、サイズが大きいことを表します。",
                    },
                    "type": "kanji",
                },
                {
                    "question": "次の文の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。\n\n友達と（　　）へ行きました。",
                    "options": {
                        "ア": "映画館",
                        "イ": "教室",
                        "ウ": "病院",
                        "エ": "会社",
                    },
                    "correct": "ア",
                    "explanations": {
                        "ア": "「映画館」は友達と娯楽を楽しむ場所なので正解です。",
                        "イ": "「教室」は勉強する場所です。",
                        "ウ": "「病院」は病気の治療を受ける場所です。",
                        "エ": "「会社」は働く場所です。",
                    },
                    "type": "kanji",
                },
                {
                    "question": "次の文の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。\n\n（　　）で写真を撮りました。",
                    "options": {"ア": "カメラ", "イ": "時計", "ウ": "傘", "エ": "靴"},
                    "correct": "ア",
                    "explanations": {
                        "ア": "「カメラ」は写真を撮る道具なので正解です。",
                        "イ": "「時計」は時間を確認する物です。",
                        "ウ": "「傘」は雨よけです。",
                        "エ": "「靴」は足を保護する物です。",
                    },
                    "type": "kanji",
                },
            ],
            "grammar": [
                {
                    "question": "次の文の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。\n\n明日、友達が（　　）と思います。",
                    "options": {
                        "ア": "来ます",
                        "イ": "来る",
                        "ウ": "来た",
                        "エ": "来て",
                    },
                    "correct": "イ",
                    "explanations": {
                        "イ": "「来ると思います」は「～と思います」の正しい使い方で、正解です。",
                        "ア": "「来ますと思います」は二重の丁寧形です。",
                        "ウ": "「来たと思います」は過去形です。",
                        "エ": "「来てと思います」は不完全な文です。",
                    },
                    "type": "grammar",
                },
                {
                    "question": "次の文の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。\n\nこの本は（　　）です。",
                    "options": {
                        "ア": "面白い",
                        "イ": "面白かった",
                        "ウ": "面白く",
                        "エ": "面白くない",
                    },
                    "correct": "ア",
                    "explanations": {
                        "ア": "「面白い」は現在形で、状態を表すので正解です。",
                        "イ": "「面白かった」は過去形です。",
                        "ウ": "「面白く」は連用形です。",
                        "エ": "「面白くない」は否定形です。",
                    },
                    "type": "grammar",
                },
                {
                    "question": "次の文の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。\n\n雨が降っているので、（　　）出かけません。",
                    "options": {
                        "ア": "ずっと",
                        "イ": "すぐに",
                        "ウ": "ゆっくり",
                        "エ": "なかなか",
                    },
                    "correct": "エ",
                    "explanations": {
                        "エ": "「なかなか～ません」は「あまり～しません」の意味で、正解です。",
                        "ア": "「ずっと」は「ずっと続く」という意味です。",
                        "イ": "「すぐに」は「すぐ」という意味です。",
                        "ウ": "「ゆっくり」は「ゆっくり」という意味です。",
                    },
                    "type": "grammar",
                },
            ],
            "vocab": [
                {
                    "question": "次の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。\n\nA: すみません。\nB: （　　）。",
                    "options": {
                        "ア": "どういたしまして",
                        "イ": "こんにちは",
                        "ウ": "さようなら",
                        "エ": "すみません",
                    },
                    "correct": "ア",
                    "explanations": {
                        "ア": "「どういたしまして」は「どういたしまして」という意味で、謝罪に対する返事として正解です。",
                        "イ": "「こんにちは」は挨拶です。",
                        "ウ": "「さようなら」は別れの挨拶です。",
                        "エ": "「すみません」は謝罪の言葉です。",
                    },
                    "type": "vocab",
                },
                {
                    "question": "次の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。\n\n（　　）をしています。",
                    "options": {"ア": "仕事", "イ": "机", "ウ": "本", "エ": "時計"},
                    "correct": "ア",
                    "explanations": {
                        "ア": "「仕事」は「しごと」で、動詞「する」と組み合わせることができます。",
                        "イ": "「机」は「つくえ」で、動作を表すことができません。",
                        "ウ": "「本」は「ほん」で、動作を表すことができません。",
                        "エ": "「時計」は「とけい」で、動作を表すことができません。",
                    },
                    "type": "vocab",
                },
                {
                    "question": "次の（　　）に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。\n\n（　　）で新聞を読みます。",
                    "options": {"ア": "電車", "イ": "学校", "ウ": "病院", "エ": "銀行"},
                    "correct": "ア",
                    "explanations": {
                        "ア": "「電車」は通勤・通学時に新聞を読む場所なので正解です。",
                        "イ": "「学校」は勉強する場所です。",
                        "ウ": "「病院」は病気の治療を受ける場所です。",
                        "エ": "「銀行」はお金を扱う場所です。",
                    },
                    "type": "vocab",
                },
            ],
        },
    }

    # Connect to database
    db = sqlite3.connect(DATABASE_PATH)
    db.row_factory = sqlite3.Row

    try:
        # Insert questions
        for level, types in questions_data.items():
            for question_type, questions in types.items():
                for question in questions:
                    # Insert question
                    cursor = db.execute(
                        """
                        INSERT INTO questions (level, question_type, question_text, correct_answer, difficulty_rating)
                        VALUES (?, ?, ?, ?, ?)
                    """,
                        [
                            level,
                            question_type,
                            question["question"],
                            question["correct"],
                            1,
                        ],
                    )

                    question_id = cursor.lastrowid

                    # Insert options
                    for letter, option_text in question["options"].items():
                        explanation = question["explanations"].get(
                            letter, f"Option {letter} explanation"
                        )
                        db.execute(
                            """
                            INSERT INTO question_options (question_id, option_letter, option_text, explanation)
                            VALUES (?, ?, ?, ?)
                        """,
                            [question_id, letter, option_text, explanation],
                        )

        db.commit()
        print(
            f"Successfully migrated {sum(len(types[qtype]) for types in questions_data.values() for qtype in types)} questions to database"
        )

    except Exception as e:
        print(f"Migration failed: {e}")
        db.rollback()
    finally:
        db.close()


def verify_migration():
    """Verify that questions were migrated correctly"""
    db = sqlite3.connect(DATABASE_PATH)
    db.row_factory = sqlite3.Row

    try:
        # Count questions by level and type
        rows = db.execute("""
            SELECT level, question_type, COUNT(*) as count
            FROM questions
            GROUP BY level, question_type
            ORDER BY level, question_type
        """).fetchall()

        print("\nDatabase Contents:")
        for row in rows:
            print(f"  {row['level']} {row['question_type']}: {row['count']} questions")

        # Test API endpoint simulation
        test_questions = db.execute("""
            SELECT q.*, GROUP_CONCAT(qo.option_letter || ':' || qo.option_text || ':' || qo.explanation, '|||') as options
            FROM questions q
            LEFT JOIN question_options qo ON q.id = qo.question_id
            WHERE q.level = 'N5' AND q.question_type = 'kanji'
            GROUP BY q.id
            ORDER BY RANDOM()
            LIMIT 3
        """).fetchall()

        print(f"\nTest Query (N5 Kanji, 3 questions): {len(test_questions)} results")

    finally:
        db.close()


if __name__ == "__main__":
    print("Starting JLPT Questions Database Migration")
    print("=" * 50)

    # Initialize database
    print("Initializing database...")
    init_database()

    # Migrate questions
    print("Migrating questions...")
    migrate_questions()

    # Verify migration
    verify_migration()

    print("\nMigration complete!")
    print("JLPT API server can now serve questions from database")
