# Games App Windows Service
# Manages all game servers and keeps them alive

param(
    [switch]$Install,
    [switch]$Uninstall,
    [switch]$Start,
    [switch]$Stop,
    [switch]$Status,
    [switch]$Debug
)

$ServiceName = "GamesAppService"
$ScriptPath = $PSScriptRoot
$LogFile = Join-Path $PSScriptRoot "service.log"
$TunnelUrl = "https://games-app-tunnel.trycloudflare.com"

# Service configuration
$ServiceConfig = @{
    WebServer = @{
        Name = "Web Server (9876)"
        Path = Join-Path $ScriptPath "backend/web-server.py"
        Args = @()
        WorkingDir = Join-Path $ScriptPath "backend"
        Port = 9876
        HealthCheck = "http://localhost:9876"
    }
    SoundService = @{
        Name = "Sound Service (11879)"
        Path = Join-Path $ScriptPath "backend/sound-service.py"
        Args = @()
        WorkingDir = Join-Path $ScriptPath "backend"
        Port = 11879
        HealthCheck = "http://localhost:11879/health"
    }
    MultiplayerServer = @{
        Name = "Multiplayer Server (9877/9878)"
        Path = Join-Path $ScriptPath "backend/multiplayer-server.py"
        Args = @()
        WorkingDir = Join-Path $ScriptPath "backend"
        Port = 9877
        HealthCheck = "http://localhost:9878/health"
    }
    StockfishAI = @{
        Name = "Stockfish AI (10001)"
        Path = Join-Path $ScriptPath "backend/simple-stockfish-server.py"
        Args = @()
        WorkingDir = Join-Path $ScriptPath "backend"
        Port = 10001
        HealthCheck = "http://localhost:10001/api/status"
    }
    KataGoAI = @{
        Name = "KataGo AI (10002)"
        Path = Join-Path $ScriptPath "backend/simple-go-server.py"
        Args = @()
        WorkingDir = Join-Path $ScriptPath "backend"
        Port = 10002
        HealthCheck = "http://localhost:10002/api/status"
    }
    YaneuraOuAI = @{
        Name = "YaneuraOu AI (10003)"
        Path = Join-Path $ScriptPath "backend/simple-shogi-server.py"
        Args = @()
        WorkingDir = Join-Path $ScriptPath "backend"
        Port = 10003
        HealthCheck = "http://localhost:10003/api/status"
    }
    Tunnel = @{
        Name = "Cloudflare Tunnel (Permanent)"
        Path = Join-Path $ScriptPath "cloudflared.exe"
        Args = @("tunnel", "run", "--config", ".cloudflared\config.yaml")
        WorkingDir = $ScriptPath
        HealthCheck = "https://games-app-tunnel.trycloudflare.com"
    }
}

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] [$Level] $Message"
    Write-Host $logMessage -ForegroundColor $(if ($Level -eq "ERROR") { "Red" } elseif ($Level -eq "WARN") { "Yellow" } else { "White" })
    Add-Content -Path $LogFile -Value $logMessage
}

function Test-Port {
    param([int]$Port)
    try {
        $tcpClient = New-Object System.Net.Sockets.TcpClient
        $tcpClient.Connect("localhost", $Port)
        $tcpClient.Close()
        return $true
    } catch {
        return $false
    }
}

