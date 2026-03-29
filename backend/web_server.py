#!/usr/bin/env python3
"""
Simple Web Server for Games Collection
**Timestamp**: 2025-12-04
"""

import html
import http.server
import json
import logging
import os
import re
import shutil
import signal
import socket
import socketserver
import sqlite3
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from urllib.parse import parse_qs, urlparse

try:
    import defusedxml.ElementTree as ET
except ImportError:
    # Standard library fallback, audit verified for trusted internal RSS feeds
    import xml.etree.ElementTree as ET  # nosec: S405

import psutil

# Local imports
try:
    from . import kanji_handlers
except (ImportError, ValueError):
    import kanji_handlers

# Constants (reservoir port 10726 per WEBAPP_PORTS.md)
DEFAULT_PORT = 10726
STOCKFISH_DEFAULT_PORT = 11543
SHOGI_DEFAULT_PORT = 11544
KATAGO_DEFAULT_PORT = 11545
MULTIPLAYER_DEFAULT_PORT = 11877
KANJI_API_DEFAULT_PORT = 5003
JLPT_API_DEFAULT_PORT = 5001
SOUND_SERVICE_DEFAULT_PORT = 9879

# Path indices and lengths
MIN_API_PATH_PARTS = 3
MIN_SERVER_CONTROL_PARTS = 3
ARG_PORT_INDEX = 2

# Windows Error Codes
WSAEADDRINUSE = 10048

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    stream=sys.stderr,
)
logger = logging.getLogger(__name__)


class OptimizedRequestHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP request handler with improved performance."""

    def end_headers(self):
        """Add CORS and caching headers."""
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

        # Smart caching based on file type
        path = self.path.split("?")[0]  # Remove query parameters
        if path.endswith(
            (
                ".css",
                ".png",
                ".jpg",
                ".jpeg",
                ".gif",
                ".ico",
                ".svg",
                ".woff",
                ".woff2",
            )
        ):
            # Static assets: cache for 1 hour
            self.send_header("Cache-Control", "public, max-age=3600, immutable")
            self.send_header("Expires", self.date_time_string(time.time() + 3600))
        elif path.endswith(".js"):
            # JavaScript files: no cache during development
            self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
            self.send_header("Pragma", "no-cache")
            self.send_header("Expires", "0")
        elif path.endswith((".html", ".htm")):
            # HTML files: no cache during development
            self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
            self.send_header("Pragma", "no-cache")
            self.send_header("Expires", "0")
        else:
            # Other files: no cache for development
            self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")

        super().end_headers()

    def do_GET(self):
        """Handle GET requests."""
        # Mapping of paths to handler methods
        handlers = {
            "/api/test": self._handle_test,
            "/api/config": self._handle_config,
            "/api/servers": self._handle_server_status,
        }

        if self.path in handlers:
            handlers[self.path]()
            return

        # Path prefix matches
        if self.path.startswith(
            ("/api/stockfish/", "/api/shogi/", "/api/go/", "/api/multiplayer/")
        ):
            self._proxy_ai_request()
        elif self.path.startswith("/api/guardian"):
            self._handle_guardian_request()
        elif self.path.startswith("/api/kanji/"):
            self._handle_kanji_api()
        elif self.path in ["/", ""]:
            self._serve_index()
        else:
            # Handle normal file serving
            super().do_GET()

    def _handle_test(self):
        """Handle debug test endpoint."""
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(
            b'{"test": "working", "timestamp": "' + str(time.time()).encode() + b'"}'
        )

    def do_POST(self):
        """Handle POST requests - critical for AI move requests."""
        # Handle server control API
        if self.path.startswith("/api/servers/"):
            self._handle_server_control()
            return

        # Proxy AI POST requests
        if self.path.startswith(
            ("/api/stockfish/", "/api/shogi/", "/api/go/", "/api/multiplayer/")
        ):
            self._proxy_ai_request()
            return

        # Handle other POST requests
        self.send_error(405, "Method Not Allowed")

    def _serve_index(self):
        """Serve index.html content directly."""
        try:
            index_path = Path("index.html")
            if index_path.exists():
                with index_path.open("rb") as f:
                    content = f.read()
                self.send_response(200)
                self.send_header("Content-Type", "text/html")
                self.send_header("Content-Length", str(len(content)))
                self.end_headers()
                self.wfile.write(content)
            else:
                self.send_error(404, "index.html not found")
        except (OSError, sqlite3.Error) as e:
            logger.exception("Error serving index.html")
            self.send_error(500, f"Error reading index.html: {e}")

    def _handle_config(self):
        """Handle /api/config request."""
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()

        client_ip = self.client_address[0]
        config = {
            "ai_server_host": self._get_ai_server_host(client_ip),
            "is_remote": not self._is_local_ip(client_ip),
            "ports": {
                "stockfish": STOCKFISH_DEFAULT_PORT,
                "katago": KATAGO_DEFAULT_PORT,
                "yaneuraou": SHOGI_DEFAULT_PORT,
                "multiplayer": MULTIPLAYER_DEFAULT_PORT,
                "kanji_api": int(
                    os.environ.get("KANJI_API_PORT", KANJI_API_DEFAULT_PORT)
                ),
                "jlpt_api": int(os.environ.get("JLPT_API_PORT", JLPT_API_DEFAULT_PORT)),
            },
            "remote_access_enabled": True,
            "competitive_play": {
                "enabled": True,
                "ai_servers": [
                    str(STOCKFISH_DEFAULT_PORT),
                    str(KATAGO_DEFAULT_PORT),
                    str(SHOGI_DEFAULT_PORT),
                ],
                "note": "Ports must be accessible remotely for mobile players",
            },
        }

        self.wfile.write(json.dumps(config).encode())

    def _is_local_ip(self, ip):
        """Check if IP is local."""
        return ip.startswith(("127.", "192.168.", "10.", "172."))

    def _safe_urlopen(self, url, **kwargs):
        """Standardized URL open with scheme validation."""
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https"):
            msg = f"Forbidden URL scheme: {parsed.scheme}"
            raise ValueError(msg)
        return urllib.request.urlopen(url, **kwargs)  # nosec: S310

    def _get_ai_server_host(self, client_ip):
        """Determine the correct AI server host for the client."""
        if self._is_local_ip(client_ip):
            return "localhost"

        # Check for Tailscale connection
        if client_ip.startswith("100."):
            try:
                ts_path = shutil.which("tailscale")
                if ts_path:
                    result = subprocess.run(
                        [ts_path, "ip", "-4"],
                        capture_output=True,
                        text=True,
                        timeout=5,
                        check=False,
                    )  # nosec: S603
                    if result.returncode == 0:
                        tailscale_ip = result.stdout.strip()
                        logger.info(
                            "Detected Tailscale connection from %s, using %s",
                            client_ip,
                            tailscale_ip,
                        )
                        return tailscale_ip
            except (
                subprocess.TimeoutExpired,
                OSError,
                subprocess.CalledProcessError,
            ):
                logger.warning("Could not get Tailscale IP")

        return "host.docker.internal"

    def _proxy_ai_request(self):
        """Simple proxy for AI server requests."""
        service_ports = {
            "stockfish": int(os.environ.get("STOCKFISH_PORT", STOCKFISH_DEFAULT_PORT)),
            "shogi": int(os.environ.get("SHOGI_PORT", SHOGI_DEFAULT_PORT)),
            "go": int(os.environ.get("GO_PORT", KATAGO_DEFAULT_PORT)),
            "multiplayer": int(
                os.environ.get("MULTIPLAYER_PORT", MULTIPLAYER_DEFAULT_PORT)
            ),
        }

        path_parts = self.path.split("/")
        if len(path_parts) < MIN_API_PATH_PARTS:
            self.send_error(404, "Invalid API path")
            return

        service = path_parts[2]
        port = service_ports.get(service)

        if not port:
            self.send_error(404, f"Unknown AI service: {service}")
            return

        target_path = "/" + "/".join(path_parts[3:])
        target_url = f"http://localhost:{port}{target_path}"

        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length) if content_length > 0 else None

        # Construction of target_url is safe as it uses local ports
        req = urllib.request.Request(
            target_url,
            data=body,
            headers={k: v for k, v in self.headers.items() if k.lower() != "host"},
            method=self.command,
        )  # nosec: S310

        try:
            with self._safe_urlopen(req) as response:
                self.send_response(response.status)
                for k, v in response.getheaders():
                    self.send_header(k, v)
                self.end_headers()
                self.wfile.write(response.read())
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            for k, v in e.headers.items():
                self.send_header(k, v)
            self.end_headers()
            self.wfile.write(e.read())
        except (urllib.error.URLError, OSError):
            logger.exception("Proxy error")
            self.send_error(502, "Proxy error")

    def _handle_guardian_request(self):
        """Handle requests for Guardian crosswords."""
        try:
            db_path = Path("data/crosswords.db")
            db_path.parent.mkdir(exist_ok=True)

            with sqlite3.connect(db_path) as conn:
                c = conn.cursor()
                c.execute(
                    """CREATE TABLE IF NOT EXISTS puzzles
                       (id TEXT PRIMARY KEY, source TEXT,
                        date TEXT, data TEXT, title TEXT)"""
                )
                conn.commit()

                logger.debug("Handling Guardian Request. Path: %s", self.path)

                if "latest" in self.path:
                    self._handle_guardian_latest(c, conn)
                    return

        except (sqlite3.Error, OSError, urllib.error.URLError, ValueError) as e:
            logger.exception("Guardian API Error")
            self.send_error(500, f"Guardian Error: {e!s}")

    def _handle_guardian_latest(self, cursor, conn):
        """Helper to handle fetching the latest Guardian crossword."""
        puzzle_type = "quick" if "type=quick" in self.path else "cryptic"
        rss_url = f"https://www.theguardian.com/crosswords/series/{puzzle_type}/rss"

        with self._safe_urlopen(rss_url) as response:
            xml_data = response.read()

        root = ET.fromstring(xml_data)  # nosec: S314
        latest_item = root.find(".//item")
        if latest_item is None:
            err_msg = "No items found in RSS"
            raise ValueError(err_msg)

        link = latest_item.find("link").text
        guid_node = latest_item.find("guid")
        guid = guid_node.text if guid_node is not None else link

        cursor.execute("SELECT data FROM puzzles WHERE id=?", (guid,))
        row = cursor.fetchone()

        if row:
            logger.info("Serving %s from cache", guid)
            puzzle_data = json.loads(row[0])
        else:
            logger.info("Scraping %s", link)
            puzzle_data = self._scrape_guardian_puzzle(link, guid)

            if puzzle_data:
                cursor.execute(
                    "INSERT OR REPLACE INTO puzzles (id, source, date, data, title) "
                    "VALUES (?, ?, ?, ?, ?)",
                    (
                        guid,
                        f"guardian-{puzzle_type}",
                        puzzle_data.get("date", ""),
                        json.dumps(puzzle_data),
                        puzzle_data.get("name", ""),
                    ),
                )
                conn.commit()

        if puzzle_data:
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(puzzle_data).encode())

    def _scrape_guardian_puzzle(self, link, guid):
        """Scrape puzzle data from Guardian website."""
        json_link = f"{link}.json"
        headers = {"User-Agent": "Mozilla/5.0"}
        puzzle_data = None

        try:
            logger.info("Attempting JSON endpoint: %s", json_link)
            req = urllib.request.Request(json_link, headers=headers)  # nosec: S310
            with self._safe_urlopen(req) as response:
                puzzle_data = json.loads(response.read().decode("utf-8"))
                logger.info("Successfully fetched JSON data for %s", guid)
        except (urllib.error.URLError, json.JSONDecodeError, ValueError) as e:
            logger.warning(
                "JSON endpoint failed (%s), falling back to HTML scraping", e
            )
            req = urllib.request.Request(link, headers=headers)  # nosec: S310
            with self._safe_urlopen(req) as response:
                html_content = response.read().decode("utf-8")

            match = re.search(r'data-crossword-data="([^"]+)"', html_content)
            if match:
                raw_json = html.unescape(match.group(1))
                puzzle_data = json.loads(raw_json)
            else:
                msg = "Could not find crossword data in HTML and JSON endpoint failed"
                raise ValueError(msg) from None

        return puzzle_data

    def log_message(self, log_format, *args):
        """Standard log format for the server."""
        sys.stderr.write(
            f"{self.client_address[0]} - - [{self.log_date_time_string()}] "
            f"{log_format % args}\n"
        )

    def _handle_server_status(self):
        """Handle /api/servers request."""
        services = {
            "web-server": {"port": DEFAULT_PORT, "description": "Main Web Server"},
            "stockfish-server": {
                "port": STOCKFISH_DEFAULT_PORT,
                "description": "Chess AI Engine",
            },
            "katago-server": {
                "port": KATAGO_DEFAULT_PORT,
                "description": "Go AI Engine",
            },
            "yaneuraou-server": {
                "port": SHOGI_DEFAULT_PORT,
                "description": "Shogi AI Engine",
            },
            "kanji-api": {
                "port": KANJI_API_DEFAULT_PORT,
                "description": "Kanji Database API",
            },
            "multiplayer-server": {
                "port": MULTIPLAYER_DEFAULT_PORT,
                "description": "Competitive Play Engine",
            },
            "sound-service": {
                "port": SOUND_SERVICE_DEFAULT_PORT,
                "description": "Audio Service",
            },
        }

        servers = {}
        for name, config in services.items():
            port = config["port"]
            is_running = self._check_port("localhost", port)
            process_info = self._get_process_info(port) if is_running else None

            servers[name] = {
                "running": is_running,
                "port": port,
                "description": config["description"],
                "uptime": process_info.get("uptime") if process_info else None,
                "pid": process_info.get("pid") if process_info else None,
                "cpu_percent": process_info.get("cpu_percent")
                if process_info
                else None,
                "memory_mb": process_info.get("memory_mb") if process_info else None,
                "auto_restart": True,
            }

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"servers": servers}).encode())

    def _check_port(self, host, port):
        """Check if a port is open."""
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
                sock.settimeout(1)
                return sock.connect_ex((host, port)) == 0
        except OSError:
            return False

    def _get_process_info(self, port):
        """Get process info for a port if possible."""
        try:
            for conn in psutil.net_connections(kind="inet"):
                if conn.laddr.port == port and conn.status == "LISTEN":
                    try:
                        process = psutil.Process(conn.pid)
                        create_time = process.create_time()
                        uptime = int(time.time() - create_time) if create_time else None
                        return {
                            "pid": conn.pid,
                            "uptime": uptime,
                            "cpu_percent": round(process.cpu_percent(), 1),
                            "memory_mb": round(
                                process.memory_info().rss / 1024 / 1024, 1
                            ),
                        }
                    except (psutil.NoSuchProcess, psutil.AccessDenied):
                        pass
        except psutil.Error:
            pass
        return {}

    def _handle_server_control(self):
        """Handle POST /api/servers/ control requests."""
        path_parts = self.path.strip("/").split("/")
        if len(path_parts) < MIN_SERVER_CONTROL_PARTS:
            self.send_error(400, "Invalid server control path")
            return

        server_name = path_parts[2]
        action = (
            path_parts[MIN_SERVER_CONTROL_PARTS]
            if len(path_parts) > MIN_SERVER_CONTROL_PARTS
            else None
        )

        if not action or action not in ["start", "stop", "restart"]:
            self.send_error(400, f"Invalid action: {action}")
            return

        response = self._execute_server_action(server_name, action)

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(response).encode())

    def _execute_server_action(self, server_name, action):
        """Execute start/stop/restart on a service."""
        startup_commands = {
            "stockfish-server": (
                f"python backend/simple-stockfish-server.py "
                f"--port {STOCKFISH_DEFAULT_PORT}"
            ),
            "katago-server": (
                f"python backend/simple-go-server.py --port {KATAGO_DEFAULT_PORT}"
            ),
            "yaneuraou-server": (
                f"python backend/simple-shogi-server.py --port {SHOGI_DEFAULT_PORT}"
            ),
            "kanji-api": "python backend/kanji-api.py",
            "multiplayer-server": (
                f"python backend/multiplayer-server.py "
                f"--port {MULTIPLAYER_DEFAULT_PORT}"
            ),
            "sound-service": "python backend/sound-service.py",
        }

        server_ports = {
            "stockfish-server": STOCKFISH_DEFAULT_PORT,
            "katago-server": KATAGO_DEFAULT_PORT,
            "yaneuraou-server": SHOGI_DEFAULT_PORT,
            "kanji-api": KANJI_API_DEFAULT_PORT,
            "multiplayer-server": MULTIPLAYER_DEFAULT_PORT,
            "sound-service": SOUND_SERVICE_DEFAULT_PORT,
        }

        if server_name not in server_ports:
            return {"success": False, "message": f"Unknown server: {server_name}"}

        try:
            if action == "start":
                return self._start_service(server_name, startup_commands)
            if action == "stop":
                return self._stop_service(server_name, server_ports)
            if action == "restart":
                self._stop_service(server_name, server_ports)
                time.sleep(2)
                return self._start_service(server_name, startup_commands)
        except (subprocess.SubprocessError, OSError, signal.ITIMER_REAL):
            logger.exception("Server control error")
            return {"success": False, "message": "Internal server error"}

        return {"success": False, "message": f"Invalid action: {action}"}

    def _start_service(self, server_name, startup_commands):
        """Start a specific service."""
        if server_name not in startup_commands:
            return {
                "success": False,
                "message": f"No startup command for {server_name}",
            }

        cmd = startup_commands[server_name].split()
        # Commands are defined internally in startup_commands
        process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)  # nosec: S603
        return {
            "success": True,
            "message": f"Started {server_name}",
            "pid": process.pid,
        }

    def _stop_service(self, server_name, server_ports):
        """Stop a specific service."""
        port = server_ports[server_name]
        target_pid = None
        for conn in psutil.net_connections(kind="inet"):
            if conn.laddr.port == port and conn.status == "LISTEN":
                target_pid = conn.pid
                break

        if target_pid:
            os.kill(target_pid, signal.SIGTERM)
            return {"success": True, "message": f"Stopped {server_name}"}

        return {"success": False, "message": f"Process not found for {server_name}"}

    def _handle_kanji_api(self):
        """Handle kanji API requests using externalized handlers."""
        try:
            parsed_url = urlparse(self.path)
            query_params = parse_qs(parsed_url.query)

            if parsed_url.path == "/api/kanji/all":
                response = kanji_handlers.handle_kanji_all(query_params)
            elif parsed_url.path == "/api/kanji/search":
                response = kanji_handlers.handle_kanji_search(query_params)
            else:
                self.send_error(404, "Kanji API endpoint not found")
                return

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())

        except (sqlite3.Error, json.JSONDecodeError, ValueError) as e:
            logger.exception("Kanji API error")
            self.send_error(500, f"Kanji API error: {e!s}")


class ThreadingHTTPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
    """A threaded HTTP server."""

    allow_reuse_address = True
    daemon_threads = True


def parse_args():
    """Parse command line arguments."""
    port = DEFAULT_PORT
    if len(sys.argv) > 1 and sys.argv[1] == "--port" and len(sys.argv) > ARG_PORT_INDEX:
        try:
            port = int(sys.argv[ARG_PORT_INDEX])
        except ValueError:
            logger.exception("Invalid port number: %s", sys.argv[ARG_PORT_INDEX])
            sys.exit(1)
    return port


def check_port_availability(port):
    """Verify the port is available before starting."""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    try:
        sock.bind(("0.0.0.0", port))
        sock.close()
    except OSError as e:
        if e.errno == WSAEADDRINUSE:
            logger.exception("Port %s is already in use!", port)
            logger.info("Try running: netstat -ano | findstr :%s", port)
        else:
            logger.exception("Cannot bind to port %s", port)
        sys.exit(1)


def main():
    """Main entry point for the web server."""
    port = parse_args()
    check_port_availability(port)

    try:
        httpd = ThreadingHTTPServer(("0.0.0.0", port), OptimizedRequestHandler)
        server_address = httpd.server_address

        logger.info("===================================================")
        logger.info("  WEB SERVER FOR GAMES COLLECTION")
        logger.info("===================================================")
        logger.info("Server bound to: %s:%s", server_address[0], server_address[1])
        logger.info("Server running on: http://localhost:%s", port)
        logger.info("Also accessible at: http://127.0.0.1:%s", port)

        hostname = socket.gethostname()
        try:
            local_ip = socket.gethostbyname(hostname)
            logger.info("Network access: http://%s:%s", local_ip, port)
        except OSError:
            logger.debug("Could not determine local IP")

        logger.info("Serving directory: %s", Path.cwd())
        logger.info("Press Ctrl+C to stop")
        sys.stdout.flush()

        logger.info("Starting server on port %s...", port)
        try:
            httpd.serve_forever()
        finally:
            httpd.server_close()
            logger.info("Server stopped")
    except KeyboardInterrupt:
        logger.warning("Server stopped by user")
        sys.exit(0)
    except Exception:
        logger.exception("CRITICAL ERROR")
        sys.exit(1)


if __name__ == "__main__":
    main()
