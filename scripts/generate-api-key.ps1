# Generate API Key for Remote Players
# Usage: .\scripts\generate-api-key.ps1 -Email "player@example.com" -Name "Bangalore Player"

param(
    [Parameter(Mandatory=$true)]
    [string]$Email,
    
    [Parameter(Mandatory=$false)]
    [string]$Name = "Default",
    
    [Parameter(Mandatory=$false)]
    [int]$ExpiresDays = 365
)

Write-Host "Generating API key for: $Email" -ForegroundColor Cyan

# Python script to generate API key
$pythonScript = @"
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from auth_manager import auth_manager

try:
    # Create or get user
    user = None
    for existing_user in auth_manager.users.values():
        if existing_user.email == '$Email':
            user = existing_user
            break
    
    if not user:
        user = auth_manager.create_user('$Email', role='user')
        print(f'Created new user: {user.user_id}')
    else:
        print(f'Found existing user: {user.user_id}')
    
    # Generate API key
    api_key = auth_manager.generate_api_key(user.user_id, name='$Name', expires_days=$ExpiresDays)
    
    print(f'\nAPI Key Generated Successfully!')
    print(f'User ID: {user.user_id}')
    print(f'Email: {user.email}')
    print(f'API Key: {api_key}')
    print(f'\nIMPORTANT: Save this API key securely - it will not be shown again!')
    print(f'Add to requests: X-API-Key: {api_key}')
    
except Exception as e:
    print(f'Error: {e}', file=sys.stderr)
    sys.exit(1)
"@

# Write temporary Python script
$tempScript = Join-Path $env:TEMP "generate_api_key_$(Get-Random).py"
$pythonScript | Out-File -FilePath $tempScript -Encoding UTF8

try {
    # Run Python script
    $scriptDir = Split-Path -Parent $PSScriptRoot
    Push-Location $scriptDir
    python $tempScript
} finally {
    Pop-Location
    Remove-Item $tempScript -ErrorAction SilentlyContinue
}
