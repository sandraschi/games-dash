"""Pytest fixtures for games-app gateway tests."""

import os
import sys
import pytest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "games-mcp" / "src"))
sys.path.insert(0, str(ROOT / "web_sota"))

os.environ.setdefault("GAMES_BACKEND_PORT", "10987")


@pytest.fixture(scope="session")
def backend_port():
    return int(os.environ.get("GAMES_BACKEND_PORT", "10987"))


@pytest.fixture(scope="session")
def base_url(backend_port):
    return f"http://127.0.0.1:{backend_port}"
