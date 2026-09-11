import sqlite3

from jarvis.db import SCHEMA
from jarvis.memory.retrieval import retrieve
from jarvis.memory.store import store_chunk


def make_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(":memory:")
    conn.row_factory = sqlite3.Row
    conn.executescript(SCHEMA)
    return conn


def test_retrieve_ranks_relevant_chunk_first():
    conn = make_conn()
    store_chunk(conn, "s1", "The user's dog is named Biscuit and loves the park.")
    store_chunk(conn, "s1", "The user is allergic to shellfish and avoids seafood restaurants.")
    store_chunk(conn, "s1", "The user's favorite programming language is Rust.")

    results = retrieve(conn, "dog named biscuit park", top_k=2)

    assert results
    assert "Biscuit" in results[0].text


def test_retrieve_empty_query_returns_nothing():
    conn = make_conn()
    store_chunk(conn, "s1", "some memory")
    assert retrieve(conn, "", top_k=5) == []


def test_retrieve_empty_store_returns_nothing():
    conn = make_conn()
    assert retrieve(conn, "anything", top_k=5) == []