function Test-HttpEndpoint {
    param([string]$Url)
    try {
        $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 5 -ErrorAction Stop
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
}

function Start-ProcessMonitored {
    param([string]$Name, [string]$Path, [array]$Args, [string]$WorkingDir)

    Write-Log "Starting $Name..."

    if (!(Test-Path $Path)) {
        Write-Log "ERROR: $Path not found" "ERROR"
        return $null
    }

    try {
        $process = Start-Process -FilePath $Path -ArgumentList $Args -WorkingDirectory $WorkingDir -PassThru -NoNewWindow
        Start-Sleep -Seconds 2

        if (!$process.HasExited) {
            Write-Log "$Name started successfully (PID: $($process.Id))"
            return $process
        } else {
            Write-Log "ERROR: $Name failed to start" "ERROR"
            return $null
        }
    } catch {
        Write-Log "ERROR starting $Name`: $($_.Exception.Message)" "ERROR"
        return $null
    }
}

function Monitor-Services {
    Write-Log "=== Games App Service Monitor Started ==="

    $runningProcesses = @{}

    # Start all services
    foreach ($serviceKey in $ServiceConfig.Keys) {
        $service = $ServiceConfig[$serviceKey]
        $process = Start-ProcessMonitored -Name $service.Name -Path $service.Path -Args $service.Args -WorkingDir $service.WorkingDir

        if ($process) {
            $runningProcesses[$serviceKey] = @{
                Process = $process
                Config = $service
                LastHealthCheck = Get-Date
                RestartCount = 0
            }
        }
    }

    # Monitor loop
    while ($true) {
        foreach ($serviceKey in $runningProcesses.Keys) {
            $serviceInfo = $runningProcesses[$serviceKey]
            $process = $serviceInfo.Process
            $config = $serviceInfo.Config

            # Check if process is still running
            if ($process.HasExited) {
                Write-Log "WARNING: $($config.Name) crashed or stopped (Exit code: $($process.ExitCode))" "WARN"
                $serviceInfo.RestartCount++

                if ($serviceInfo.RestartCount -le 5) {
                    Write-Log "Attempting to restart $($config.Name) (attempt $($serviceInfo.RestartCount)/5)..."
                    $newProcess = Start-ProcessMonitored -Name $config.Name -Path $config.Path -Args $config.Args -WorkingDir $config.WorkingDir

                    if ($newProcess) {
                        $serviceInfo.Process = $newProcess
                        $serviceInfo.LastHealthCheck = Get-Date
                    } else {
                        Write-Log "ERROR: Failed to restart $($config.Name)" "ERROR"
                    }
                } else {
                    Write-Log "ERROR: $($config.Name) failed to restart after 5 attempts. Giving up." "ERROR"
                    $runningProcesses.Remove($serviceKey)
                }
                continue
            }

            # Health check (every 30 seconds)
            $now = Get-Date
            if (($now - $serviceInfo.LastHealthCheck).TotalSeconds -ge 30) {
                $healthy = $false

                if ($config.ContainsKey("Port")) {
                    $healthy = Test-Port -Port $config.Port
                } elseif ($config.ContainsKey("HealthCheck")) {
                    $healthy = Test-HttpEndpoint -Url $config.HealthCheck
                }

                if (!$healthy) {
                    Write-Log "WARNING: $($config.Name) health check failed" "WARN"
                }

                $serviceInfo.LastHealthCheck = $now
            }
        }

        # Tunnel keeper ping (every 60 seconds for tunnel)
        if ($runningProcesses.ContainsKey("Tunnel")) {
            $tunnelInfo = $runningProcesses["Tunnel"]
            $now = Get-Date
            if (($now - $tunnelInfo.LastHealthCheck).TotalSeconds -ge 60) {
                try {
                    $response = Invoke-WebRequest -Uri $TunnelUrl -Method GET -TimeoutSec 10 -ErrorAction Stop
                    Write-Log "Tunnel ping successful - Status: $($response.StatusCode)"
                } catch {
                    Write-Log "WARNING: Tunnel ping failed: $($_.Exception.Message)" "WARN"
                }
                $tunnelInfo.LastHealthCheck = $now
            }
        }

        Start-Sleep -Seconds 5
    }
}

function Install-Service {
    Write-Host "Installing Games App Service..." -ForegroundColor Cyan

    # Check if NSSM is available
    $nssmPath = "C:\nssm\nssm.exe"
    if (!(Test-Path $nssmPath)) {
        Write-Host "NSSM not found at $nssmPath" -ForegroundColor Red
        Write-Host "Please download NSSM from https://nssm.cc/download" -ForegroundColor Yellow
        Write-Host "Extract nssm.exe to C:\nssm\" -ForegroundColor Yellow
        return
    }

    # Install service using NSSM
    $serviceCmd = "& '$nssmPath' install '$ServiceName' 'powershell.exe' '-ExecutionPolicy Bypass -File `"$PSCommandPath`"'"
    Invoke-Expression $serviceCmd

    # Configure service
    & $nssmPath set $ServiceName Description "Games App Service - Manages web server, sound service, and Cloudflare tunnel"
    & $nssmPath set $ServiceName Start SERVICE_AUTO_START
    & $nssmPath set $ServiceName AppDirectory $ScriptPath

    Write-Host "Service installed successfully!" -ForegroundColor Green
    Write-Host "Start with: nssm start $ServiceName" -ForegroundColor Cyan
}

function Uninstall-Service {
    Write-Host "Uninstalling Games App Service..." -ForegroundColor Cyan

    $nssmPath = "C:\nssm\nssm.exe"
    if (!(Test-Path $nssmPath)) {
        Write-Host "NSSM not found. Cannot uninstall service." -ForegroundColor Red
        return
    }

    & $nssmPath stop $ServiceName 2>$null
    & $nssmPath remove $ServiceName confirm

    Write-Host "Service uninstalled." -ForegroundColor Green
}

function Show-Status {
    Write-Host "Games App Service Status" -ForegroundColor Cyan
    Write-Host "=========================" -ForegroundColor Cyan

    # Check if service exists
    $service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if ($service) {
        Write-Host "Service: $($service.Status)" -ForegroundColor $(if ($service.Status -eq "Running") { "Green" } else { "Red" })
    } else {
        Write-Host "Service: Not installed" -ForegroundColor Red
    }

    # Check individual components
    Write-Host ""
    Write-Host "Component Status:" -ForegroundColor White

    foreach ($serviceKey in $ServiceConfig.Keys) {
        $config = $ServiceConfig[$serviceKey]
        $status = "❌ Not running"

        if ($config.ContainsKey("Port")) {
            if (Test-Port -Port $config.Port) { $status = "✅ Running" }
        } elseif ($config.ContainsKey("HealthCheck")) {
            if (Test-HttpEndpoint -Url $config.HealthCheck) { $status = "✅ Running" }
        }

        Write-Host "  $($config.Name): $status" -ForegroundColor $(if ($status.Contains("✅")) { "Green" } else { "Red" })
    }

    # Show log file location
    Write-Host ""
    Write-Host "Log file: $LogFile" -ForegroundColor Gray
}

# Main logic
if ($Install) {
    Install-Service
} elseif ($Uninstall) {
    Uninstall-Service
} elseif ($Start) {
    Write-Host "Starting service..." -ForegroundColor Cyan
    nssm start $ServiceName
} elseif ($Stop) {
    Write-Host "Stopping service..." -ForegroundColor Cyan
    nssm stop $ServiceName
} elseif ($Status) {
    Show-Status
} elseif ($Debug) {
    Write-Host "Running in debug mode (Ctrl+C to stop)..." -ForegroundColor Yellow
    Monitor-Services
} else {
    Write-Host "Games App Service Manager" -ForegroundColor Green
    Write-Host "========================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor White
    Write-Host "  .\games-app-service.ps1 -Install     Install as Windows service"
    Write-Host "  .\games-app-service.ps1 -Uninstall   Remove Windows service"
    Write-Host "  .\games-app-service.ps1 -Start       Start the service"
    Write-Host "  .\games-app-service.ps1 -Stop        Stop the service"
    Write-Host "  .\games-app-service.ps1 -Status      Show service status"
    Write-Host "  .\games-app-service.ps1 -Debug       Run in debug mode (foreground)"
    Write-Host ""
    Write-Host "Prerequisites:" -ForegroundColor Yellow
    Write-Host "  • Download NSSM: https://nssm.cc/download"
    Write-Host "  • Extract nssm.exe to C:\nssm\"
    Write-Host "  • Run as Administrator for install/uninstall"
}