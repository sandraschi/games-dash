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
from collections import defaultdict
from aiohttp import web
import aiohttp_cors

# Import database module
try:
    from multiplayer_db import MultiplayerDB
except ImportError:
    # Fallback if module not found
    MultiplayerDB = None
    print("⚠️  Warning: multiplayer_db module not found. Database features disabled.")

# Initialize database
db = MultiplayerDB()

# Game state storage (in-memory for active games)
games = {}  # game_id -> game_state
players = {}  # player_id -> {name, websocket, game_id}
waiting_players = []  # List of player_ids waiting for a match

class GameState:
    def __init__(self, game_id, player1_id, player2_id, game_type='chess'):
        self.game_id = game_id
        self.player1_id = player1_id
        self.player2_id = player2_id
        self.game_type = game_type
        self.current_turn = player1_id
        self.board_state = None
        self.move_history = []
        self.created_at = datetime.now().isoformat()
        self.status = 'active'  # active, finished, abandoned

async def register_player(websocket, player_name):
    """Register a new player"""
    player_id = str(uuid.uuid4())[:8]
    
    # Get or create player in database
    if db:
        try:
            player_data = db.get_or_create_player(player_id, player_name)
        except:
            pass  # Continue without database
    
    players[player_id] = {
        'id': player_id,
        'name': player_name,
        'websocket': websocket,
        'game_id': None,
        'connected_at': datetime.now().isoformat(),
        'game_started_at': None  # Track when current game started
    }
    return player_id

async def find_or_create_game(player_id, game_type='chess'):
    """Find an available game or create a new one"""
    # Check if player is already in a game
    if players[player_id]['game_id']:
        return players[player_id]['game_id']
    
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
            players[waiting_id]['game_id'] = game_id
            players[waiting_id]['game_started_at'] = started_at
            players[player_id]['game_id'] = game_id
            players[player_id]['game_started_at'] = started_at
            return game_id
    
    # No match found, add to waiting list
    waiting_players.append(player_id)
    return None

async def handle_message(websocket, message, player_id):
    """Handle incoming messages from clients"""
    try:
        data = json.loads(message)
        msg_type = data.get('type')
        
        if msg_type == 'join':
            # Player wants to join/create a game
            game_type = data.get('game_type', 'chess')
            game_id = await find_or_create_game(player_id, game_type)
            
            if game_id:
                # Game found or created
                game = games[game_id]
                opponent_id = game.player2_id if game.player1_id == player_id else game.player1_id
                opponent = players[opponent_id]
                
                # Notify both players
                await send_to_player(player_id, {
                    'type': 'game_started',
                    'game_id': game_id,
                    'game_type': game_type,
                    'opponent': opponent['name'],
                    'opponent_id': opponent_id,
                    'your_color': 'white' if game.player1_id == player_id else 'black',
                    'your_turn': game.current_turn == player_id
                })
                
                await send_to_player(opponent_id, {
                    'type': 'game_started',
                    'game_id': game_id,
                    'game_type': game_type,
                    'opponent': players[player_id]['name'],
                    'opponent_id': player_id,
                    'your_color': 'black' if game.player1_id == player_id else 'white',
                    'your_turn': game.current_turn == opponent_id
                })
            else:
                # Waiting for opponent
                await send_to_player(player_id, {
                    'type': 'waiting',
                    'message': 'Waiting for opponent...'
                })
        
        elif msg_type == 'move':
            # Player made a move
            game_id = data.get('game_id')
            move = data.get('move')
            
            if not game_id or game_id not in games:
                await send_to_player(player_id, {
                    'type': 'error',
                    'message': 'Invalid game ID'
                })
                return
            
            game = games[game_id]
            
            # Verify it's player's turn
            if game.current_turn != player_id:
                await send_to_player(player_id, {
                    'type': 'error',
                    'message': 'Not your turn!'
                })
                return
            
            # Add move to history
            game.move_history.append({
                'player_id': player_id,
                'move': move,
                'timestamp': datetime.now().isoformat()
            })
            
            # Switch turn
            game.current_turn = game.player2_id if game.current_turn == game.player1_id else game.player1_id
            
            # Notify both players
            opponent_id = game.player2_id if game.player1_id == player_id else game.player1_id
            
            await send_to_player(player_id, {
                'type': 'move_applied',
                'game_id': game_id,
                'move': move,
                'your_turn': False
            })
            
            await send_to_player(opponent_id, {
                'type': 'opponent_move',
                'game_id': game_id,
                'move': move,
                'your_turn': True
            })
        
        elif msg_type == 'chat':
            # Chat message
            game_id = data.get('game_id')
            message_text = data.get('message')
            
            if game_id and game_id in games:
                game = games[game_id]
                opponent_id = game.player2_id if game.player1_id == player_id else game.player1_id
                
                await send_to_player(opponent_id, {
                    'type': 'chat',
                    'game_id': game_id,
                    'from': players[player_id]['name'],
                    'message': message_text
                })
        
        elif msg_type == 'ping':
            # Keep-alive ping
            await send_to_player(player_id, {'type': 'pong'})
        
        elif msg_type == 'game_end':
            # Game finished - save to database
            game_id = data.get('game_id')
            winner_id = data.get('winner_id')  # None for draw
            result = data.get('result')  # 'win', 'loss', 'draw'
            
            if game_id and game_id in games:
                game = games[game_id]
                game.status = 'finished'
                finished_at = datetime.now().isoformat()
                started_at = game.started_at or game.created_at
                
                # Determine winner
                if result == 'win':
                    winner = player_id
                elif result == 'loss':
                    winner = game.player2_id if game.player1_id == player_id else game.player1_id
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
                            player1_name=players[game.player1_id]['name'],
                            player2_name=players[game.player2_id]['name'],
                            move_history=game.move_history,
                            winner_id=winner,
                            status='finished',
                            started_at=started_at,
                            finished_at=finished_at
                        )
                    except:
                        pass  # Continue without database
                
                # Notify both players
                opponent_id = game.player2_id if game.player1_id == player_id else game.player1_id
                await send_to_player(player_id, {
                    'type': 'game_saved',
                    'game_id': game_id,
                    'result': result
                })
                if opponent_id in players:
                    await send_to_player(opponent_id, {
                        'type': 'game_saved',
                        'game_id': game_id,
                        'result': 'win' if result == 'loss' else ('loss' if result == 'win' else 'draw')
                    })
                
                # Clean up
                del games[game_id]
                if player_id in players:
                    players[player_id]['game_id'] = None
                    players[player_id]['game_started_at'] = None
                if opponent_id in players:
                    players[opponent_id]['game_id'] = None
                    players[opponent_id]['game_started_at'] = None
                
                print(f"✅ Game {game_id} saved to database (winner: {winner})")
            
    except json.JSONDecodeError:
        await send_to_player(player_id, {
            'type': 'error',
            'message': 'Invalid JSON'
        })
    except Exception as e:
        print(f"Error handling message: {e}")
        await send_to_player(player_id, {
            'type': 'error',
            'message': str(e)
        })

