from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv

load_dotenv()


def _data_dir() -> Path:
    raw = os.environ.get("JARVIS_DATA_DIR", "").strip()
    path = Path(raw).expanduser() if raw else Path.home() / ".jarvis"
    path.mkdir(parents=True, exist_ok=True)
    return path


@dataclass(frozen=True)
class Config:
    data_dir: Path = field(default_factory=_data_dir)

    local_base_url: str = os.environ.get("LOCAL_LLM_BASE_URL", "http://127.0.0.1:8080/v1")
    local_model: str = os.environ.get("LOCAL_LLM_MODEL", "local-model")
    local_api_key: str = os.environ.get("LOCAL_LLM_API_KEY", "")

    anthropic_api_key: str = os.environ.get("ANTHROPIC_API_KEY", "")
    anthropic_model: str = os.environ.get("ANTHROPIC_MODEL", "claude-sonnet-5")

    openai_api_key: str = os.environ.get("OPENAI_API_KEY", "")
    openai_model: str = os.environ.get("OPENAI_MODEL", "gpt-4o")

    default_provider: str = os.environ.get("DEFAULT_PROVIDER", "local")

    # Working-memory window: how many recent turns stay "hot" before consolidation
    # folds the oldest ones into long-term memory.
    working_memory_turns: int = 12
    retrieval_top_k: int = 5

    @property
    def db_path(self) -> Path:
        return self.data_dir / "jarvis.db"

    @property
    def mcp_servers_path(self) -> Path:
        return self.data_dir / "mcp_servers.json"


CONFIG = Config()
