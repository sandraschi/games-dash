# Go & Gomoku Implementation Plan

**Date**: 2025-12-03  
**Status**: In Progress

---

## Go (囲碁, Wéiqí, Baduk)

### Game Features
- **Board**: 19×19 (standard), with 13×13 and 9×9 options
- **Rules**: Chinese rules (area scoring)
- **Mechanics**: Stone placement, capture, ko rule, territory counting
- **AI**: Monte Carlo Tree Search (MCTS) or simpler pattern-based AI

### AI Options (Nov 2024 knowledge)
**Best Available**:
- **KataGo** - Strongest open-source Go AI (requires backend)
- **Leela Zero** - Strong neural network engine
- **GnuGo** - Classic, can work in browser with WASM

**For Web Implementation**:
- Simple MCTS with limited simulations
- Pattern-based AI (ladder detection, basic joseki)
- Difficulty levels by limiting search depth

### Education Center Content

**Famous Games**:
1. **AlphaGo vs Lee Sedol - Game 4 (2016)** - "Move 37" - The AI Move
2. **AlphaGo vs Ke Jie - Game 2 (2017)** - Peak of AI dominance
3. **Honinbo Shusaku's Ear-Reddening Game (1846)** - Historic brilliancy
4. **Go Seigen vs Kitani Minoru (1933)** - Shin Fuseki revolution

**Encyclopedia Articles**:
- Rules & Basics (stones, capture, eyes, life & death)
- Territory & Scoring
- Opening Theory (Fuseki patterns)
- Joseki (corner sequences)
- Tesuji (brilliant moves)
- Life & Death problems (Tsumego)
- Ko fighting
- Endgame (Yose)
- History (4000 years in China, Japan, Korea)
- AlphaGo Revolution (2016-2017)

---

## Gomoku (五目並べ, Connect5, Renju)

### Game Features
- **Board**: 15×15 (standard)
- **Rules**: First to 5 in a row wins
- **Variants**: Freestyle (no restrictions), Renju (black has restrictions)
- **AI**: Minimax with alpha-beta pruning

### AI Implementation
**Algorithm**: Minimax with alpha-beta pruning
**Evaluation Function**:
- Count threats (4-in-a-row, 3-in-a-row)
- Detect VCT (Victory by Continuous Threats)
- Pattern recognition (double-three, double-four)

**Difficulty Levels**:
- Easy: Depth 2-3
- Medium: Depth 4-5
- Hard: Depth 6+ with threat detection

### Education Center Content

**Famous Patterns**:
1. **VCT Examples** - Forced win sequences
2. **Double Three Opening** - Classic powerful start
3. **Taraguchi Opening** - Named pattern
4. **Defensive Formations** - How to block threats

**Encyclopedia Articles**:
- Rules & Basics (5-in-a-row, overline rule)
- Renju Rules (forbidden moves for black)
- Opening Theory (first 3 moves)
- VCT (Victory by Continuous Threats)
- VCF (Victory by Continuous Fours)
- Defense Techniques
- Tournament Rules
- History (Japan, Eastern Europe)

---

## Implementation Priority

### Phase 1: Go Game ✅
- 19×19 board with stone placement
- Basic capture mechanics
- Ko rule detection
- Territory counting (simple)
- AI opponent (pattern-based, 3 difficulty levels)

### Phase 2: Go Education 🔄
- 4 famous games with annotations
- Encyclopedia with 8+ articles
- Interactive problems (tsumego)

### Phase 3: Gomoku Game 📝
- 15×15 board
- 5-in-a-row detection
- AI with minimax (3 difficulty levels)
- Renju rule option

### Phase 4: Gomoku Education 📝
- 4 famous patterns/games
- Encyclopedia with opening theory
- VCT examples

---

## Technical Notes

**Go Challenges**:
- Territory counting is complex (implement simplified version)
- Ko rule needs move history tracking
- AI requires significant computation (use web workers)

**Gomoku Challenges**:
- Threat detection needs pattern matching
- Minimax depth must be limited for performance
- VCT detection is computationally expensive

**Solutions**:
- Web Workers for AI calculation
- Simplified rule sets for v1
- Progressive enhancement (add advanced features later)

---

**Total New Games**: 2 (Go, Gomoku)  
**Total New Education Centers**: 2  
**Grand Total**: 18 games with education!

---

**Created by**: Sandra Schipal  
**Location**: Vienna, Austria  
**Date**: 2025-12-03

