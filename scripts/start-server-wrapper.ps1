cd d:\Dev\repos\ai-games-collection
Write-Host "Starting web server on port 9876..." -ForegroundColor Green
Write-Host ""
try {
    python -m http.server 9876
} catch {
    Write-Host "ERROR: $_" -ForegroundColor Red
    Read-Host "Press Enter to close"
}
