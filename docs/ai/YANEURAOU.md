# ⚔️ YaneuraOu AI Integration

YaneuraOu (やねうら王) is a world-champion Shogi engine. This integration provides access to the "Deep" neural network versions for super-human level analysis.

---

## 🛠️ Technical Specifications
- **Port**: `10003` (Mapping to host `9544`)
- **Protocol**: HTTP/REST -> USI (Universal Shogi Interface)
- **Engine**: YaneuraOu Deep/gcc native binary.
- **Backend**: `backend/shogi-server.py` (FastAPI/Aiohttp)

---

## 🎯 Engine Capabilities
- **Strength**: World Champion Level (2019+ standard).
- **Format**: Full support for SFEN (Shogi Forsyth-Edwards Notation).
- **Search**: Time-controlled search or fixed depth.

---

## 🚀 Key Features

### USI Implementation
The server translates REST requests into the USI protocol commands required by YaneuraOu:
- `usi` / `usiok` (initialization)
- `position sfen [sfen]`
- `go btime [ms] wtime [ms]`

### Rate Limiting & Safety
To manage the heavy CPU requirements of deep search:
- **Concurrency**: Limited to `3` active searches.
- **Suppression**: Noisy connection errors are suppressed to prevent log-bloat on Windows.

---

## 🔌 API Usage

### `POST /api/move`
Request the best shogi move.

**Request Body:**
```json
{
  "sfen": "lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1",
  "skill": 5,
  "btime": 1000,
  "wtime": 1000
}
```

**Successful Response:**
```json
{
  "success": true,
  "move": "7g7f",
  "engine": "YaneuraOu v9.10 (ふかうら王)",
  "strength": "World Champion Level"
}
```
