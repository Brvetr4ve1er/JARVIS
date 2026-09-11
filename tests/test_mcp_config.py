import json
from pathlib import Path

import pytest

from jarvis.mcp_client.config import McpConfigError, load_mcp_servers


def write(tmp_path: Path, data: dict) -> Path:
    path = tmp_path / "mcp_servers.json"
    path.write_text(json.dumps(data))
    return path


def test_missing_file_returns_empty_list(tmp_path):
    assert load_mcp_servers(tmp_path / "nope.json") == []


def test_stdio_server_parses(tmp_path):
    path = write(
        tmp_path,
        {"mcpServers": {"fs": {"command": "npx", "args": ["-y", "server-filesystem", "/home"], "env": {"X": "1"}}}},
    )
    servers = load_mcp_servers(path)
    assert len(servers) == 1
    s = servers[0]
    assert s.name == "fs"
    assert s.transport == "stdio"
    assert s.command == "npx"
    assert s.args == ["-y", "server-filesystem", "/home"]
    assert s.env == {"X": "1"}
    assert s.permission == "ask"  # default


def test_sse_server_parses_with_explicit_permission(tmp_path):
    path = write(tmp_path, {"mcpServers": {"remote": {"url": "https://x/mcp", "permission": "allow"}}})
    servers = load_mcp_servers(path)
    assert servers[0].transport == "sse"
    assert servers[0].url == "https://x/mcp"
    assert servers[0].permission == "allow"


def test_server_without_command_or_url_raises(tmp_path):
    path = write(tmp_path, {"mcpServers": {"broken": {}}})
    with pytest.raises(McpConfigError):
        load_mcp_servers(path)


def test_invalid_permission_raises(tmp_path):
    path = write(tmp_path, {"mcpServers": {"fs": {"command": "npx", "permission": "sometimes"}}})
    with pytest.raises(McpConfigError):
        load_mcp_servers(path)


def test_invalid_json_raises(tmp_path):
    path = tmp_path / "mcp_servers.json"
    path.write_text("{not json")
    with pytest.raises(McpConfigError):
        load_mcp_servers(path)
