# Games Collection

Arcade, board, card, casino, puzzle, strategy, and multiplayer — 150+ browser games running locally with real AI opponents.

## Categories

| Category | Count | Examples |
|----------|-------|---------|
| Board games | 23 | Chess (Stockfish AI), Go (KataGo), Shogi (YaneuraOu), Checkers, Backgammon, Xiangqi |
| Arcade | 19 | Snake, Tetris, Pac-Man, Pong, Space Invaders, Frogger, Asteroids |
| Card games | 14 | Poker, Blackjack, Bridge, Rummy, Solitaire, Hearts, Schnapsen, Tarock, Skat |
| Puzzle & word | 14 | Sudoku, Crossword, Scrabble, Rubik's Cube, Word Search, Pentomino |
| Casino | 4 | Roulette, Baccarat, Craps |
| Dice | 2 | Yahtzee, Cho-Han |
| Strategy | 10 | Monopoly, Risk, Catan, Carcassonne |
| Multiplayer | P2P | Firebase-synced sessions for global play |
| Japanese learning | 15+ | See [README_JAPANESE.md](README_JAPANESE.md) |

## AI Opponents

| Game | Engine | Strength | Port |
|------|--------|----------|------|
| Chess | Stockfish 16 | 3500+ Elo | 10001 |
| Go | KataGo | Professional | 10002 |
| Shogi | YaneuraOu | World champion | 10003 |

Engines run locally as HTTP servers — no cloud dependency. Set difficulty level from the game page.

## Unusual Games

Games you won't find in every collection:
- **Tri-Dimensional Chess** — Star Trek-style 7-board logic with Three.js
- **3D Chess** — Three.js rendered board
- **Hanafuda** — Japanese flower cards (52 cards, 12 suits)
- **Schnapsen** — Austrian 2-player card classic
- **Cho-Han Bakuchi** — Japanese dice game
- **Hnefatafl** — Viking strategy board game
- **Senet** — Ancient Egyptian board game
- **Royal Game of Ur** — Ancient Mesopotamia
- **Mancala** — African strategy game
- **Tarock** — Austrian national card game

## How to Play

All games open in your browser. Start the gateway:

```powershell
.\start.ps1
# Opens http://localhost:10987/
```

Click any game card to play. AI opponents are available for chess, Go, shogi, and checkers.
