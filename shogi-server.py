#!/usr/bin/env python3
"""
Real YaneuraOu Backend Server
Runs actual YaneuraOu Shogi engine (World Champion 2019!)
**Timestamp**: 2025-12-19
"""

import asyncio
import subprocess
import socket
import sys
import logging
import time
from pathlib import Path
from aiohttp import web
import aiohttp_cors
from collections import defaultdict

# Suppress noisy connection errors that aren't actual crashes
logging.getLogger("asyncio").setLevel(logging.WARNING)
logging.getLogger("aiohttp").setLevel(logging.WARNING)


class RateLimiter:
    """Token bucket rate limiter for concurrent user management"""
    def __init__(self, max_concurrent=3, refill_rate=1.0, bucket_size=5):
        self.max_concurrent = max_concurrent  # Max simultaneous users
        self.refill_rate = refill_rate        # Tokens per second
        self.bucket_size = bucket_size        # Max tokens
        self.buckets = defaultdict(lambda: {'tokens': bucket_size, 'last_update': time.time()})
        self.active_requests = 0

    async def acquire(self, client_ip):
        """Acquire permission to make a request"""
        bucket = self.buckets[client_ip]

        # Refill tokens based on time passed
        now = time.time()
        time_passed = now - bucket['last_update']
        tokens_to_add = time_passed * self.refill_rate
        bucket['tokens'] = min(bucket['tokens'] + tokens_to_add, self.bucket_size)
        bucket['last_update'] = now

        # Check concurrent limit and token availability
        if self.active_requests >= self.max_concurrent:
            return False, f"Server busy ({self.active_requests}/{self.max_concurrent} active users). Please wait."

        if bucket['tokens'] < 1:
            return False, f"Rate limit exceeded. Please wait {int(1/self.refill_rate)} seconds."

        # Grant access
        bucket['tokens'] -= 1
        self.active_requests += 1
        return True, None

    def release(self, client_ip):
        """Release a request slot"""
        self.active_requests = max(0, self.active_requests - 1)


class YaneuraOuEngine:
    def __init__(self, exe_path):
        self.exe_path = exe_path
        self.process = None
        self.rate_limiter = RateLimiter(max_concurrent=3, refill_rate=0.5, bucket_size=3)

    async def start(self):
        """Start YaneuraOu process"""
        self.process = await asyncio.create_subprocess_exec(
            self.exe_path,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )

        # Initialize USI (Universal Shogi Interface)
        await self.send_command("usi")
        await self.wait_for("usiok")
        print("[OK] Real YaneuraOu engine initialized!")

    async def send_command(self, command):
        """Send command to YaneuraOu"""
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
            print(f"YaneuraOu: {decoded}")
            if expected in decoded:
                return decoded

    async def get_best_move(self, sfen, skill_level=5, btime=1000, wtime=1000):
        """Get best move from position"""
        # Set position (SFEN format for Shogi)
        await self.send_command(f"position sfen {sfen}")

        # Request move with time controls
        await self.send_command(f"go btime {btime} wtime {wtime}")

        # Wait for bestmove
        bestmove_line = await self.wait_for("bestmove")
        move = bestmove_line.split()[1] if bestmove_line else None

        return move


# Global engine instance
engine = None


