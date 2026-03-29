# Setup Permanent Ngrok Tunnel
# Creates a permanent URL that survives restarts

param(
    [string]$LocalPort = "9876",
    [string]$Region = "eu"  # eu, us, ap, au, sa, jp, in
)

Write-Host "🚀 SETTING UP PERMANENT NGROK TUNNEL" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

# Check if ngrok is available
if (!(Test-Path "ngrok.exe")) {
    Write-Host "❌ ngrok.exe not found in current directory" -ForegroundColor Red
    Write-Host "Please download ngrok from https://ngrok.com/download" -ForegroundColor Yellow
    Write-Host "Extract ngrok.exe to the same directory as this script" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Found ngrok.exe" -ForegroundColor Green
Write-Host ""

# Check if authenticated
Write-Host "🔐 Checking Ngrok Authentication..." -ForegroundColor Cyan
$authCheck = & .\ngrok.exe config check 2>&1
if ($LASTEXITCODE -ne 0 -or $authCheck -match "not authenticated|no authtoken") {
    Write-Host "❌ Not authenticated with Ngrok" -ForegroundColor Red
    Write-Host ""
    Write-Host "📝 TO FIX:" -ForegroundColor Yellow
    Write-Host "1. Sign up at: https://dashboard.ngrok.com/signup" -ForegroundColor White
    Write-Host "2. Get your authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken" -ForegroundColor White
    Write-Host "3. Run: ngrok config add-authtoken YOUR_TOKEN_HERE" -ForegroundColor White
    Write-Host "4. Then run this script again" -ForegroundColor White
    exit 1
}

Write-Host "✅ Ngrok authenticated" -ForegroundColor Green
Write-Host ""

# Get current plan info
Write-Host "📊 Checking Ngrok Plan..." -ForegroundColor Cyan
$credits = & .\ngrok.exe credits 2>&1
if ($credits -match "(\d+)\s+credits") {
    $creditCount = $matches[1]
    Write-Host "💰 Credits available: $creditCount" -ForegroundColor Green
} else {
    Write-Host "💰 Plan status: Checking..." -ForegroundColor Gray
}

Write-Host ""

# Create reserved domain (paid feature)
Write-Host "🌐 Setting up Reserved Domain..." -ForegroundColor Cyan
Write-Host "This requires a paid Ngrok plan (~$5/month)" -ForegroundColor Yellow
Write-Host ""

# Check if user has reserved domains
$domains = & .\ngrok.exe api reserved-domains list 2>&1
$hasReservedDomain = $false
$reservedDomain = $null

if ($LASTEXITCODE -eq 0) {
    $domainList = $domains | ConvertFrom-Json -ErrorAction SilentlyContinue
    if ($domainList -and $domainList.Count -gt 0) {
        $reservedDomain = $domainList[0].domain
        $hasReservedDomain = $true
        Write-Host "✅ Found reserved domain: $reservedDomain" -ForegroundColor Green
    }
}

if (!$hasReservedDomain) {
    Write-Host "❌ No reserved domain found" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 TO GET A PERMANENT URL:" -ForegroundColor Yellow
    Write-Host "1. Upgrade to paid plan: https://dashboard.ngrok.com/billing" -ForegroundColor White
    Write-Host "2. Go to: https://dashboard.ngrok.com/reserved-domains" -ForegroundColor White
    Write-Host "3. Create a reserved domain (e.g., yourname.ngrok.io)" -ForegroundColor White
    Write-Host "4. Run this script again" -ForegroundColor White
    Write-Host ""
    Write-Host "💰 COST: ~$5/month for Personal plan" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "⚠️  ALTERNATIVE: Use free temporary URLs" -ForegroundColor Yellow
    Write-Host "   These change on restart but work immediately" -ForegroundColor White
    Write-Host ""
    $useFree = Read-Host "Use free temporary URL instead? (y/n)"
    if ($useFree -eq "y" -or $useFree -eq "Y") {
        Write-Host ""
        Write-Host "🆓 USING FREE TEMPORARY URL" -ForegroundColor Green
        $reservedDomain = $null
    } else {
        Write-Host "Exiting. Run script again after setting up reserved domain." -ForegroundColor Yellow
        exit 0
    }
}

Write-Host ""

# Start the tunnel
Write-Host "🚀 Starting Ngrok Tunnel..." -ForegroundColor Cyan

if ($reservedDomain) {
    Write-Host "Using reserved domain: $reservedDomain" -ForegroundColor White
    $tunnelCmd = "ngrok http $LocalPort --subdomain=$($reservedDomain -replace '\.ngrok\.io$', '') --region=$Region"
} else {
    Write-Host "Using temporary URL (changes on restart)" -ForegroundColor Yellow
    $tunnelCmd = "ngrok http $LocalPort --region=$Region"
}

Write-Host "Command: $tunnelCmd" -ForegroundColor Gray
Write-Host ""

# Start tunnel in background
$job = Start-Job -ScriptBlock {
    param($cmd)
    Invoke-Expression $cmd
} -ArgumentList $tunnelCmd

# Wait for tunnel to start
Write-Host "⏳ Starting tunnel..." -ForegroundColor White
Start-Sleep -Seconds 3

# Get tunnel info
$tunnelInfo = & .\ngrok.exe api tunnels list 2>&1 | ConvertFrom-Json -ErrorAction SilentlyContinue

if ($tunnelInfo -and $tunnelInfo.tunnels) {
    $tunnel = $tunnelInfo.tunnels[0]
    $publicUrl = $tunnel.public_url
    Write-Host "✅ TUNNEL ACTIVE!" -ForegroundColor Green
    Write-Host "🌐 URL: $publicUrl" -ForegroundColor Magenta
    Write-Host ""
    Write-Host "🎮 Your games are now accessible at:" -ForegroundColor Green
    Write-Host "   $publicUrl" -ForegroundColor Magenta
    Write-Host ""
    if (!$reservedDomain) {
        Write-Host "⚠️  NOTE: This URL will change when you restart ngrok" -ForegroundColor Yellow
        Write-Host "   For permanent URL, upgrade to paid plan (~$5/month)" -ForegroundColor Yellow
    } else {
        Write-Host "✅ PERMANENT URL - survives restarts!" -ForegroundColor Green
    }
} else {
    Write-Host "❌ Failed to get tunnel information" -ForegroundColor Red
    Write-Host "Check ngrok process..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🛑 Press Ctrl+C to stop the tunnel" -ForegroundColor Gray

# Keep script running to maintain tunnel
try {
    while ($true) {
        Start-Sleep -Seconds 10
        # Health check
        if (!(Get-Process -Name ngrok -ErrorAction SilentlyContinue)) {
            Write-Host "⚠️  Ngrok process died, restarting..." -ForegroundColor Red
            # Could add restart logic here
        }
    }
} finally {
    Write-Host ""
    Write-Host "🛑 Stopping tunnel..." -ForegroundColor Yellow
    Stop-Job $job -ErrorAction SilentlyContinue
    Remove-Job $job -ErrorAction SilentlyContinue
    Stop-Process -Name ngrok -ErrorAction SilentlyContinue
}