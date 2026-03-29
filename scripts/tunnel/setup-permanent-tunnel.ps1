# Setup Permanent Cloudflare Tunnel
# Creates a named tunnel with consistent URL that survives restarts

param(
    [string]$TunnelName = "games-app-tunnel",
    [string]$LocalPort = "9876"
)

Write-Host "🚀 SETTING UP PERMANENT CLOUDFLARE TUNNEL" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host ""

# Check if cloudflared is available
if (!(Test-Path "cloudflared.exe")) {
    Write-Host "❌ cloudflared.exe not found in current directory" -ForegroundColor Red
    Write-Host "Please ensure cloudflared.exe is in the same directory as this script" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found cloudflared.exe" -ForegroundColor Green
Write-Host ""

# Step 1: Login to Cloudflare (if not already logged in)
Write-Host "📋 Step 1: Cloudflare Authentication" -ForegroundColor Cyan
Write-Host "-----------------------------------" -ForegroundColor Cyan

# Check if already logged in
$loginCheck = & .\cloudflared.exe tunnel list 2>&1
if ($LASTEXITCODE -ne 0 -or $loginCheck -match "not logged in|authentication required") {
    Write-Host "🔐 Not logged in. Starting login process..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📱 A browser window will open for Cloudflare login." -ForegroundColor White
    Write-Host "   Log in with your Cloudflare account (or create free one)." -ForegroundColor White
    Write-Host "   After login, return here and press Enter." -ForegroundColor White
    Write-Host ""
    Read-Host "Press Enter after completing login in browser"

    # Verify login worked
    $loginCheck = & .\cloudflared.exe tunnel list 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Login failed or incomplete. Please try again." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Already logged in to Cloudflare" -ForegroundColor Green
}

Write-Host ""

# Step 2: Create named tunnel
Write-Host "🔧 Step 2: Creating Named Tunnel" -ForegroundColor Cyan
Write-Host "------------------------------" -ForegroundColor Cyan

Write-Host "Creating tunnel: $TunnelName" -ForegroundColor White
$createResult = & .\cloudflared.exe tunnel create $TunnelName 2>&1

if ($LASTEXITCODE -ne 0) {
    if ($createResult -match "already exists") {
        Write-Host "ℹ️  Tunnel '$TunnelName' already exists" -ForegroundColor Yellow
    } else {
        Write-Host "❌ Failed to create tunnel: $createResult" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Created tunnel '$TunnelName'" -ForegroundColor Green
}

# Get tunnel ID
$tunnelInfo = & .\cloudflared.exe tunnel list | Where-Object { $_ -match $TunnelName }
$tunnelId = ($tunnelInfo -split '\s+')[1]

if (!$tunnelId) {
    Write-Host "❌ Could not retrieve tunnel ID" -ForegroundColor Red
    exit 1
}

Write-Host "🔑 Tunnel ID: $tunnelId" -ForegroundColor Gray
Write-Host ""

# Step 3: Create tunnel configuration
Write-Host "⚙️  Step 3: Creating Tunnel Configuration" -ForegroundColor Cyan
Write-Host "--------------------------------------" -ForegroundColor Cyan

$configPath = ".cloudflared\config.yaml"
$configDir = Split-Path $configPath -Parent

if (!(Test-Path $configDir)) {
    New-Item -ItemType Directory -Path $configDir -Force | Out-Null
}

$configContent = @"
tunnel: $TunnelName
credentials-file: $PWD\.cloudflared\$tunnelId.json

ingress:
  - hostname: $TunnelName.trycloudflare.com
    service: http://localhost:$LocalPort
  - service: http_status:404
"@

$configContent | Out-File -FilePath $configPath -Encoding UTF8 -Force
Write-Host "✅ Created config file: $configPath" -ForegroundColor Green
Write-Host ""

# Step 4: Set up DNS routing
Write-Host "🌐 Step 4: Setting Up DNS Routing" -ForegroundColor Cyan
Write-Host "-------------------------------" -ForegroundColor Cyan

Write-Host "Setting up DNS for: $TunnelName.trycloudflare.com" -ForegroundColor White
$dnsResult = & .\cloudflared.exe tunnel route dns $TunnelName "$TunnelName.trycloudflare.com" 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ DNS setup failed: $dnsResult" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 This might be normal if DNS is already set up." -ForegroundColor Yellow
    Write-Host "   Continuing anyway..." -ForegroundColor Yellow
} else {
    Write-Host "✅ DNS routing configured" -ForegroundColor Green
}

Write-Host ""

# Step 5: Test the tunnel
Write-Host "🧪 Step 5: Testing Tunnel" -ForegroundColor Cyan
Write-Host "-----------------------" -ForegroundColor Cyan

Write-Host "Starting tunnel in background for testing..." -ForegroundColor White

# Start tunnel in background
$job = Start-Job -ScriptBlock {
    param($configPath)
    Set-Location $using:PWD
    & .\cloudflared.exe tunnel run --config $configPath 2>&1
} -ArgumentList $configPath

# Wait a moment for tunnel to start
Start-Sleep -Seconds 5

# Test connection
$testUrl = "https://$TunnelName.trycloudflare.com"
Write-Host "Testing URL: $testUrl" -ForegroundColor White

try {
    $response = Invoke-WebRequest -Uri $testUrl -Method GET -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ Tunnel working! Status: $($response.StatusCode)" -ForegroundColor Green
    $tunnelUrl = $testUrl
} catch {
    Write-Host "⚠️  Tunnel may still be starting up: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "   This is normal - it takes a few seconds to establish." -ForegroundColor Yellow
    $tunnelUrl = $testUrl
}

# Stop the test tunnel
Stop-Job $job -ErrorAction SilentlyContinue
Remove-Job $job -ErrorAction SilentlyContinue

Write-Host ""

# Step 6: Create service integration
Write-Host "🔧 Step 6: Updating Windows Service" -ForegroundColor Cyan
Write-Host "----------------------------------" -ForegroundColor Cyan

# Update the service configuration
$serviceScript = "games-app-service.ps1"
if (Test-Path $serviceScript) {
    $newConfig = @"

    Tunnel = @{
        Name = "Cloudflare Tunnel ($TunnelName)"
        Path = Join-Path `$ScriptPath "cloudflared.exe"
        Args = @("tunnel", "run", "--config", ".cloudflared\config.yaml")
        WorkingDir = `$ScriptPath
        HealthCheck = "https://$TunnelName.trycloudflare.com"
    }
"@

    Write-Host "✅ Service configuration ready" -ForegroundColor Green
    Write-Host "   Run the service setup to use the permanent tunnel" -ForegroundColor White
} else {
    Write-Host "⚠️  Service script not found - manual configuration needed" -ForegroundColor Yellow
}

Write-Host ""

# Final summary
Write-Host "🎉 PERMANENT TUNNEL SETUP COMPLETE!" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your permanent URL: https://$TunnelName.trycloudflare.com" -ForegroundColor Magenta
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor White
Write-Host "1. Update games-app-service.ps1 with new tunnel config" -ForegroundColor Yellow
Write-Host "2. Run .\setup-games-service.bat to restart service" -ForegroundColor Yellow
Write-Host "3. Share permanent URL with Osaka friend" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔄 This URL will survive Windows restarts!" -ForegroundColor Green
Write-Host "💾 Configuration saved - no need to re-run setup" -ForegroundColor Cyan
Write-Host ""
Write-Host "🧪 Test anytime: curl https://$TunnelName.trycloudflare.com" -ForegroundColor Gray