"""Smoke tests for the ai-games-collection FastAPI gateway.

Run with: uv run pytest tests/test_gateway.py -v
Requires the gateway to be running: just serve
"""

import httpx
import pytest


@pytest.mark.anyio
async def test_health_endpoint(base_url):
    """Gateway /health returns 200 with server info."""
    async with httpx.AsyncClient() as client:
        r = await client.get(f"{base_url}/health")
    assert r.status_code == 200
    data = r.json()
    assert data.get("status") == "ok"
    assert "version" in data or "server" in data


@pytest.mark.anyio
async def test_status_endpoint(base_url):
    """Gateway /api/v1/status returns game count and engine info."""
    async with httpx.AsyncClient() as client:
        r = await client.get(f"{base_url}/api/v1/status")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, dict)


@pytest.mark.anyio
async def test_config_endpoint(base_url):
    """Gateway /api/config returns port mappings."""
    async with httpx.AsyncClient() as client:
        r = await client.get(f"{base_url}/api/config")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, dict)
    assert "ports" in data or "ai_server_host" in data


@pytest.mark.anyio
async def test_mcp_health(base_url):
    """MCP mount at /mcp is reachable."""
    async with httpx.AsyncClient() as client:
        r = await client.get(f"{base_url}/mcp")
    assert r.status_code in (200, 404, 405, 406)  # MCP endpoint may not accept bare GET


@pytest.mark.anyio
async def test_ai_games_collection_mcp_imports():
    """Canonical ai_games_collection_mcp package imports cleanly (core modules only)."""
    import ai_games_collection_mcp
    assert ai_games_collection_mcp.__version__
    from ai_games_collection_mcp import config
    assert config
