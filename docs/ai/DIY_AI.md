# 🛠️ DIY AI & Heuristic Engines

While Chess, Shogi, and Go use world-class binary engines, many of our other games use custom "DIY" AI implementations written in Python or highly optimized JavaScript.

---

## 🧠 Minimax & Strategic Engines

### 🔵 Connect Four & Gomoku
- **Algorithm**: Minimax with Alpha-Beta Pruning.
- **Depth**: Varies per device (8-12 on desktop, 4-6 on mobile).
- **Heuristics**: Positional weighting (center columns prioritizing) and threat detection (3-in-a-row blockers).

### ⬛ Reversi (Othello)
- **Algorithm**: Strategic Evaluation Matrix.
- **Focus**: Corner control, edge stability, and mobility limitation.
- **Dynamic Play**: Switches from "greedy" count-matching to "territorial" corner focus as the game progresses.

---

## 🧩 Procedural Game Solvers

### 🚗 Car Park Puzzle
- **Algorithm**: Breadth-First Search (BFS).
- **Capability**: Guarantees the shortest possible path to the exit.
- **Real-time**: Solves on-demand and can play back the solution visually.

### 🗺️ Maze Generators & Solvers
- **Generation**: Recursive Backtracking / Prim's Algorithm.
- **Solving**: A* Search with Manhattan distance heuristics.

---

## 📜 Unified AI Philosophy: "Real or None"
In our board games, we've removed "Random Move" fallbacks. 
- If the AI engine is unavailable, the user is notified. 
- We prioritize **Materialist Verification**: We'd rather the game tell you the engine is disconnected than play a nonsensical random move.

---

## 🔧 Developing New DIY Engines
All new DIY engines are built using the `BaseGame` JS class or the Python backend framework, ensuring:
1. **Persistent State**: Games survive refreshes.
2. **Standard Interfaces**: Compatible with the Games MCP server.
3. **Optimized I/O**: Efficient communication between the UI and the backend.
