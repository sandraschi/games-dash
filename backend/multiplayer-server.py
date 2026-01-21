#!/usr/bin/env python3
"""
Simple WebSocket Multiplayer Server for Chess Games
No external services required - self-contained!
**Timestamp**: 2025-12-04
"""

import asyncio
import websockets
import json
import uuid
import sys
import socket
from datetime import datetime
from aiohttp import web
import aiohttp_cors

# Import database module
try:
    from multiplayer_db import MultiplayerDB

    db = MultiplayerDB()
    print("[OK] Database module loaded successfully")
except ImportError:
    # Fallback if module not found
    MultiplayerDB = None
    db = None
    print(
        "[WARN]  Warning: multiplayer_db module not found. Database features disabled."
    )
except Exception as e:
    # Other errors (e.g., database file issues)
    MultiplayerDB = None
    db = None
    print(
        f"[WARN]  Warning: Database initialization failed: {e}. Database features disabled."
    )

# Game state storage (in-memory for active games)
games = {}  # game_id -> game_state
players = {}  # player_id -> {name, websocket, game_id}
waiting_players = []  # List of player_ids waiting for a match


class GameState:
    def __init__(self, game_id, player1_id, player2_id, game_type="chess"):
        self.game_id = game_id
        self.player1_id = player1_id
        self.player2_id = player2_id
        self.game_type = game_type
        self.current_turn = player1_id
        self.board_state = None
        self.move_history = []
        self.created_at = datetime.now().isoformat()
        self.status = "active"  # active, finished, abandoned


async def register_player(websocket, player_name):
    """Register a new player"""
    player_id = str(uuid.uuid4())[:8]

    # Get or create player in database
    if db:
        try:
            db.get_or_create_player(player_id, player_name)
        except Exception:
            pass  # Continue without database

    players[player_id] = {
        "id": player_id,
        "name": player_name,
        "websocket": websocket,
        "game_id": None,
        "connected_at": datetime.now().isoformat(),
        "game_started_at": None,  # Track when current game started
    }
    return player_id


async def find_or_create_game(player_id, game_type="chess"):
    """Find an available game or create a new one"""
    # Check if player is already in a game
    if players[player_id]["game_id"]:
        return players[player_id]["game_id"]

    # Look for waiting players
    for waiting_id in waiting_players:
        if waiting_id != player_id and waiting_id in players:
            # Found a match!
            waiting_players.remove(waiting_id)
            game_id = str(uuid.uuid4())[:8]
            started_at = datetime.now().isoformat()
            game = GameState(game_id, waiting_id, player_id, game_type)
            game.started_at = started_at
            games[game_id] = game
            players[waiting_id]["game_id"] = game_id
            players[waiting_id]["game_started_at"] = started_at
            players[player_id]["game_id"] = game_id
            players[player_id]["game_started_at"] = started_at
            return game_id

    # No match found, add to waiting list
    waiting_players.append(player_id)
    return None


