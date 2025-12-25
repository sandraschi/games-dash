# Games App - Server Health Check
# **Timestamp**: 2025-12-20

Write-Host ""
Write-Host "🔍 GAMES APP SERVER STATUS" -ForegroundColor Cyan
Write-Host "   $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host ""

$servers = @(
    @{ Name = "Web Server"; Port = 9876 },
    @{ Name = "Stockfish AI"; Port = 9543 },
    @{ Name = "Shogi AI"; Port = 9544 },
    @{ Name = "Go AI"; Port = 9545 },
    @{ Name = "Multiplayer"; Port = 9877 }
)

$allHealthy = $true

foreach ($server in $servers) {
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.Connect("127.0.0.1", $server.Port)
        $tcpClient.Close()
        Write-Host "   ✅ $($server.Name) (port $($server.Port)) - RUNNING" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ $($server.Name) (port $($server.Port)) - DOWN" -ForegroundColor Red
        $allHealthy = $false
    }
}

Write-Host ""
if ($allHealthy) {
    Write-Host "🎉 All servers are healthy!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some servers are down." -ForegroundColor Yellow
    Write-Host "   Run START_SERVERS_RESILIENT.ps1 to restart them." -ForegroundColor Yellow
}
