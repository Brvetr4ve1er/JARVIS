"""Folds overflow working-memory turns into long-term memory_chunks.

This is the write path the architecture diagram left implicit: without it,
"working memory" just grows forever (context bloat) or gets truncated
(amnesia). Here, once a session has more than `working_memory_turns`
unconsolidated messages, the oldest overflow is summarized once and stored
as a searchable chunk, then dropped from the hot window. The raw messages
stay in the `messages` table for a full transcript/audit trail either way.
"""

from __future__ import annotations

import sqlite3
from typing import Callable

from jarvis.memory import store

SummarizeFn = Callable[[str], str]


def _format_transcript(messages: list[store.StoredMessage]) -> str:
    lines = []
    for m in messages:
        if m.role in ("user", "assistant") and m.content:
            lines.append(f"{m.role}: {m.content}")
        elif m.role == "tool" and m.content:
            lines.append(f"tool[{m.name}]: {m.content}")
    return "\n".join(lines)


def maybe_consolidate(
    conn: sqlite3.Connection,
    session_id: str,
    working_memory_turns: int,
    summarize: SummarizeFn,
) -> bool:
    """Returns True if a consolidation happened."""
    overflow = store.overflow_messages(conn, session_id, keep_last=working_memory_turns)
    if not overflow:
        return False

    transcript = _format_transcript(overflow)
    if not transcript.strip():
        store.mark_consolidated(conn, [m.id for m in overflow])
        return False

    summary = summarize(transcript)
    store.store_chunk(conn, session_id, summary)
    store.mark_consolidated(conn, [m.id for m in overflow])
    return True
