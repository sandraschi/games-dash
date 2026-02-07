# 🎮 Multiplayer Game Server

The **Multiplayer Game Server** is the real-time communication hub for the Games Collection, enabling players to compete against each other or AI agents across the network.

## 🚀 Features

-   **Real-Time Communication**: Powered by WebSockets for instant game moves and chat.
-   **Statistics API**: HTTP endpoints for retrieving league tables and player stats.
-   **Remote Access**: Built-in [Tailscale](https://tailscale.com) integration for seamless remote play without port forwarding.
-   **Persistence**: SQLite database (`data/multiplayer.db`) for storing games, users, and ELO ratings.
-   **Robustness**: Error logging, automatic recovery, and strict input validation.

## 🛠️ Technical Details

| Service | Port | Description |
| :--- | :--- | :--- |
| **WebSocket** | `11877` | Main game communication channel. |
| **HTTP API** | `11878` | REST API for statistics (`/api/league`). |

> **Note**: The HTTP API port is always `WebSocket Port + 1`.

### Environment Variables

-   `AI_MULTIPLAYER_PORT`: Set the base WebSocket port (Default: `11877`).
-   `TAILSCALE_IP`: (Optional) Manually override Tailscale IP detection.

## 📦 Requirements

-   Python 3.11+
-   Dependencies:
    -   `aiohttp`
    -   `aiohttp_cors`
    -   `websockets`

## 🏃‍♂️ Running the Server

From the root directory of the repository:

```bash
# 1. Install dependencies (if not already done)
pip install -e .

# 2. Start the server
python backend/multiplayer-server.py
```

## 🔌 API Endpoints

### HTTP (`http://localhost:11878`)

-   `GET /api/league`: Returns the top 100 players ranked by ELO.
-   `GET /api/public_games`: Returns a list of active public games.

### WebSocket (`ws://localhost:11877`)

-   Connect to `/ws` to start a session.
-   Protocol details are documented in `docs/mcp/GAMES_MCP.md`.
