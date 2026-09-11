from __future__ import annotations

import sqlite3

from jarvis.db import now


def set_fact(conn: sqlite3.Connection, key: str, value: str) -> None:
    conn.execute(
        """
        INSERT INTO facts (key, value, updated_at) VALUES (?, ?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
        """,
        (key.strip(), value.strip(), now()),
    )
    conn.commit()


def delete_fact(conn: sqlite3.Connection, key: str) -> bool:
    cur = conn.execute("DELETE FROM facts WHERE key = ?", (key.strip(),))
    conn.commit()
    return cur.rowcount > 0


def all_facts(conn: sqlite3.Connection) -> dict[str, str]:
    rows = conn.execute("SELECT key, value FROM facts ORDER BY key").fetchall()
    return {r["key"]: r["value"] for r in rows}


def format_facts(facts: dict[str, str]) -> str:
    if not facts:
        return ""
    return "\n".join(f"- {k}: {v}" for k, v in facts.items())
