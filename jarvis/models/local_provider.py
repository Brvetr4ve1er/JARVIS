from __future__ import annotations

import json
from typing import Any

import httpx

from jarvis.models.base import ChatMessage, Provider, ProviderError, ToolCall, ToolSpec


class LocalProvider(Provider):
    """Talks to any OpenAI-compatible chat endpoint — this is what both
    llama.cpp's `llama-server` and vLLM's OpenAI server expose, so the same
    client works for either without caring which one you run.
    """

    name = "local"

    def __init__(self, base_url: str, model: str, api_key: str = "", timeout: float = 120.0):
        self.base_url = base_url.rstrip("/")
        self.model = model
        headers = {"Content-Type": "application/json"}
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"
        self._client = httpx.Client(base_url=self.base_url, headers=headers, timeout=timeout)

    def chat(self, messages: list[ChatMessage], tools: list[ToolSpec] | None = None) -> ChatMessage:
        payload: dict[str, Any] = {
            "model": self.model,
            "messages": [m.to_openai() for m in messages],
        }
        if tools:
            payload["tools"] = [t.to_openai() for t in tools]
            payload["tool_choice"] = "auto"

        try:
            resp = self._client.post("/chat/completions", json=payload)
        except httpx.ConnectError as e:
            raise ProviderError(
                f"Can't reach local model server at {self.base_url}. "
                f"Is llama-server or vLLM running there? ({e})"
            ) from e
        except httpx.TimeoutException as e:
            raise ProviderError(f"Local model server at {self.base_url} timed out.") from e

        if resp.status_code != 200:
            raise ProviderError(f"Local model server returned {resp.status_code}: {resp.text[:500]}")

        data = resp.json()
        try:
            choice = data["choices"][0]["message"]
        except (KeyError, IndexError) as e:
            raise ProviderError(f"Unexpected response shape from local server: {data}") from e

        tool_calls = []
        for tc in choice.get("tool_calls") or []:
            fn = tc.get("function", {})
            raw_args = fn.get("arguments", "{}")
            try:
                args = json.loads(raw_args) if isinstance(raw_args, str) else raw_args
            except json.JSONDecodeError:
                args = {"_raw": raw_args}
            tool_calls.append(ToolCall(id=tc.get("id", ""), name=fn.get("name", ""), arguments=args))

        return ChatMessage(role="assistant", content=choice.get("content") or "", tool_calls=tool_calls)

    def close(self) -> None:
        self._client.close()
