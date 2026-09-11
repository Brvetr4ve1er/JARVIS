"""End-to-end test against a real (if trivial) MCP server subprocess —
catches wire-format mismatches (e.g. `input_schema` vs `inputSchema`,
`is_error` vs `isError`) that a mocked manager can't."""

import sys
from pathlib import Path

from jarvis.mcp_client.bridge import register_mcp_tools
from jarvis.mcp_client.config import McpServerConfig
from jarvis.mcp_client.manager import McpManager
from jarvis.tools.permission import PermissionLayer
from jarvis.tools.registry import ToolContext, ToolRegistry

FIXTURE = Path(__file__).parent / "fixtures" / "mock_mcp_server.py"


def test_full_roundtrip_through_real_mcp_server():
    cfg = McpServerConfig(name="test", transport="stdio", command=sys.executable, args=[str(FIXTURE)], permission="allow")
    manager = McpManager([cfg])
    try:
        manager.start()
        assert manager.errors == []

        registry = ToolRegistry()
        permissions = PermissionLayer()
        count = register_mcp_tools(registry, manager, [cfg], permissions)

        assert count == 1
        assert registry.has("mcp__test__add")
        assert permissions.policy["mcp__test__add"] == "allow"

        result = registry.call("mcp__test__add", {"a": 3, "b": 4}, ToolContext(conn=None, session_id="s"))
        assert result == "7"
    finally:
        manager.stop()
