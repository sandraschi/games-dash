import json

#!/usr/bin/env python3
"""
Simple Web Server for Games Collection
**Timestamp**: 2025-12-04
"""

import sys
import http.server
import socketserver
import psutil
import signal
import os
from pathlib import Path
import time
import json
import os
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
import sqlite3
import re
import html


def main():
    # Default port, can be overridden by command line argument
    PORT = 9876

    # Parse command line arguments
    if len(sys.argv) > 1 and sys.argv[1] == "--port" and len(sys.argv) > 2:
        try:
            PORT = int(sys.argv[2])
        except ValueError:
            print(f"[ERROR] Invalid port number: {sys.argv[2]}", file=sys.stderr)
            sys.exit(1)

    # Check if port is in use
    import socket

    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    try:
        sock.bind(("0.0.0.0", PORT))
        sock.close()
    except OSError as e:
        if e.errno == 10048:
            print(f"[ERROR] ERROR: Port {PORT} is already in use!", file=sys.stderr)
            print(f"   Another process is using port {PORT}", file=sys.stderr)
            print(f"   Run: netstat -ano | findstr :{PORT}", file=sys.stderr)
            sys.exit(1)
        else:
            print(f"[ERROR] ERROR: Cannot bind to port {PORT}: {e}", file=sys.stderr)
            sys.exit(1)

    class OptimizedRequestHandler(http.server.SimpleHTTPRequestHandler):
        def end_headers(self):
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
            # Handle debug test endpoint
            if self.path == "/api/test":
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(
                    b'{"test": "working", "timestamp": "'
                    + str(time.time()).encode()
                    + b'"}'
                )
                return

            # Handle API configuration endpoint - Critical for remote access (iPad/iPhone/Bangalore)
            if self.path == "/api/config":
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()

                # Get the client IP to determine if we need to provide AI server host info
                client_ip = self.client_address[0]

                # Get server hostname for remote access
                import socket

                hostname = socket.gethostname()
                try:
                    # Try to get external IP or use hostname
                    server_ip = socket.gethostbyname(hostname)
                except:
                    server_ip = self.server.server_address[0]

                # For remote clients, provide AI server configuration
                # CRITICAL: Ports 10001-10003 must be accessible for iPad/iPhone/Bangalore players
                config = {
                    "ai_server_host": self._get_ai_server_host(client_ip),
                    "is_remote": not self._is_local_ip(client_ip),
                    "ports": {
                        "stockfish": 11543,  # Remote competitive play port
                        "katago": 11545,  # KataGo for Bangalore players
                        "yaneuraou": 11544,  # Shogi AI
                        "multiplayer": 11877,
                        "kanji_api": int(os.environ.get("KANJI_API_PORT", 5003)),
                        "jlpt_api": int(os.environ.get("JLPT_API_PORT", 5001)),
                    },
                    "remote_access_enabled": True,
                    "competitive_play": {
                        "enabled": True,
                        "ai_servers": ["11543", "11545", "11544"],
                        "note": "Ports must be accessible remotely for iPad/iPhone/Bangalore players",
                    },
                }

                self.wfile.write(json.dumps(config).encode())
                return

            # Proxy AI requests
            if self.path.startswith(
                ("/api/stockfish/", "/api/shogi/", "/api/go/", "/api/multiplayer/")
            ):
                self._proxy_ai_request()
                return

            # Handle Guardian Crossword API
            if self.path.startswith("/api/guardian"):
                self._handle_guardian_request()
                return

            # Handle server status API
            if self.path == "/api/servers":
                self._handle_server_status()
                return

            # Handle kanji API endpoints
            if self.path.startswith("/api/kanji/"):
                self._handle_kanji_api()
                return

            # Handle root path - serve index.html content directly
            if self.path in ["/", ""]:
                try:
                    with open("index.html", "rb") as f:
                        content = f.read()
                    self.send_response(200)
                    self.send_header("Content-Type", "text/html")
                    self.send_header("Content-Length", str(len(content)))
                    self.end_headers()
                    self.wfile.write(content)
                    return
                except Exception as e:
                    self.send_error(500, f"Error reading index.html: {e}")
                    return

            # Handle normal file serving
            super().do_GET()

        def do_POST(self):
            """Handle POST requests - critical for AI move requests"""
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

        def _is_local_ip(self, ip):
            """Check if IP is local"""
            return (
                ip.startswith("127.")
                or ip.startswith("192.168.")
                or ip.startswith("10.")
                or ip.startswith("172.")
            )

        def _get_ai_server_host(self, client_ip):
            """Determine the correct AI server host for the client"""
            if self._is_local_ip(client_ip):
                # Local access - use localhost
                return "localhost"
            else:
                # Remote access - need to determine the external host
                # Check if client is connecting via Tailscale (100.x.x.x range)
                if client_ip.startswith("100."):
                    # Tailscale connection - use the Tailscale IP of this machine
                    import subprocess

                    try:
                        # Get Tailscale IP
                        result = subprocess.run(
                            ["tailscale", "ip", "-4"],
                            capture_output=True,
                            text=True,
                            timeout=5,
                        )
                        if result.returncode == 0:
                            tailscale_ip = result.stdout.strip()
                            print(
                                f"[INFO] Detected Tailscale connection from {client_ip}, using {tailscale_ip}"
                            )
                            return tailscale_ip
                    except (
                        subprocess.TimeoutExpired,
                        FileNotFoundError,
                        subprocess.CalledProcessError,
                    ):
                        print("[WARN] Could not get Tailscale IP")

                # Fallback for other remote connections
                return "host.docker.internal"  # For Docker setups

        def _proxy_ai_request(self):
            """Simple proxy for AI server requests - CRITICAL for remote iPad/iPhone access"""
            service_ports = {
                "stockfish": int(os.environ.get("STOCKFISH_PORT", "11543")),
                "shogi": int(os.environ.get("SHOGI_PORT", "11544")),
                "go": int(os.environ.get("GO_PORT", "11545")),
                "multiplayer": int(os.environ.get("MULTIPLAYER_PORT", "11877")),
            }

            path_parts = self.path.split("/")
            if len(path_parts) < 3:
                self.send_error(404, "Invalid API path")
                return

            service = path_parts[2]
            port = service_ports.get(service)

            if not port:
                self.send_error(404, f"Unknown AI service: {service}")
                return

            # Reconstruct the target path (remove /api/service)
            target_path = "/" + "/".join(path_parts[3:])
            target_url = f"http://localhost:{port}{target_path}"

            # Get request body for POST/PUT
            content_length = int(self.headers.get("Content-Length", 0))
            body = self.rfile.read(content_length) if content_length > 0 else None

            # Prepare the proxy request
            req = urllib.request.Request(
                target_url,
                data=body,
                headers={k: v for k, v in self.headers.items() if k.lower() != "host"},
                method=self.command,
            )

            try:
                with urllib.request.urlopen(req) as response:
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
            except Exception as e:
                self.send_error(502, f"Proxy error: {e}")

        def _handle_guardian_request(self):
            """Handle requests for Guardian crosswords"""
            try:
                # 1. Setup DB
                db_path = Path("data/crosswords.db")
                db_path.parent.mkdir(exist_ok=True)

                conn = sqlite3.connect(db_path)
                c = conn.cursor()
                c.execute("""CREATE TABLE IF NOT EXISTS puzzles 
                             (id TEXT PRIMARY KEY, source TEXT, date TEXT, data TEXT, title TEXT)""")
                conn.commit()

                print(f"[DEBUG] Handling Guardian Request. Path: {self.path}")
                puzzle_data = None

                # 2. Determine action
                if "latest" in self.path:
                    # Parse type param
                    puzzle_type = "cryptic"
                    if "type=quick" in self.path:
                        puzzle_type = "quick"

                    # Fetch RSS
                    rss_url = f"https://www.theguardian.com/crosswords/series/{puzzle_type}/rss"
                    with urllib.request.urlopen(rss_url) as response:
                        xml_data = response.read()

                    root = ET.fromstring(xml_data)
                    # Find first item link
                    # RSS structure: channel -> item -> link
                    latest_item = root.find(".//item")
                    if latest_item is None:
                        raise Exception("No items found in RSS")

                    link = latest_item.find("link").text
                    guid = (
                        latest_item.find("guid").text
                        if latest_item.find("guid") is not None
                        else link
                    )

                    # Check if in DB
                    c.execute("SELECT data FROM puzzles WHERE id=?", (guid,))
                    row = c.fetchone()

                    puzzle_data = None
                    if row:
                        print(f"[INFO] Serving {guid} from cache")
                        puzzle_data = json.loads(row[0])
                    else:
                        print(f"[INFO] Scraping {link}")

                        # Try fetching via JSON endpoint (more reliable)
                        json_link = link + ".json"
                        headers = {
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                        }

                        try:
                            # Try .json first
                            print(f"[INFO] Attempting JSON endpoint: {json_link}")
                            req = urllib.request.Request(json_link, headers=headers)
                            with urllib.request.urlopen(req) as response:
                                puzzle_data = json.loads(
                                    response.read().decode("utf-8")
                                )
                                print(f"[SUCCESS] Fetched JSON data for {guid}")

                        except urllib.error.HTTPError as e:
                            print(
                                f"[WARN] JSON endpoint failed ({e}), falling back to HTML scraping"
                            )

                            # Fallback to HTML scraping
                            req = urllib.request.Request(link, headers=headers)
                            with urllib.request.urlopen(req) as response:
                                html_content = response.read().decode("utf-8")

                            # Find data-crossword-data
                            match = re.search(
                                r'data-crossword-data="([^"]+)"', html_content
                            )
                            if match:
                                raw_json = html.unescape(match.group(1))
                                puzzle_data = json.loads(raw_json)
                            else:
                                raise Exception(
                                    "Could not find crossword data in HTML and JSON endpoint failed"
                                )

                        if puzzle_data:
                            # Save to DB
                            c.execute(
                                "INSERT OR REPLACE INTO puzzles (id, source, date, data, title) VALUES (?, ?, ?, ?, ?)",
                                (
                                    guid,
                                    f"guardian-{puzzle_type}",
                                    puzzle_data.get("date", ""),
                                    json.dumps(puzzle_data),
                                    puzzle_data.get("name", ""),
                                ),
                            )
                            conn.commit()

                    conn.close()

                    # Return JSON
                    self.send_response(200)
                    self.send_header("Content-Type", "application/json")
                    self.end_headers()
                    self.wfile.write(json.dumps(puzzle_data).encode())
                    return

            except Exception as e:
                import traceback

                error_msg = f"Fatal Error: {e}\n{traceback.format_exc()}"
                print(error_msg)
                try:
                    with open(
                        "d:/Dev/repos/games-app/backend/LAST_ERROR.txt", "w"
                    ) as f:
                        f.write(error_msg)
                except Exception as file_err:
                    print(f"Failed to write log: {file_err}")

                self.send_error(500, f"Guardian Error: {str(e)}")

        def log_message(self, format, *args):
            sys.stderr.write(
                "%s - - [%s] %s\n"
                % (self.client_address[0], self.log_date_time_string(), format % args)
            )

        def _handle_server_status(self):
            """Handle GET /api/servers - Return status of all backend servers"""
            import socket

            def check_port(host, port):
                """Check if a port is open"""
                try:
                    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                    sock.settimeout(1)
                    result = sock.connect_ex((host, port))
                    sock.close()
                    return result == 0
                except:
                    return False

            def get_process_info(port):
                """Get process info for a port if possible"""
                try:
                    # Try to find process using the port
                    for conn in psutil.net_connections(kind="inet"):
                        if conn.laddr.port == port and conn.status == "LISTEN":
                            try:
                                process = psutil.Process(conn.pid)
                                create_time = getattr(
                                    process, "create_time", lambda: None
                                )()
                                uptime = (
                                    int(time.time() - create_time)
                                    if create_time
                                    else None
                                )
                                return {
                                    "pid": conn.pid,
                                    "uptime": uptime,
                                    "cpu_percent": round(process.cpu_percent(), 1),
                                    "memory_mb": round(
                                        process.memory_info().rss / 1024 / 1024, 1
                                    ),
                                }
                            except:
                                pass
                except:
                    pass
                return None

            # Define all services to check
            services = {
                "web-server": {"port": 9876, "description": "Main Web Server"},
                "stockfish-server": {"port": 11543, "description": "Chess AI Engine"},
                "katago-server": {"port": 11545, "description": "Go AI Engine"},
                "yaneuraou-server": {"port": 11544, "description": "Shogi AI Engine"},
                "kanji-api": {"port": 11003, "description": "Kanji Database API"},
                "multiplayer-server": {
                    "port": 11877,
                    "description": "Competitive Play Engine",
                },
                "sound-service": {"port": 9879, "description": "Audio Service"},
            }

            servers = {}
            for name, config in services.items():
                port = config["port"]
                is_running = check_port("localhost", port)
                process_info = get_process_info(port) if is_running else None

                servers[name] = {
                    "running": is_running,
                    "port": port,
                    "description": config["description"],
                    "uptime": process_info.get("uptime") if process_info else None,
                    "pid": process_info.get("pid") if process_info else None,
                    "cpu_percent": process_info.get("cpu_percent")
                    if process_info
                    else None,
                    "memory_mb": process_info.get("memory_mb")
                    if process_info
                    else None,
                    "auto_restart": True,
                }

            # Send JSON response
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"servers": servers}).encode())

        def _handle_server_control(self):
            """Handle POST /api/servers/<name>/start|stop|restart"""
            import subprocess

            # Parse the path
            path_parts = self.path.strip("/").split("/")
            if len(path_parts) < 3:
                self.send_error(400, "Invalid server control path")
                return

            server_name = path_parts[2]
            action = path_parts[3] if len(path_parts) > 3 else None

            if not action or action not in ["start", "stop", "restart"]:
                self.send_error(400, f"Invalid action: {action}")
                return

            # Define server configurations
            startup_commands = {
                "stockfish-server": "python backend/simple-stockfish-server.py --port 11543",
                "katago-server": "python backend/simple-go-server.py --port 11545",
                "yaneuraou-server": "python backend/simple-shogi-server.py --port 11544",
                "kanji-api": "python backend/kanji-api.py",
                "multiplayer-server": "python backend/multiplayer-server.py --port 11877",
                "sound-service": "python backend/sound-service.py",
            }

            server_ports = {
                "stockfish-server": 11543,
                "katago-server": 11545,
                "yaneuraou-server": 11544,
                "kanji-api": 11003,
                "multiplayer-server": 11877,
                "sound-service": 9879,
            }

            response = {"success": False, "message": "Unknown error"}

            try:
                if action == "start":
                    if server_name not in startup_commands:
                        response = {
                            "success": False,
                            "message": f"Unknown server: {server_name}",
                        }
                    else:
                        cmd = startup_commands[server_name]
                        process = subprocess.Popen(
                            cmd.split(), stdout=subprocess.PIPE, stderr=subprocess.PIPE
                        )
                        response = {
                            "success": True,
                            "message": f"Started {server_name}",
                            "pid": process.pid,
                        }

                elif action in ["stop", "restart"]:
                    if server_name not in server_ports:
                        response = {
                            "success": False,
                            "message": f"Unknown server: {server_name}",
                        }
                    else:
                        port = server_ports[server_name]

                        # Find process using the port
                        target_pid = None
                        for conn in psutil.net_connections(kind="inet"):
                            if conn.laddr.port == port and conn.status == "LISTEN":
                                target_pid = conn.pid
                                break

                        if target_pid:
                            # Send SIGTERM to gracefully stop
                            os.kill(target_pid, signal.SIGTERM)
                            response = {
                                "success": True,
                                "message": f"Stopped {server_name}",
                            }
                        else:
                            response = {
                                "success": False,
                                "message": f"Process not found for {server_name}",
                            }

                        # For restart, wait and start again
                        if action == "restart" and response["success"]:
                            import time

                            time.sleep(2)
                            if server_name in startup_commands:
                                cmd = startup_commands[server_name]
                                process = subprocess.Popen(
                                    cmd.split(),
                                    stdout=subprocess.PIPE,
                                    stderr=subprocess.PIPE,
                                )
                                response = {
                                    "success": True,
                                    "message": f"Restarted {server_name}",
                                    "pid": process.pid,
                                }

            except Exception as e:
                response = {"success": False, "message": str(e)}

            # Send JSON response
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(response).encode())

        def _handle_kanji_api(self):
            """Handle kanji API requests"""
            try:
                # Parse query parameters
                from urllib.parse import urlparse, parse_qs

                parsed_url = urlparse(self.path)
                query_params = parse_qs(parsed_url.query)

                # Route to appropriate handler
                if parsed_url.path == "/api/kanji/all":
                    self._handle_kanji_all(query_params)
                elif parsed_url.path == "/api/kanji/search":
                    self._handle_kanji_search(query_params)
                else:
                    self.send_error(404, "Kanji API endpoint not found")

            except Exception as e:
                self.send_error(500, f"Kanji API error: {str(e)}")

        def _handle_kanji_all(self, query_params):
            """Handle GET /api/kanji/all"""
            limit = int(query_params.get("limit", ["100"])[0])
            offset = int(query_params.get("offset", ["0"])[0])
            grade = query_params.get("grade", [None])[0]
            jouyou_only = (
                query_params.get("jouyou_only", ["false"])[0].lower() == "true"
            )

            with sqlite3.connect("games.db") as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()

                query = """
                    SELECT kanji, onyomi, kunyomi, meanings, jlpt, grade, strokes,
                           categories, frequency, radical, is_jouyou, is_jinmeiyou
                    FROM kanji
                    WHERE 1=1
                """
                params = []

                if jouyou_only:
                    query += " AND is_jouyou = 1"
                if grade:
                    query += " AND grade = ?"
                    params.append(grade)

                query += " ORDER BY frequency ASC LIMIT ? OFFSET ?"
                params.extend([limit, offset])

                cursor.execute(query, params)
                kanji_list = [dict(row) for row in cursor.fetchall()]

                # Parse JSON fields
                for kanji in kanji_list:
                    try:
                        kanji["onyomi"] = (
                            json.loads(kanji["onyomi"]) if kanji["onyomi"] else []
                        )
                    except:
                        kanji["onyomi"] = []
                    try:
                        kanji["kunyomi"] = (
                            json.loads(kanji["kunyomi"]) if kanji["kunyomi"] else []
                        )
                    except:
                        kanji["kunyomi"] = []
                    try:
                        kanji["meanings"] = (
                            json.loads(kanji["meanings"]) if kanji["meanings"] else []
                        )
                    except:
                        kanji["meanings"] = []
                    try:
                        kanji["categories"] = (
                            json.loads(kanji["categories"])
                            if kanji["categories"]
                            else []
                        )
                    except:
                        kanji["categories"] = []

                response = {
                    "success": True,
                    "kanji": kanji_list,
                    "total": len(kanji_list),
                    "limit": limit,
                    "offset": offset,
                }

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(response).encode())

        def _handle_kanji_search(self, query_params):
            """Handle GET /api/kanji/search"""
            query = query_params.get("q", [""])[0]
            category = query_params.get("category", [None])[0]
            grade = query_params.get("grade", [None])[0]
            strokes = query_params.get("strokes", [None])[0]

            with sqlite3.connect("games.db") as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()

                sql_query = """
                    SELECT kanji, onyomi, kunyomi, meanings, jlpt, grade, strokes,
                           categories, frequency, radical, is_jouyou, is_jinmeiyou
                    FROM kanji
                    WHERE 1=1
                """
                params = []

                if query:
                    sql_query += " AND (kanji LIKE ? OR meanings LIKE ?)"
                    params.extend([f"%{query}%", f"%{query}%"])

                if category:
                    sql_query += " AND categories LIKE ?"
                    params.append(f"%{category}%")

                if grade:
                    sql_query += " AND grade = ?"
                    params.append(grade)

                if strokes:
                    sql_query += " AND strokes = ?"
                    params.append(strokes)

                sql_query += " ORDER BY frequency ASC LIMIT 50"

                cursor.execute(sql_query, params)
                results = [dict(row) for row in cursor.fetchall()]

                # Parse JSON fields
                for kanji in results:
                    try:
                        kanji["meanings"] = (
                            json.loads(kanji["meanings"]) if kanji["meanings"] else []
                        )
                    except:
                        kanji["meanings"] = []
                    try:
                        kanji["categories"] = (
                            json.loads(kanji["categories"])
                            if kanji["categories"]
                            else []
                        )
                    except:
                        kanji["categories"] = []

                response = {"success": True, "results": results, "count": len(results)}

                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps(response).encode())

    Handler = OptimizedRequestHandler

    try:
        # Explicitly bind to 0.0.0.0 to expose on all interfaces (more reliable on Windows)
        # Use ThreadingMixIn for better Windows compatibility
        class ThreadingHTTPServer(socketserver.ThreadingMixIn, socketserver.TCPServer):
            allow_reuse_address = True
            daemon_threads = True

        httpd = ThreadingHTTPServer(("0.0.0.0", PORT), Handler)

        # Verify the server is actually listening
        server_address = httpd.server_address
        if not server_address:
            print(
                f"[ERROR] ERROR: Server failed to bind to port {PORT}", file=sys.stderr
            )
            sys.exit(1)

        # Verify server socket is active
        if not httpd.socket:
            print("[ERROR] ERROR: Server socket not created", file=sys.stderr)
            sys.exit(1)

        print("")
        print("===================================================")
        print("  [INFO] WEB SERVER FOR GAMES COLLECTION")
        print("===================================================")
        print("")
        print(f"[OK] Server bound to: {server_address[0]}:{server_address[1]}")
        print(f"Server running on: http://localhost:{PORT}")
        print(f"Also accessible at: http://127.0.0.1:{PORT}")

        # Get local IP addresses for network access
        hostname = socket.gethostname()
        try:
            local_ip = socket.gethostbyname(hostname)
            print(f"Network access: http://{local_ip}:{PORT}")
        except Exception:
            pass

        print(f"Serving directory: {Path.cwd()}")
        print("")
        print(f"[OK] Server socket created: {httpd.socket}")
        print(f"[OK] Server address: {server_address}")
        print("")
        print("Press Ctrl+C to stop")
        print("")
        print("To verify port is listening, run in another terminal:")
        print(f"  netstat -ano | findstr :{PORT}")
        print("")
        sys.stdout.flush()

        # Start the server (this actually starts listening)
        print(f"[START] Starting server on port {PORT}...")
        try:
            httpd.serve_forever()
        finally:
            httpd.server_close()
            print("\n[OK] Server stopped")
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


