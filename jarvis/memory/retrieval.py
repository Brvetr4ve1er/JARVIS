"""Lexical (BM25) retrieval over consolidated long-term memory.

Honest naming note: the architecture calls this "semantic retrieval", but
without a configured embedding model there's no vector space here — this is
term-frequency ranking (BM25), which is a solid, dependency-free baseline.
Swap in a real embedding-based ranker later by giving `retrieve()` the same
signature and having it hit an embedding endpoint instead of tokenizing.
"""

from __future__ import annotations

import math
import re
import sqlite3
from collections import Counter
from dataclasses import dataclass

_TOKEN_RE = re.compile(r"[a-z0-9']+")

_K1 = 1.5
_B = 0.75


def tokenize(text: str) -> list[str]:
    return _TOKEN_RE.findall(text.lower())


@dataclass
class RetrievedChunk:
    id: int
    session_id: str
    text: str
    created_at: float
    score: float


def retrieve(conn: sqlite3.Connection, query: str, top_k: int = 5) -> list[RetrievedChunk]:
    rows = conn.execute("SELECT id, session_id, text, created_at FROM memory_chunks").fetchall()
    if not rows or not query.strip():
        return []

    docs = [tokenize(r["text"]) for r in rows]
    n_docs = len(docs)
    avg_dl = sum(len(d) for d in docs) / n_docs or 1.0

    doc_freq: Counter[str] = Counter()
    for d in docs:
        doc_freq.update(set(d))

    q_tokens = tokenize(query)
    scored: list[tuple[float, sqlite3.Row]] = []
    for row, doc in zip(rows, docs):
        if not doc:
            continue
        term_freq = Counter(doc)
        score = 0.0
        for t in q_tokens:
            f = term_freq.get(t, 0)
            if f == 0:
                continue
            df = doc_freq[t]
            idf = math.log(1 + (n_docs - df + 0.5) / (df + 0.5))
            score += idf * (f * (_K1 + 1)) / (f + _K1 * (1 - _B + _B * len(doc) / avg_dl))
        if score > 0:
            scored.append((score, row))

    scored.sort(key=lambda pair: pair[0], reverse=True)
    return [
        RetrievedChunk(id=r["id"], session_id=r["session_id"], text=r["text"], created_at=r["created_at"], score=s)
        for s, r in scored[:top_k]
    ]
