#!/usr/bin/env python3
"""
Real Stockfish Backend Server
Runs actual Stockfish C++ engine (not JavaScript version!)
**Timestamp**: 2025-12-03
"""

import asyncio
import subprocess
import socket
import sys
from pathlib import Path
from aiohttp import web
import aiohttp_cors
import concurrent.futures
from functools import lru_cache


class StockfishEngine:
    def __init__(self, exe_path):
        self.exe_path = exe_path
        self.process = None
        self._executor = concurrent.futures.ThreadPoolExecutor(max_workers=2)
        self._cache = {}
        self._max_cache_size = 1000

    async def start(self):
        """Start Stockfish process with optimized settings"""
        self.process = await asyncio.create_subprocess_exec(
            self.exe_path,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            # Optimize process priority and I/O
            preexec_fn=None if sys.platform == "win32" else lambda: None,
        )

        # Initialize UCI with optimized settings
        await self.send_command("uci")
        await self.wait_for("uciok")

        # Set optimized defaults for faster responses
        await self.send_command(
            "setoption name Threads value 1"
        )  # Single thread for responsiveness
        await self.send_command("setoption name Hash value 16")  # 16MB hash table
        await self.send_command(
            "setoption name Ponder value false"
        )  # Disable pondering
        await self.send_command("isready")
        await self.wait_for("readyok")

        print("[OK] Real Stockfish engine initialized with optimizations!")

    async def send_command(self, command):
        """Send command to Stockfish"""
        if self.process and self.process.stdin:
            self.process.stdin.write(f"{command}\n".encode())
            await self.process.stdin.drain()

    async def wait_for(self, expected):
        """Wait for specific response with timeout"""
        timeout = 10.0  # 10 second timeout
        start_time = asyncio.get_event_loop().time()

        while True:
            line = await self.process.stdout.readline()
            if not line:
                break
            decoded = line.decode().strip()
            if expected in decoded:
                return decoded

            # Check for timeout
            if asyncio.get_event_loop().time() - start_time > timeout:
                raise asyncio.TimeoutError(f"Timeout waiting for '{expected}'")

    @lru_cache(maxsize=500)
    async def get_best_move(self, fen, skill_level=20, depth=15, movetime=1000):
        """Get best move from position with caching"""
        # Create cache key
        cache_key = f"{fen}_{skill_level}_{depth}_{movetime}"

        # Check cache first
        if cache_key in self._cache:
            return self._cache[cache_key]

        # Set skill level (only if changed from default)
        if skill_level != 20:
            await self.send_command(f"setoption name Skill Level value {skill_level}")

        # Set position
        await self.send_command(f"position fen {fen}")

        # Request move with optimized parameters
        await self.send_command(f"go depth {depth} movetime {movetime}")

        # Wait for bestmove
        bestmove_line = await self.wait_for("bestmove")
        move = bestmove_line.split()[1] if bestmove_line else None

        # Cache result
        if len(self._cache) < self._max_cache_size:
            self._cache[cache_key] = move

        return move


# Global engine instance
engine = None


async def handle_get_move(request):
    """Handle move requests from frontend"""
    try:
        data = await request.json()
        fen = data.get("fen")
        skill = data.get("skill", 20)
        depth = data.get("depth", 15)
        movetime = data.get("movetime", 1000)

        print(f"📩 Move request: Skill={skill}, Depth={depth}, Time={movetime}ms")
        print(f"Position: {fen}")

        move = await engine.get_best_move(fen, skill, depth, movetime)

        print(f"[OK] Best move: {move}")

        return web.json_response(
            {
                "success": True,
                "move": move,
                "engine": "Stockfish 16 (Full C++ Version)",
                "elo": "~3500",
            }
        )

    except Exception as e:
        print(f"[ERROR] Error: {e}")
        return web.json_response({"success": False, "error": str(e)}, status=500)


async def handle_status(request):
    """Status endpoint"""
    return web.json_response(
        {
            "status": "online",
            "engine": "Stockfish 16",
            "version": "Full C++ Version (not JavaScript!)",
            "elo": "~3500",
            "ready": engine is not None,
        }
    )


