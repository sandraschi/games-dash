"""Pytest fixtures for ai-games-collection gateway tests."""

import os
import sys
import pytest
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "ai-games-collection-mcp" / "src"))
sys.path.insert(0, str(ROOT / "web_sota"))

os.environ.setdefault("AI_GAMES_COLLECTION_BACKEND_PORT", "10987")


@pytest.fixture(scope="session")
def backend_port():
    return int(os.environ.get("AI_GAMES_COLLECTION_BACKEND_PORT", "10987"))


@pytest.fixture(scope="session")
def base_url(backend_port):
    return f"http://127.0.0.1:{backend_port}"
