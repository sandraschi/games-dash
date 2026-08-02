"""AI Games Collection MCP Server"""

try:
    from importlib.metadata import PackageNotFoundError, version
    __version__ = version("ai-games-collection-mcp")
except PackageNotFoundError:
    __version__ = "0.0.0"
