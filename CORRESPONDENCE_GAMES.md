# Correspondence Games via MCP

## Overview

These games can be played via correspondence using the Games MCP Server, perfect for playing with a physical board while away from your computer!

## ✅ Fully Supported (AI Engine Backend)

These games have dedicated AI engines and full MCP support:

### 1. **Chess** ⭐ Best for Correspondence
- **Move format**: `e2e4`, `Nf3`, `O-O` (castling), `e7e8q` (promotion)
- **AI**: Stockfish 16 (~3500 ELO)
- **Perfect for**: Physical board play, analysis, learning
- **Example**: "I moved rook from e1 to e4" → Claude records → Stockfish suggests response

### 2. **Shogi** (Japanese Chess)
- **Move format**: `7g7f`, `B*5e` (drop notation)
- **AI**: YaneuraOu (World Champion 2019)
- **Perfect for**: Japanese chess enthusiasts

### 3. **Go**
- **Move format**: `A1`, `K10`, `pass`
- **AI**: KataGo (AlphaGo-level)
- **Perfect for**: Strategic depth, long games

## 📝 Move Recording Supported (AI via Web Interface)

These games can record moves via MCP, but AI analysis requires the web interface (can add Python minimax backends later):

### 4. **Gomoku** (5 in a Row)
- **Move format**: `row,col` (e.g., `7,7`)
- **Board**: 15x15 grid
- **Perfect for**: Quick games, pattern recognition
- **Example**: "I placed black at row 7, column 7"

### 5. **Checkers**
- **Move format**: `from_row,col to to_row,col` (e.g., `5,2 to 4,3`)
- **Board**: 8x8 (dark squares only)
- **Perfect for**: Classic strategy
- **Example**: "I moved from row 5, column 2 to row 4, column 3"

### 6. **Connect Four**
- **Move format**: Column number `0-6` (e.g., `3`)
- **Board**: 6 rows × 7 columns
- **Perfect for**: Quick games, vertical thinking
- **Example**: "I dropped a piece in column 3"

### 7. **Mühle** (Nine Men's Morris)
- **Move format**: Position index `0-23`
- **Board**: 24 positions (3 concentric squares)
- **Perfect for**: Ancient strategy game
- **Example**: "I placed at position 5"

### 8. **Battleship**
- **Move format**: `A5` or `row,col` (e.g., `0,4`)
- **Board**: 10×10 grid
- **Perfect for**: Hidden information, deduction
- **Example**: "I shot at A5" → "Hit!" or "Miss!"

### 9. **Scrabble**
- **Move format**: `WORD at POSITION direction` (e.g., `HELLO at H8 horizontal`)
- **Board**: 15×15 grid with premium squares
- **Perfect for**: Word games, vocabulary building
- **Example**: "I played HELLO at H8 going horizontal"

## 🎯 Best Games for Correspondence

**Top Recommendations:**

1. **Chess** ⭐⭐⭐⭐⭐
   - Full Stockfish integration
   - Standard notation
   - Perfect for analysis and learning

2. **Go** ⭐⭐⭐⭐⭐
   - KataGo engine
   - Deep strategic play
   - Great for long correspondence games

3. **Gomoku** ⭐⭐⭐⭐
   - Simple notation (row,col)
   - Quick games
   - Easy to visualize

4. **Battleship** ⭐⭐⭐⭐
   - Simple coordinates
   - Fun deduction game
   - Works great via text

5. **Shogi** ⭐⭐⭐
   - Full engine support
   - More complex than chess
   - Great for Japanese game enthusiasts

## ❌ Not Suitable for Correspondence

These games don't work well for correspondence play:

- **Real-time games**: Snake, Tetris, **Pong** 😂, Pac-Man, Breakout
  - *"I hit the ball to the left side, now you hit it back in 3 days..."* - Not how Pong works!
- **Single-player puzzles**: Sudoku, Word Search, Crossword
- **Dice-based**: Yahtzee, Craps, Cho-Han
- **Complex board games**: Monopoly, Risk (too much state to track)
- **Card games with hidden hands**: Poker, Bridge (would need complex state management)

**Special mention**: Correspondence Pong would be like playing tennis by mail - technically possible but defeats the entire purpose of the game! 🎾📮

## Usage Examples

### Chess Correspondence
```
You: I'm playing correspondence chess. I moved e2e4.

Claude: [Records move] Move recorded! Let me get Stockfish's response...
[Gets AI move] Stockfish suggests e7e5. The position is equal (+0.1).

You: I played e7e5.

Claude: [Records move] Good! Stockfish suggests Nf3...
```

### Gomoku Correspondence
```
You: I'm playing Gomoku. I placed black at row 7, column 7.

Claude: [Records move] Move recorded! The AI suggests row 8, column 7.
This creates a threat in the vertical direction.

You: I placed white at row 6, column 7 to block.

Claude: [Records move] Good defensive move! AI suggests...
```

### Battleship Correspondence
```
You: I shot at A5.

Claude: [Records shot] Checking... Miss! AI shoots at B3 - Hit! 
You have a ship there. Which ship was hit?

You: It was my Destroyer. I shot at C7.

Claude: [Records shot] Hit! You hit the AI's Cruiser...
```

## Future Enhancements

- Python minimax backends for Gomoku, Checkers, Connect Four, Mühle
- Full AI analysis for all correspondence games
- Game replay and analysis
- Integration with multiplayer database
- Voice input support

## See Also

- `GAMES_MCP_README.md` - Quick start guide
- `games-mcp/README.md` - Full MCP server documentation

