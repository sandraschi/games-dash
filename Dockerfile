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

# Copy backend directory with AI servers
COPY backend/ /app/backend/

# Create optimized nginx config
RUN echo 'server {\n\
    listen 80;\n\
    server_name localhost;\n\
    root /app;\n\
    index index.html;\n\
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
    # API endpoints - proxy to external Windows services\n\
    location /api/jlpt/ {\n\
        proxy_pass http://localhost:5001;\n\
        proxy_set_header Host $host;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
        add_header Cache-Control "no-cache, no-store, must-revalidate";\n\
    }\n\
    \n\
    location /api/kanji/ {\n\
        proxy_pass http://127.0.0.1:5003;\n\
        proxy_set_header Host $host;\n\
        proxy_set_header X-Real-IP $remote_addr;\n\
        add_header Cache-Control "no-cache, no-store, must-revalidate";\n\
    }\n\
    \n\
    location /api/ {\n\
        proxy_pass http://localhost:9543;\n\
    }\n\
}' > /etc/nginx/sites-available/default && \
    # Optimize nginx for performance
    echo 'events {\n\
    worker_connections 1024;\n\
}\n\
http {\n\
    include /etc/nginx/mime.types;\n\
    default_type application/octet-stream;\n\
    \n\
    sendfile on;\n\
    tcp_nopush on;\n\
    tcp_nodelay on;\n\
    keepalive_timeout 65;\n\
    types_hash_max_size 2048;\n\
    \n\
    gzip on;\n\
    gzip_vary on;\n\
    gzip_min_length 1024;\n\
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;\n\
}\n\
' > /etc/nginx/nginx.conf

# Expose ports
# 80 = nginx (web server)
# 5001 = JLPT API Server
# 5003 = Kanji Database API
# 9544 = YaneuraOu
# 9545 = KataGo
EXPOSE 80 5001 5003 9543 9544 9545

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

