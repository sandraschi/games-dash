# AI Services Health Monitor & Auto-Restart
# Ensures AI servers are always available for remote players

param(
    [switch]$Install,
    [switch]$Uninstall,
    [switch]$Status,
    [switch]$ForceRestart
)

$aiServices = @(
    @{Name="Stockfish"; Port=10001; Script="backend/simple-stockfish-server.py"; HealthEndpoint="/api/status"},
    @{Name="KataGo"; Port=10002; Script="backend/simple-go-server.py"; HealthEndpoint="/api/status"},
    @{Name="YaneuraOu"; Port=10003; Script="backend/simple-shogi-server.py"; HealthEndpoint="/api/status"}
)

$serviceName = "GamesAIServices"
$servicePath = $PSScriptRoot

function Test-Port {
    param([int]$Port)
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $tcp.Connect("127.0.0.1", $Port)
        $tcp.Close()
        return $true
    } catch {
        return $false
    }
}

function Test-HealthEndpoint {
    param([int]$Port, [string]$Endpoint)
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$Port$Endpoint" -TimeoutSec 5 -ErrorAction SilentlyContinue
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
}

function Kill-ProcessByPort {
    param([int]$Port)
    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
        foreach ($conn in $connections) {
            if ($conn.State -eq "Listen") {
                Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
                Write-Host "Killed process on port $Port" -ForegroundColor Yellow
            }
        }
    } catch {
        # Ignore errors
    }
}

function Start-AIService {
    param([hashtable]$Service)

    Write-Host "Starting $($Service.Name) on port $($Service.Port)..." -ForegroundColor Green

    # Kill any existing process on this port
    Kill-ProcessByPort $Service.Port

    # Start the service
    $job = Start-Job -ScriptBlock {
        param($script, $workDir)
        Set-Location $workDir
        python $script
    } -ArgumentList $Service.Script, $PSScriptRoot

    # Wait for startup
    $maxWait = 10
    $waited = 0
    $started = $false

    while ($waited -lt $maxWait -and -not $started) {
        Start-Sleep -Seconds 1
        $waited++

        if (Test-Port $Service.Port) {
            # Additional health check
            if (Test-HealthEndpoint $Service.Port $Service.HealthEndpoint) {
                $started = $true
                Write-Host "✓ $($Service.Name) healthy on port $($Service.Port)" -ForegroundColor Green
            }
        }
    }

    if (-not $started) {
        Write-Host "✗ $($Service.Name) failed to start properly" -ForegroundColor Red
        Stop-Job $job -ErrorAction SilentlyContinue
        Remove-Job $job -ErrorAction SilentlyContinue
    }

    return @{Service=$Service; Job=$job; Started=$started}
}

function Monitor-And-Restart {
    Write-Host "🔍 Monitoring AI services for remote players..." -ForegroundColor Cyan
    Write-Host "Services must remain available 24/7 for iPad/iPhone users" -ForegroundColor Yellow

    while ($true) {
        foreach ($service in $aiServices) {
            $healthy = Test-Port $service.Port
            if (-not $healthy) {
                Write-Host "⚠️ $($service.Name) down - restarting for remote access..." -ForegroundColor Red
                Start-AIService $service
            }
        }

        # Check every 30 seconds
        Start-Sleep -Seconds 30
    }
}

function Install-Service {
    Write-Host "Installing AI Services as Windows Service..." -ForegroundColor Cyan

    # Create service using NSSM (Non-Sucking Service Manager)
    $nssmPath = "C:\Program Files\nssm\nssm.exe"
    if (-not (Test-Path $nssmPath)) {
        Write-Host "NSSM not found. Please install NSSM first." -ForegroundColor Red
        Write-Host "Download from: https://nssm.cc/download" -ForegroundColor Yellow
        return
    }

    # Install the monitoring service
    $serviceCmd = "powershell.exe -ExecutionPolicy Bypass -File `"$servicePath\ensure-ai-services.ps1`""
    & $nssmPath install $serviceName $serviceCmd
    & $nssmPath set $serviceName DisplayName "Games AI Services Monitor"
    & $nssmPath set $serviceName Description "Ensures AI servers (Stockfish, KataGo, YaneuraOu) remain available for remote players"

    Write-Host "Service installed. Starting..." -ForegroundColor Green
    Start-Service $serviceName
}

function Uninstall-Service {
    Write-Host "Uninstalling AI Services..." -ForegroundColor Yellow
    Stop-Service $serviceName -ErrorAction SilentlyContinue
    & "C:\Program Files\nssm\nssm.exe" remove $serviceName confirm
}

function Show-Status {
    Write-Host "🤖 AI Services Status for Remote Players" -ForegroundColor Cyan
    Write-Host "─" * 50

    foreach ($service in $aiServices) {
        $portOpen = Test-Port $service.Port
        $healthy = Test-HealthEndpoint $service.Port $service.HealthEndpoint

        $status = if ($healthy) { "🟢 Available" } elseif ($portOpen) { "🟡 Port Open" } else { "🔴 Down" }
        Write-Host ("{0,-12} Port {1,-5} {2}" -f $service.Name, $service.Port, $status)
    }

    Write-Host "`n📱 Remote Access Status:" -ForegroundColor Cyan
    Write-Host "  • iPad/iPhone: Replace localhost with external IP" -ForegroundColor White
    Write-Host "  • Ports 10001-10003 must be accessible remotely" -ForegroundColor White
    Write-Host "  • KataGo enables competitive Go for Bangalore players" -ForegroundColor White
}

# Main logic
if ($Install) {
    Install-Service
} elseif ($Uninstall) {
    Uninstall-Service
} elseif ($Status) {
    Show-Status
} elseif ($ForceRestart) {
    Write-Host "🔄 Force restarting all AI services..." -ForegroundColor Yellow
    foreach ($service in $aiServices) {
        Kill-ProcessByPort $service.Port
        Start-AIService $service
    }
} else {
    # Default: Start all services and begin monitoring
    Write-Host "🎮 Starting AI Services for Remote Competitive Play" -ForegroundColor Cyan
    Write-Host "Ensuring KataGo, Stockfish, YaneuraOu work for Bangalore players" -ForegroundColor Yellow

    $runningServices = @()

    foreach ($service in $aiServices) {
        $result = Start-AIService $service
        if ($result.Started) {
            $runningServices += $result
        }
    }

    if ($runningServices.Count -eq $aiServices.Count) {
        Write-Host "`n✅ All AI services ready for remote players!" -ForegroundColor Green
        Write-Host "🏆 Competitive play enabled for iPad/iPhone users worldwide" -ForegroundColor Cyan

        # Start monitoring in background
        Monitor-And-Restart
    } else {
        Write-Host "`n❌ Some AI services failed to start" -ForegroundColor Red
        Write-Host "Remote competitive play will not work properly" -ForegroundColor Yellow
        exit 1
    }
}