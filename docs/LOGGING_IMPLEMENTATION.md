# Logging Implementation

## Overview

**CRITICAL**: Logging beats print statements for everything, especially in production. All print statements have been replaced with proper Python logging throughout the codebase. This provides better debugging capabilities, log level control, structured output for production use, and enables integration with monitoring stacks (Loki/Prometheus/Fluentd) for worldwide problem visibility via Grafana dashboards.

## Why Logging Over Print?

### Production Readiness
- **Print statements are a development anti-pattern**: They cannot be filtered, redirected, or aggregated
- **Logging enables production monitoring**: Structured logs feed into monitoring stacks (Loki, Prometheus, Fluentd)
- **Grafana dashboards**: Real-time visibility into problems worldwide, not just local console output
- **Log aggregation**: Centralized log collection from distributed services (iPad/iPhone/Bangalore players)

### Debugging Advantages
- **Log levels**: Filter by severity (DEBUG, INFO, WARNING, ERROR) without code changes
- **Structured output**: Consistent format enables parsing and analysis
- **Stack traces**: `exc_info=True` provides full exception context
- **Context preservation**: Logger names identify source components

### Operational Benefits
- **File rotation**: Automatic log file management (size/time-based)
- **Remote logging**: Send logs to syslog, cloud services, or log aggregation systems
- **Performance**: Logging can be disabled in production without code changes (set level to CRITICAL)
- **Compliance**: Audit trails and security event logging

## Logging Configuration

### MCP Server (`games-mcp/src/games_mcp/mcp_server.py`)

- **Logger Name**: `games_mcp`
- **Output**: stderr (critical for MCP stdio mode - stdout is reserved for JSON-RPC)
- **Log Level**: Configurable via `GAMES_MCP_LOG_LEVEL` environment variable (default: INFO)
- **Format**: `%(asctime)s - %(name)s - %(levelname)s - %(message)s`

```python
log_level = os.environ.get("GAMES_MCP_LOG_LEVEL", "INFO").upper()
logger = logging.getLogger("games_mcp")
handler = logging.StreamHandler(sys.stderr)  # Critical: stderr, not stdout
```

### AI Servers (`backend/simple-*-server.py`)

- **Logger Names**: `stockfish_server`, `katago_server`, `yaneuraou_server`
- **Output**: stdout (standard console output)
- **Log Level**: INFO (default)
- **Format**: `%(asctime)s - %(name)s - %(levelname)s - %(message)s`

### Security Middleware (`backend/security_middleware.py`)

- **Logger Name**: `security_middleware`
- **Output**: stdout
- **Log Level**: INFO (default)
- **Features**: 
  - WARNING level for rate limit violations
  - ERROR level for authentication failures
  - DEBUG level for successful authenticated requests

### Auth Manager (`backend/auth_manager.py`)

- **Logger Name**: `auth_manager`
- **Output**: stdout
- **Log Level**: INFO (default)
- **Features**:
  - INFO level for user creation and API key generation
  - WARNING level for database load failures
  - ERROR level for save failures

### Test Scripts (`games-mcp/test_mcp_server.py`, `games-mcp/validate_mcp.py`)

- **Logger Names**: `test_mcp_server`, `validate_mcp`
- **Output**: stdout
- **Log Level**: INFO (default)
- **Features**: Structured test output with appropriate log levels

## Log Levels

- **DEBUG**: Detailed diagnostic information (e.g., cache hits, position hashes)
- **INFO**: General informational messages (e.g., server startup, move recording)
- **WARNING**: Warning messages (e.g., engine not running, missing dependencies)
- **ERROR**: Error conditions (e.g., failed requests, exceptions)

## Usage Examples

### Setting Log Level

```powershell
# Set environment variable for MCP server
$env:GAMES_MCP_LOG_LEVEL = "DEBUG"
python -m games_mcp.mcp_server

# For AI servers, modify logging.basicConfig level
```

### Viewing Logs

```powershell
# MCP server logs go to stderr
python -m games_mcp.mcp_server 2> mcp.log

# AI server logs go to stdout
python backend/simple-stockfish-server.py > stockfish.log 2>&1
```

### Debugging

Enable DEBUG level for detailed diagnostics:

```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## Benefits

1. **Structured Output**: Consistent format across all components
2. **Log Level Control**: Filter by severity (DEBUG, INFO, WARNING, ERROR)
3. **Better Debugging**: Stack traces with `exc_info=True` for exceptions
4. **Production Ready**: Easy to redirect to files, syslog, or log aggregation services
5. **MCP Compatibility**: MCP server correctly uses stderr (not stdout) for logging

## Migration Notes

- All `print()` statements replaced with `logger.info()`, `logger.error()`, etc.
- Exception handling now uses `exc_info=True` for full stack traces
- Test scripts use logging for structured output instead of print statements
- No emojis in log messages (compliance with coding standards)

## Monitoring Stack Integration

### Loki/Prometheus/Fluentd (LPF) Stack

Logging enables integration with modern monitoring stacks:

1. **Loki** (Log Aggregation)
   - Collects logs from all services (AI servers, MCP server, web server)
   - Queries logs using LogQL for filtering and analysis
   - Efficient storage and indexing

2. **Prometheus** (Metrics)
   - Extract metrics from log patterns (e.g., request rates, error rates)
   - Time-series data for performance monitoring
   - Alerting on error thresholds

3. **Fluentd** (Log Forwarding)
   - Collects logs from multiple sources
   - Routes to Loki, Elasticsearch, or cloud services
   - Handles log parsing and transformation

4. **Grafana Dashboards**
   - **Worldwide Problem Visibility**: Real-time dashboards showing:
     - Error rates by region (Bangalore, Caracas, local)
     - AI server health (Stockfish, KataGo, YaneuraOu)
     - Rate limiting violations and blocked IPs
     - Request patterns and performance metrics
   - **Alerting**: Notify on critical issues (server down, high error rate)
   - **Historical Analysis**: Trend analysis and capacity planning

### Docker Integration

When running in Docker containers:
- Logs automatically captured via stdout/stderr
- Fluentd/Docker logging driver forwards to Loki
- No code changes needed - logging configuration handles it

### Example Grafana Dashboard Queries

```logql
# Error rate by service
sum(rate({service="games-app"} |= "ERROR" [5m])) by (service)

# Rate limit violations worldwide
sum(rate({service="games-app"} |= "Rate limit exceeded" [5m])) by (ip)

# AI server response times
histogram_quantile(0.95, sum(rate({service="stockfish_server"} | json | __error__="" [5m])) by (le))
```

## Future Enhancements

- **File-based logging with rotation**: Automatic log file management
- **Structured logging (JSON format)**: Native JSON output for log aggregation
- **Log correlation IDs**: Request tracing across services
- **Integration with ELK stack**: Elasticsearch, Logstash, Kibana
- **Cloud logging**: AWS CloudWatch, Google Cloud Logging, Azure Monitor
- **Distributed tracing**: OpenTelemetry integration for request flow visualization