def get_all_kanji():
    """Get all kanji with optional filtering"""
    try:
        limit = request.args.get("limit", 100, type=int)
        offset = request.args.get("offset", 0, type=int)
        grade = request.args.get("grade")
        jouyou_only = request.args.get("jouyou_only", "false").lower() == "true"

        with sqlite3.connect("games.db") as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            query = """
                SELECT kanji, onyomi, kunyomi, meanings, jlpt, grade, strokes,
                       categories, frequency, radical, is_jouyou, is_jinmeiyou
                FROM kanji
                WHERE 1=1
            """
            params = []

            if jouyou_only:
                query += " AND is_jouyou = 1"
            if grade:
                query += " AND grade = ?"
                params.append(grade)

            query += " ORDER BY frequency ASC LIMIT ? OFFSET ?"
            params.extend([limit, offset])

            cursor.execute(query, params)
            kanji_list = [dict(row) for row in cursor.fetchall()]

            # Parse JSON fields
            for kanji in kanji_list:
                try:
                    kanji["onyomi"] = (
                        json.loads(kanji["onyomi"]) if kanji["onyomi"] else []
                    )
                except:
                    kanji["onyomi"] = []
                try:
                    kanji["kunyomi"] = (
                        json.loads(kanji["kunyomi"]) if kanji["kunyomi"] else []
                    )
                except:
                    kanji["kunyomi"] = []
                try:
                    kanji["meanings"] = (
                        json.loads(kanji["meanings"]) if kanji["meanings"] else []
                    )
                except:
                    kanji["meanings"] = []
                try:
                    kanji["categories"] = (
                        json.loads(kanji["categories"]) if kanji["categories"] else []
                    )
                except:
                    kanji["categories"] = []

            return jsonify(
                {
                    "success": True,
                    "kanji": kanji_list,
                    "total": len(kanji_list),
                    "limit": limit,
                    "offset": offset,
                }
            )

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


