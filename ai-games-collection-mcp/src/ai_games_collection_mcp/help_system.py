import logging
from pathlib import Path
from typing import Any

logger = logging.getLogger("ai_games_collection_mcp.help")


class GamesHelpSystem:
    """
    Manages loading and serving documentation for the AI Games Collection MCP server.
    """

    def __init__(self, docs_dir: str | None = None):
        # Default to docs/ai_games_collection_mcp relative to the project root
        if docs_dir is None:
            # Assume we are in src/ai_games_collection_mcp/ and project root is two levels up
            base_dir = Path(__file__).parent.parent.parent
            self.docs_dir = base_dir / "docs" / "ai_games_collection_mcp"
        else:
            self.docs_dir = Path(docs_dir)

        self._cache = {}

    def get_help(self, topic: str = "overview") -> dict[str, Any]:
        """
        Retrieve help content for a given topic.
        """
        topic = topic.lower().strip()
        filename = f"{topic}.md"
        file_path = self.docs_dir / filename

        if not file_path.exists():
            # Fallback to overview if topic not found
            if topic != "overview":
                logger.warning(
                    f"Help topic not found: {topic}. Falling back to overview."
                )
                return self.get_help("overview")

            return {
                "success": False,
                "error": "Help documentation not found.",
                "docs_dir": str(self.docs_dir),
            }

        try:
            # Check cache
            mtime = file_path.stat().st_mtime
            if topic in self._cache and self._cache[topic]["mtime"] == mtime:
                return self._cache[topic]["content"]

            with open(file_path, encoding="utf-8") as f:
                content = f.read()

            response = {
                "success": True,
                "topic": topic,
                "content": content,
                "format": "markdown",
                "last_updated": mtime,
            }

            # Update cache
            self._cache[topic] = {"mtime": mtime, "content": response}

            return response

        except Exception as e:
            logger.error(f"Error loading help for {topic}: {e}")
            return {"success": False, "error": str(e)}

    def list_topics(self) -> list[str]:
        """
        List all available help topics.
        """
        if not self.docs_dir.exists():
            return []

        topics = []
        for file in self.docs_dir.glob("*.md"):
            topics.append(file.stem)

        return sorted(topics)


# Global help system instance
_help_system = None


def get_help_system() -> GamesHelpSystem:
    """Get the global help system instance."""
    global _help_system
    if _help_system is None:
        _help_system = GamesHelpSystem()
    return _help_system
