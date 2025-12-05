#!/usr/bin/env python3
"""
Real KataGo Backend Server
Runs actual KataGo engine (AlphaGo-level AI!)
**Timestamp**: 2025-12-03
"""

import asyncio
import subprocess
import socket
import sys
from pathlib import Path
from aiohttp import web
import aiohttp_cors

class KataGoEngine:
    def __init__(self, exe_path):
        self.exe_path = exe_path
        self.process = None
        
    async def start(self):
        """Start KataGo process"""
        self.process = await asyncio.create_subprocess_exec(
            self.exe_path,
            'gtp',  # GTP mode
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Initialize GTP
        await self.send_command('name')
        response = await self.wait_for_response()
        print(f"✅ KataGo engine initialized: {response}")
        
    async def send_command(self, command):
        """Send command to KataGo"""
        if self.process and self.process.stdin:
            self.process.stdin.write(f"{command}\n".encode())
            await self.process.stdin.drain()
            
    async def wait_for_response(self):
        """Wait for GTP response"""
        response_lines = []
        while True:
            line = await self.process.stdout.readline()
            if not line:
                break
            decoded = line.decode().strip()
            if decoded.startswith('='):
                # Success response
                return decoded[2:].strip()
            elif decoded.startswith('?'):
                # Error response
                return decoded
            elif decoded == '':
                # End of response
                break
            response_lines.append(decoded)
        return ' '.join(response_lines)
                
    async def get_best_move(self, board_size=19, moves=[], komi=7.5):
        """Get best move from position"""
        # Clear board
        await self.send_command(f'boardsize {board_size}')
        await self.wait_for_response()
        
        await self.send_command('clear_board')
        await self.wait_for_response()
        
        # Set komi
        await self.send_command(f'komi {komi}')
        await self.wait_for_response()
        
        # Play moves
        for move in moves:
            await self.send_command(f'play {move}')
            await self.wait_for_response()
        
        # Get best move
        await self.send_command('genmove b' if len(moves) % 2 == 0 else 'genmove w')
        move = await self.wait_for_response()
        
        return move

# Global engine instance
engine = None

async def handle_get_move(request):
    """Handle move requests from frontend"""
    try:
        data = await request.json()
        board_size = data.get('board_size', 19)
        moves = data.get('moves', [])
        komi = data.get('komi', 7.5)
        
        print(f"📩 Go move request: Size={board_size}, Moves={len(moves)}")
        
        move = await engine.get_best_move(board_size, moves, komi)
        
        print(f"✅ Best move: {move}")
        
        return web.json_response({
            'success': True,
            'move': move,
            'engine': 'KataGo',
            'strength': 'AlphaGo Level'
        })
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return web.json_response({
            'success': False,
            'error': str(e)
        }, status=500)

async def handle_status(request):
    """Status endpoint"""
    return web.json_response({
        'status': 'online',
        'engine': 'KataGo',
        'version': 'v1.15.3',
        'strength': 'AlphaGo Level (~5000 ELO)',
        'ready': engine is not None
    })

def is_port_in_use(port):
    """Check if port is already in use"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(('127.0.0.1', port))
            return False
        except OSError:
            return True

def kill_process_on_port(port):
    """Kill process using the specified port (Windows)"""
    try:
        # Find process using the port
        result = subprocess.run(
            ['netstat', '-ano'],
            capture_output=True,
            text=True,
            check=True
        )
        
        for line in result.stdout.split('\n'):
            if f':{port}' in line and 'LISTENING' in line:
                parts = line.split()
                if len(parts) >= 5:
                    pid = parts[-1]
                    # Kill the process
                    subprocess.run(['taskkill', '/F', '/PID', pid], 
                                 capture_output=True, check=False)
                    print(f"⚠️  Killed process {pid} using port {port}")
                    return True
        return False
    except Exception as e:
        print(f"⚠️  Could not kill process on port {port}: {e}")
        return False

async def start_background_tasks(app):
    """Start KataGo engine on startup"""
    global engine
    
    try:
        # Find KataGo executable
        katago_paths = [
            Path('katago/katago.exe'),
            Path('katago/KataGo.exe')
        ]
        
        katago_exe = None
        for path in katago_paths:
            if path.exists():
                katago_exe = str(path.absolute())
                break
        
        if not katago_exe:
            print("❌ ERROR: KataGo executable not found!", file=sys.stderr)
            print("Expected paths:", file=sys.stderr)
            for p in katago_paths:
                print(f"  - {p}", file=sys.stderr)
            print("⚠️  Server will start but Go features will not work!", file=sys.stderr)
            return
        
        print(f"✅ Found KataGo: {katago_exe}")
        
        engine = KataGoEngine(katago_exe)
        await engine.start()
        print("🚀 KataGo backend ready!")
    except Exception as e:
        print(f"❌ CRITICAL ERROR starting KataGo engine: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        print("⚠️  Server will start but Go features will not work!", file=sys.stderr)

def main():
    port = 9545
    
    # Check if port is in use
    if is_port_in_use(port):
        print(f"⚠️  Port {port} is already in use!")
        print(f"Attempting to free port {port}...")
        if kill_process_on_port(port):
            import time
            time.sleep(1)  # Wait a moment for port to be freed
            if is_port_in_use(port):
                print(f"❌ Port {port} is still in use. Please close the process manually.")
                print(f"   Run: netstat -ano | findstr :{port}")
                sys.exit(1)
        else:
            print(f"❌ Could not free port {port}. Please close the process manually.")
            print(f"   Run: netstat -ano | findstr :{port}")
            sys.exit(1)
    
    app = web.Application()
    
    # CORS configuration
    cors = aiohttp_cors.setup(app, defaults={
        "*": aiohttp_cors.ResourceOptions(
            allow_credentials=True,
            expose_headers="*",
            allow_headers="*",
            allow_methods="*"
        )
    })
    
    # Routes
    app.router.add_post('/api/move', handle_get_move)
    app.router.add_get('/api/status', handle_status)
    
    # Add CORS to all routes
    for route in list(app.router.routes()):
        cors.add(route)
    
    # Startup
    app.on_startup.append(start_background_tasks)
    
    print("")
    print("═══════════════════════════════════════════════════")
    print("  🏆 REAL KATAGO BACKEND SERVER")
    print("═══════════════════════════════════════════════════")
    print("")
    print("Port: 9545 (Go backend)")
    print("Frontend: http://localhost:9876")
    print("")
    print("Press Ctrl+C to stop")
    print("")
    
    try:
        print(f"🌐 Starting web server on port {port}...")
        web.run_app(app, host='127.0.0.1', port=port)
    except OSError as e:
        if e.errno == 10048:
            print(f"❌ ERROR: Port {port} conflict: {e}", file=sys.stderr)
            print(f"   Another process is using port {port}", file=sys.stderr)
            print(f"   Run: netstat -ano | findstr :{port}", file=sys.stderr)
        else:
            print(f"❌ ERROR: Server failed to start: {e}", file=sys.stderr)
            import traceback
            traceback.print_exc(file=sys.stderr)
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n⚠️  Server stopped by user")
        sys.exit(0)
    except Exception as e:
        print(f"❌ CRITICAL ERROR: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main()

