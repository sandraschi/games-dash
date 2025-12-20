import http.server
import os
import sys

PORT = 9876
DIRECTORY = "d:/Dev/repos/games-app"

print(f"Changing dir to {DIRECTORY}")
try:
    os.chdir(DIRECTORY)
    print(f"CWD is now {os.getcwd()}")
except Exception as e:
    print(f"Failed to change dir: {e}")
    sys.exit(1)

Handler = http.server.SimpleHTTPRequestHandler
http.server.HTTPServer.allow_reuse_address = True

with http.server.HTTPServer(("", PORT), Handler) as httpd:
    print("Serving at port", PORT)
    httpd.serve_forever()