async def send_to_player(player_id, message):
    """Send a message to a specific player"""
    if player_id in players and players[player_id]['websocket']:
        try:
            await players[player_id]['websocket'].send(json.dumps(message))
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
    game_id = players[player_id].get('game_id')
    if game_id and game_id in games:
        game = games[game_id]
        opponent_id = game.player2_id if game.player1_id == player_id else game.player1_id
        
        # Notify opponent
        if opponent_id in players:
            await send_to_player(opponent_id, {
                'type': 'opponent_disconnected',
                'game_id': game_id,
                'message': 'Your opponent disconnected'
            })
        
        # Mark game as abandoned and save to database
        game.status = 'abandoned'
        finished_at = datetime.now().isoformat()
        started_at = game.started_at or game.created_at
        
        # Save abandoned game to database
        db.save_game(
            game_id=game_id,
            game_type=game.game_type,
            player1_id=game.player1_id,
            player2_id=game.player2_id,
            player1_name=players[game.player1_id]['name'],
            player2_name=players[game.player2_id]['name'],
            move_history=game.move_history,
            winner_id=None,  # No winner for abandoned games
            status='abandoned',
            started_at=started_at,
            finished_at=finished_at
        )
        
        # Clean up
        del games[game_id]
        if opponent_id in players:
            players[opponent_id]['game_id'] = None
            players[opponent_id]['game_started_at'] = None
    
    # Remove player
    del players[player_id]

# HTTP API for statistics
async def get_player_stats(request):
    """Get player statistics"""
    player_id = request.match_info.get('player_id')
    stats = db.get_player_stats(player_id)
    if stats:
        return web.json_response(stats)
    return web.json_response({'error': 'Player not found'}, status=404)

async def get_league_table(request):
    """Get league table/leaderboard"""
    if not db:
        return web.json_response({'error': 'Database not available'}, status=503)
    limit = int(request.query.get('limit', 50))
    try:
        standings = db.get_league_table(limit)
        return web.json_response({'standings': standings})
    except:
        return web.json_response({'error': 'Database error'}, status=500)

async def get_game_type_leaderboard(request):
    """Get leaderboard for specific game type"""
    if not db:
        return web.json_response({'error': 'Database not available'}, status=503)
    game_type = request.match_info.get('game_type')
    limit = int(request.query.get('limit', 20))
    try:
        leaderboard = db.get_game_type_leaderboard(game_type, limit)
        return web.json_response({'leaderboard': leaderboard})
    except:
        return web.json_response({'error': 'Database error'}, status=500)

