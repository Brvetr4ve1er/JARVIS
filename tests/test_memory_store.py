import sqlite3

from jarvis.db import SCHEMA
from jarvis.memory import consolidation, store


def make_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    conn.executescript(SCHEMA)
    return conn


def test_session_roundtrip():
    conn = make_conn()
    sid = store.create_session(conn, title="test")
    assert store.get_or_create_active_session(conn) == sid


def test_append_and_load_working_memory_preserves_order():
    conn = make_conn()
    sid = store.create_session(conn)
    store.append_message(conn, sid, "user", "hello")
    store.append_message(conn, sid, "assistant", "hi there")
    store.append_message(conn, sid, "user", "how are you")

    working = store.load_working_memory(conn, sid, limit=10)
    assert [m.content for m in working] == ["hello", "hi there", "how are you"]


def test_load_working_memory_respects_limit_and_recency():
    conn = make_conn()
    sid = store.create_session(conn)
    for i in range(5):
        store.append_message(conn, sid, "user", f"msg{i}")

    working = store.load_working_memory(conn, sid, limit=2)
    assert [m.content for m in working] == ["msg3", "msg4"]


def test_tool_call_json_roundtrip():
    conn = make_conn()
    sid = store.create_session(conn)
    tool_calls = [{"id": "tc1", "name": "read_file", "arguments": {"path": "/x"}}]
    store.append_message(conn, sid, "assistant", "", tool_calls=tool_calls)

    working = store.load_working_memory(conn, sid, limit=10)
    assert working[0].tool_calls == tool_calls


def test_consolidation_folds_overflow_and_marks_consolidated():
    conn = make_conn()
    sid = store.create_session(conn)
    for i in range(10):
        store.append_message(conn, sid, "user", f"turn {i}")

    summarized = []

    def fake_summarize(text: str) -> str:
        summarized.append(text)
        return "SUMMARY: " + text[:20]

    happened = consolidation.maybe_consolidate(conn, sid, working_memory_turns=4, summarize=fake_summarize)

    assert happened is True
    assert len(summarized) == 1

    working = store.load_working_memory(conn, sid, limit=100)
    assert len(working) == 4  # only the most recent 4 remain hot
    assert working[-1].content == "turn 9"

    chunk = conn.execute("SELECT text FROM memory_chunks WHERE session_id = ?", (sid,)).fetchone()
    assert chunk["text"].startswith("SUMMARY:")


def test_consolidation_noop_when_under_threshold():
    conn = make_conn()
    sid = store.create_session(conn)
    store.append_message(conn, sid, "user", "hi")

    happened = consolidation.maybe_consolidate(
        conn, sid, working_memory_turns=10, summarize=lambda t: "unused"
    )
    assert happened is False
