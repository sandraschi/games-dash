#!/usr/bin/env python3
"""
Real Stockfish Backend Server
Runs actual Stockfish C++ engine (not JavaScript version!)
**Timestamp**: 2025-12-03
"""

import asyncio
import subprocess
from pathlib import Path
from aiohttp import web
import aiohttp_cors

class StockfishEngine:
    def __init__(self, exe_path):
        self.exe_path = exe_path
        self.process = None
        
    async def start(self):
        """Start Stockfish process"""
        self.process = await asyncio.create_subprocess_exec(
            self.exe_path,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Initialize UCI
        await self.send_command('uci')
        await self.wait_for('uciok')
        print("✅ Real Stockfish engine initialized!")
        
    async def send_command(self, command):
        """Send command to Stockfish"""
        if self.process and self.process.stdin:
            self.process.stdin.write(f"{command}\n".encode())
            await self.process.stdin.drain()
            
    async def wait_for(self, expected):
        """Wait for specific response"""
        while True:
            line = await self.process.stdout.readline()
            if not line:
                break
            decoded = line.decode().strip()
            if expected in decoded:
                return decoded
                
    async def get_best_move(self, fen, skill_level=20, depth=15, movetime=1000):
        """Get best move from position"""
        # Set skill level
        await self.send_command(f'setoption name Skill Level value {skill_level}')
        
        # Set position
        await self.send_command(f'position fen {fen}')
        
        # Request move
        await self.send_command(f'go depth {depth} movetime {movetime}')
        
        # Wait for bestmove
        bestmove_line = await self.wait_for('bestmove')
        move = bestmove_line.split()[1] if bestmove_line else None
        
        return move

# Global engine instance
engine = None

async def handle_get_move(request):
    """Handle move requests from frontend"""
    try:
        data = await request.json()
        fen = data.get('fen')
        skill = data.get('skill', 20)
        depth = data.get('depth', 15)
        movetime = data.get('movetime', 1000)
        
        print(f"📩 Move request: Skill={skill}, Depth={depth}, Time={movetime}ms")
        print(f"Position: {fen}")
        
        move = await engine.get_best_move(fen, skill, depth, movetime)
        
        print(f"✅ Best move: {move}")
        
        return web.json_response({
            'success': True,
            'move': move,
            'engine': 'Stockfish 16 (Full C++ Version)',
            'elo': '~3500'
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
        'engine': 'Stockfish 16',
        'version': 'Full C++ Version (not JavaScript!)',
        'elo': '~3500',
        'ready': engine is not None
    })

async def start_background_tasks(app):
    """Start Stockfish engine on startup"""
    global engine
    
    # Find Stockfish executable
    stockfish_paths = [
        Path('stockfish/stockfish/stockfish-windows-x86-64-avx2.exe'),
        Path('stockfish/stockfish-windows-x86-64-avx2.exe'),
        Path('stockfish/stockfish.exe')
    ]
    
    stockfish_exe = None
    for path in stockfish_paths:
        if path.exists():
            stockfish_exe = str(path.absolute())
            break
    
    if not stockfish_exe:
        print("❌ Stockfish executable not found!")
        print("Expected paths:")
        for p in stockfish_paths:
            print(f"  - {p}")
        return
    
    print(f"✅ Found Stockfish: {stockfish_exe}")
    
    engine = StockfishEngine(stockfish_exe)
    await engine.start()
    print("🚀 Stockfish backend ready!")

def main():
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
    print("  🏆 REAL STOCKFISH BACKEND SERVER")
    print("═══════════════════════════════════════════════════")
    print("")
    print("Port: 9543 (backend)")
    print("Frontend: http://localhost:9876")
    print("")
    print("Press Ctrl+C to stop")
    print("")
    
    web.run_app(app, host='127.0.0.1', port=9543)

if __name__ == '__main__':
    main()