async def handle_message(websocket, message, player_id):
    """Handle incoming messages from clients"""
    try:
        data = json.loads(message)
        msg_type = data.get("type")

        if msg_type == "join":
            # Player wants to join/create a game
            game_type = data.get("game_type", "chess")
            game_id = await find_or_create_game(player_id, game_type)

            if game_id:
                # Game found or created
                game = games[game_id]
                opponent_id = (
                    game.player2_id if game.player1_id == player_id else game.player1_id
                )
                opponent = players[opponent_id]

                # Notify both players
                await send_to_player(
                    player_id,
                    {
                        "type": "game_started",
                        "game_id": game_id,
                        "game_type": game_type,
                        "opponent": opponent["name"],
                        "opponent_id": opponent_id,
                        "your_color": "white"
                        if game.player1_id == player_id
                        else "black",
                        "your_turn": game.current_turn == player_id,
                    },
                )

                await send_to_player(
                    opponent_id,
                    {
                        "type": "game_started",
                        "game_id": game_id,
                        "game_type": game_type,
                        "opponent": players[player_id]["name"],
                        "opponent_id": player_id,
                        "your_color": "black"
                        if game.player1_id == player_id
                        else "white",
                        "your_turn": game.current_turn == opponent_id,
                    },
                )
            else:
                # Waiting for opponent
                await send_to_player(
                    player_id, {"type": "waiting", "message": "Waiting for opponent..."}
                )

        elif msg_type == "move":
            # Player made a move
            game_id = data.get("game_id")
            move = data.get("move")

            if not game_id or game_id not in games:
                await send_to_player(
                    player_id, {"type": "error", "message": "Invalid game ID"}
                )
                return

            game = games[game_id]

            # Verify it's player's turn
            if game.current_turn != player_id:
                await send_to_player(
                    player_id, {"type": "error", "message": "Not your turn!"}
                )
                return

            # Add move to history
            game.move_history.append(
                {
                    "player_id": player_id,
                    "move": move,
                    "timestamp": datetime.now().isoformat(),
                }
            )

            # Switch turn
            game.current_turn = (
                game.player2_id
                if game.current_turn == game.player1_id
                else game.player1_id
            )

            # Notify both players
            opponent_id = (
                game.player2_id if game.player1_id == player_id else game.player1_id
            )

            await send_to_player(
                player_id,
                {
                    "type": "move_applied",
                    "game_id": game_id,
                    "move": move,
                    "your_turn": False,
                },
            )

            await send_to_player(
                opponent_id,
                {
                    "type": "opponent_move",
                    "game_id": game_id,
                    "move": move,
                    "your_turn": True,
                },
            )

        elif msg_type == "chat":
            # Chat message
            game_id = data.get("game_id")
            message_text = data.get("message")

            if game_id and game_id in games:
                game = games[game_id]
                opponent_id = (
                    game.player2_id if game.player1_id == player_id else game.player1_id
                )

                await send_to_player(
                    opponent_id,
                    {
                        "type": "chat",
                        "game_id": game_id,
                        "from": players[player_id]["name"],
                        "message": message_text,
                    },
                )

        elif msg_type == "ping":
            # Keep-alive ping
            await send_to_player(player_id, {"type": "pong"})

        elif msg_type == "game_end":
            # Game finished - save to database
            game_id = data.get("game_id")
            result = data.get("result")  # 'win', 'loss', 'draw'

            if game_id and game_id in games:
                game = games[game_id]
                game.status = "finished"
                finished_at = datetime.now().isoformat()
                started_at = game.started_at or game.created_at

                # Determine winner
                if result == "win":
                    winner = player_id
                elif result == "loss":
                    winner = (
                        game.player2_id
                        if game.player1_id == player_id
                        else game.player1_id
                    )
                else:
                    winner = None  # Draw

                # Save to database
                if db:
                    try:
                        db.save_game(
                            game_id=game_id,
                            game_type=game.game_type,
                            player1_id=game.player1_id,
                            player2_id=game.player2_id,
                            player1_name=players[game.player1_id]["name"],
                            player2_name=players[game.player2_id]["name"],
                            move_history=game.move_history,
                            winner_id=winner,
                            status="finished",
                            started_at=started_at,
                            finished_at=finished_at,
                        )
                    except Exception:
                        pass  # Continue without database

                # Notify both players
                opponent_id = (
                    game.player2_id if game.player1_id == player_id else game.player1_id
                )
                await send_to_player(
                    player_id,
                    {"type": "game_saved", "game_id": game_id, "result": result},
                )
                if opponent_id in players:
                    await send_to_player(
                        opponent_id,
                        {
                            "type": "game_saved",
                            "game_id": game_id,
                            "result": "win"
                            if result == "loss"
                            else ("loss" if result == "win" else "draw"),
                        },
                    )

                # Clean up
                del games[game_id]
                if player_id in players:
                    players[player_id]["game_id"] = None
                    players[player_id]["game_started_at"] = None
                if opponent_id in players:
                    players[opponent_id]["game_id"] = None
                    players[opponent_id]["game_started_at"] = None

                print(f"[OK] Game {game_id} saved to database (winner: {winner})")

    except json.JSONDecodeError:
        await send_to_player(player_id, {"type": "error", "message": "Invalid JSON"})
    except Exception as e:
        print(f"Error handling message: {e}")
        await send_to_player(player_id, {"type": "error", "message": str(e)})


