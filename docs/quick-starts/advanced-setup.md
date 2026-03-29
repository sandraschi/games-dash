# 🔧 Advanced Setup Guide

This guide is for advanced users who want complete control over their Games Collection installation, including custom configurations, performance optimization, security hardening, and integration with existing systems.

## 🎯 Prerequisites

### System Requirements
- **OS**: Windows 10/11 Pro, Linux (Ubuntu 20.04+), or macOS 12+
- **RAM**: 16GB minimum, 32GB recommended
- **Storage**: 50GB SSD for full installation
- **Network**: Stable internet for AI model downloads
- **GPU**: NVIDIA GPU recommended for AI acceleration (optional)

### Technical Skills Required
- Command line proficiency
- Basic networking knowledge
- Understanding of web technologies
- Experience with Docker (recommended)

## 🚀 Advanced Installation

### Option 1: Full Development Environment
```bash
# Clone with full history
git clone https://github.com/your-org/games-app.git
cd games-app

# Install Python dependencies with development tools
pip install -r requirements.txt -r requirements-dev.txt

# Install Node.js dependencies for frontend development
npm install

# Set up pre-commit hooks
pre-commit install

# Create virtual environment (recommended)
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Install in development mode
pip install -e .
```

### Option 2: Production Docker Setup
```bash
# Clone repository
git clone https://github.com/your-org/games-app.git
cd games-app

# Build with custom optimizations
docker build --build-arg BUILD_TYPE=production \
             --build-arg ENABLE_CUDA=true \
             -t games-app-custom .

# Run with custom configuration
docker run -d \
  --name games-app \
  -p 9876:9876 \
  -v /host/config:/app/config \
  -v /host/logs:/app/logs \
  -e CUSTOM_CONFIG=true \
  games-app-custom
```

### Option 3: Manual Server Configuration
```bash
# Install system dependencies
# Windows
choco install python nodejs git

# Linux
sudo apt update
sudo apt install python3 python3-pip nodejs npm git

# macOS
brew install python node git

# Install Python packages
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118  # CUDA 11.8
pip install -r requirements.txt

# Download AI models manually (optional)
python scripts/download_models.py --all
```

## ⚙️ Advanced Configuration

### Custom Server Configuration
Create `config/advanced.json`:
```json
{
  "server": {
    "host": "0.0.0.0",
    "port": 9876,
    "workers": 4,
    "ssl": {
      "enabled": true,
      "cert_file": "/path/to/cert.pem",
      "key_file": "/path/to/key.pem"
    }
  },
  "ai_engines": {
    "stockfish": {
      "threads": 8,
      "hash_size": 4096,
      "skill_level": 20
    },
    "katago": {
      "max_visits": 5000,
      "model": "40b",
      "gpu": true
    }
  },
  "games": {
    "enabled_games": ["all"],
    "disabled_games": ["adult_content_games"],
    "custom_games_path": "/path/to/custom/games"
  },
  "multiplayer": {
    "max_players": 100,
    "firebase_config": "/path/to/firebase.json",
    "custom_backend": "redis://localhost:6379"
  }
}
```

### Environment Variables
Create `.env` file:
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/games
REDIS_URL=redis://localhost:6379

# AI Engines
STOCKFISH_PATH=/custom/path/to/stockfish
KATAGO_MODEL_PATH=/models/katago
OPENAI_API_KEY=sk-your-key-here

# Security
SECRET_KEY=your-256-bit-secret
JWT_SECRET=your-jwt-secret
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# Performance
MAX_WORKERS=8
GPU_MEMORY_FRACTION=0.8
CACHE_SIZE=10GB

# Monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project
LOG_LEVEL=INFO
METRICS_PORT=9090
```

### Performance Optimization

#### AI Engine Tuning
```python
# config/ai_tuning.py
STOCKFISH_CONFIG = {
    'threads': 8,
    'hash': 4096,
    'skill_level': 20,
    'move_overhead': 100,
    'slow_mover': 100
}

KATAGO_CONFIG = {
    'max_visits': 5000,
    'model': '40b',
    'gpu': True,
    'threads': 4,
    'analysis_threads': 8
}
```

#### Database Optimization
```sql
-- PostgreSQL tuning for high concurrency
ALTER SYSTEM SET max_connections = '200';
ALTER SYSTEM SET shared_buffers = '512MB';
ALTER SYSTEM SET effective_cache_size = '2GB';
ALTER SYSTEM SET maintenance_work_mem = '128MB';
```

#### Caching Configuration
```python
# Redis cache configuration
CACHE_CONFIG = {
    'game_states': {'ttl': 3600, 'max_size': '1GB'},
    'ai_moves': {'ttl': 300, 'max_size': '500MB'},
    'user_sessions': {'ttl': 86400, 'max_size': '100MB'}
}
```

## 🔒 Security Hardening

### Network Security
```bash
# Configure firewall (Windows)
New-NetFirewallRule -DisplayName "Games App" -Direction Inbound -LocalPort 9876 -Protocol TCP -Action Allow

