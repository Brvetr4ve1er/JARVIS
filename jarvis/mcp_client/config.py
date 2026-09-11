"""Loads MCP server config in the same `mcpServers` shape Claude Desktop and
Claude Code use, so a config you already have for those works here unchanged.
We add one optional field of our own (`permission`) that other hosts will
just ignore.

    {
      "mcpServers": {
        "filesystem": {
          "command": "npx",
          "args": ["-y", "@modelcontextprotocol/server-filesystem", "/home/user"]
        },
        "some-remote-server": {
          "url": "https://example.com/mcp/sse",
          "permission": "allow"
        }
      }
    }
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Literal

Permission = Literal["allow", "ask", "deny"]


@dataclass
class McpServerConfig:
    name: str
    transport: Literal["stdio", "sse"]
    command: str | None = None
    args: list[str] = field(default_factory=list)
    env: dict[str, str] = field(default_factory=dict)
    url: str | None = None
    permission: Permission = "ask"


class McpConfigError(ValueError):
    pass


def _parse_server(name: str, spec: dict[str, Any]) -> McpServerConfig:
    permission = spec.get("permission", "ask")
    if permission not in ("allow", "ask", "deny"):
        raise McpConfigError(f"mcp server '{name}': invalid permission '{permission}' (want allow/ask/deny)")

    if "command" in spec:
        return McpServerConfig(
            name=name,
            transport="stdio",
            command=spec["command"],
            args=list(spec.get("args", [])),
            env=dict(spec.get("env", {})),
            permission=permission,
        )
    if "url" in spec:
        return McpServerConfig(name=name, transport="sse", url=spec["url"], permission=permission)

    raise McpConfigError(f"mcp server '{name}': needs either 'command' (stdio) or 'url' (sse)")


def load_mcp_servers(path: Path) -> list[McpServerConfig]:
    if not path.exists():
        return []
    try:
        data = json.loads(path.read_text())
    except json.JSONDecodeError as e:
        raise McpConfigError(f"{path} is not valid JSON: {e}") from e

    servers = data.get("mcpServers", {})
    if not isinstance(servers, dict):
        raise McpConfigError(f"{path}: 'mcpServers' must be an object")

    return [_parse_server(name, spec) for name, spec in servers.items()]