def setup_http_api():
    """Setup HTTP API server for statistics"""
    app = web.Application()
    
    # Add CORS
    cors = aiohttp_cors.setup(app, defaults={
        "*": aiohttp_cors.ResourceOptions(
            allow_credentials=True,
            expose_headers="*",
            allow_headers="*",
            allow_methods="*"
        )
    })
    
    # API routes
    app.router.add_get('/api/player/{player_id}/stats', get_player_stats)
    app.router.add_get('/api/league', get_league_table)
    app.router.add_get('/api/leaderboard/{game_type}', get_game_type_leaderboard)
    
    # Add CORS to all routes
    for route in list(app.router.routes()):
        cors.add(route)
    
    return app

async def handle_client(websocket, path):
    """Handle a new WebSocket connection"""
    player_id = None
    player_name = "Player"
    
    try:
        # Wait for initial registration
        message = await websocket.recv()
        data = json.loads(message)
        
        if data.get('type') == 'register':
            player_name = data.get('name', f'Player{len(players)}')
            player_id = await register_player(websocket, player_name)
            
            await websocket.send(json.dumps({
                'type': 'registered',
                'player_id': player_id,
                'name': player_name
            }))
            
            print(f"✅ Player connected: {player_name} ({player_id})")
        else:
            await websocket.send(json.dumps({
                'type': 'error',
                'message': 'Must register first'
            }))
            return
        
        # Handle messages
        async for message in websocket:
            await handle_message(websocket, message, player_id)
            
    except websockets.exceptions.ConnectionClosed:
        print(f"⚠️  Player disconnected: {player_name} ({player_id})")
    except Exception as e:
        print(f"❌ Error with client: {e}")
    finally:
        if player_id:
            await handle_disconnect(player_id)

async def main():
    PORT = 9877
    HTTP_PORT = 9878  # HTTP API for statistics
    HOST = "0.0.0.0"  # Bind to all interfaces (localhost + Tailscale)
    
    # Check if port is already in use
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    try:
        sock.bind((HOST, PORT))
        sock.close()
    except OSError as e:
        if e.errno == 10048:  # Windows: port already in use
            print(f"❌ ERROR: Port {PORT} is already in use!", file=sys.stderr)
            print(f"   Another process is using port {PORT}", file=sys.stderr)
            print(f"   Run: netstat -ano | findstr :{PORT}", file=sys.stderr)
            sys.exit(1)
        else:
            print(f"❌ ERROR: Cannot bind to port {PORT}: {e}", file=sys.stderr)
            sys.exit(1)
    
    # Get Tailscale IP if available
    tailscale_ip = None
    try:
        import subprocess
        result = subprocess.run(['tailscale', 'ip', '-4'], capture_output=True, text=True, timeout=2)
        if result.returncode == 0:
            tailscale_ip = result.stdout.strip().split('\n')[0] if result.stdout.strip() else None
    except:
        pass
    
    print("")
    print("═══════════════════════════════════════════════════")
    print("  🎮 MULTIPLAYER WEBSOCKET SERVER")
    print("═══════════════════════════════════════════════════")
    print("")
    print(f"WebSocket server running on:")
    print(f"  Local:    ws://localhost:{PORT}")
    print(f"  Local:    ws://127.0.0.1:{PORT}")
    if tailscale_ip:
        print(f"  Tailscale: ws://{tailscale_ip}:{PORT}")
        print(f"  Tailscale: ws://goliath:{PORT}")
    print("")
    print("Press Ctrl+C to stop")
    print("")
    
    # Start HTTP API server for statistics
    http_app = setup_http_api()
    http_runner = web.AppRunner(http_app)
    await http_runner.setup()
    http_site = web.TCPSite(http_runner, HOST, HTTP_PORT)
    await http_site.start()
    print(f"📊 Statistics API: http://localhost:{HTTP_PORT}/api/league")
    print("")
    
    try:
        async with websockets.serve(handle_client, HOST, PORT, reuse_address=True):
            await asyncio.Future()  # Run forever
    except OSError as e:
        if e.errno == 10048:
            print(f"❌ ERROR: Port {PORT} is already in use!", file=sys.stderr)
            print(f"   Another process is using port {PORT}", file=sys.stderr)
            sys.exit(1)
        else:
            raise

if __name__ == '__main__':
    import sys
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n⚠️  Server stopped by user")
    except Exception as e:
        print(f"\n❌ ERROR: {e}", file=sys.stderr)
        sys.exit(1)

