from __future__ import annotations

import argparse
import sys
from datetime import datetime
from typing import Callable

from rich.console import Console
from rich.table import Table

from jarvis import db
from jarvis.agent import AgentRuntime
from jarvis.config import CONFIG
from jarvis.memory import profile, store
from jarvis.models.base import NotConfiguredError, ProviderError
from jarvis.models.router import ModelRouter
from jarvis.tools import builtin
from jarvis.tools.permission import PermissionLayer
from jarvis.tools.registry import ToolRegistry

HELP = """\
Commands:
  /new              start a new session (previous ones stay in memory)
  /sessions         list recent sessions
  /switch <id>      switch to a past session by id
  /model [name]     show or switch active model provider (local, anthropic, openai)
  /profile          show remembered facts about you
  /remember k=v     manually store a fact
  /forget <key>     delete a stored fact
  /help             this message
  /exit             quit
"""


def _on_event(console: Console) -> Callable[[str, dict], None]:
    def handler(kind: str, payload: dict) -> None:
        if kind == "tool_call":
            console.print(f"[dim]→ calling {payload['name']}({payload['arguments']})[/]")
        elif kind == "tool_result":
            result = str(payload["result"])
            shown = result if len(result) < 300 else result[:300] + "…"
            console.print(f"[dim]← {payload['name']}: {shown}[/]")
        elif kind == "tool_denied":
            console.print(f"[red]✗ {payload['name']} denied[/]")

    return handler


def main() -> None:
    parser = argparse.ArgumentParser(prog="jarvis")
    parser.add_argument("--new", action="store_true", help="start a fresh session instead of resuming")
    args = parser.parse_args()

    console = Console()
    conn = db.connect(CONFIG.db_path)
    registry = ToolRegistry()
    builtin.register_all(registry)
    permissions = PermissionLayer()

    try:
        router = ModelRouter(CONFIG)
    except NotConfiguredError as e:
        console.print(f"[red]{e}[/]")
        sys.exit(1)

    session_id = store.create_session(conn) if args.new else store.get_or_create_active_session(conn)

    console.print(
        f"[bold cyan]JARVIS[/] — provider: [green]{router.active_name}[/] · "
        f"session: [dim]{session_id}[/] · data: [dim]{CONFIG.db_path}[/]"
    )
    console.print("[dim]Type /help for commands, /exit to quit.[/]")

    agent = AgentRuntime(conn, router, registry, permissions, CONFIG, session_id)

    while True:
        try:
            user_text = console.input("[bold]› [/]").strip()
        except (EOFError, KeyboardInterrupt):
            console.print()
            break

        if not user_text:
            continue

        if user_text.startswith("/"):
            session_id, done = _handle_command(user_text, console, conn, router, agent, session_id)
            if done:
                break
            continue

        try:
            reply = agent.turn(user_text, on_event=_on_event(console))
        except ProviderError as e:
            console.print(f"[red]{e}[/]")
            continue

        console.print(reply)


def _handle_command(cmd: str, console: Console, conn, router: ModelRouter, agent: AgentRuntime, session_id: str):
    parts = cmd[1:].split(maxsplit=1)
    name = parts[0].lower() if parts else ""
    rest = parts[1] if len(parts) > 1 else ""

    if name in ("exit", "quit"):
        return session_id, True

    if name == "help":
        console.print(HELP)

    elif name == "new":
        session_id = store.create_session(conn)
        agent.session_id = session_id
        console.print(f"[green]started session {session_id}[/]")

    elif name == "switch":
        if not rest:
            console.print("[red]usage: /switch <session_id>[/]")
        else:
            session_id = rest.strip()
            agent.session_id = session_id
            console.print(f"[green]switched to session {session_id}[/]")

    elif name == "sessions":
        table = Table()
        table.add_column("id")
        table.add_column("title")
        table.add_column("last active")
        for row in store.list_sessions(conn):
            table.add_row(row["id"], row["title"], datetime.fromtimestamp(row["last_active_at"]).isoformat(sep=" ", timespec="seconds"))
        console.print(table)

    elif name == "model":
        if not rest:
            console.print(f"active: [green]{router.active_name}[/] · available: {', '.join(router.available())}")
        else:
            try:
                router.switch(rest.strip())
                console.print(f"[green]switched to {router.active_name}[/]")
            except NotConfiguredError as e:
                console.print(f"[red]{e}[/]")

    elif name == "profile":
        facts = profile.all_facts(conn)
        console.print(profile.format_facts(facts) or "[dim](nothing remembered yet)[/]")

    elif name == "remember":
        if "=" not in rest:
            console.print("[red]usage: /remember key=value[/]")
        else:
            k, v = rest.split("=", 1)
            profile.set_fact(conn, k, v)
            console.print(f"[green]remembered {k.strip()}[/]")

    elif name == "forget":
        if not rest:
            console.print("[red]usage: /forget <key>[/]")
        elif profile.delete_fact(conn, rest.strip()):
            console.print(f"[green]forgot {rest.strip()}[/]")
        else:
            console.print(f"[dim]no such fact: {rest.strip()}[/]")

    else:
        console.print(f"[red]unknown command: /{name}[/] — try /help")

    return session_id, False


if __name__ == "__main__":
    main()
