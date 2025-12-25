#!/usr/bin/env python3
"""
JLPT Practice Test API Server
Database-driven question management for scalable JLPT practice
"""

import sqlite3
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Database setup
DATABASE_PATH = os.path.join(os.path.dirname(__file__), 'jlpt_questions.db')

def get_db():
    """Get database connection"""
    db = sqlite3.connect(DATABASE_PATH)
    db.row_factory = sqlite3.Row
    return db

def init_database():
    """Initialize database with schema"""
    with get_db() as db:
        # Create questions table
        db.execute('''
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
        ''')

        # Create question options table
        db.execute('''
            CREATE TABLE IF NOT EXISTS question_options (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                question_id INTEGER NOT NULL,
                option_letter TEXT NOT NULL,
                option_text TEXT NOT NULL,
                explanation TEXT NOT NULL,
                FOREIGN KEY (question_id) REFERENCES questions (id)
            )
        ''')

        # Create user progress table
        db.execute('''
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
        ''')

        # Create indexes for performance
        db.execute('CREATE INDEX IF NOT EXISTS idx_questions_level ON questions(level)')
        db.execute('CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(question_type)')
        db.execute('CREATE INDEX IF NOT EXISTS idx_user_progress_session ON user_progress(session_id)')

        db.commit()

@app.route('/api/questions', methods=['GET'])
def get_questions():
    """Get questions by level and type"""
    level = request.args.get('level', 'N5')
    question_type = request.args.get('type', 'mixed')
    limit = int(request.args.get('limit', 3))
    exclude_ids = request.args.get('exclude_ids', '')

    # Parse excluded IDs
    excluded_ids = [int(x) for x in exclude_ids.split(',') if x.strip()]

    with get_db() as db:
        if question_type == 'mixed':
            # Get mixed types for this level
            query = '''
                SELECT q.*, GROUP_CONCAT(qo.option_letter || ':' || qo.option_text || ':' || qo.explanation, '|||') as options
                FROM questions q
                LEFT JOIN question_options qo ON q.id = qo.question_id
                WHERE q.level = ? AND q.id NOT IN ({})
                GROUP BY q.id
                ORDER BY RANDOM()
                LIMIT ?
            '''.format(','.join(['?'] * len(excluded_ids)) if excluded_ids else 'NULL')
        else:
            # Get specific type
            query = '''
                SELECT q.*, GROUP_CONCAT(qo.option_letter || ':' || qo.option_text || ':' || qo.explanation, '|||') as options
                FROM questions q
                LEFT JOIN question_options qo ON q.id = qo.question_id
                WHERE q.level = ? AND q.question_type = ? AND q.id NOT IN ({})
                GROUP BY q.id
                ORDER BY RANDOM()
                LIMIT ?
            '''.format(','.join(['?'] * len(excluded_ids)) if excluded_ids else 'NULL')

        params = [level]
        if question_type != 'mixed':
            params.append(question_type)
        if excluded_ids:
            params.extend(excluded_ids)
        params.append(limit)

        rows = db.execute(query, params).fetchall()

        questions = []
        for row in rows:
            # Parse options
            options_data = row['options'].split('|||') if row['options'] else []
            options = {}
            explanations = {}

            for option_str in options_data:
                parts = option_str.split(':', 2)
                if len(parts) >= 3:
                    letter, text, explanation = parts
                    options[letter] = text
                    explanations[letter] = explanation

            questions.append({
                'id': row['id'],
                'level': row['level'],
                'type': row['question_type'],
                'question': row['question_text'],
                'correct': row['correct_answer'],
                'options': options,
                'explanations': explanations,
                'difficulty': row['difficulty_rating']
            })

        return jsonify({
            'success': True,
            'questions': questions,
            'count': len(questions)
        })

@app.route('/api/submit-answers', methods=['POST'])
def submit_answers():
    """Submit user answers and get results"""
    data = request.get_json()
    session_id = data.get('session_id', 'anonymous')
    answers = data.get('answers', [])

    results = []
    total_correct = 0

    with get_db() as db:
        for answer in answers:
            question_id = answer['question_id']
            user_answer = answer['answer']
            response_time = answer.get('response_time_ms', 0)

            # Get correct answer
            correct_row = db.execute('SELECT correct_answer FROM questions WHERE id = ?', [question_id]).fetchone()
            if correct_row:
                correct_answer = correct_row['correct_answer']
                is_correct = user_answer == correct_answer

                if is_correct:
                    total_correct += 1

                # Record progress
                db.execute('''
                    INSERT INTO user_progress (session_id, question_id, user_answer, is_correct, response_time_ms)
                    VALUES (?, ?, ?, ?, ?)
                ''', [session_id, question_id, user_answer, is_correct, response_time])

                # Update question statistics
                db.execute('''
                    UPDATE questions
                    SET times_asked = times_asked + 1,
                        times_correct = times_correct + ?
                    WHERE id = ?
                ''', [1 if is_correct else 0, question_id])

                results.append({
                    'question_id': question_id,
                    'user_answer': user_answer,
                    'correct_answer': correct_answer,
                    'is_correct': is_correct
                })

        db.commit()

    return jsonify({
        'success': True,
        'results': results,
        'score': f"{total_correct}/{len(answers)}",
        'percentage': round((total_correct / len(answers)) * 100, 1) if answers else 0
    })

