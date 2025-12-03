# 🎌 Shogi AI Implementation Guide

**Date**: 2025-12-03  
**Status**: In Progress

---

## Real Shogi Engines (Official)

### YaneuraOu (やねうら王) - THE BEST! 🏆

**About**:
- World Computer Shogi Champion 2019
- Open source, professional strength
- Equivalent to Stockfish for Chess
- Uses USI (Universal Shogi Interface) protocol

**Download**:
- Official repo: https://github.com/yaneurao/YaneuraOu
- Releases: https://github.com/yaneurao/YaneuraOu/releases
- Latest: v7.6.3+
- Windows binary available

**Setup**:
1. Download Windows binary from releases
2. Extract to `D:\Dev\repos\games-app\yaneuraou\`
3. Run via Python backend (similar to Stockfish setup)
4. Uses USI protocol (usi, isready, position, go, bestmove)

### Alternative: GNU Shogi

**About**:
- Free GNU Project engine
- Simpler, older
- Good for learning/development
- C-based, portable

**Installation**:
```powershell
# Install via package manager
winget search gnushogi
# Or download from: https://www.gnu.org/software/gnushogi/
```

---

## USI Protocol (Universal Shogi Interface)

Similar to UCI (chess), but for Shogi:

**Commands**:
- `usi` - Initialize engine
- `isready` - Check if ready
- `usinewgame` - Start new game
- `position sfen <fen> moves <moves>` - Set position
- `go btime <time> wtime <time>` - Start thinking
- `bestmove <move>` - Engine response

**SFEN Format** (Shogi FEN):
Similar to chess FEN but 9x9 board with Shogi pieces

---

## Current Implementation

### ✅ Basic Heuristic AI (Implemented)
- Evaluates all moves
- Scores based on:
  - Captures (piece value)
  - Promotions
  - Center control
  - Forward progress
- 5 difficulty levels

**Strength**: ~1200-1600 ELO equivalent

### 🎯 Target: YaneuraOu Integration

**Architecture** (Same as Stockfish):
```
Frontend (JavaScript)
    ↓ HTTP
Python Backend (shogi-server.py)
    ↓ USI Protocol
YaneuraOu Binary
```

**Ports**:
- Frontend: 9876
- Shogi Backend: 9544 (different from Stockfish 9543)

---

## Implementation Plan

### Phase 1: Basic AI ✅
- Heuristic-based move evaluation
- Working but not professional level

### Phase 2: YaneuraOu Integration (To Do)
1. Download YaneuraOu binary
2. Create `shogi-server.py` (analogous to stockfish-server.py)
3. Implement USI protocol communication
4. Connect frontend to backend
5. Add difficulty levels (1-20)

### Phase 3: Enhanced Features (Optional)
- Opening book
- Endgame databases
- Position analysis
- Game review

---

## Alternative: Use Existing Services

### Lishogi API
- Free online Shogi
- Has AI analysis
- Could integrate as external service

### Shogi Wars API
- Popular Japanese platform
- May have API access
- Commercial service

---

## Current Status

**What Works**:
- ✅ Shogi game with capture and drops
- ✅ Basic heuristic AI (5 levels)
- ✅ Education center with famous games
- ✅ Complete rules encyclopedia

**What's Needed for Pro-Level AI**:
- Download YaneuraOu binary
- Create Python backend server
- Implement USI protocol
- Connect frontend

---

## Quick Comparison

| Feature | Current AI | YaneuraOu |
|---------|-----------|-----------|
| Strength | ~1400 ELO | ~3000+ ELO |
| Type | Heuristic | Neural Net + Search |
| Speed | Instant | 0.1-5 seconds |
| Protocol | Direct JS | USI via backend |
| Download | None | ~50MB |

---

## Recommendation

**For Now**: Current heuristic AI is playable and fun!

**For Pro-Level**: 
1. Download YaneuraOu manually from GitHub
2. Implement backend server
3. Connect via USI protocol

**Easiest Path**:
Use GNU Shogi (lighter, easier to install):
```powershell
# Install via MinGW or WSL
# Or download pre-compiled binary
```

---

**Created by**: Sandra Schipal  
**Location**: Vienna, Austria  
**Status**: Basic AI working, professional engine documented!

