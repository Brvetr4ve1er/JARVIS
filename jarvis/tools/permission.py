"""Gate that runs BEFORE tool execution, not after — a permission check on
already-executed side effects is just a log line. Every tool call goes
through `PermissionLayer.check()` first; only on approval does the agent
loop invoke the tool.
"""

from __future__ import annotations

import re
from typing import Any, Callable, Literal

Decision = Literal["allow", "ask", "deny"]

DEFAULT_POLICY: dict[str, Decision] = {
    "read_file": "allow",
    "recall": "allow",
    "remember": "allow",
    "write_file": "ask",
    "run_shell": "ask",
}

# Not a substitute for the ask-the-user gate above — a last-ditch hard block
# on commands that would be catastrophic even with explicit approval typo'd
# in a hurry.
_CATASTROPHIC_SHELL_PATTERNS = [
    re.compile(r"rm\s+-[a-z]*r[a-z]*f[a-z]*\s+(/|~|\*)\s*$"),
    re.compile(r"rm\s+-[a-z]*f[a-z]*r[a-z]*\s+(/|~|\*)\s*$"),
    re.compile(r"\bmkfs(\.\w+)?\b"),
    re.compile(r"\bdd\b.*\bof=/dev/"),
    re.compile(r":\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:"),
    re.compile(r">\s*/dev/sd[a-z]\b"),
]


def looks_catastrophic(command: str) -> bool:
    return any(p.search(command) for p in _CATASTROPHIC_SHELL_PATTERNS)


Asker = Callable[[str, dict[str, Any]], str]  # -> "yes" | "no" | "always"


class PermissionLayer:
    def __init__(self, policy: dict[str, Decision] | None = None, asker: Asker | None = None):
        self.policy: dict[str, Decision] = {**DEFAULT_POLICY, **(policy or {})}
        self._session_allowed: set[str] = set()
        self._asker = asker or _console_ask

    def check(self, tool_name: str, arguments: dict[str, Any]) -> bool:
        if tool_name == "run_shell" and looks_catastrophic(str(arguments.get("command", ""))):
            return False

        decision = self.policy.get(tool_name, "ask")
        if decision == "allow":
            return True
        if decision == "deny":
            return False

        if tool_name in self._session_allowed:
            return True

        answer = self._asker(tool_name, arguments)
        if answer == "always":
            self._session_allowed.add(tool_name)
            return True
        return answer == "yes"


def _console_ask(tool_name: str, arguments: dict[str, Any]) -> str:
    from rich.prompt import Prompt

    ans = Prompt.ask(
        f"[yellow]Allow tool[/] [bold]{tool_name}[/] with {arguments}? [y/N/always]",
        default="n",
    ).strip().lower()
    if ans in ("y", "yes"):
        return "yes"
    if ans in ("a", "always"):
        return "always"
    return "no"
