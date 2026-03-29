# Games MCP Server - Streamable HTTP Transport
# Enables serverless deployment and global distribution

FROM python:3.11-slim

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY pyproject.toml .
RUN pip install --no-cache-dir -e ".[http]"

# Copy source code
COPY src/ ./src/

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash games
USER games

# Expose port for HTTP transport
EXPOSE 8000

# Health check for container orchestration
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Default command - can be overridden for different transports
CMD ["python", "-m", "games_mcp.mcp_server", "--transport", "streamable-http", "--host", "0.0.0.0", "--port", "8000"]