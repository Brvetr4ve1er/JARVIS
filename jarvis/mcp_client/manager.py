"""Bridges the async-only MCP SDK into JARVIS's synchronous agent loop.

Each configured server gets a persistent connection (subprocess for stdio,
HTTP/SSE for remote) opened once at startup and kept alive on a dedicated
background thread running its own asyncio event loop. The rest of the app
never touches asyncio directly — `call_tool()` blocks the calling thread and
returns text, same shape as every other tool in the registry.
"""

from __future__ import annotations

import asyncio
import threading
from contextlib import AsyncExitStack
from dataclasses import dataclass

from mcp import ClientSession
from mcp.client.sse import sse_client
from mcp.client.stdio import StdioServerParameters, stdio_client
from mcp.types import Tool

from jarvis.mcp_client.config import McpServerConfig

_START_TIMEOUT = 30.0
_CALL_TIMEOUT = 120.0
_STOP_TIMEOUT = 10.0


@dataclass
class ConnectError:
    server: str
    message: str


class McpManager:
    def __init__(self, configs: list[McpServerConfig]):
        self._configs = configs
        self._loop: asyncio.AbstractEventLoop | None = None
        self._thread: threading.Thread | None = None
        self._stack: AsyncExitStack | None = None
        self._sessions: dict[str, ClientSession] = {}
        self._tools: dict[str, list[Tool]] = {}
        self.errors: list[ConnectError] = []

    def start(self) -> None:
        if not self._configs:
            return
        ready = threading.Event()
        self._thread = threading.Thread(target=self._run, args=(ready,), daemon=True)
        self._thread.start()
        if not ready.wait(_START_TIMEOUT):
            self.errors.append(ConnectError("*", "timed out connecting to MCP servers"))

    def _run(self, ready: threading.Event) -> None:
        self._loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self._loop)
        self._loop.run_until_complete(self._connect_all())
        ready.set()
        self._loop.run_forever()

    async def _connect_all(self) -> None:
        self._stack = AsyncExitStack()
        for cfg in self._configs:
            try:
                session = await self._connect_one(cfg)
                self._sessions[cfg.name] = session
                result = await session.list_tools()
                self._tools[cfg.name] = result.tools
            except Exception as e:
                self.errors.append(ConnectError(cfg.name, f"{type(e).__name__}: {e}"))

    async def _connect_one(self, cfg: McpServerConfig) -> ClientSession:
        if cfg.transport == "stdio":
            params = StdioServerParameters(command=cfg.command, args=cfg.args, env=cfg.env or None)
            read, write = await self._stack.enter_async_context(stdio_client(params))
        else:
            read, write = await self._stack.enter_async_context(sse_client(cfg.url))
        session = await self._stack.enter_async_context(ClientSession(read, write))
        await session.initialize()
        return session

    def list_tools(self) -> dict[str, list[Tool]]:
        return dict(self._tools)

    def call_tool(self, server: str, name: str, arguments: dict) -> str:
        if server not in self._sessions or self._loop is None:
            return f"error: mcp server '{server}' is not connected"
        future = asyncio.run_coroutine_threadsafe(self._call_tool_async(server, name, arguments), self._loop)
        try:
            return future.result(timeout=_CALL_TIMEOUT)
        except Exception as e:
            return f"error: mcp tool '{server}/{name}' failed: {type(e).__name__}: {e}"

    async def _call_tool_async(self, server: str, name: str, arguments: dict) -> str:
        session = self._sessions[server]
        result = await session.call_tool(name, arguments)
        parts = [block.text for block in result.content if hasattr(block, "text")]
        text = "\n".join(parts) if parts else str(result.content)
        if getattr(result, "is_error", False):
            return f"error: {text}"
        return text

    def stop(self) -> None:
        if self._loop is None:
            return

        async def _close() -> None:
            if self._stack:
                await self._stack.aclose()

        future = asyncio.run_coroutine_threadsafe(_close(), self._loop)
        try:
            future.result(timeout=_STOP_TIMEOUT)
        except Exception:
            pass
        self._loop.call_soon_threadsafe(self._loop.stop)
        if self._thread:
            self._thread.join(timeout=_STOP_TIMEOUT)
