from __future__ import annotations

import subprocess
from pathlib import Path
from typing import Any

from jarvis.memory import profile
from jarvis.memory.retrieval import retrieve
from jarvis.models.base import ToolSpec
from jarvis.tools.registry import ToolContext, ToolRegistry

_MAX_READ_CHARS = 20_000
_MAX_SHELL_OUTPUT = 4_000


def _read_file(args: dict[str, Any], ctx: ToolContext) -> str:
    path = Path(args["path"]).expanduser()
    if not path.exists():
        return f"error: {path} does not exist"
    if not path.is_file():
        return f"error: {path} is not a file"
    text = path.read_text(errors="replace")
    if len(text) > _MAX_READ_CHARS:
        return text[:_MAX_READ_CHARS] + f"\n...[truncated, {len(text)} chars total]"
    return text


def _write_file(args: dict[str, Any], ctx: ToolContext) -> str:
    path = Path(args["path"]).expanduser()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(args.get("content", ""))
    return f"wrote {len(args.get('content', ''))} chars to {path}"


def _run_shell(args: dict[str, Any], ctx: ToolContext) -> str:
    command = args["command"]
    timeout = min(float(args.get("timeout", 30)), 120.0)
    try:
        result = subprocess.run(
            command, shell=True, capture_output=True, text=True, timeout=timeout
        )
    except subprocess.TimeoutExpired:
        return f"error: command timed out after {timeout}s"
    out = (result.stdout or "") + (result.stderr or "")
    if len(out) > _MAX_SHELL_OUTPUT:
        out = out[:_MAX_SHELL_OUTPUT] + "\n...[truncated]"
    return f"exit={result.returncode}\n{out}"


def _remember(args: dict[str, Any], ctx: ToolContext) -> str:
    profile.set_fact(ctx.conn, args["key"], str(args["value"]))
    return f"remembered {args['key']} = {args['value']}"


def _recall(args: dict[str, Any], ctx: ToolContext) -> str:
    chunks = retrieve(ctx.conn, args["query"], top_k=int(args.get("top_k", 5)))
    if not chunks:
        return "no matching long-term memory found"
    return "\n---\n".join(c.text for c in chunks)


def register_all(registry: ToolRegistry) -> None:
    registry.register(
        ToolSpec(
            name="read_file",
            description="Read a local text file and return its contents.",
            parameters={
                "type": "object",
                "properties": {"path": {"type": "string"}},
                "required": ["path"],
            },
        ),
        _read_file,
    )
    registry.register(
        ToolSpec(
            name="write_file",
            description="Write text content to a local file, creating parent directories as needed.",
            parameters={
                "type": "object",
                "properties": {
                    "path": {"type": "string"},
                    "content": {"type": "string"},
                },
                "required": ["path", "content"],
            },
        ),
        _write_file,
    )
    registry.register(
        ToolSpec(
            name="run_shell",
            description="Run a shell command on the local machine and return stdout/stderr.",
            parameters={
                "type": "object",
                "properties": {
                    "command": {"type": "string"},
                    "timeout": {"type": "number", "description": "seconds, max 120"},
                },
                "required": ["command"],
            },
        ),
        _run_shell,
    )
    registry.register(
        ToolSpec(
            name="remember",
            description="Persist a durable fact about the user to long-term profile memory (survives across sessions).",
            parameters={
                "type": "object",
                "properties": {
                    "key": {"type": "string"},
                    "value": {"type": "string"},
                },
                "required": ["key", "value"],
            },
        ),
        _remember,
    )
    registry.register(
        ToolSpec(
            name="recall",
            description="Search consolidated long-term memory for relevant past context beyond what's already in the conversation.",
            parameters={
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "top_k": {"type": "integer"},
                },
                "required": ["query"],
            },
        ),
        _recall,
    )
