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
from datetime import datetime
from collections import defaultdict

# Game state storage (in-memory, resets on server restart)
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
    players[player_id] = {
        'id': player_id,
        'name': player_name,
        'websocket': websocket,
        'game_id': None,
        'connected_at': datetime.now().isoformat()
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
            game = GameState(game_id, waiting_id, player_id, game_type)
            games[game_id] = game
            players[waiting_id]['game_id'] = game_id
            players[player_id]['game_id'] = game_id
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
        
        # Mark game as abandoned
        game.status = 'abandoned'
    
    # Remove player
    del players[player_id]

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
    print("")
    print("═══════════════════════════════════════════════════")
    print("  🎮 MULTIPLAYER WEBSOCKET SERVER")
    print("═══════════════════════════════════════════════════")
    print("")
    print(f"WebSocket server running on: ws://localhost:{PORT}")
    print("")
    print("Press Ctrl+C to stop")
    print("")
    
    async with websockets.serve(handle_client, "localhost", PORT):
        await asyncio.Future()  # Run forever

if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n⚠️  Server stopped by user")

