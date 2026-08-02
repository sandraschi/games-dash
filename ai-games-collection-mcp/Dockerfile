# AI Games Collection MCP standalone Dockerfile (lightweight, no webapp)
# Use root docker-compose.yml for the full gateway deployment

FROM python:3.11-slim

RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY pyproject.toml .
RUN pip install --no-cache-dir .

COPY src/ ./src/

EXPOSE 8000

ENV AI_GAMES_COLLECTION_MCP_LOG_LEVEL=INFO

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["python", "-m", "ai_games_collection_mcp", "--transport", "streamable-http", "--host", "0.0.0.0", "--port", "8000"]
