# JARVIS (local-first)

Actual running software, not the prompt-doc "spellbook" content that lives
at the repo root — this is the implementation:

```
UI (CLI REPL)
  -> AgentRuntime (agent.py)
      -> ContextAssembler (context.py): working memory + retrieved long-term
         memory + user profile facts -> message list
      -> ModelRouter (models/router.py): local (llama.cpp/vLLM) or cloud
         (Anthropic/OpenAI, key-gated) -> ChatMessage
      -> ToolRegistry + PermissionLayer (tools/): gate BEFORE execution,
         not after
      -> back to memory: persist turn, consolidate overflow into long-term
         chunks (memory/consolidation.py)
```

## Setup

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env   # fill in what you need
```

You need a local OpenAI-compatible server running for the default `local`
provider to do anything:

```bash
# llama.cpp
./llama-server -m your-model.gguf --port 8080

# or vLLM
vllm serve your-model --port 8000   # and set LOCAL_LLM_BASE_URL=http://127.0.0.1:8000/v1
```

Cloud providers (`anthropic`, `openai`) activate automatically once their
API key is set in `.env` — no code changes needed. Switch at runtime with
`/model anthropic` etc.

## Run

```bash
jarvis            # resumes your most recent session
jarvis --new       # starts a fresh one
```

Commands: `/new`, `/sessions`, `/switch <id>`, `/model [name]`, `/profile`,
`/remember k=v`, `/forget <key>`, `/help`, `/exit`.

## Memory model

- **Working memory**: the last `working_memory_turns` (default 12) messages
  of the active session, loaded from SQLite on every turn.
- **Consolidation**: once a session accumulates more than that, the oldest
  overflow is summarized by the active model and stored as a `memory_chunk`,
  then dropped from the hot window. Full raw transcript stays in `messages`
  regardless — consolidation only affects what's hot, not what's kept.
- **Retrieval**: `memory_chunks` are searched with BM25 (pure Python, no
  embedding model required) against the current user message, top-K
  injected into the system prompt. This is lexical, not semantic — swap
  `memory/retrieval.py`'s `retrieve()` for an embedding-backed version later
  if you configure one; the call signature is designed to make that a
  localized change.
- **Profile**: explicit key/value facts, written via the `remember` tool
  (the model is instructed to use it proactively) or `/remember`, always
  injected in full.

Everything lives in a single SQLite file at `~/.jarvis/jarvis.db` (override
with `JARVIS_DATA_DIR`).

## Permission layer

Tool calls are checked *before* execution: `read_file`/`remember`/`recall`
are allowed by default, `write_file`/`run_shell` prompt you interactively
(`y` / `N` / `always` for the rest of the session). A handful of
catastrophic shell patterns (`rm -rf /`, `mkfs`, writing to a raw block
device, fork bombs) are hard-blocked regardless of what you answer —
tune `jarvis/tools/permission.py` if that list needs to change.

## What's deliberately not here yet

- No web UI (CLI/TUI only, by design — see repo history for why).
- No routing *policy* beyond explicit `/model` switching — there's no
  automatic cost/latency/privacy-based dispatch. The router is built to
  support one; nobody's written the policy.
- Retrieval is lexical, not embedding-based (see above).
- No streaming responses — replies print once complete.

## Tests

```bash
pytest
```

Covers retrieval ranking, permission-layer policy/escalation/hard-blocks,
and the memory store's consolidation behavior. It does not (and can't, in
this environment) hit a real llama.cpp/vLLM/Anthropic/OpenAI endpoint —
`jarvis/models/local_provider.py` was smoke-tested against a throwaway mock
OpenAI-compatible server exercising the full tool-call loop end to end.
