"""Games MCP Server"""

try:
    from importlib.metadata import PackageNotFoundError, version
    __version__ = version("games-mcp")
except PackageNotFoundError:
    __version__ = "0.0.0"
