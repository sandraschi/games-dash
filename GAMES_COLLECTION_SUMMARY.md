# Games Collection - Complete Summary

**Last Updated**: 2025-12-02 (v1.3.4 - Rubik's Cube Variety Switching)

## Overview

**Total Games**: 72 games across 11 categories  
**AI Engines**: 4 (Stockfish 16, YaneuraOu v9.10, KataGo v1.15.3, Minimax algorithms)  
**3D Graphics**: Yes (3D Chess, Rubik's Cube)  
**Multiplayer**: WebSocket server + Firebase support

---

## Games by Category

### ♟️ Board Games (25 games - All with AI!)

1. **Chess** - Stockfish 16 AI (~3500 ELO)
2. **3D Chess** - Beautiful 3D board!
3. **Shogi** - YaneuraOu AI (World Champ)
4. **Go** - KataGo AI (AlphaGo Level)
5. **Gomoku** - Five in a row
6. **Checkers** - Solved game AI
7. **Connect Four** - Four in a row
8. **Mühle** - Nine Men's Morris
9. **Ludo** - Race to the finish!
10. **Mensch ärgere dich nicht!** - German childhood classic!
11. **Snakes & Ladders** - Climb up, slide down!
12. **Monopoly** - Buy properties, get rich!
13. **Risk** - World domination!
14. **Battleship** - Naval combat
15. **Clue** - Solve the mystery!
16. **Settlers of Catan** - Resource management
17. **Ticket to Ride** - Train route building
18. **Carcassonne** - Tile placement
19. **Hnefatafl** - Viking strategy
20. **Senet** - Ancient Egyptian
21. **Mancala** - African strategy
22. **Xiangqi** - Chinese Chess
23. **Royal Game of Ur** - Ancient Mesopotamia

### 👾 Arcade Games (18 games)

1. **Snake** - Eat and grow
2. **Tetris** - Stack blocks
3. **Breakout** - Break the bricks
4. **Pong** - Classic paddle game
5. **Pac-Man** - Eat dots, avoid ghosts
6. **Frogger** - Cross traffic & river
7. **Q*bert** - Change cube colors
8. **Asteroids** - Shoot space rocks
9. **Space Invaders** - Classic alien shooter
10. **Galaga** - Formation flying shooter
11. **Centipede** - Bug shooter with mushrooms
12. **Missile Command** - Defend your cities
13. **Dig Dug** - Underground digging
14. **Defender** - Side-scrolling shooter
15. **Joust** - Flying combat
16. **Donkey Kong** - Classic platformer
17. **Tempest** - Tube shooter
18. **Robotron 2084** - Twin-stick shooter

### 🧩 Puzzle & Word Games (8 games)

1. **Sudoku** - Number logic puzzle
2. **Word Search** - 3 difficulty levels
3. **Scrabble** - Word game with AI
4. **Crossword** - EN/JP + Import!
5. **Pentomino** - 12-piece tile puzzle
6. **Dominoes** - Classic tile game
7. **Memory** - Match pairs!
8. **Rubik's Cube** - 3D + Auto-Solver! (2×2, 3×3, 4×4, 5×5 with reduction method solvers)

### 🧮 Math Puzzles (2 games)

1. **KenKen** - Math logic cages
2. **24 Game** - Make 24 from 4 numbers!

### 🎲 Dice Games (3 games)

1. **Yahtzee** - Classic dice combinations
2. **Craps** - Casino dice game
3. **Cho-Han Bakuchi** - Japanese dice game

### 🇯🇵 Japanese Learning Games (5 games)

1. **Mahjong** - Japanese tile game
2. **Hanafuda** - Japanese flower cards
3. **四字熟語 (Yojijukugo)** - 4-character idioms
4. **かるた (Karuta)** - Speed card matching!
5. **漢字 Stroke Order** - Learn to write kanji!

### 🃏 Card Games (4 games)

1. **Texas Hold'em** - Poker classic
2. **Contract Bridge** - The ultimate card game
3. **Old Maid** - Don't get stuck!
4. **Schnapsen** - Austrian card classic!

### 👅 Party Games (3 games)

1. **Tongue Twister** - Multilingual chaos!
2. **Text Adventure** - Twisty passages!
3. **Pub Quiz** - Trivia challenge (Easy to Insane!)

### 🕹️ Classic Adventures (1 game)

1. **ScummVM Launcher** - LucasArts, Sierra, and more! (4 FREE games included)

### 🪟 Windows Classic Games (6 games)

*Killing productivity since 1990!*

1. **Solitaire** - Klondike Classic
2. **Minesweeper** - Find the mines!
3. **FreeCell** - All games winnable
4. **Spider Solitaire** - 1, 2, or 4 suits
5. **Hearts** - Avoid the queen!
6. **Gem Cascade** - Match-3 (ADDICTIVE!)

### ⏰ Modern Timewasters (0 games currently)

*Category placeholder for future additions*

---

## AI Engines

### Chess
- **Stockfish 16** (~3500 ELO)
- Port: 9543
- Server: `stockfish-server.py`

### Shogi
- **YaneuraOu v9.10** (World Champion level)
- Port: 9544
- Server: `shogi-server.py`

### Go
- **KataGo v1.15.3** (AlphaGo level)
- Port: 9545
- Server: `go-server.py`

### Other Games
- **Minimax algorithms** for simpler games (Gomoku, Checkers, Mühle)

---

## Multiplayer Support

### WebSocket Server
- Port: 9877
- Server: `multiplayer-server.py`
- Works on localhost, LAN, and Tailscale VPN
- No database - games reset on server restart
- No statistics tracking

### Firebase
- Internet play support
- See `FIREBASE_SETUP_GUIDE.md` for setup

---

## Special Features

- **3D Graphics**: 3D Chess, Rubik's Cube
- **Education Modes**: Chess, Go, Gomoku, Checkers, Bridge, Catan, Dominoes, FreeCell, Hearts, Mancala, Ludo, Mahjong, Hanafuda, Hnefatafl
- **Japanese Learning**: 5 games for learning Japanese
- **Crossword Import**: Supports .puz and .json files
- **Chess Features**: 
  - Changeable piece sets (Classic/Modern/Emoji)
  - Move sounds for AI opponents
  - Famous games database
  - Opening explorer
  - Endgame studies
  - Blunder analysis
- **Games MCP Server**: Play correspondence chess via Claude/Cursor

---

## File Structure

```
games-app/
├── *.html              # Game pages (72 files)
├── *.js                # Game logic
├── styles.css          # Shared styles
├── data/               # Game data (openings, puzzles, etc.)
│   ├── chess/          # Chess databases
│   ├── go/             # Go databases
│   ├── shogi/          # Shogi databases
│   └── crossword/      # Crossword puzzles
├── stockfish/          # Chess AI engine
├── yaneuraou/          # Shogi AI engine
├── katago/             # Go AI engine
├── *-server.py         # AI backend servers
├── games-mcp/          # MCP server for Claude integration
├── Dockerfile          # Container config
├── docker-compose.yml  # Multi-service orchestration
└── START_EVERYTHING.ps1 # Windows launcher
```

---

## Quick Start

```powershell
cd d:\Dev\repos\games-app
.\START_EVERYTHING.ps1
```

Opens browser at `http://localhost:9876`

---

## Notes

- Built entirely with Cursor IDE's auto-agent in ~4 hours
- No fancy frameworks - vanilla HTML/CSS/JavaScript
- AI backends use asyncio/aiohttp
- Dockerized for easy deployment
- Windows AI engines (Stockfish, YaneuraOu, KataGo are Windows binaries)

---

**Made in ~4 hours. Not changing the world, just playing games.**
