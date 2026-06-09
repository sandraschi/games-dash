set windows-shell := ["pwsh.exe", "-NoLogo", "-Command"]

# — Dashboard —

default:
    @just --list

# — Development —

# Start full dev environment (backend + frontend)
dev:
    Set-Location '{{justfile_directory()}}'
    uv run python -m games_mcp.server &
    Set-Location '{{justfile_directory()}}\web_sota'
    npm run dev

# Start gateway backend only (FastAPI + FastMCP on 10987)
serve:
    Set-Location '{{justfile_directory()}}'
    uv run uvicorn web_sota.server:app --host 127.0.0.1 --port 10987 --reload

# Start frontend only (Vite on 10986)
dev-web:
    Set-Location '{{justfile_directory()}}\web_sota'
    npm run dev

# — Quality —

# Ruff lint (fleet standard)
lint:
    Set-Location '{{justfile_directory()}}'
    uv run ruff check . --extend-exclude '*.ps1'

# Ruff fix + format
fix:
    Set-Location '{{justfile_directory()}}'
    uv run ruff check . --extend-exclude '*.ps1' --fix --unsafe-fixes
    uv run ruff format .

# TypeScript typecheck
typecheck:
    Set-Location '{{justfile_directory()}}\web_sota'
    npm run build -- --noEmit

# Playwright e2e tests
e2e:
    Set-Location '{{justfile_directory()}}'
    uv run uvicorn web_sota.server:app --host 127.0.0.1 --port 10987 --log-level warning &
    Start-Sleep 3
    Set-Location '{{justfile_directory()}}\web_sota'
    npx playwright test

# — Security —

# Bandit security audit
check-sec:
    Set-Location '{{justfile_directory()}}'
    uv run bandit -r src/ games-mcp/src/

# — Native Desktop —

# Build embedded Python backend -> native/resources/
build-sidecar:
    pwsh -NoProfile -ExecutionPolicy Bypass -File '{{justfile_directory()}}\native\build-sidecar.ps1'

# Full Tauri release build (sidecar + frontend + NSIS installer)
build-native:
    pwsh -NoProfile -ExecutionPolicy Bypass -File '{{justfile_directory()}}\native\build.ps1'

# Tauri debug build (skip PyInstaller)
build-native-debug:
    Set-Location '{{justfile_directory()}}\native'
    $env:Path = "$env:USERPROFILE\.cargo\bin;$env:Path"
    npx @tauri-apps/cli build --debug

# — Docker —

# Build and start all Docker services
docker-up:
    Set-Location '{{justfile_directory()}}'
    docker compose -f docker-compose.yml up --build -d

# Stop Docker services
docker-down:
    Set-Location '{{justfile_directory()}}'
    docker compose down

# Docker logs
docker-logs:
    Set-Location '{{justfile_directory()}}'
    docker compose logs -f

# — MCPB —

# Pack the MCPB bundle for distribution
mcpb-pack:
    Set-Location '{{justfile_directory()}}'
    $name = "games-mcp"
    $version = "2.5.1"
    $out = "dist/${name}-${version}.mcpb"
    New-Item -ItemType Directory -Force -Path dist | Out-Null
    npx @anthropic-ai/mcpb pack --source . --output $out --ignore .mcpbignore
    Write-Host "MCPB: $out"

# — Screenshots —

# Capture Playwright screenshots for README/Preview
screenshots:
    Set-Location '{{justfile_directory()}}\web_sota'
    npx playwright test --project=chromium --grep @screenshot
    Write-Host "Screenshots in: docs/screenshots/"
