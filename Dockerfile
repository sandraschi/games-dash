# Games Gateway Dockerfile
# FastAPI + FastMCP gateway serving the webapp

FROM python:3.11-slim

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY pyproject.toml uv.lock ./
RUN pip install --no-cache-dir uv && uv sync --frozen

COPY games-mcp/src/ ./games-mcp/src/
COPY web_sota/ ./web_sota/
COPY run_server.py .

ENV GAMES_BACKEND_PORT=10987

EXPOSE 10987

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:10987/health || exit 1

CMD ["uv", "run", "python", "-c", "\
import uvicorn; \
from server import app; \
uvicorn.run(app, host='0.0.0.0', port=10987, log_level='info') \
"]