async def send_to_player(player_id, message):
    """Send a message to a specific player"""
    if player_id in players and players[player_id]["websocket"]:
        try:
            await players[player_id]["websocket"].send(json.dumps(message))
        except websockets.exceptions.ConnectionClosed:
            # Player disconnected
            await handle_disconnect(player_id)


async def handle_disconnect(player_id):
    """Handle player disconnection"""
    if player_id not in players:
        return

    # Remove from waiting list if present
    if player_id in waiting_players:
        waiting_players.remove(player_id)

    # Handle game disconnection
    game_id = players[player_id].get("game_id")
    if game_id and game_id in games:
        game = games[game_id]
        opponent_id = (
            game.player2_id if game.player1_id == player_id else game.player1_id
        )

        # Notify opponent
        if opponent_id in players:
            await send_to_player(
                opponent_id,
                {
                    "type": "opponent_disconnected",
                    "game_id": game_id,
                    "message": "Your opponent disconnected",
                },
            )

        # Mark game as abandoned and save to database
        game.status = "abandoned"
        finished_at = datetime.now().isoformat()
        started_at = game.started_at or game.created_at

        # Save abandoned game to database
        if db:
            try:
                db.save_game(
                    game_id=game_id,
                    game_type=game.game_type,
                    player1_id=game.player1_id,
                    player2_id=game.player2_id,
                    player1_name=players[game.player1_id]["name"],
                    player2_name=players[game.player2_id]["name"],
                    move_history=game.move_history,
                    winner_id=None,  # No winner for abandoned games
                    status="abandoned",
                    started_at=started_at,
                    finished_at=finished_at,
                )
            except Exception:
                pass  # Continue without database

        # Clean up
        del games[game_id]
        if opponent_id in players:
            players[opponent_id]["game_id"] = None
            players[opponent_id]["game_started_at"] = None

    # Remove player
    del players[player_id]


# HTTP API for statistics
async def get_player_stats(request):
    """Get player statistics"""
    if not db:
        return web.json_response({"error": "Database not available"}, status=503)
    player_id = request.match_info.get("player_id")
    try:
        stats = db.get_player_stats(player_id)
        if stats:
            return web.json_response(stats)
        return web.json_response({"error": "Player not found"}, status=404)
    except Exception:
        return web.json_response({"error": "Database error"}, status=500)


async def get_league_table(request):
    """Get league table/leaderboard"""
    if not db:
        return web.json_response({"error": "Database not available"}, status=503)
    limit = int(request.query.get("limit", 50))
    try:
        standings = db.get_league_table(limit)
        return web.json_response({"standings": standings})
    except Exception:
        return web.json_response({"error": "Database error"}, status=500)


async def get_game_type_leaderboard(request):
    """Get leaderboard for specific game type"""
    if not db:
        return web.json_response({"error": "Database not available"}, status=503)
    game_type = request.match_info.get("game_type")
    limit = int(request.query.get("limit", 20))
    try:
        leaderboard = db.get_game_type_leaderboard(game_type, limit)
        return web.json_response({"leaderboard": leaderboard})
    except Exception:
        return web.json_response({"error": "Database error"}, status=500)


