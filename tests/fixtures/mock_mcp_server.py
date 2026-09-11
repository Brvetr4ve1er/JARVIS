"""Real, minimal MCP server (stdio transport) used by test_mcp_integration.py
to exercise McpManager against the actual protocol instead of a stand-in."""

from mcp.server.mcpserver import MCPServer

server = MCPServer("test-server")


@server.tool()
def add(a: int, b: int) -> int:
    """Add two numbers."""
    return a + b


if __name__ == "__main__":
    server.run(transport="stdio")
