# Multi-stage Dockerfile for Games Collection
# **Timestamp**: 2025-12-03

FROM python:3.11-slim

# Install nginx for serving static files
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy Python requirements first (for caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY . .

# Create nginx config
RUN echo 'server {\n\
    listen 80;\n\
    server_name localhost;\n\
    root /app;\n\
    index index.html;\n\
    \n\
    location / {\n\
        try_files $uri $uri/ =404;\n\
    }\n\
    \n\
    # Enable CORS for local development\n\
    add_header Access-Control-Allow-Origin *;\n\
    \n\
    # Cache static assets\n\
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {\n\
        expires 1h;\n\
        add_header Cache-Control "public, immutable";\n\
    }\n\
}' > /etc/nginx/sites-available/default

# Create supervisor config for running multiple services
RUN echo '[supervisord]\n\
nodaemon=true\n\
user=root\n\
\n\
[program:nginx]\n\
command=/usr/sbin/nginx -g "daemon off;"\n\
autostart=true\n\
autorestart=true\n\
priority=10\n\
stdout_logfile=/dev/stdout\n\
stdout_logfile_maxbytes=0\n\
stderr_logfile=/dev/stderr\n\
stderr_logfile_maxbytes=0\n\
\n\
[program:stockfish-server]\n\
command=python /app/stockfish-server.py\n\
directory=/app\n\
autostart=true\n\
autorestart=true\n\
priority=20\n\
stdout_logfile=/dev/stdout\n\
stdout_logfile_maxbytes=0\n\
stderr_logfile=/dev/stderr\n\
stderr_logfile_maxbytes=0\n\
\n\
[program:shogi-server]\n\
command=python /app/shogi-server.py\n\
directory=/app\n\
autostart=true\n\
autorestart=true\n\
priority=20\n\
stdout_logfile=/dev/stdout\n\
stdout_logfile_maxbytes=0\n\
stderr_logfile=/dev/stderr\n\
stderr_logfile_maxbytes=0\n\
\n\
[program:go-server]\n\
command=python /app/go-server.py\n\
directory=/app\n\
autostart=true\n\
autorestart=true\n\
priority=20\n\
stdout_logfile=/dev/stdout\n\
stdout_logfile_maxbytes=0\n\
stderr_logfile=/dev/stderr\n\
stderr_logfile_maxbytes=0\n\
' > /etc/supervisor/conf.d/supervisord.conf

# Expose ports
# 80 = nginx (web server)
# 9543 = Stockfish
# 9544 = YaneuraOu
# 9545 = KataGo
EXPOSE 80 9543 9544 9545

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Start supervisor (runs nginx + 3 Python servers)
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