# Favorites API endpoints
async def add_favorite(request):
    """Add a game to player's favorites"""
    if not db:
        return web.json_response({"error": "Database not available"}, status=503)

    player_id = request.match_info.get("player_id")
    try:
        data = await request.json()
        game_name = data.get("game_name")
        game_category = data.get("game_category", "unknown")

        if not game_name:
            return web.json_response({"error": "game_name required"}, status=400)

        success = db.add_favorite(player_id, game_name, game_category)
        if success:
            return web.json_response({"success": True, "message": "Favorite added"})
        else:
            return web.json_response({"error": "Failed to add favorite"}, status=500)
    except Exception:
        return web.json_response({"error": "Database error"}, status=500)


async def remove_favorite(request):
    """Remove a game from player's favorites"""
    if not db:
        return web.json_response({"error": "Database not available"}, status=503)

    player_id = request.match_info.get("player_id")
    game_name = request.match_info.get("game_name")

    try:
        success = db.remove_favorite(player_id, game_name)
        if success:
            return web.json_response({"success": True, "message": "Favorite removed"})
        else:
            return web.json_response({"error": "Failed to remove favorite"}, status=500)
    except Exception:
        return web.json_response({"error": "Database error"}, status=500)


async def get_favorites(request):
    """Get player's favorite games"""
    if not db:
        return web.json_response({"error": "Database not available"}, status=503)

    player_id = request.match_info.get("player_id")
    try:
        favorites = db.get_favorites(player_id)
        return web.json_response({"favorites": favorites})
    except Exception:
        return web.json_response({"error": "Database error"}, status=500)


# Settings API endpoints
async def set_setting(request):
    """Set a player setting"""
    if not db:
        return web.json_response({"error": "Database not available"}, status=503)

    player_id = request.match_info.get("player_id")
    try:
        data = await request.json()
        key = data.get("key")
        value = data.get("value")

        if not key or value is None:
            return web.json_response({"error": "key and value required"}, status=400)

        success = db.set_setting(player_id, key, str(value))
        if success:
            return web.json_response({"success": True, "message": "Setting saved"})
        else:
            return web.json_response({"error": "Failed to save setting"}, status=500)
    except Exception:
        return web.json_response({"error": "Database error"}, status=500)


async def get_setting(request):
    """Get a player setting"""
    if not db:
        return web.json_response({"error": "Database not available"}, status=503)

    player_id = request.match_info.get("player_id")
    key = request.match_info.get("key")
    default = request.query.get("default", None)

    try:
        value = db.get_setting(player_id, key, default)
        return web.json_response({"key": key, "value": value})
    except Exception:
        return web.json_response({"error": "Database error"}, status=500)


async def get_all_settings(request):
    """Get all player settings"""
    if not db:
        return web.json_response({"error": "Database not available"}, status=503)

    player_id = request.match_info.get("player_id")
    try:
        settings = db.get_all_settings(player_id)
        return web.json_response({"settings": settings})
    except Exception:
        return web.json_response({"error": "Database error"}, status=500)


