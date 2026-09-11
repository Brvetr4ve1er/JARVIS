from mcp.types import Tool

from jarvis.mcp_client.bridge import qualified_name, register_mcp_tools
from jarvis.mcp_client.config import McpServerConfig
from jarvis.tools.permission import PermissionLayer
from jarvis.tools.registry import ToolContext, ToolRegistry


class FakeManager:
    """Stands in for McpManager without spawning a real subprocess."""

    def __init__(self, tools_by_server: dict[str, list[Tool]]):
        self._tools = tools_by_server
        self.calls: list[tuple[str, str, dict]] = []

    def list_tools(self):
        return self._tools

    def call_tool(self, server, name, arguments):
        self.calls.append((server, name, arguments))
        return f"called {server}/{name} with {arguments}"


def make_tool(name: str, description: str = "does a thing") -> Tool:
    return Tool(name=name, description=description, inputSchema={"type": "object", "properties": {}})


def test_qualified_name_namespaces_by_server():
    assert qualified_name("filesystem", "read_file") == "mcp__filesystem__read_file"


def test_register_mcp_tools_adds_specs_and_wires_execution():
    manager = FakeManager({"fs": [make_tool("read_file")]})
    configs = [McpServerConfig(name="fs", transport="stdio", command="x", permission="allow")]
    registry = ToolRegistry()
    permissions = PermissionLayer()

    count = register_mcp_tools(registry, manager, configs, permissions)

    assert count == 1
    assert registry.has("mcp__fs__read_file")
    result = registry.call("mcp__fs__read_file", {"path": "/tmp/x"}, ToolContext(conn=None, session_id="s"))
    assert result == "called fs/read_file with {'path': '/tmp/x'}"
    assert manager.calls == [("fs", "read_file", {"path": "/tmp/x"})]


def test_register_mcp_tools_applies_per_server_permission():
    manager = FakeManager({"safe": [make_tool("list")], "risky": [make_tool("exec")]})
    configs = [
        McpServerConfig(name="safe", transport="stdio", command="x", permission="allow"),
        McpServerConfig(name="risky", transport="stdio", command="y", permission="deny"),
    ]
    registry = ToolRegistry()
    permissions = PermissionLayer()

    register_mcp_tools(registry, manager, configs, permissions)

    assert permissions.check("mcp__safe__list", {}) is True
    assert permissions.check("mcp__risky__exec", {}) is False


def test_default_permission_is_ask_when_unspecified():
    manager = FakeManager({"srv": [make_tool("do_thing")]})
    configs = [McpServerConfig(name="srv", transport="stdio", command="x")]  # default permission="ask"
    registry = ToolRegistry()
    permissions = PermissionLayer(asker=lambda n, a: "no")

    register_mcp_tools(registry, manager, configs, permissions)

    assert permissions.check("mcp__srv__do_thing", {}) is False  # asker said no
