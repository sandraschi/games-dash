#!/usr/bin/env python3
"""
SQLite Database Module for Multiplayer Statistics
**Timestamp**: 2025-12-04
"""

import sqlite3
import json
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, List, Tuple

DB_PATH = Path('data/multiplayer.db')

class MultiplayerDB:
    def __init__(self, db_path: Path = DB_PATH):
        """Initialize database connection and create tables if needed"""
        self.db_path = db_path
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.init_database()
    
    def get_connection(self):
        """Get database connection"""
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row  # Return rows as dict-like objects
        return conn
    
    def init_database(self):
        """Create database tables if they don't exist"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Players table - persistent player profiles
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS players (
                player_id TEXT PRIMARY KEY,
                player_name TEXT NOT NULL,
                first_seen TEXT NOT NULL,
                last_seen TEXT NOT NULL,
                total_games INTEGER DEFAULT 0,
                total_wins INTEGER DEFAULT 0,
                total_losses INTEGER DEFAULT 0,
                total_draws INTEGER DEFAULT 0,
                elo_rating INTEGER DEFAULT 1000,
                created_at TEXT NOT NULL
            )
        ''')
        
        # Games table - game history
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS games (
                game_id TEXT PRIMARY KEY,
                game_type TEXT NOT NULL,
                player1_id TEXT NOT NULL,
                player2_id TEXT NOT NULL,
                player1_name TEXT NOT NULL,
                player2_name TEXT NOT NULL,
                winner_id TEXT,
                status TEXT NOT NULL,
                move_count INTEGER DEFAULT 0,
                started_at TEXT NOT NULL,
                finished_at TEXT,
                duration_seconds INTEGER,
                FOREIGN KEY (player1_id) REFERENCES players(player_id),
                FOREIGN KEY (player2_id) REFERENCES players(player_id),
                FOREIGN KEY (winner_id) REFERENCES players(player_id)
            )
        ''')
        
        # Game moves table - detailed move history
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS game_moves (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                game_id TEXT NOT NULL,
                move_number INTEGER NOT NULL,
                player_id TEXT NOT NULL,
                move_data TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                FOREIGN KEY (game_id) REFERENCES games(game_id)
            )
        ''')
        
        # Statistics table - aggregated stats per game type
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS player_statistics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                player_id TEXT NOT NULL,
                game_type TEXT NOT NULL,
                games_played INTEGER DEFAULT 0,
                wins INTEGER DEFAULT 0,
                losses INTEGER DEFAULT 0,
                draws INTEGER DEFAULT 0,
                win_rate REAL DEFAULT 0.0,
                last_played TEXT,
                FOREIGN KEY (player_id) REFERENCES players(player_id),
                UNIQUE(player_id, game_type)
            )
        ''')
        
        # League table - current standings
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS league_standings (
                player_id TEXT PRIMARY KEY,
                player_name TEXT NOT NULL,
                total_games INTEGER DEFAULT 0,
                wins INTEGER DEFAULT 0,
                losses INTEGER DEFAULT 0,
                draws INTEGER DEFAULT 0,
                win_rate REAL DEFAULT 0.0,
                elo_rating INTEGER DEFAULT 1000,
                points INTEGER DEFAULT 0,
                last_updated TEXT NOT NULL,
                FOREIGN KEY (player_id) REFERENCES players(player_id)
            )
        ''')
        
        conn.commit()
        conn.close()
        print(f"✅ Database initialized: {self.db_path}")
    
    def get_or_create_player(self, player_id: str, player_name: str) -> Dict:
        """Get player from database or create new one"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('SELECT * FROM players WHERE player_id = ?', (player_id,))
        row = cursor.fetchone()
        
        if row:
            # Update last_seen
            cursor.execute(
                'UPDATE players SET last_seen = ? WHERE player_id = ?',
                (datetime.now().isoformat(), player_id)
            )
            conn.commit()
            conn.close()
            return dict(row)
        else:
            # Create new player
            now = datetime.now().isoformat()
            cursor.execute('''
                INSERT INTO players 
                (player_id, player_name, first_seen, last_seen, created_at)
                VALUES (?, ?, ?, ?, ?)
            ''', (player_id, player_name, now, now, now))
            
            # Initialize statistics
            cursor.execute('''
                INSERT INTO league_standings 
                (player_id, player_name, last_updated)
                VALUES (?, ?, ?)
            ''', (player_id, player_name, now))
            
            conn.commit()
            conn.close()
            return {
                'player_id': player_id,
                'player_name': player_name,
                'total_games': 0,
                'total_wins': 0,
                'total_losses': 0,
                'total_draws': 0,
                'elo_rating': 1000
            }
    
    def save_game(self, game_id: str, game_type: str, player1_id: str, player2_id: str,
                  player1_name: str, player2_name: str, move_history: List[Dict],
                  winner_id: Optional[str] = None, status: str = 'finished',
                  started_at: str = None, finished_at: str = None):
        """Save completed game to database"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        if not started_at:
            started_at = datetime.now().isoformat()
        if not finished_at:
            finished_at = datetime.now().isoformat()
        
        # Calculate duration
        start_dt = datetime.fromisoformat(started_at)
        end_dt = datetime.fromisoformat(finished_at)
        duration = int((end_dt - start_dt).total_seconds())
        
        # Save game
        cursor.execute('''
            INSERT INTO games 
            (game_id, game_type, player1_id, player2_id, player1_name, player2_name,
             winner_id, status, move_count, started_at, finished_at, duration_seconds)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (game_id, game_type, player1_id, player2_id, player1_name, player2_name,
              winner_id, status, len(move_history), started_at, finished_at, duration))
        
        # Save moves
        for i, move in enumerate(move_history):
            cursor.execute('''
                INSERT INTO game_moves 
                (game_id, move_number, player_id, move_data, timestamp)
                VALUES (?, ?, ?, ?, ?)
            ''', (game_id, i + 1, move.get('player_id'), json.dumps(move), move.get('timestamp')))
        
        # Update player statistics
        self._update_player_stats(player1_id, game_type, winner_id == player1_id, 
                                 winner_id == player2_id, winner_id is None)
        self._update_player_stats(player2_id, game_type, winner_id == player2_id,
                                 winner_id == player1_id, winner_id is None)
        
        # Update league standings
        self._update_league_standings(player1_id, player1_name, winner_id == player1_id,
                                     winner_id == player2_id, winner_id is None)
        self._update_league_standings(player2_id, player2_name, winner_id == player2_id,
                                     winner_id == player1_id, winner_id is None)
        
        conn.commit()
        conn.close()
    
    def _update_player_stats(self, player_id: str, game_type: str, won: bool, lost: bool, draw: bool):
        """Update player statistics for a specific game type"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Get or create stats record
        cursor.execute('''
            SELECT * FROM player_statistics 
            WHERE player_id = ? AND game_type = ?
        ''', (player_id, game_type))
        row = cursor.fetchone()
        
        if row:
            stats = dict(row)
            games = stats['games_played'] + 1
            wins = stats['wins'] + (1 if won else 0)
            losses = stats['losses'] + (1 if lost else 0)
            draws = stats['draws'] + (1 if draw else 0)
            win_rate = (wins / games * 100) if games > 0 else 0.0
            
            cursor.execute('''
                UPDATE player_statistics 
                SET games_played = ?, wins = ?, losses = ?, draws = ?, 
                    win_rate = ?, last_played = ?
                WHERE player_id = ? AND game_type = ?
            ''', (games, wins, losses, draws, win_rate, datetime.now().isoformat(),
                  player_id, game_type))
        else:
            games = 1
            wins = 1 if won else 0
            losses = 1 if lost else 0
            draws = 1 if draw else 0
            win_rate = (wins / games * 100) if games > 0 else 0.0
            
            cursor.execute('''
                INSERT INTO player_statistics 
                (player_id, game_type, games_played, wins, losses, draws, win_rate, last_played)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (player_id, game_type, games, wins, losses, draws, win_rate, datetime.now().isoformat()))
        
        conn.commit()
        conn.close()
    
    def _update_league_standings(self, player_id: str, player_name: str, won: bool, lost: bool, draw: bool):
        """Update league standings"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Get current standings
        cursor.execute('SELECT * FROM league_standings WHERE player_id = ?', (player_id,))
        row = cursor.fetchone()
        
        if row:
            stats = dict(row)
            total_games = stats['total_games'] + 1
            wins = stats['wins'] + (1 if won else 0)
            losses = stats['losses'] + (1 if lost else 0)
            draws = stats['draws'] + (1 if draw else 0)
            win_rate = (wins / total_games * 100) if total_games > 0 else 0.0
            points = wins * 3 + draws * 1  # 3 points for win, 1 for draw
            
            cursor.execute('''
                UPDATE league_standings 
                SET total_games = ?, wins = ?, losses = ?, draws = ?,
                    win_rate = ?, points = ?, last_updated = ?
                WHERE player_id = ?
            ''', (total_games, wins, losses, draws, win_rate, points, datetime.now().isoformat(), player_id))
        else:
            total_games = 1
            wins = 1 if won else 0
            losses = 1 if lost else 0
            draws = 1 if draw else 0
            win_rate = (wins / total_games * 100) if total_games > 0 else 0.0
            points = wins * 3 + draws * 1
            
            cursor.execute('''
                INSERT INTO league_standings 
                (player_id, player_name, total_games, wins, losses, draws, win_rate, points, last_updated)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (player_id, player_name, total_games, wins, losses, draws, win_rate, points, datetime.now().isoformat()))
        
        # Update players table
        cursor.execute('SELECT * FROM players WHERE player_id = ?', (player_id,))
        player = cursor.fetchone()
        if player:
            p = dict(player)
            total_games = p['total_games'] + 1
            total_wins = p['total_wins'] + (1 if won else 0)
            total_losses = p['total_losses'] + (1 if lost else 0)
            total_draws = p['total_draws'] + (1 if draw else 0)
            
            cursor.execute('''
                UPDATE players 
                SET total_games = ?, total_wins = ?, total_losses = ?, total_draws = ?
                WHERE player_id = ?
            ''', (total_games, total_wins, total_losses, total_draws, player_id))
        
        conn.commit()
        conn.close()
    
    def get_player_stats(self, player_id: str) -> Dict:
        """Get comprehensive statistics for a player"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # Get player info
        cursor.execute('SELECT * FROM players WHERE player_id = ?', (player_id,))
        player = cursor.fetchone()
        if not player:
            conn.close()
            return None
        
        player_dict = dict(player)
        
        # Get per-game-type stats
        cursor.execute('''
            SELECT * FROM player_statistics 
            WHERE player_id = ?
            ORDER BY games_played DESC
        ''', (player_id,))
        game_stats = [dict(row) for row in cursor.fetchall()]
        player_dict['game_stats'] = game_stats
        
        # Get recent games
        cursor.execute('''
            SELECT * FROM games 
            WHERE player1_id = ? OR player2_id = ?
            ORDER BY finished_at DESC
            LIMIT 10
        ''', (player_id, player_id))
        recent_games = [dict(row) for row in cursor.fetchall()]
        player_dict['recent_games'] = recent_games
        
        conn.close()
        return player_dict
    
    def get_league_table(self, limit: int = 50) -> List[Dict]:
        """Get league table/leaderboard"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM league_standings
            WHERE total_games > 0
            ORDER BY points DESC, win_rate DESC, total_games DESC
            LIMIT ?
        ''', (limit,))
        
        standings = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return standings
    
    def get_game_type_leaderboard(self, game_type: str, limit: int = 20) -> List[Dict]:
        """Get leaderboard for a specific game type"""
        conn = self.get_connection()
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT ps.*, p.player_name
            FROM player_statistics ps
            JOIN players p ON ps.player_id = p.player_id
            WHERE ps.game_type = ? AND ps.games_played > 0
            ORDER BY ps.win_rate DESC, ps.games_played DESC
            LIMIT ?
        ''', (game_type, limit))
        
        leaderboard = []
        for row in cursor.fetchall():
            leaderboard.append({
                'player_id': row['player_id'],
                'player_name': row['player_name'],
                'games_played': row['games_played'],
                'wins': row['wins'],
                'losses': row['losses'],
                'draws': row['draws'],
                'win_rate': round(row['win_rate'], 1)
            })
        
        conn.close()
        return leaderboard

