"""Context assembler: working memory + retrieved long-term memory + user
profile, merged into the message list sent to the model. This is the piece
the architecture diagram named but didn't specify — here it's a system
prompt carrying profile facts and retrieved chunks, followed by the hot
working-memory transcript.
"""

from __future__ import annotations

import sqlite3

from jarvis.memory import profile, store
from jarvis.memory.retrieval import retrieve
from jarvis.models.base import ChatMessage, ToolCall

SYSTEM_PROMPT = (
    "You are JARVIS, a local-first personal assistant running on the user's own machine. "
    "You have persistent memory across sessions: durable facts are listed below under "
    "'Known facts', and relevant excerpts from past conversations are under 'Relevant memory'. "
    "Use the `remember` tool to save durable facts about the user (preferences, ongoing projects, "
    "commitments) as you learn them — don't wait to be asked. Use `recall` if you need to search "
    "further back than what's shown. Be direct; don't pad answers."
)


def _stored_to_chat(m: store.StoredMessage) -> ChatMessage:
    tool_calls = [ToolCall(id=tc["id"], name=tc["name"], arguments=tc["arguments"]) for tc in (m.tool_calls or [])]
    return ChatMessage(
        role=m.role,
        content=m.content,
        tool_calls=tool_calls,
        tool_call_id=m.tool_call_id,
        name=m.name,
    )


def assemble(
    conn: sqlite3.Connection,
    session_id: str,
    working_memory_turns: int,
    retrieval_top_k: int,
    retrieval_query: str,
) -> list[ChatMessage]:
    facts = profile.all_facts(conn)
    chunks = retrieve(conn, retrieval_query, top_k=retrieval_top_k)
    working = store.load_working_memory(conn, session_id, working_memory_turns)

    system_text = SYSTEM_PROMPT
    if facts:
        system_text += "\n\nKnown facts about the user:\n" + profile.format_facts(facts)
    if chunks:
        system_text += "\n\nRelevant memory from past sessions:\n" + "\n---\n".join(c.text for c in chunks)

    messages = [ChatMessage(role="system", content=system_text)]
    messages.extend(_stored_to_chat(m) for m in working)
    return messages
