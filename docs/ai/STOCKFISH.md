# ♟️ Stockfish AI Integration

Stockfish 16 is the world's strongest open-source chess engine (~3500 ELO). This project uses the full C++ native binary for maximum performance, served via an asynchronous Python bridge.

---

## 🛠️ Technical Specifications
- **Port**: `10001` (Mapping to host `9543`)
- **Protocol**: HTTP/REST -> UCI (Universal Chess Interface)
- **Engine**: Stockfish 16 x64 AVX2 native binary.
- **Backend**: `backend/stockfish-server.py` (FastAPI/Aiohttp)

---

## 🚀 Optimized Engine Settings
To ensure high responsiveness for web and MCP clients, we use the following UCI defaults:
- **Threads**: `1` (Ensures low overhead for concurrent users)
- **Hash**: `16 MB` (Memory efficient)
- **Ponder**: `false` (Disabled to save CPU cycles)
- **Skill Level**: Configurable `1-20`.

---

## ⚡ Performance Features

### 1. Intelligent Caching
The backend implements a request-level cache. If the same FEN position and skill level are requested within a short window, the engine returns the result instantly without re-calculating.

### 2. Token-Bucket Rate Limiting
To prevent CPU exhaustion from multiple concurrent users:
- **Max Concurrent Users**: `3`
- **Refill Rate**: `1.0 tokens/sec`
- **Bucket Size**: `5`

### 3. Resilience & Self-Healing
- **Auto-Restart**: The server monitors the Stockfish process and restarts it if it crashes.
- **Port Conflict Management**: Automatically detects if the port is in use and attempts to clear the process before starting.

---

## 🔌 API Usage

### `POST /api/move`
Request a move suggestion.

**Request Body:**
```json
{
  "fen": "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  "skill": 20,
  "depth": 15,
  "movetime": 1000
}
```

**Successful Response:**
```json
{
  "success": true,
  "move": "e2e4",
  "engine": "Stockfish 16 (Full C++ Version)",
  "elo": "~3500"
}
```