# Configure firewall (Linux)
sudo ufw allow 9876/tcp

# SSL/TLS Setup
certbot certonly --webroot -w /var/www/html -d yourdomain.com
```

### Application Security
```python
# config/security.py
SECURITY_CONFIG = {
    'rate_limiting': {
        'requests_per_minute': 100,
        'burst_limit': 20
    },
    'cors': {
        'origins': ['https://yourdomain.com'],
        'methods': ['GET', 'POST'],
        'headers': ['Content-Type', 'Authorization']
    },
    'auth': {
        'enabled': True,
        'provider': 'oauth',  # or 'ldap', 'saml'
        'session_timeout': 3600
    }
}
```

## 🔗 System Integration

### Reverse Proxy Setup (Nginx)
```nginx
# /etc/nginx/sites-available/games-app
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:9876;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support for multiplayer
    location /ws {
        proxy_pass http://localhost:9876;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Load Balancing
```nginx
# Load balancer configuration
upstream games_app {
    server 127.0.0.1:9876;
    server 127.0.0.1:9877;
    server 127.0.0.1:9878;
}

server {
    listen 80;
    server_name games.yourdomain.com;

    location / {
        proxy_pass http://games_app;
        proxy_next_upstream error timeout invalid_header http_500;
    }
}
```

### Monitoring Integration
```python
# Prometheus metrics
from prometheus_client import Counter, Histogram, Gauge

REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint'])
RESPONSE_TIME = Histogram('http_request_duration_seconds', 'HTTP request duration', ['method', 'endpoint'])
ACTIVE_USERS = Gauge('active_users', 'Number of active users')
GAME_SESSIONS = Gauge('game_sessions', 'Number of active game sessions')
```

## 📊 Monitoring & Observability

### Application Monitoring
```bash
# Start monitoring stack
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v /path/to/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus

docker run -d \
  --name grafana \
  -p 3000:3000 \
  grafana/grafana
```

### Log Aggregation
```python
# Structured logging configuration
import structlog

structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)
```

## 🚀 Performance Tuning

### GPU Optimization
```bash
# NVIDIA GPU monitoring
nvidia-smi --query-gpu=utilization.gpu,utilization.memory --format=csv

# CUDA optimization
export CUDA_VISIBLE_DEVICES=0
export CUDA_MPS_PIPE_DIRECTORY=/tmp/nvidia-mps
export CUDA_MPS_LOG_DIRECTORY=/tmp/nvidia-log
```

### Memory Management
```python
# Memory optimization
import gc
import psutil

def memory_cleanup():
    """Aggressive memory cleanup"""
    gc.collect()
    process = psutil.Process()
    memory_usage = process.memory_info().rss / 1024 / 1024  # MB

    if memory_usage > 1024:  # 1GB threshold
        # Force garbage collection
        gc.collect(2)
        # Clear caches if available
        if hasattr(gc, 'clear_caches'):
            gc.clear_caches()
```

## 🔧 Maintenance Scripts

### Automated Backups
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/games_app_$DATE"

# Database backup
pg_dump games_db > "$BACKUP_DIR/database.sql"

# File backup
tar -czf "$BACKUP_DIR/files.tar.gz" /app/data /app/uploads

# Config backup
cp -r /app/config "$BACKUP_DIR/config"

# Retention policy (keep last 30 days)
find /backups -name "games_app_*" -mtime +30 -delete
```

### Health Checks
```bash
#!/bin/bash
# health_check.sh

# Check web server
curl -f http://localhost:9876/health || exit 1

# Check AI engines
curl -f http://localhost:8080/stockfish || exit 1
curl -f http://localhost:8081/katago || exit 1

# Check database
psql -h localhost -U games -d games_db -c "SELECT 1" || exit 1

echo "All services healthy"
```

## 🆘 Advanced Troubleshooting

### Performance Issues
1. **High CPU Usage**: Check AI engine configurations, reduce threads
2. **Memory Leaks**: Monitor with `memory_profiler`, implement cleanup
3. **Slow Responses**: Enable caching, optimize database queries
4. **GPU Issues**: Update CUDA drivers, check GPU memory usage

### Network Issues
1. **Connection Refused**: Check firewall, service status
2. **Timeouts**: Increase timeouts, check network latency
3. **SSL Errors**: Verify certificates, check certificate chain

### Database Issues
1. **Connection Pool Exhausted**: Increase pool size, check connection leaks
2. **Slow Queries**: Add indexes, optimize query plans
3. **Deadlocks**: Implement retry logic, reduce transaction scope

## 📚 Additional Resources

- **[Technical Architecture](../development/TECHNICAL.md)**
- **[API Documentation](../development/APIS.md)**
- **[Security Guidelines](../development/SECURITY.md)**
- **[Performance Tuning](../development/PERFORMANCE.md)**

---

**⚠️ Warning**: Advanced setup requires technical expertise. For simpler deployments, see the [Organization Guide](for-organizations.md) or [Deployment Guide](../deployment/DEPLOYMENT_GUIDE.md).
