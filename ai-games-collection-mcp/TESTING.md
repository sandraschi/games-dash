# AI Games Collection MCP Server Testing Guide

## CR/LF Line Ending Issues

### Problem (Historical)
Windows uses CRLF (`\r\n`) line endings by default, but JSON-RPC protocol (used by MCP) requires strict LF (`\n`) line endings. Previously, Antigravity IDE and some MCP clients interpreted trailing `\r` as "invalid trailing data".

**Update**: Antigravity IDE has fixed this bug in their JSON config parser and now tolerates CR/LF line endings.

### Solution (Still Implemented for Compatibility)
The MCP server implements multiple safeguards for compatibility with other MCP clients:

1. **Binary Mode**: Sets stdin/stdout to binary mode on Windows to prevent automatic CRLF conversion
2. **Text Mode Reconfiguration**: Forces LF-only output using `reconfigure(newline='\n')`
3. **Graceful Fallback**: Continues operation even if binary mode setup fails

**Note**: While Antigravity now handles CR/LF correctly, we maintain LF-only output for maximum compatibility with all MCP clients and strict JSON-RPC compliance.

### Testing CR/LF Handling

```powershell
# Test 1: Verify binary mode setup
python -c "import sys; import os; import msvcrt; msvcrt.setmode(sys.stdout.fileno(), os.O_BINARY); print('Test', end='')" | od -c

# Test 2: Run MCP server and check output
python -m ai_games_collection_mcp.mcp_server 2>&1 | od -c | head -20

# Test 3: Validate JSON-RPC output
python -m ai_games_collection_mcp.mcp_server < test_input.json | python -m json.tool
```

### Expected Behavior
- All JSON-RPC messages use LF (`\n`) only
- No CR (`\r`) characters in output
- MCP client accepts messages without "invalid trailing data" errors

## Port Configuration

### Updated Ports
The MCP server now uses the new port configuration:
- **Stockfish**: Port 10001 (was 9543)
- **KataGo**: Port 10002 (was 9545)
- **YaneuraOu**: Port 10003 (was 9544)

### Testing Port Connectivity

```powershell
# Test Stockfish
Invoke-WebRequest -Uri "http://localhost:10001/api/status" -Method GET

# Test KataGo
Invoke-WebRequest -Uri "http://localhost:10002/api/status" -Method GET

# Test YaneuraOu
Invoke-WebRequest -Uri "http://localhost:10003/api/status" -Method GET
```

## Running Tests

### Basic Validation
```powershell
cd ai-games-collection-mcp
python validate_mcp.py
```

### Full Test Suite
```powershell
cd ai-games-collection-mcp
python test_mcp_server.py
```

### Expected Test Results
- ✅ All imports successful
- ✅ Tools registered correctly
- ✅ Database connectivity (if SQLite available)
- ✅ ADN integration (if Advanced Memory available)
- ⚠️ Engine status (depends on AI servers running)

## MCP Client Integration Testing

### Claude Desktop Configuration
```json
{
  "mcpServers": {
    "ai-games-collection-mcp": {
      "command": "python",
      "args": ["-m", "ai_games_collection_mcp.mcp_server"],
      "cwd": "D:\\Dev\\repos\\ai-games-collection\\ai-games-collection-mcp"
    }
  }
}
```

### Cursor Configuration
Same as Claude Desktop - add to MCP settings.

### Testing in Client
1. **Start AI servers**:
   ```powershell
   .\scripts\ensure-ai-services.ps1
   ```

2. **Verify MCP connection**:
   - Check MCP server logs for connection
   - Verify tools are available in Claude/Cursor

3. **Test basic tool**:
   ```
   User: "Check if Stockfish is running"
   Claude: [Uses check_engine_status] "Chess engine is running"
   ```

4. **Test correspondence game**:
   ```
   User: "I moved e2e4"
   Claude: [Uses make_move] "Move recorded"
   Claude: [Uses get_ai_move] "Stockfish suggests e7e5"
   ```

## Known Issues and Fixes

### Issue: "Invalid trailing data" Error (Historical)
**Cause**: CRLF line endings in JSON-RPC output
**Status**: Antigravity IDE has fixed this bug - now tolerates CR/LF
**Fix**: Binary mode + LF-only reconfiguration (still implemented for compatibility)

### Issue: Engine Connection Failed
**Cause**: Old port numbers or engines not running
**Fix**: Updated to ports 10001-10003, verify engines are running

### Issue: Import Errors
**Cause**: Missing dependencies or incorrect path
**Fix**: Run `pip install -e .` in ai-games-collection-mcp directory

### Issue: Database Errors
**Cause**: SQLite file permissions or path issues
**Fix**: Check `data/` directory permissions, ensure writable

## Performance Testing

### Response Time Benchmarks
- `check_engine_status`: < 100ms (if engine running)
- `make_move`: < 50ms (local database)
- `get_ai_move`: 500ms - 5s (depends on engine and depth)
- `get_system_status`: < 200ms

### Load Testing
```python
# Test concurrent requests
import asyncio
async def test_concurrent():
    tasks = [make_move(f"game_{i}", "e2e4") for i in range(10)]
    results = await asyncio.gather(*tasks)
    print(f"Completed {len(results)} concurrent moves")
```

## Security Testing

### Authentication (if enabled)
- Test with valid API key
- Test with invalid API key
- Test without API key (if auth disabled)

### Rate Limiting
- Test rapid requests (should be rate limited)
- Test normal usage (should work)

## Debugging

### Enable Verbose Logging
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Check MCP Server Output
```powershell
# Run with output capture
python -m ai_games_collection_mcp.mcp_server 2>&1 | Tee-Object -FilePath mcp_debug.log
```

### Validate JSON-RPC Messages
```powershell
# Capture and validate
python -m ai_games_collection_mcp.mcp_server < input.json | python -m json.tool
```

## Next Steps

1. ✅ CR/LF handling fixed
2. ✅ Port configuration updated
3. ✅ Missing imports fixed
4. ⏳ Comprehensive test suite
5. ⏳ Performance optimization
6. ⏳ Error handling improvements
