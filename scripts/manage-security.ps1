# Security Management Script
# Usage: .\scripts\manage-security.ps1 -Action <status|block|unblock|stats>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("status", "block", "unblock", "stats", "enable-auth", "disable-auth")]
    [string]$Action,
    
    [Parameter(Mandatory=$false)]
    [string]$IP,
    
    [Parameter(Mandatory=$false)]
    [int]$Port = 10001
)

$serverUrl = "http://localhost:$Port"

switch ($Action) {
    "status" {
        Write-Host "Security Status for AI Server on port $Port" -ForegroundColor Cyan
        try {
            $response = Invoke-RestMethod -Uri "$serverUrl/api/security/stats" -Method Get
            Write-Host "Total Requests: $($response.total_requests)" -ForegroundColor Green
            Write-Host "Blocked IPs: $($response.blocked_ips)" -ForegroundColor Yellow
            Write-Host "Auth Enabled: $($response.auth_enabled)" -ForegroundColor $(if ($response.auth_enabled) { "Green" } else { "Yellow" })
            Write-Host "`nRate Limit Config:" -ForegroundColor Cyan
            $response.rate_limit_config | ConvertTo-Json -Depth 3
        } catch {
            Write-Host "Error: Could not connect to server on port $Port" -ForegroundColor Red
            Write-Host "Make sure the AI server is running" -ForegroundColor Yellow
        }
    }
    
    "stats" {
        Write-Host "Recent Security Events" -ForegroundColor Cyan
        try {
            $response = Invoke-RestMethod -Uri "$serverUrl/api/security/stats" -Method Get
            if ($response.recent_requests) {
                $response.recent_requests | Select-Object -Last 20 | Format-Table -AutoSize
            } else {
                Write-Host "No recent requests logged" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    "block" {
        if (-not $IP) {
            Write-Host "Error: IP address required for block action" -ForegroundColor Red
            Write-Host "Usage: .\manage-security.ps1 -Action block -IP 1.2.3.4" -ForegroundColor Yellow
            exit 1
        }
        Write-Host "Blocking IP: $IP" -ForegroundColor Yellow
        Write-Host "Note: IP blocking requires server restart with updated security_middleware.py" -ForegroundColor Yellow
        Write-Host "For immediate blocking, use firewall rules:" -ForegroundColor Cyan
        Write-Host "New-NetFirewallRule -DisplayName `"Block $IP`" -Direction Inbound -RemoteAddress $IP -Action Block" -ForegroundColor White
    }
    
    "unblock" {
        if (-not $IP) {
            Write-Host "Error: IP address required for unblock action" -ForegroundColor Red
            exit 1
        }
        Write-Host "Unblocking IP: $IP" -ForegroundColor Yellow
        Write-Host "Note: Requires server restart" -ForegroundColor Yellow
    }
    
    "enable-auth" {
        Write-Host "Enabling authentication..." -ForegroundColor Cyan
        $env:AI_AUTH_ENABLED = "true"
        if (-not $env:AI_API_KEY_SECRET) {
            Write-Host "Generating API key secret..." -ForegroundColor Yellow
            $secret = python -c "import secrets; print(secrets.token_urlsafe(32))"
            $env:AI_API_KEY_SECRET = $secret
            Write-Host "API Key Secret generated. Set permanently:" -ForegroundColor Green
            Write-Host "`$env:AI_API_KEY_SECRET = '$secret'" -ForegroundColor White
        }
        Write-Host "Restart AI servers to apply authentication" -ForegroundColor Yellow
        Write-Host "Run: .\scripts\ensure-ai-services.ps1 -ForceRestart" -ForegroundColor Cyan
    }
    
    "disable-auth" {
        Write-Host "Disabling authentication..." -ForegroundColor Yellow
        $env:AI_AUTH_ENABLED = "false"
        Write-Host "Restart AI servers to apply changes" -ForegroundColor Yellow
        Write-Host "Run: .\scripts\ensure-ai-services.ps1 -ForceRestart" -ForegroundColor Cyan
    }
}
