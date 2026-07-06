#!/usr/bin/env python3
"""
Real Stockfish Server - Uses actual Stockfish chess engine
SECURITY: Includes rate limiting and authentication for public internet access
"""

import argparse
import asyncio
import os
import subprocess
import sys
import threading

import aiohttp_cors
from aiohttp import web

# Add parent directory to path for security_middleware import
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler()],
)
logger = logging.getLogger("stockfish_server")

try:
    from security_middleware import get_security_stats, security_middleware

    SECURITY_ENABLED = True
except ImportError:
    logger.warning("security_middleware not found, running without security")
    SECURITY_ENABLED = False

# Stockfish executable path (relative to repo root)
STOCKFISH_PATH = os.environ.get(
    "STOCKFISH_PATH",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "stockfish", "stockfish-windows-x86-64-avx2.exe")
)


class StockfishEngine:
    """Manages Stockfish engine instance"""

    def __init__(self, path):
        self.path = path
        self.process = None
        self.lock = threading.Lock()

    def start(self):
        """Start the Stockfish process"""
        if self.process is None:
            try:
                self.process = subprocess.Popen(
                    [self.path],
                    stdin=subprocess.PIPE,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    bufsize=1,
                )
                # Initialize engine
                self._send_command("uci")
                self._send_command("isready")
                logger.info("Stockfish engine started successfully")
            except Exception as e:
                logger.error(f"Failed to start Stockfish: {e}")
                self.process = None

    def stop(self):
        """Stop the Stockfish process"""
        if self.process:
            try:
                self._send_command("quit")
                self.process.terminate()
                self.process.wait(timeout=5)
            except:
                self.process.kill()
            self.process = None

    def _send_command(self, command):
        """Send command to Stockfish"""
        if self.process:
            try:
                self.process.stdin.write(command + "\n")
                self.process.stdin.flush()
            except Exception as e:
                logger.error(f"Error sending command '{command}': {e}")

    def _read_response(self):
        """Read response from Stockfish"""
        if not self.process:
            return ""

        response = ""
        try:
            # Read until we get a response or timeout
            import time

            start_time = time.time()
            while time.time() - start_time < 10:  # 10 second timeout
                line = self.process.stdout.readline().strip()
                if line:
                    response += line + "\n"
                    # Check for common termination patterns
                    if "bestmove" in line or "readyok" in line:
                        break
                else:
                    time.sleep(0.01)  # Small delay to avoid busy waiting
        except Exception as e:
            logger.error(f"Error reading response: {e}")

        return response

    def get_best_move(self, fen, depth=10):
        """Get best move for position"""
        with self.lock:
            if not self.process:
                self.start()
                if not self.process:
                    raise Exception("Stockfish engine not available")

            try:
                # Drain stale output from previous requests (prevents engine desync)
                self._send_command("isready")
                self._read_response()

                # Set position
                self._send_command(f"position fen {fen}")

                # Set skill level (0-20, where 20 is max)
                skill = min(20, max(0, depth))
                self._send_command(f"setoption name Skill Level value {skill}")

                # Request best move
                self._send_command("go movetime 2000")  # 2 second thinking time

                # Read response
                response = self._read_response()

                # Parse best move
                for line in response.split("\n"):
                    if line.startswith("bestmove"):
                        parts = line.split()
                        if len(parts) >= 2:
                            move = parts[1]
                            if move != "(none)":
                                return move

                raise Exception("No best move found in Stockfish response")

            except Exception as e:
                logger.error(f"Error getting best move: {e}")
                raise


# Global Stockfish engine instance
stockfish_engine = StockfishEngine(STOCKFISH_PATH)


async def handle_move(request):
    """Handle chess move requests with real Stockfish engine"""
    try:
        data = await request.json()
        fen = data.get("fen", "")
        depth = data.get("depth", 10)

        if not fen:
            return web.json_response(
                {"success": False, "error": "No FEN position provided"}, status=400
            )

        # Get best move from Stockfish
        move = stockfish_engine.get_best_move(fen, depth)

        logger.info(f"Stockfish move for {fen[:20]}...: {move}")

        return web.json_response(
            {
                "success": True,
                "move": move,
                "engine": "Stockfish 16",
                "strength": f"Depth {depth}, Skill {min(20, max(0, depth))}",
            }
        )

    except Exception as e:
        logger.error(f"Error in handle_move: {e}")
        return web.json_response({"success": False, "error": str(e)}, status=500)


async def handle_status(request):
    """Status endpoint"""
    try:
        # Test if Stockfish is responsive
        test_move = stockfish_engine.get_best_move(
            "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", 5
        )
        ready = bool(test_move and len(test_move) >= 4)

        return web.json_response(
            {
                "status": "online",
                "ready": ready,  # Critical: JavaScript checks status.ready
                "engine": "Stockfish 16",
                "version": "Real Engine",
                "strength": "Full chess analysis",
                "elo": "3500+",
            }
        )
    except Exception as e:
        logger.error(f"Stockfish status check failed: {e}")
        return web.json_response(
            {
                "status": "error",
                "ready": False,
                "engine": "Stockfish 16",
                "error": str(e),
            }
        )


async def handle_security_stats(request):
    """Security statistics endpoint (admin only)"""
    if SECURITY_ENABLED:
        stats = get_security_stats()
        return web.json_response(stats)
    return web.json_response({"error": "Security not enabled"}, status=503)


async def create_app():
    app = web.Application()

    # Add security middleware if available
    if SECURITY_ENABLED:
        app.middlewares.append(security_middleware)
        logger.info(
            "Security middleware enabled: Rate limiting and authentication active"
        )

    # CORS - Configured for public access but with security
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
    app.router.add_post("/api/move", handle_move)
    app.router.add_get("/api/status", handle_status)
    app.router.add_get("/api/security/stats", handle_security_stats)

    # Add CORS to routes
    for route in list(app.router.routes()):
        cors.add(route)

    return app


async def startup_tasks(app):
    """Initialize services on startup"""
    logger.info("Initializing Stockfish engine...")
    stockfish_engine.start()

    # Test the engine
    try:
        test_move = stockfish_engine.get_best_move(
            "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", 5
        )
        if test_move:
            logger.info("✅ Stockfish engine initialized successfully")
        else:
            logger.error("❌ Stockfish engine test failed - no moves returned")
    except Exception as e:
        logger.error(f"❌ Stockfish engine initialization failed: {e}")


async def shutdown_tasks(app):
    """Clean shutdown"""
    logger.info("Shutting down Stockfish engine...")
    stockfish_engine.stop()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Stockfish Server")
    parser.add_argument(
        "--port",
        type=int,
        default=int(os.environ.get("AI_STOCKFISH_PORT", 10001)),
        help="Port to run the server on",
    )
    args = parser.parse_args()

    port = args.port
    logger.info("Real Stockfish Server")
    logger.info(f"Starting on port {port}")
    logger.info("Using actual Stockfish 16 engine")
    logger.info(f"Starting on 127.0.0.1:{port} (local only — Docker overrides via STOCKFISH_HOST)")

    # Create app and add startup handlers
    app = asyncio.run(create_app())
    app.on_startup.append(startup_tasks)
    app.on_shutdown.append(shutdown_tasks)

    web.run_app(app, host=os.environ.get("STOCKFISH_HOST", "127.0.0.1"), port=port)
