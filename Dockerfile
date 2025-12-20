# Multi-stage optimized Dockerfile for Games Collection
# **Timestamp**: 2025-12-17

FROM python:3.11-slim as builder

# Install build dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies in virtual environment for better caching
WORKDIR /app
COPY requirements.txt .
RUN python -m venv /opt/venv && \
    /opt/venv/bin/pip install --no-cache-dir --upgrade pip && \
    /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

FROM python:3.11-slim

# Install runtime dependencies only
RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    curl \
    && rm -rf /var/lib/apt/lists/* && \
    apt-get clean

# Copy virtual environment from builder stage
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Set working directory
WORKDIR /app

# Copy application files
COPY . .

# Create optimized nginx config
RUN echo 'server {\n\
    listen 80;\n\
    server_name localhost;\n\
    root /app;\n\
    index index.html;\n\
    \n\
    # Enable gzip compression\n\
    gzip on;\n\
    gzip_vary on;\n\
    gzip_min_length 1024;\n\
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;\n\
    \n\
    location / {\n\
        try_files $uri $uri/ =404;\n\
    }\n\
    \n\
    # Enable CORS for local development\n\
    add_header Access-Control-Allow-Origin *;\n\
    \n\
    # Optimized caching for static assets\n\
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {\n\
        expires 1h;\n\
        add_header Cache-Control "public, immutable";\n\
        add_header X-Content-Type-Options nosniff;\n\
        gzip_static on;\n\
    }\n\
    \n\
    # API endpoints - no caching\n\
    location /api/ {\n\
        proxy_pass http://localhost:9543;\n\
        proxy_set_header Host $host;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
        add_header Cache-Control "no-cache, no-store, must-revalidate";\n\
    }\n\
}' > /etc/nginx/sites-available/default && \
    # Optimize nginx for performance
    echo 'worker_processes auto;\n\
worker_connections 1024;\n\
use epoll;\n\
multi_accept on;\n\
keepalive_timeout 65;\n\
client_max_body_size 50M;\n\
' > /etc/nginx/nginx.conf

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

