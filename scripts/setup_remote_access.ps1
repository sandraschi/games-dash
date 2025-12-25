# Remote Access Setup for Games App
# Ensures AI works from iPad in Burundi or anywhere else!
# **Timestamp**: 2025-12-17

param(
    [switch]$Force,
    [switch]$TestConnectivity
)

Write-Host "🎮 Games App - Remote Access Setup" -ForegroundColor Cyan
Write-Host "Ensuring AI works from iPad in Burundi! 🌍" -ForegroundColor Yellow
Write-Host ""

# Check if Docker is running
Write-Host "🐳 Checking Docker status..." -ForegroundColor Blue
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker found: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker not found or not running!" -ForegroundColor Red
    Write-Host "   Please install and start Docker Desktop" -ForegroundColor Yellow
    exit 1
}

# Check if AI servers are running
Write-Host "🤖 Checking AI server status..." -ForegroundColor Blue
$aiPorts = @(9543, 9544, 9545, 9877)
$aiServices = @("Stockfish", "YaneuraOu", "KataGo", "Multiplayer")

for ($i = 0; $i -lt $aiPorts.Count; $i++) {
    $port = $aiPorts[$i]
    $service = $aiServices[$i]

    try {
        $connection = New-Object System.Net.Sockets.TcpClient("localhost", $port)
        $connection.Close()
        Write-Host "✅ $service (port $port): RUNNING" -ForegroundColor Green
    } catch {
        Write-Host "❌ $service (port $port): NOT RUNNING" -ForegroundColor Red
        Write-Host "   Start with: .\START_ALL_SERVERS.ps1" -ForegroundColor Yellow
    }
}

# Test Docker connectivity
Write-Host "🔗 Testing Docker networking..." -ForegroundColor Blue
try {
    $dockerNetworks = docker network ls --format "{{.Name}}"
    if ($dockerNetworks -contains "games-app_games-network") {
        Write-Host "✅ Games network exists" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Games network not found (will be created by docker-compose)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Cannot check Docker networks" -ForegroundColor Red
}

# Get network information
Write-Host "🌐 Network configuration..." -ForegroundColor Blue

# Get local IP addresses
$localIPs = Get-NetIPAddress | Where-Object {
    $_.AddressFamily -eq "IPv4" -and
    $_.IPAddress -notlike "127.*" -and
    $_.IPAddress -notlike "169.*"
} | Select-Object -ExpandProperty IPAddress

Write-Host "Local IP addresses:" -ForegroundColor Cyan
foreach ($ip in $localIPs) {
    Write-Host "  📱 http://$ip`:9876 (iPad/LAN access)" -ForegroundColor White
}

# Check for Tailscale
Write-Host "🔒 Checking VPN status..." -ForegroundColor Blue
$tailscaleIP = Get-NetIPAddress | Where-Object {
    $_.IPAddress -match "^100\."
} | Select-Object -First 1 -ExpandProperty IPAddress

if ($tailscaleIP) {
    Write-Host "✅ Tailscale detected: $tailscaleIP" -ForegroundColor Green
    Write-Host "  🌍 Remote access: http://$tailscaleIP`:9876" -ForegroundColor White
    Write-Host "  📱 iPad access: Use Tailscale app to connect" -ForegroundColor White
} else {
    Write-Host "ℹ️  No Tailscale detected (optional for internet access)" -ForegroundColor Blue
    Write-Host "   Install Tailscale for zero-config remote access" -ForegroundColor Yellow
}

# Firewall check
Write-Host "🔥 Checking Windows Firewall..." -ForegroundColor Blue
$firewallRules = Get-NetFirewallRule | Where-Object {
    $_.DisplayName -like "*games*" -or
    $_.LocalPort -in @("9876", "9543", "9544", "9545", "9877")
}

if ($firewallRules) {
    Write-Host "✅ Firewall rules found for games ports" -ForegroundColor Green
} else {
    Write-Host "⚠️  No firewall rules found for games ports" -ForegroundColor Yellow
    Write-Host "   Run: .\START_REMOTE_DEPLOYMENT.ps1 (includes firewall setup)" -ForegroundColor Cyan
}

# Test connectivity if requested
if ($TestConnectivity) {
    Write-Host "🧪 Testing connectivity..." -ForegroundColor Blue

    foreach ($ip in $localIPs) {
        try {
            $response = Invoke-WebRequest -Uri "http://$ip`:9876" -TimeoutSec 5 -Method Head
            Write-Host "✅ Web server accessible at http://$ip`:9876" -ForegroundColor Green
            break
        } catch {
            Write-Host "❌ Cannot reach http://$ip`:9876" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "🚀 Deployment Instructions:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start AI servers:" -ForegroundColor White
Write-Host "   .\START_ALL_SERVERS.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "2. Start web server in Docker:" -ForegroundColor White
Write-Host "   docker compose up -d" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Access from iPad:" -ForegroundColor White
if ($tailscaleIP) {
    Write-Host "   🌍 http://$tailscaleIP`:9876 (anywhere via Tailscale)" -ForegroundColor Green
}
foreach ($ip in $localIPs | Select-Object -First 2) {
    Write-Host "   📱 http://$ip`:9876 (local network)" -ForegroundColor Green
}
Write-Host ""
Write-Host "4. For remote access (Burundi/iPad):" -ForegroundColor White
Write-Host "   • Make sure your router forwards ports 9543, 9544, 9545, 9877 to your PC" -ForegroundColor Yellow
Write-Host "   • Or use Tailscale VPN for secure access" -ForegroundColor Yellow
Write-Host "   • Test AI connectivity at: connectivity-test.html" -ForegroundColor Yellow
Write-Host ""
Write-Host "5. Test AI connectivity locally:" -ForegroundColor White
Write-Host "   Open chess.html and try to play vs AI" -ForegroundColor Yellow
Write-Host ""

if ($TestConnectivity) {
    Write-Host "🧪 Connectivity test completed!" -ForegroundColor Green
} else {
    Write-Host "💡 Run with -TestConnectivity for full connectivity test" -ForegroundColor Blue
}

Write-Host ""
Write-Host "🎯 AI should work from iPad in Burundi! 🎉" -ForegroundColor Magenta
