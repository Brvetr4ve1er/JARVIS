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
         not after. Populated by builtin tools AND by any MCP servers you
         configure (mcp_client/) — same registry, same gate, either way.
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

Commands: `/new`, `/sessions`, `/switch <id>`, `/model [name]`, `/mcp`,
`/profile`, `/remember k=v`, `/forget <key>`, `/help`, `/exit`.

## MCP servers (give the model tools for any app)

JARVIS is an MCP *client* — the same role Claude Desktop and Claude Code
play. Point it at any MCP server and its tools show up for whichever model
you're running, local or cloud, with no code changes.

```bash
cp mcp_servers.example.json ~/.jarvis/mcp_servers.json
# edit it, then just start jarvis — servers connect at boot
```

Config shape matches Claude Desktop's `mcpServers` key exactly (a config you
already have for that works here unchanged), plus one extra field:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/home/you/projects"],
      "permission": "ask"
    },
    "remote-example": { "url": "https://example.com/mcp/sse", "permission": "allow" }
  }
}
```

- `command`/`args`/`env` → stdio transport (a local subprocess); `url` →
  SSE transport (a remote server). Exactly one of the two per server.
- `permission` (`allow` | `ask` | `deny`, default `ask`) sets the
  **default** policy for every tool that server exposes, same mechanism as
  the builtin tools' permission layer — an MCP server that can write to
  your GitHub account should stay `ask`, one that only reads local files
  you already trust can be `allow`.
- Tools register as `mcp__{server}__{tool}` (same naming convention you'd
  recognize from Claude Code itself) so servers can't collide with each
  other or with the builtins.
- `/mcp` lists connected servers, their tool counts, and any that failed
  to connect (wrong command, missing `npx`/`uvx`, bad URL, etc — connection
  failures are non-fatal, the rest of JARVIS still runs).
- Servers connect once at startup; edit the config and restart to pick up
  changes (no hot-reload — not worth the complexity for a config you'll
  touch rarely).

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
- No MCP *resources* or *prompts* — only *tools* are bridged in. Resources
  (server-exposed readable content) and prompts (server-provided prompt
  templates) are separate MCP capabilities the SDK supports; wiring them in
  is a bounded follow-up, not a redesign, if you end up wanting them.
- No hot-reload of `mcp_servers.json` — restart to pick up config changes.

## Tests

```bash
pytest
```

Covers retrieval ranking, permission-layer policy/escalation/hard-blocks,
the memory store's consolidation behavior, MCP config parsing, and the MCP
tool-registry bridge (naming, per-server permission wiring). It does not
(and can't, in this environment) hit a real llama.cpp/vLLM/Anthropic/OpenAI
endpoint — `jarvis/models/local_provider.py` was smoke-tested against a
throwaway mock OpenAI-compatible server exercising the full tool-call loop
end to end. The MCP client *was* tested against a real (if trivial) MCP
server subprocess (`tests/test_mcp_integration.py`) — that's what caught
`inputSchema`/`isError` vs. the SDK's actual `input_schema`/`is_error`
attribute names before they shipped.
