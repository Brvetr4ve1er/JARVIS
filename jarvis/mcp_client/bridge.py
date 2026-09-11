from __future__ import annotations

from jarvis.mcp_client.config import McpServerConfig
from jarvis.mcp_client.manager import McpManager
from jarvis.models.base import ToolSpec
from jarvis.tools.permission import PermissionLayer
from jarvis.tools.registry import ToolContext, ToolRegistry

EMPTY_SCHEMA = {"type": "object", "properties": {}}


def qualified_name(server: str, tool_name: str) -> str:
    return f"mcp__{server}__{tool_name}"


def _make_fn(manager: McpManager, server: str, tool_name: str):
    def fn(arguments: dict, ctx: ToolContext) -> str:
        return manager.call_tool(server, tool_name, arguments)

    return fn


def register_mcp_tools(
    registry: ToolRegistry,
    manager: McpManager,
    configs: list[McpServerConfig],
    permissions: PermissionLayer,
) -> int:
    """Registers every tool discovered from connected MCP servers into the
    shared tool registry, namespaced as mcp__{server}__{tool} so different
    servers can't collide, and applies each server's configured permission
    (default "ask") as that tool's default policy.
    """
    permission_by_server = {cfg.name: cfg.permission for cfg in configs}
    count = 0

    for server, tools in manager.list_tools().items():
        for tool in tools:
            name = qualified_name(server, tool.name)
            spec = ToolSpec(
                name=name,
                description=f"[MCP:{server}] {tool.description or ''}".strip(),
                parameters=tool.input_schema or EMPTY_SCHEMA,
            )
            registry.register(spec, _make_fn(manager, server, tool.name))
            permissions.policy.setdefault(name, permission_by_server.get(server, "ask"))
            count += 1

    return count
