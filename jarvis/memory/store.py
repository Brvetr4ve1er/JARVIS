from __future__ import annotations

import json
import sqlite3
from dataclasses import dataclass

from jarvis.db import new_id, now


@dataclass
class StoredMessage:
    id: int
    role: str
    content: str
    tool_calls: list[dict] | None
    tool_call_id: str | None
    name: str | None


def get_or_create_active_session(conn: sqlite3.Connection) -> str:
    row = conn.execute("SELECT id FROM sessions ORDER BY last_active_at DESC LIMIT 1").fetchone()
    if row:
        return row["id"]
    return create_session(conn)


def create_session(conn: sqlite3.Connection, title: str = "session") -> str:
    session_id = new_id()
    ts = now()
    conn.execute(
        "INSERT INTO sessions (id, title, started_at, last_active_at) VALUES (?, ?, ?, ?)",
        (session_id, title, ts, ts),
    )
    conn.commit()
    return session_id


def touch_session(conn: sqlite3.Connection, session_id: str) -> None:
    conn.execute("UPDATE sessions SET last_active_at = ? WHERE id = ?", (now(), session_id))
    conn.commit()


def list_sessions(conn: sqlite3.Connection, limit: int = 20) -> list[sqlite3.Row]:
    return conn.execute(
        "SELECT id, title, started_at, last_active_at FROM sessions ORDER BY last_active_at DESC LIMIT ?",
        (limit,),
    ).fetchall()


def append_message(
    conn: sqlite3.Connection,
    session_id: str,
    role: str,
    content: str,
    tool_calls: list[dict] | None = None,
    tool_call_id: str | None = None,
    name: str | None = None,
) -> int:
    cur = conn.execute(
        """
        INSERT INTO messages (session_id, role, content, tool_calls, tool_call_id, name, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (session_id, role, content, json.dumps(tool_calls) if tool_calls else None, tool_call_id, name, now()),
    )
    touch_session(conn, session_id)
    return cur.lastrowid


def _row_to_message(row: sqlite3.Row) -> StoredMessage:
    return StoredMessage(
        id=row["id"],
        role=row["role"],
        content=row["content"],
        tool_calls=json.loads(row["tool_calls"]) if row["tool_calls"] else None,
        tool_call_id=row["tool_call_id"],
        name=row["name"],
    )


def load_working_memory(conn: sqlite3.Connection, session_id: str, limit: int) -> list[StoredMessage]:
    """Most recent `limit` not-yet-consolidated messages, oldest first."""
    rows = conn.execute(
        """
        SELECT id, role, content, tool_calls, tool_call_id, name FROM messages
        WHERE session_id = ? AND consolidated = 0
        ORDER BY id DESC LIMIT ?
        """,
        (session_id, limit),
    ).fetchall()
    return [_row_to_message(r) for r in reversed(rows)]


def overflow_messages(conn: sqlite3.Connection, session_id: str, keep_last: int) -> list[StoredMessage]:
    """Unconsolidated messages older than the `keep_last` most recent ones, oldest first."""
    rows = conn.execute(
        """
        SELECT id, role, content, tool_calls, tool_call_id, name FROM messages
        WHERE session_id = ? AND consolidated = 0
        ORDER BY id DESC
        """,
        (session_id,),
    ).fetchall()
    overflow = list(reversed(rows))[: max(0, len(rows) - keep_last)]
    return [_row_to_message(r) for r in overflow]


def mark_consolidated(conn: sqlite3.Connection, message_ids: list[int]) -> None:
    if not message_ids:
        return
    conn.executemany("UPDATE messages SET consolidated = 1 WHERE id = ?", [(i,) for i in message_ids])
    conn.commit()


def store_chunk(conn: sqlite3.Connection, session_id: str, text: str) -> int:
    cur = conn.execute(
        "INSERT INTO memory_chunks (session_id, text, created_at) VALUES (?, ?, ?)",
        (session_id, text, now()),
    )
    conn.commit()
    return cur.lastrowid
