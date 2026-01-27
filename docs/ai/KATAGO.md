# ⚪ KataGo AI Integration

KataGo is a state-of-the-art Go (Weiqi/Baduk) AI that rivals or exceeds AlphaGo Zero levels of play.

---

## 🛠️ Technical Specifications
- **Port**: `10002` (Mapping to host `9545`)
- **Protocol**: HTTP/REST -> GTP (Go Text Protocol)
- **Engine**: KataGo native binary.
- **Backend**: `backend/go-server.py` (FastAPI/Aiohttp)

---

## 🎯 Engine Capabilities
- **Board Sizes**: Full support for `9x9`, `13x13`, and `19x19`.
- **Komi**: Configurable (Default: 7.5).
- **Strength**: Professional/God-level (~5000 ELO).

---

## 🚀 Implementation Details

### GTP Bridge
The Python backend manages a long-running KataGo process in `gtp` mode. It translates standard HTTP REST requests into the following GTP command sequence:
1. `boardsize [n]`
2. `clear_board`
3. `komi [k]`
4. `play [move1]`, `play [move2]`, ...
5. `genmove [color]`

### AI Caching
Like our other engines, KataGo results are cached by the MCP layer and the backend to ensure instant replay of known positions.

---

## 🔌 API Usage

### `POST /api/move`
Request the best move for a given sequence.

**Request Body:**
```json
{
  "board_size": 19,
  "moves": ["B16", "D4", "Q16"],
  "komi": 7.5
}
```

**Successful Response:**
```json
{
  "success": true,
  "move": "D16",
  "engine": "KataGo",
  "strength": "AlphaGo Level (~5000 ELO)"
}
```
