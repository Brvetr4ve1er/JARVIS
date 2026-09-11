from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Callable

from jarvis.models.base import ToolSpec

ToolFn = Callable[[dict[str, Any], "ToolContext"], str]


@dataclass
class ToolContext:
    conn: Any  # sqlite3.Connection, typed loosely to avoid import cycles
    session_id: str


class ToolRegistry:
    def __init__(self) -> None:
        self._specs: dict[str, ToolSpec] = {}
        self._fns: dict[str, ToolFn] = {}

    def register(self, spec: ToolSpec, fn: ToolFn) -> None:
        self._specs[spec.name] = spec
        self._fns[spec.name] = fn

    def specs(self) -> list[ToolSpec]:
        return list(self._specs.values())

    def has(self, name: str) -> bool:
        return name in self._fns

    def call(self, name: str, arguments: dict[str, Any], ctx: ToolContext) -> str:
        if name not in self._fns:
            return f"error: no such tool '{name}'"
        try:
            return self._fns[name](arguments, ctx)
        except Exception as e:  # tool failures become model-visible text, not crashes
            return f"error: tool '{name}' raised {type(e).__name__}: {e}"