def search_kanji():
    """Search kanji by various criteria"""
    try:
        query = request.args.get("q", "")
        category = request.args.get("category")
        grade = request.args.get("grade")
        strokes = request.args.get("strokes")

        with sqlite3.connect("games.db") as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()

            sql_query = """
                SELECT kanji, onyomi, kunyomi, meanings, jlpt, grade, strokes,
                       categories, frequency, radical, is_jouyou, is_jinmeiyou
                FROM kanji
                WHERE 1=1
            """
            params = []

            if query:
                sql_query += " AND (kanji LIKE ? OR meanings LIKE ?)"
                params.extend([f"%{query}%", f"%{query}%"])

            if category:
                sql_query += " AND categories LIKE ?"
                params.append(f"%{category}%")

            if grade:
                sql_query += " AND grade = ?"
                params.append(grade)

            if strokes:
                sql_query += " AND strokes = ?"
                params.append(strokes)

            sql_query += " ORDER BY frequency ASC LIMIT 50"

            cursor.execute(sql_query, params)
            results = [dict(row) for row in cursor.fetchall()]

            # Parse JSON fields
            for kanji in results:
                try:
                    kanji["meanings"] = (
                        json.loads(kanji["meanings"]) if kanji["meanings"] else []
                    )
                except:
                    kanji["meanings"] = []
                try:
                    kanji["categories"] = (
                        json.loads(kanji["categories"]) if kanji["categories"] else []
                    )
                except:
                    kanji["categories"] = []

            return jsonify({"success": True, "results": results, "count": len(results)})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


