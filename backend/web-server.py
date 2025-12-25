#!/usr/bin/env python3
"""
Simple Web Server for Games Collection
**Timestamp**: 2025-12-04
"""

import sys
import http.server
import socketserver
from pathlib import Path
import time
import json


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
            # Handle API configuration endpoint
            if self.path == "/api/config":
                self.send_response(200)
                self.send_header("Content-Type", "application/json")
                self.end_headers()

                # Get the client IP to determine if we need to provide AI server host info
                client_ip = self.client_address[0]

                # For remote clients, provide AI server configuration
                config = {
                    "ai_server_host": self._get_ai_server_host(client_ip),
                    "is_remote": not self._is_local_ip(client_ip),
                    "ports": {
                        "stockfish": 9543,
                        "shogi": 9544,
                        "go": 9545,
                        "multiplayer": 9877,
                    },
                }

                self.wfile.write(json.dumps(config).encode())
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

        def log_message(self, format, *args):
            # Suppress default logging for cleaner output
            pass

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
