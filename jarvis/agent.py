from __future__ import annotations

import sqlite3
from typing import Any, Callable

from jarvis import context
from jarvis.config import Config
from jarvis.memory import consolidation, store
from jarvis.models.router import ModelRouter
from jarvis.tools.permission import PermissionLayer
from jarvis.tools.registry import ToolContext, ToolRegistry

EventCallback = Callable[[str, dict[str, Any]], None]

MAX_TOOL_ITERATIONS = 5


class AgentRuntime:
    def __init__(
        self,
        conn: sqlite3.Connection,
        router: ModelRouter,
        registry: ToolRegistry,
        permissions: PermissionLayer,
        config: Config,
        session_id: str,
    ):
        self.conn = conn
        self.router = router
        self.registry = registry
        self.permissions = permissions
        self.config = config
        self.session_id = session_id

    def turn(self, user_text: str, on_event: EventCallback | None = None) -> str:
        def emit(kind: str, **payload: Any) -> None:
            if on_event:
                on_event(kind, payload)

        store.append_message(self.conn, self.session_id, "user", user_text)

        reply = None
        final_text = ""
        for _ in range(MAX_TOOL_ITERATIONS):
            messages = context.assemble(
                self.conn,
                self.session_id,
                self.config.working_memory_turns,
                self.config.retrieval_top_k,
                retrieval_query=user_text,
            )
            reply = self.router.chat(messages, tools=self.registry.specs())

            tool_calls_json = [{"id": tc.id, "name": tc.name, "arguments": tc.arguments} for tc in reply.tool_calls]
            store.append_message(
                self.conn,
                self.session_id,
                "assistant",
                reply.content,
                tool_calls=tool_calls_json or None,
            )

            if not reply.tool_calls:
                final_text = reply.content
                break

            for tc in reply.tool_calls:
                emit("tool_call", name=tc.name, arguments=tc.arguments)
                if self.permissions.check(tc.name, tc.arguments):
                    result = self.registry.call(tc.name, tc.arguments, ToolContext(self.conn, self.session_id))
                    emit("tool_result", name=tc.name, result=result)
                else:
                    result = "denied by user"
                    emit("tool_denied", name=tc.name)
                store.append_message(self.conn, self.session_id, "tool", result, tool_call_id=tc.id, name=tc.name)
        else:
            final_text = (reply.content if reply else "") or "(hit the tool-call iteration limit without a final answer)"

        self._maybe_consolidate()
        return final_text

    def _maybe_consolidate(self) -> None:
        consolidation.maybe_consolidate(
            self.conn, self.session_id, self.config.working_memory_turns, summarize=self.router.summarize
        )