def get_server_status():
    """Get status of all backend servers and services"""
    import socket
    import time
    import subprocess
    import psutil

    def check_port(host, port):
        """Check if a port is open"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1)
            result = sock.connect_ex((host, port))
            sock.close()
            return result == 0
        except:
            return False

    def get_process_info(port):
        """Get process info for a port if possible"""
        try:
            # Try to find process using the port
            for conn in psutil.net_connections(kind="inet"):
                if conn.laddr.port == port and conn.status == "LISTEN":
                    try:
                        process = psutil.Process(conn.pid)
                        return {
                            "pid": conn.pid,
                            "name": process.name(),
                            "cpu_percent": process.cpu_percent(),
                            "memory_mb": process.memory_info().rss / 1024 / 1024,
                            "create_time": process.create_time(),
                        }
                    except:
                        pass
        except:
            pass
        return None

    servers = {}

    # Define all services to check
    services = {
        "web-server": {"port": 9876, "description": "Main Web Server"},
        "stockfish-server": {"port": 10001, "description": "Chess AI Engine"},
        "katago-server": {"port": 10002, "description": "Go AI Engine"},
        "yaneuraou-server": {"port": 10003, "description": "Shogi AI Engine"},
        "kanji-api": {"port": 11003, "description": "Kanji Database API"},
        "multiplayer-server": {"port": 9881, "description": "Competitive Play Engine"},
        "sound-service": {"port": 9879, "description": "Audio Service"},
        "firebase-functions": {"port": 5001, "description": "Firebase Emulator"},
    }

    for name, config in services.items():
        port = config["port"]
        is_running = check_port("localhost", port)
        process_info = get_process_info(port) if is_running else None

        uptime = None
        if process_info and process_info.get("create_time"):
            uptime = int(time.time() - process_info["create_time"])

        servers[name] = {
            "running": is_running,
            "port": port,
            "description": config["description"],
            "uptime": uptime,
            "pid": process_info.get("pid") if process_info else None,
            "cpu_percent": round(process_info.get("cpu_percent", 0), 1)
            if process_info
            else None,
            "memory_mb": round(process_info.get("memory_mb", 1), 1)
            if process_info
            else None,
            "auto_restart": True,  # Most services have auto-restart enabled
        }

    return jsonify({"servers": servers})