async def log_error(request):
    """Log client-side errors for debugging and monitoring"""
    try:
        error_data = await request.json()

        # Validate required fields
        required_fields = ['timestamp', 'type', 'message', 'url', 'userAgent', 'game', 'sessionId']
        if not all(field in error_data for field in required_fields):
            return web.json_response({
                'success': False,
                'error': 'Missing required fields'
            }, status=400)

        # Log to server console
        print(f"[ERROR LOG] {error_data['timestamp']} - {error_data['type']}: {error_data['message']}")
        print(f"[ERROR LOG] Game: {error_data['game']}, URL: {error_data['url']}")

        # Store in database if available
        if db:
            try:
                # Create error log table if it doesn't exist
                db.cursor.execute('''
                    CREATE TABLE IF NOT EXISTS error_logs (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp TEXT,
                        type TEXT,
                        message TEXT,
                        filename TEXT,
                        lineno INTEGER,
                        colno INTEGER,
                        url TEXT,
                        user_agent TEXT,
                        game TEXT,
                        session_id TEXT,
                        critical INTEGER DEFAULT 0
                    )
                ''')

                # Insert error record
                db.cursor.execute('''
                    INSERT INTO error_logs
                    (timestamp, type, message, filename, lineno, colno, url, user_agent, game, session_id, critical)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    error_data['timestamp'],
                    error_data['type'],
                    error_data['message'],
                    error_data.get('filename'),
                    error_data.get('lineno'),
                    error_data.get('colno'),
                    error_data['url'],
                    error_data['userAgent'],
                    error_data['game'],
                    error_data['sessionId'],
                    1 if error_data.get('critical') else 0
                ))

                db.conn.commit()
                print(f"[ERROR LOG] Stored error in database: {error_data['type']}")

            except Exception as db_error:
                print(f"[ERROR LOG] Failed to store error in database: {db_error}")

        return web.json_response({
            'success': True,
            'message': 'Error logged successfully'
        })

    except Exception as e:
        print(f"[ERROR LOG] Failed to process error report: {e}")
        return web.json_response({
            'success': False,
            'error': 'Failed to process error report'
        }, status=500)


def setup_http_api():
    """Setup HTTP API server for statistics"""
    app = web.Application()

    # Add CORS
    cors = aiohttp_cors.setup(
        app,
        defaults={
            "*": aiohttp_cors.ResourceOptions(
                allow_credentials=True,
                expose_headers="*",
                allow_headers="*",
                allow_methods="*",
            )
        },
    )

    # API routes
    app.router.add_get("/api/player/{player_id}/stats", get_player_stats)
    app.router.add_get("/api/league", get_league_table)
    app.router.add_get("/api/leaderboard/{game_type}", get_game_type_leaderboard)

    # Favorites routes
    app.router.add_post("/api/player/{player_id}/favorites", add_favorite)
    app.router.add_delete(
        "/api/player/{player_id}/favorites/{game_name}", remove_favorite
    )
    app.router.add_get("/api/player/{player_id}/favorites", get_favorites)

    # Settings routes
    app.router.add_post("/api/player/{player_id}/settings", set_setting)
    app.router.add_get("/api/player/{player_id}/settings/{key}", get_setting)
    app.router.add_get("/api/player/{player_id}/settings", get_all_settings)

    # Error logging routes
    app.router.add_post("/api/log-error", log_error)

    # Add CORS to all routes
    for route in list(app.router.routes()):
        cors.add(route)

    return app


async def handle_client(websocket, path=None):
    """Handle a new WebSocket connection"""
    player_id = None
    player_name = "Player"

    try:
        # Wait for initial registration
        message = await websocket.recv()
        data = json.loads(message)

        if data.get("type") == "register":
            player_name = data.get("name", f"Player{len(players)}")
            player_id = await register_player(websocket, player_name)

            await websocket.send(
                json.dumps(
                    {"type": "registered", "player_id": player_id, "name": player_name}
                )
            )

            print(f"[OK] Player connected: {player_name} ({player_id})")
        else:
            await websocket.send(
                json.dumps({"type": "error", "message": "Must register first"})
            )
            return

        # Handle messages
        async for message in websocket:
            await handle_message(websocket, message, player_id)

    except websockets.exceptions.ConnectionClosed:
        print(f"[WARN]  Player disconnected: {player_name} ({player_id})")
    except Exception as e:
        print(f"[ERROR] Error with client: {e}")
    finally:
        if player_id:
            await handle_disconnect(player_id)


async def main():
    PORT = 9881
    HTTP_PORT = 9882  # HTTP API for statistics
    HOST = "0.0.0.0"  # Bind to all interfaces (localhost + Tailscale)

    # Check if WebSocket port is already in use
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    try:
        sock.bind((HOST, PORT))
        sock.close()
    except OSError as e:
        if e.errno == 10048:  # Windows: port already in use
            print(f"[ERROR] ERROR: Port {PORT} is already in use!", file=sys.stderr)
            print(f"   Another process is using port {PORT}", file=sys.stderr)
            print(f"   Run: netstat -ano | findstr :{PORT}", file=sys.stderr)
            sys.exit(1)
        else:
            print(f"[ERROR] ERROR: Cannot bind to port {PORT}: {e}", file=sys.stderr)
            sys.exit(1)

    # Check if HTTP port is available (optional - don't fail if it's not)
    http_port_available = False
    http_sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    http_sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    try:
        http_sock.bind((HOST, HTTP_PORT))
        http_sock.close()
        http_port_available = True
    except OSError as e:
        if e.errno == 10048:  # Port already in use
            print(
                f"[WARN]  Warning: HTTP API port {HTTP_PORT} is already in use. Statistics API will be disabled."
            )
        elif (
            e.errno == 10013
        ):  # Windows: access forbidden (reserved port or permission issue)
            print(
                f"[WARN]  Warning: HTTP API port {HTTP_PORT} is blocked by Windows (reserved or permission issue). Statistics API will be disabled."
            )
        else:
            print(
                f"[WARN]  Warning: Cannot bind to HTTP API port {HTTP_PORT}: {e}. Statistics API will be disabled."
            )
        http_port_available = False

    # Get Tailscale IP if available
    tailscale_ip = None
    try:
        import subprocess

        result = subprocess.run(
            ["tailscale", "ip", "-4"], capture_output=True, text=True, timeout=2
        )
        if result.returncode == 0:
            tailscale_ip = (
                result.stdout.strip().split("\n")[0] if result.stdout.strip() else None
            )
    except Exception:
        pass

    print("")
    print("===================================================")
    print("  [GAMES] MULTIPLAYER WEBSOCKET SERVER")
    print("===================================================")
    print("")
    print("WebSocket server running on:")
    print(f"  Local:    ws://localhost:{PORT}")
    print(f"  Local:    ws://127.0.0.1:{PORT}")
    if tailscale_ip:
        print(f"  Tailscale: ws://{tailscale_ip}:{PORT}")
        print(f"  Tailscale: ws://goliath:{PORT}")
    print("")
    print("Press Ctrl+C to stop")
    print("")

    # Start HTTP API server for statistics (optional - only if port is available)
    http_runner = None
    if http_port_available:
        try:
            http_app = setup_http_api()
            http_runner = web.AppRunner(http_app)
            await http_runner.setup()
            http_site = web.TCPSite(http_runner, HOST, HTTP_PORT)
            await http_site.start()
            print(f"📊 Statistics API: http://localhost:{HTTP_PORT}/api/league")
        except Exception as e:
            print(f"[WARN]  Warning: HTTP API failed to start: {e}")
            http_runner = None
    else:
        print("📊 Statistics API: Disabled (port unavailable)")
    print("")

    # Suppress common WebSocket handshake errors to reduce log noise
    import logging

    logging.getLogger("websockets").setLevel(logging.WARNING)

    # Custom exception handler for cleaner error logging
    def exception_handler(loop, context):
        exception = context.get("exception")
        if exception and hasattr(exception, "args"):
            error_msg = str(exception)
            # Suppress common handshake errors that are just network noise
            if (
                "did not receive a valid HTTP request" in error_msg
                or "stream ends after 0 bytes" in error_msg
                or "connection closed while reading" in error_msg
            ):
                return  # Suppress these common errors
        # Log other exceptions normally
        loop.default_exception_handler(context)

    asyncio.get_event_loop().set_exception_handler(exception_handler)

    try:
        async with websockets.serve(handle_client, HOST, PORT, reuse_address=True):
            await asyncio.Future()  # Run forever
    except OSError as e:
        if e.errno == 10048:
            print(f"[ERROR] ERROR: Port {PORT} is already in use!", file=sys.stderr)
            print(f"   Another process is using port {PORT}", file=sys.stderr)
            sys.exit(1)
        else:
            raise


if __name__ == "__main__":
    import sys

    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n[WARN]  Server stopped by user")
    except Exception as e:
        print(f"\n[ERROR] ERROR: {e}", file=sys.stderr)
        sys.exit(1)
