# Update Server Configuration
# Helps users configure Tailscale and other settings

param(
    [switch]$DetectTailscale,
    [switch]$ShowConfig,
    [string]$ManualTailscaleIP
)

$configFile = "server-config.env"

function Write-Header {
    Write-Host ""
    Write-Host "══════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host "  ⚙️  SERVER CONFIGURATION TOOL" -ForegroundColor White
    Write-Host "══════════════════════════════════════════════" -ForegroundColor Cyan
    Write-Host ""
}

function Read-Config {
    $config = @{}
    if (Test-Path $configFile) {
        Get-Content $configFile | ForEach-Object {
            if ($_ -match '^([^#][^=]+)=(.*)$') {
                $config[$matches[1]] = $matches[2]
            }
        }
    }
    return $config
}

function Write-Config {
    param($config)

    $content = @"
# Game Server Configuration
# This file contains environment-specific settings

# Tailscale Configuration
# Leave empty to auto-detect, or set manually if auto-detection fails
TAILSCALE_IP=$($config.TAILSCALE_IP)

# AI Server Configuration
AI_STOCKFISH_PORT=$($config.AI_STOCKFISH_PORT)
AI_SHOGI_PORT=$($config.AI_SHOGI_PORT)
AI_GO_PORT=$($config.AI_GO_PORT)
AI_MULTIPLAYER_PORT=$($config.AI_MULTIPLAYER_PORT)

# Web Server Configuration
WEB_PORT=$($config.WEB_PORT)

# Docker Configuration
DOCKER_AI_HOST=$($config.DOCKER_AI_HOST)
"@

    $content | Out-File -FilePath $configFile -Encoding UTF8
    Write-Host "✅ Configuration saved to $configFile" -ForegroundColor Green
}

function Detect-TailscaleIP {
    Write-Host "🔍 Detecting Tailscale IP..." -ForegroundColor Blue

    try {
        $tailscaleIP = tailscale ip -4 2>&1
        if ($LASTEXITCODE -eq 0 -and $tailscaleIP) {
            Write-Host "✅ Tailscale IP detected: $tailscaleIP" -ForegroundColor Green
            return $tailscaleIP
        } else {
            Write-Host "❌ Tailscale not running or not connected" -ForegroundColor Red
            return $null
        }
    } catch {
        Write-Host "❌ Tailscale command failed: $_" -ForegroundColor Red
        Write-Host "💡 Make sure Tailscale is installed and running" -ForegroundColor Yellow
        return $null
    }
}

# Main logic
Write-Header

$config = Read-Config

if ($ShowConfig) {
    Write-Host "📄 Current Configuration:" -ForegroundColor Cyan
    $config.GetEnumerator() | ForEach-Object {
        Write-Host "   $($_.Key): $($_.Value)" -ForegroundColor White
    }
    exit 0
}

if ($ManualTailscaleIP) {
    Write-Host "📝 Setting manual Tailscale IP: $ManualTailscaleIP" -ForegroundColor Blue
    $config.TAILSCALE_IP = $ManualTailscaleIP
    Write-Config -config $config
    Write-Host ""
    Write-Host "🎯 Next steps:" -ForegroundColor Green
    Write-Host "   1. Run: docker compose build --no-cache" -ForegroundColor White
    Write-Host "   2. Run: docker compose up -d" -ForegroundColor White
    Write-Host "   3. Test from iPad: http://$ManualTailscaleIP`:9876" -ForegroundColor White
    exit 0
}

if ($DetectTailscale) {
    $detectedIP = Detect-TailscaleIP
    if ($detectedIP) {
        $config.TAILSCALE_IP = $detectedIP
        Write-Config -config $config
        Write-Host ""
        Write-Host "🎯 Next steps:" -ForegroundColor Green
        Write-Host "   1. Run: docker compose build --no-cache" -ForegroundColor White
        Write-Host "   2. Run: docker compose up -d" -ForegroundColor White
        Write-Host "   3. Test from iPad: http://$detectedIP`:9876" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "💡 Alternatives:" -ForegroundColor Yellow
        Write-Host "   • Install and start Tailscale" -ForegroundColor White
        Write-Host "   • Use: .\update-server-config.ps1 -ManualTailscaleIP <IP>" -ForegroundColor White
        Write-Host "   • Check Tailscale status: tailscale status" -ForegroundColor White
    }
    exit 0
}

# Interactive mode
Write-Host "🔧 Server Configuration Options:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Auto-detect Tailscale IP" -ForegroundColor White
Write-Host "2. Set manual Tailscale IP" -ForegroundColor White
Write-Host "3. Show current configuration" -ForegroundColor White
Write-Host "4. Reset to defaults" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Choose an option (1-4)"

switch ($choice) {
    "1" {
        $detectedIP = Detect-TailscaleIP
        if ($detectedIP) {
            $config.TAILSCALE_IP = $detectedIP
            Write-Config -config $config
        }
    }
    "2" {
        $manualIP = Read-Host "Enter Tailscale IP (e.g., 100.118.171.110)"
        if ($manualIP -match '^\d+\.\d+\.\d+\.\d+$') {
            $config.TAILSCALE_IP = $manualIP
            Write-Config -config $config
        } else {
            Write-Host "❌ Invalid IP address format" -ForegroundColor Red
        }
    }
    "3" {
        Write-Host "📄 Current Configuration:" -ForegroundColor Cyan
        $config.GetEnumerator() | ForEach-Object {
            Write-Host "   $($_.Key): $($_.Value)" -ForegroundColor White
        }
    }
    "4" {
        # Reset to defaults
        $config.TAILSCALE_IP = ""
        $config.AI_STOCKFISH_PORT = "9543"
        $config.AI_SHOGI_PORT = "9544"
        $config.AI_GO_PORT = "9545"
        $config.AI_MULTIPLAYER_PORT = "9877"
        $config.WEB_PORT = "9876"
        $config.DOCKER_AI_HOST = "host.docker.internal"
        Write-Config -config $config
        Write-Host "✅ Configuration reset to defaults" -ForegroundColor Green
    }
    default {
        Write-Host "❌ Invalid choice" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "💡 After configuration changes:" -ForegroundColor Cyan
Write-Host "   Run: docker compose build --no-cache" -ForegroundColor White
Write-Host "   Run: docker compose up -d" -ForegroundColor White
Write-Host "   Test: Visit the games on your iPad" -ForegroundColor White