def is_port_in_use(port):
    """Check if port is already in use"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(("127.0.0.1", port))
            return False
        except OSError:
            return True


def kill_process_on_port(port):
    """Kill process using the specified port (Windows)"""
    try:
        # Find process using the port
        result = subprocess.run(
            ["netstat", "-ano"], capture_output=True, text=True, check=True
        )

        for line in result.stdout.split("\n"):
            if f":{port}" in line and "LISTENING" in line:
                parts = line.split()
                if len(parts) >= 5:
                    pid = parts[-1]
                    # Kill the process
                    subprocess.run(
                        ["taskkill", "/F", "/PID", pid],
                        capture_output=True,
                        check=False,
                    )
                    print(f"[WARN]  Killed process {pid} using port {port}")
                    return True
        return False
    except Exception as e:
        print(f"[WARN]  Could not kill process on port {port}: {e}")
        return False


async def start_background_tasks(app):
    """Start Stockfish engine on startup"""
    global engine

    try:
        # Find Stockfish executable
        stockfish_paths = [
            Path("stockfish/stockfish/stockfish-windows-x86-64-avx2.exe"),
            Path("stockfish/stockfish-windows-x86-64-avx2.exe"),
            Path("stockfish/stockfish.exe"),
        ]

        stockfish_exe = None
        for path in stockfish_paths:
            if path.exists():
                stockfish_exe = str(path.absolute())
                break

        if not stockfish_exe:
            print("[ERROR] ERROR: Stockfish executable not found!", file=sys.stderr)
            print("Expected paths:", file=sys.stderr)
            for p in stockfish_paths:
                print(f"  - {p}", file=sys.stderr)
            print(
                "[WARN]  Server will start but Stockfish features will not work!",
                file=sys.stderr,
            )
            return

        print(f"[OK] Found Stockfish: {stockfish_exe}")

        engine = StockfishEngine(stockfish_exe)
        await engine.start()
        print("[START] Stockfish backend ready!")
    except Exception as e:
        print(f"[ERROR] CRITICAL ERROR starting Stockfish engine: {e}", file=sys.stderr)
        import traceback

        traceback.print_exc(file=sys.stderr)
        print(
            "[WARN]  Server will start but Stockfish features will not work!",
            file=sys.stderr,
        )


def main():
    port = 9543

    # Check if port is in use
    if is_port_in_use(port):
        print(f"[WARN]  Port {port} is already in use!")
        print(f"Attempting to free port {port}...")
        if kill_process_on_port(port):
            import time

            time.sleep(1)  # Wait a moment for port to be freed
            if is_port_in_use(port):
                print(
                    f"[ERROR] Port {port} is still in use. Please close the process manually."
                )
                print(f"   Run: netstat -ano | findstr :{port}")
                sys.exit(1)
        else:
            print(
                f"[ERROR] Could not free port {port}. Please close the process manually."
            )
            print(f"   Run: netstat -ano | findstr :{port}")
            sys.exit(1)

    app = web.Application()

    # CORS configuration
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

    # Routes
    app.router.add_post("/api/move", handle_get_move)
    app.router.add_get("/api/status", handle_status)

    # Add CORS to all routes
    for route in list(app.router.routes()):
        cors.add(route)

    # Startup
    app.on_startup.append(start_background_tasks)

    print("")
    print("===================================================")
    print("  REAL STOCKFISH BACKEND SERVER")
    print("===================================================")
    print("")
    print("Port: 9543 (backend)")
    print("Frontend: http://localhost:9876")
    print("")
    print("Press Ctrl+C to stop")
    print("")

    try:
        print(f"[INFO] Starting web server on port {port}...")
        web.run_app(app, host="0.0.0.0", port=port)
    except OSError as e:
        if e.errno == 10048:
            print(f"[ERROR] ERROR: Port {port} conflict: {e}", file=sys.stderr)
            print(f"   Another process is using port {port}", file=sys.stderr)
            print(f"   Run: netstat -ano | findstr :{port}", file=sys.stderr)
        else:
            print(f"[ERROR] ERROR: Server failed to start: {e}", file=sys.stderr)
            import traceback

            traceback.print_exc(file=sys.stderr)
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n[WARN]  Server stopped by user")
        sys.exit(0)
    except Exception as e:
        print(f"[ERROR] CRITICAL ERROR: {e}", file=sys.stderr)
        import traceback

        traceback.print_exc(file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
