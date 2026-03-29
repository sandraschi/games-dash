import random
import logging
from typing import List, Tuple, Optional, Any, Dict

logger = logging.getLogger(__name__)

class BattleshipAI:
    """Heuristic Battleship AI: Hunter-Killer Strategy."""
    
    def get_move(self, board: List[List[int]]) -> Tuple[int, int]:
        """
        board: 10x10 matrix. 
        0 = unknown, 1 = miss, 2 = hit, 3 = sunk
        """
        # Killer mode: if there are hits (2) that aren't sunk (3), target their neighbors
        for r in range(10):
            for c in range(10):
                if board[r][c] == 2:
                    # Check neighbors
                    for dr, dc in [(0, 1), (0, -1), (1, 0), (-1, 0)]:
                        nr, nc = r + dr, c + dc
                        if 0 <= nr < 10 and 0 <= nc < 10 and board[nr][nc] == 0:
                            return nr, nc
                            
        # Hunter mode: Parity search (checkerboard)
        # We target every second cell to find ships faster (minimum 2-cell ships)
        parity_cells = [(r, c) for r in range(10) for c in range(10) 
                        if board[r][c] == 0 and (r + c) % 2 == 0]
        if parity_cells:
            return random.choice(parity_cells)
            
        # Fallback: any unknown cell
        unknown_cells = [(r, c) for r in range(10) for c in range(10) if board[r][c] == 0]
        if unknown_cells:
            return random.choice(unknown_cells)
            
        return 0, 0

class ScrabbleAI:
    """Simplified Scrabble AI: Dictionary Word Finder."""
    
    def __init__(self, dictionary_path: Optional[str] = None):
        # We'll use a very small built-in list for now, 
        # but could load a larger one if available on disk.
        self.words = ["APPLE", "BANANA", "CHERRY", "DATE", "ELDERBERRY", "FIG", "GRAPE"]
        
    def get_best_move(self, rack: str, board: Any) -> Dict[str, Any]:
        """Find the highest scoring word from the rack that fits the board."""
        # This is a placeholder for a real Scrabble engine (e.g., using a GADDAG)
        # For the "Mock Purge" in MCP, we'll return a valid move from the rack.
        rack_chars = list(rack.upper())
        for word in sorted(self.words, key=len, reverse=True):
            temp_rack = list(rack_chars)
            possible = True
            for char in word:
                if char in temp_rack:
                    temp_rack.remove(char)
                else:
                    possible = False
                    break
            if possible:
                return {"word": word, "score": len(word) * 2}
        return {"word": "", "score": 0}

battleship_ai = BattleshipAI()
scrabble_ai = ScrabbleAI()
