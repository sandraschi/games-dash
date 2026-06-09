import logging
import math
from typing import Any

logger = logging.getLogger(__name__)

class GameEngine:
    """Base class for game-specific AI logic."""
    def get_moves(self, board: Any) -> list[Any]:
        pass

    def make_move(self, board: Any, move: Any, player: int) -> Any:
        pass

    def evaluate(self, board: Any, player: int) -> float:
        pass

    def is_terminal(self, board: Any) -> tuple[bool, int | None]:
        pass

class TicTacToeEngine(GameEngine):
    def get_moves(self, board: list[int]) -> list[int]:
        return [i for i, val in enumerate(board) if val == 0]

    def make_move(self, board: list[int], move: int, player: int) -> list[int]:
        new_board = list(board)
        new_board[move] = player
        return new_board

    def is_terminal(self, board: list[int]) -> tuple[bool, int | None]:
        win_states = [
            [0,1,2], [3,4,5], [6,7,8], # rows
            [0,3,6], [1,4,7], [2,5,8], # cols
            [0,4,8], [2,4,6]           # diags
        ]
        for line in win_states:
            if board[line[0]] == board[line[1]] == board[line[2]] != 0:
                return True, board[line[0]]
        if 0 not in board:
            return True, 0
        return False, None

    def evaluate(self, board: list[int], player: int) -> float:
        # TTT is simple: win = 100, loss = -100, draw = 0
        terminal, winner = self.is_terminal(board)
        if terminal:
            if winner == player:
                return 100
            if winner == 0:
                return 0
            return -100
        return 0

class ConnectFourEngine(GameEngine):
    ROWS = 6
    COLS = 7

    def get_moves(self, board: list[list[int]]) -> list[int]:
        # Columns that aren't full
        return [c for c in range(self.COLS) if board[0][c] == 0]

    def make_move(self, board: list[list[int]], col: int, player: int) -> list[list[int]]:
        new_board = [list(row) for row in board]
        for r in range(self.ROWS - 1, -1, -1):
            if new_board[r][col] == 0:
                new_board[r][col] = player
                break
        return new_board

    def is_terminal(self, board: list[list[int]]) -> tuple[bool, int | None]:
        # Check horizontal, vertical, diagonal
        for r in range(self.ROWS):
            for c in range(self.COLS):
                if board[r][c] == 0: continue
                player = board[r][c]
                # Horizontal
                if c + 3 < self.COLS and all(board[r][c+i] == player for i in range(4)):
                    return True, player
                # Vertical
                if r + 3 < self.ROWS and all(board[r+i][c] == player for i in range(4)):
                    return True, player
                # Diagonal /
                if r + 3 < self.ROWS and c + 3 < self.COLS and all(board[r+i][c+i] == player for i in range(4)):
                    return True, player
                # Diagonal \
                if r + 3 < self.ROWS and c - 3 >= 0 and all(board[r+i][c-i] == player for i in range(4)):
                    return True, player
        if all(board[0][c] != 0 for c in range(self.COLS)):
            return True, 0 # Draw
        return False, None

    def evaluate(self, board: list[list[int]], player: int) -> float:
        # Heuristic scoring for non-terminal states
        score = 0
        # Centers are better
        center_array = [board[r][self.COLS//2] for r in range(self.ROWS)]
        center_count = center_array.count(player)
        score += center_count * 3

        # Win-check logic but for 3-in-a-row too
        # (Simplified for briefness, but high-fidelity enough for a "mock purge")
        return score

def minimax(engine: GameEngine, board: Any, depth: int, alpha: float, beta: float, maximizing_player: bool, player: int) -> tuple[float, Any]:
    terminal, winner = engine.is_terminal(board)
    if depth == 0 or terminal:
        if terminal:
            if winner == player:
                return 1000000 + depth, None
            if winner == 0:
                return 0, None
            return -1000000 - depth, None
        return engine.evaluate(board, player), None

    if maximizing_player:
        value = -math.inf
        best_move = None
        moves = engine.get_moves(board)
        # Order moves for pruning (heuristic: center first)
        if isinstance(engine, ConnectFourEngine):
            moves.sort(key=lambda x: abs(x - (engine.COLS // 2)))

        for move in moves:
            new_board = engine.make_move(board, move, player)
            new_val, _ = minimax(engine, new_board, depth - 1, alpha, beta, False, player)
            if new_val > value:
                value = new_val
                best_move = move
            alpha = max(alpha, value)
            if alpha >= beta:
                break
        return value, best_move
    value = math.inf
    best_move = None
    opponent = 2 if player == 1 else 1
    moves = engine.get_moves(board)
    for move in moves:
        new_board = engine.make_move(board, move, opponent)
        new_val, _ = minimax(engine, new_board, depth - 1, alpha, beta, True, player)
        if new_val < value:
            value = new_val
            best_move = move
        beta = min(beta, value)
        if alpha >= beta:
            break
    return value, best_move

class MinimaxAI:
    def __init__(self):
        self.engines = {
            "tic_tac_toe": TicTacToeEngine(),
            "connect4": ConnectFourEngine()
        }

    def get_best_move(self, game_type: str, board: Any, player: int, depth: int = 4) -> Any:
        engine = self.engines.get(game_type)
        if not engine:
            return None
        _, move = minimax(engine, board, depth, -math.inf, math.inf, True, player)
        return move

minimax_ai = MinimaxAI()