async def handle_get_move(request):
    """Handle move requests from frontend with rate limiting"""
    try:
        # Get client IP for rate limiting
        client_ip = request.headers.get('X-Forwarded-For', request.remote or 'unknown').split(',')[0].strip()

        # Check rate limits
        allowed, limit_message = await engine.rate_limiter.acquire(client_ip)
        if not allowed:
            print(f"[RATE_LIMIT] Shogi request denied from {client_ip}: {limit_message}")
            return web.json_response(
                {
                    "success": False,
                    "error": limit_message,
                    "retry_after": 5,
                    "rate_limited": True
                },
                status=429  # Too Many Requests
            )

        try:
            data = await request.json()
            sfen = data.get("sfen")
            skill = data.get("skill", 5)
            btime = data.get("btime", 1000)
            wtime = data.get("wtime", 1000)

            print(f"📩 Shogi move request from {client_ip}: Skill={skill}, Time={btime}ms")
            print(f"Position: {sfen}")
            print(f"Active requests: {engine.rate_limiter.active_requests}/{engine.rate_limiter.max_concurrent}")

            move = await engine.get_best_move(sfen, skill, btime, wtime)

            print(f"[OK] Best move: {move}")

            return web.json_response(
                {
                    "success": True,
                    "move": move,
                    "engine": "YaneuraOu v9.10",
                    "strength": "World Champion Level",
                }
            )
        finally:
            # Always release the rate limiter slot
            engine.rate_limiter.release(client_ip)

    except Exception as e:
        print(f"[ERROR] Error: {e}")
        return web.json_response({"success": False, "error": str(e)}, status=500)


async def handle_status(request):
    """Status endpoint"""
    return web.json_response(
        {
            "status": "online",
            "engine": "YaneuraOu",
            "version": "v9.10 (ふかうら王)",
            "strength": "World Champion Level",
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
    """Start YaneuraOu engine on startup"""
    global engine

    try:
        # Find YaneuraOu executable
        yaneuraou_paths = [
            Path("yaneuraou/YaneuraOu-Deep-ORT-CPU.exe"),
            Path("yaneuraou/YaneuraOu.exe"),
            Path("yaneuraou/YaneuraOu-by-gcc.exe"),
        ]

        yaneuraou_exe = None
        for path in yaneuraou_paths:
            if path.exists():
                yaneuraou_exe = str(path.absolute())
                break

        if not yaneuraou_exe:
            print("[ERROR] ERROR: YaneuraOu executable not found!", file=sys.stderr)
            print("Expected paths:", file=sys.stderr)
            for p in yaneuraou_paths:
                print(f"  - {p}", file=sys.stderr)
            print(
                "[WARN]  Server will start but Shogi features will not work!",
                file=sys.stderr,
            )
            return

        print(f"[OK] Found YaneuraOu: {yaneuraou_exe}")

        engine = YaneuraOuEngine(yaneuraou_exe)
        await engine.start()
        print("[START] YaneuraOu backend ready!")
    except Exception as e:
        print(f"[ERROR] CRITICAL ERROR starting YaneuraOu engine: {e}", file=sys.stderr)
        import traceback

        traceback.print_exc(file=sys.stderr)
        print(
            "[WARN]  Server will start but Shogi features will not work!",
            file=sys.stderr,
        )


def handle_asyncio_exceptions(loop, context):
    """Handle asyncio exceptions to suppress noisy connection errors"""
    exception = context.get("exception")
    if isinstance(exception, ConnectionResetError) or (
        isinstance(exception, OSError) and exception.errno in (10054, 10053, 10057)
    ):
        # Suppress common connection errors that aren't actual server crashes
        print(f"[INFO] Connection error (suppressed): {exception}")
        return

    # For other exceptions, show the full context
    print(f"[WARN] Asyncio exception: {context}")
    if exception:
        import traceback

        traceback.print_exc()


def main():
    port = 9544

    # Set up asyncio exception handler to suppress connection errors
    loop = asyncio.get_event_loop()
    loop.set_exception_handler(handle_asyncio_exceptions)

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
    print("  REAL YANEURAOU BACKEND SERVER")
    print("===================================================")
    print("")
    print("Port: 9544 (Shogi backend)")
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
    except ConnectionResetError as e:
        # Handle client connection resets gracefully - these are not server crashes
        print(f"[INFO] Client connection reset (normal): {e}")
        print("[INFO] Server continues running...")
    except Exception as e:
        print(f"[ERROR] CRITICAL ERROR: {e}", file=sys.stderr)
        import traceback

        traceback.print_exc(file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