@app.route('/api/progress', methods=['GET'])
def get_progress():
    """Get user progress statistics"""
    session_id = request.args.get('session_id', 'anonymous')

    with get_db() as db:
        # Overall statistics
        stats_row = db.execute('''
            SELECT
                COUNT(*) as total_answered,
                SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as total_correct,
                AVG(response_time_ms) as avg_response_time
            FROM user_progress
            WHERE session_id = ?
        ''', [session_id]).fetchone()

        # Statistics by level
        level_stats = db.execute('''
            SELECT
                q.level,
                COUNT(up.id) as questions_answered,
                SUM(CASE WHEN up.is_correct THEN 1 ELSE 0 END) as correct_answers,
                ROUND(AVG(up.response_time_ms), 0) as avg_time
            FROM user_progress up
            JOIN questions q ON up.question_id = q.id
            WHERE up.session_id = ?
            GROUP BY q.level
            ORDER BY q.level
        ''', [session_id]).fetchall()

        return jsonify({
            'success': True,
            'overall': {
                'total_answered': stats_row['total_answered'] or 0,
                'total_correct': stats_row['total_correct'] or 0,
                'accuracy': round((stats_row['total_correct'] or 0) / max(stats_row['total_answered'] or 1, 1) * 100, 1),
                'avg_response_time': round(stats_row['avg_response_time'] or 0, 0)
            },
            'by_level': [{
                'level': row['level'],
                'answered': row['questions_answered'],
                'correct': row['correct_answers'],
                'accuracy': round(row['correct_answers'] / max(row['questions_answered'], 1) * 100, 1),
                'avg_time': row['avg_time'] or 0
            } for row in level_stats]
        })

@app.route('/api/question-stats', methods=['GET'])
def get_question_stats():
    """Get question difficulty statistics"""
    level = request.args.get('level')

    with get_db() as db:
        if level:
            rows = db.execute('''
                SELECT level, question_type, COUNT(*) as total_questions,
                       AVG(times_correct * 1.0 / NULLIF(times_asked, 0)) as avg_accuracy,
                       AVG(difficulty_rating) as avg_difficulty
                FROM questions
                WHERE level = ?
                GROUP BY level, question_type
            ''', [level]).fetchall()
        else:
            rows = db.execute('''
                SELECT level, question_type, COUNT(*) as total_questions,
                       AVG(times_correct * 1.0 / NULLIF(times_asked, 0)) as avg_accuracy,
                       AVG(difficulty_rating) as avg_difficulty
                FROM questions
                GROUP BY level, question_type
                ORDER BY level, question_type
            ''').fetchall()

        return jsonify({
            'success': True,
            'stats': [{
                'level': row['level'],
                'type': row['question_type'],
                'total_questions': row['total_questions'],
                'avg_accuracy': round(row['avg_accuracy'] or 0, 3),
                'avg_difficulty': round(row['avg_difficulty'] or 0, 1)
            } for row in rows]
        })

@app.route('/api/add-question', methods=['POST'])
def add_question():
    """Add a new question to the database"""
    data = request.get_json()

    with get_db() as db:
        # Insert question
        cursor = db.execute('''
            INSERT INTO questions (level, question_type, question_text, correct_answer, difficulty_rating)
            VALUES (?, ?, ?, ?, ?)
        ''', [
            data['level'],
            data['type'],
            data['question'],
            data['correct'],
            data.get('difficulty', 1)
        ])

        question_id = cursor.lastrowid

        # Insert options
        for letter, option_data in data['options'].items():
            db.execute('''
                INSERT INTO question_options (question_id, option_letter, option_text, explanation)
                VALUES (?, ?, ?, ?)
            ''', [
                question_id,
                letter,
                option_data['text'],
                option_data['explanation']
            ])

        db.commit()

        return jsonify({
            'success': True,
            'question_id': question_id,
            'message': 'Question added successfully'
        })

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'JLPT API Server',
        'database': 'connected' if os.path.exists(DATABASE_PATH) else 'not found'
    })

if __name__ == '__main__':
    init_database()
    app.run(host='0.0.0.0', port=5001, debug=True)
