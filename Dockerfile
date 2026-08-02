# Games Gateway Dockerfile
# FastAPI + FastMCP gateway serving the webapp

FROM python:3.11-slim

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy source BEFORE uv sync so setuptools egg_base check passes
COPY ai-games-collection-mcp/src/ ./src/
COPY pyproject.toml uv.lock ./
RUN pip install --no-cache-dir uv && uv sync --frozen --extra http

COPY web_sota/ ./web_sota/
COPY run_server.py .

ENV AI_GAMES_COLLECTION_BACKEND_PORT=10987

EXPOSE 10987

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:10987/health || exit 1

CMD ["uv", "run", "python", "-m", "uvicorn", "web_sota.server:app", "--host", "0.0.0.0", "--port", "10987", "--log-level", "info"]
