#!/usr/bin/env python3
"""
Simple Web Server for Games Collection
**Timestamp**: 2025-12-04
"""

import sys
import http.server
import socketserver
from pathlib import Path

def main():
    PORT = 9876
    
    # Check if port is in use
    import socket
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    try:
        sock.bind(('0.0.0.0', PORT))
        sock.close()
    except OSError as e:
        if e.errno == 10048:
            print(f"❌ ERROR: Port {PORT} is already in use!", file=sys.stderr)
            print(f"   Another process is using port {PORT}", file=sys.stderr)
            print(f"   Run: netstat -ano | findstr :{PORT}", file=sys.stderr)
            sys.exit(1)
        else:
            print(f"❌ ERROR: Cannot bind to port {PORT}: {e}", file=sys.stderr)
            sys.exit(1)
    
    class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
        def end_headers(self):
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            super().end_headers()
        
        def log_message(self, format, *args):
            # Suppress default logging for cleaner output
            pass
    
    Handler = CORSRequestHandler
    
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
            print(f"❌ ERROR: Server failed to bind to port {PORT}", file=sys.stderr)
            sys.exit(1)
        
        # Verify server socket is active
        if not httpd.socket:
            print(f"❌ ERROR: Server socket not created", file=sys.stderr)
            sys.exit(1)
        
        print("")
        print("═══════════════════════════════════════════════════")
        print("  🌐 WEB SERVER FOR GAMES COLLECTION")
        print("═══════════════════════════════════════════════════")
        print("")
        print(f"✅ Server bound to: {server_address[0]}:{server_address[1]}")
        print(f"Server running on: http://localhost:{PORT}")
        print(f"Also accessible at: http://127.0.0.1:{PORT}")
        
        # Get local IP addresses for network access
        hostname = socket.gethostname()
        try:
            local_ip = socket.gethostbyname(hostname)
            print(f"Network access: http://{local_ip}:{PORT}")
        except:
            pass
        
        print(f"Serving directory: {Path.cwd()}")
        print("")
        print(f"✅ Server socket created: {httpd.socket}")
        print(f"✅ Server address: {server_address}")
        print("")
        print("Press Ctrl+C to stop")
        print("")
        print("To verify port is listening, run in another terminal:")
        print(f"  netstat -ano | findstr :{PORT}")
        print("")
        sys.stdout.flush()
        
        # Start the server (this actually starts listening)
        print(f"🚀 Starting server on port {PORT}...")
        try:
            httpd.serve_forever()
        finally:
            httpd.server_close()
            print("\n✅ Server stopped")
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
