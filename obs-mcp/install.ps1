# OBS MCP Server Installation Script
# Run this to set up the OBS MCP server for development

param(
    [switch]$SkipTests,
    [switch]$Force
)

Write-Host "🎬 OBS MCP Server Installation" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan

# Check Python version
$pythonVersion = python --version 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Error "Python not found. Please install Python 3.10+"
    exit 1
}

Write-Host "✅ Python found: $pythonVersion"

# Check if we're in the right directory
if (!(Test-Path "pyproject.toml")) {
    Write-Error "Not in obs-mcp directory. Please cd to obs-mcp folder."
    exit 1
}

Write-Host "✅ In obs-mcp directory"

# Install dependencies
Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
pip install -e .

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install dependencies"
    exit 1
}

Write-Host "✅ Dependencies installed"

# Run tests unless skipped
if (!$SkipTests) {
    Write-Host "`n🧪 Running tests..." -ForegroundColor Yellow
    python test_mcp_server.py

    if ($LASTEXITCODE -ne 0) {
        Write-Error "Tests failed. Use -SkipTests to skip testing."
        exit 1
    }

    Write-Host "✅ Tests passed"
}

# Check OBS Websocket requirements
Write-Host "`n🔌 OBS Studio Setup Check:" -ForegroundColor Yellow
Write-Host "   1. Install OBS Studio 28+ from https://obsproject.com/"
Write-Host "   2. Download OBS Websocket plugin:"
Write-Host "      https://github.com/obsproject/obs-websocket/releases"
Write-Host "   3. Extract plugin to:"
Write-Host "      C:\Program Files\obs-studio\obs-plugins\64bit\"
Write-Host "   4. In OBS: Tools → WebSocket Server Settings"
Write-Host "      - Enable WebSocket server"
Write-Host "      - Port: 4455"
Write-Host "      - Set a password (recommended)"
Write-Host "   5. Restart OBS Studio"

# Claude Desktop configuration
Write-Host "`n🤖 Claude Desktop Configuration:" -ForegroundColor Yellow
$configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
Write-Host "   Add to: $configPath"
Write-Host '   {'
Write-Host '     "mcpServers": {'
Write-Host '       "obs-mcp": {'
Write-Host '         "command": "python",'
Write-Host '         "args": ["-m", "obs_mcp.mcp_server"],'
$scriptPath = $PSScriptRoot -replace '\\', '\\'
Write-Host "         `"cwd`": `"$scriptPath`""
Write-Host '       }'
Write-Host '     }'
Write-Host '   }'

Write-Host "`n🎉 OBS MCP Server installed successfully!" -ForegroundColor Green
Write-Host "`n📚 Next steps:"
Write-Host "   1. Set up OBS Websocket plugin"
Write-Host "   2. Configure Claude Desktop"
Write-Host "   3. Start OBS Studio"
Write-Host "   4. Test with: connect_obs() in Claude"

Write-Host "`n📖 Documentation: README.md" -ForegroundColor Cyan