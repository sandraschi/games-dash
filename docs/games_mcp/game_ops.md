# Game Operations & State Management

Documentation for recording moves, managing games, and correspondence play.

## Move Recording (`make_move`)

This is the primary tool for correspondence play. It consolidates move recording, validation, and state updates.

- **Standard Notation**:
  - Chess: 'e2e4', 'Nf3', 'O-O' (castling), 'e7e8q' (promotion)
  - Shogi: '7g7f', 'B*5e' (drop)
  - Go: 'A1', 'K10', 'pass'
- **Context**: Use this when recording moves from a physical board. The tool stores the position and updates the database automatically.

## AI Moves (`get_ai_move`)

Once a move is recorded, use this to generate a response from the engine.
- Supports Chess (Stockfish), Shogi, and Go.
- Adjustable parameters for `skill_level` and `depth`.

## Game State Management

- `new_game`: Initializes a new game with a unique ID and type.
- `get_game_state`: Retrieves the current position and move history.
- `get_player_statistics`: Provides Elo ratings and win/loss records.

## Automated Notes

- `create_analysis_note`: Automatically summarizes the current game state and analysis into an ADN note for long-term study.
