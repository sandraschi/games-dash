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
    try:
        sock.bind(('127.0.0.1', PORT))
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
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print("")
            print("═══════════════════════════════════════════════════")
            print("  🌐 WEB SERVER FOR GAMES COLLECTION")
            print("═══════════════════════════════════════════════════")
            print("")
            print(f"Server running on: http://localhost:{PORT}")
            print(f"Also accessible at: http://127.0.0.1:{PORT}")
            print(f"Serving directory: {Path.cwd()}")
            print("")
            print("Press Ctrl+C to stop")
            print("")
            sys.stdout.flush()
            httpd.serve_forever()
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
