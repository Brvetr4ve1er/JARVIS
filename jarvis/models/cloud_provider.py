from __future__ import annotations

import json
from typing import Any

import httpx

from jarvis.models.base import ChatMessage, Provider, ProviderError, ToolCall, ToolSpec
from jarvis.models.local_provider import LocalProvider


class OpenAIProvider(LocalProvider):
    """OpenAI's chat completions API is the same shape we already speak to
    local servers with, so this just points the same client at OpenAI."""

    name = "openai"

    def __init__(self, api_key: str, model: str):
        if not api_key:
            from jarvis.models.base import NotConfiguredError

            raise NotConfiguredError("OPENAI_API_KEY is not set.")
        super().__init__(base_url="https://api.openai.com/v1", model=model, api_key=api_key)


class AnthropicProvider(Provider):
    """Anthropic's Messages API — different wire format from OpenAI's, so this
    is a real translation layer, not a thin reuse."""

    name = "anthropic"

    def __init__(self, api_key: str, model: str, max_tokens: int = 4096, timeout: float = 120.0):
        if not api_key:
            from jarvis.models.base import NotConfiguredError

            raise NotConfiguredError("ANTHROPIC_API_KEY is not set.")
        self.model = model
        self.max_tokens = max_tokens
        self._client = httpx.Client(
            base_url="https://api.anthropic.com/v1",
            headers={
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            timeout=timeout,
        )

    def chat(self, messages: list[ChatMessage], tools: list[ToolSpec] | None = None) -> ChatMessage:
        system_parts = [m.content for m in messages if m.role == "system" and m.content]
        anthropic_messages = [_to_anthropic_message(m) for m in messages if m.role != "system"]

        payload: dict[str, Any] = {
            "model": self.model,
            "max_tokens": self.max_tokens,
            "messages": anthropic_messages,
        }
        if system_parts:
            payload["system"] = "\n\n".join(system_parts)
        if tools:
            payload["tools"] = [
                {"name": t.name, "description": t.description, "input_schema": t.parameters} for t in tools
            ]

        try:
            resp = self._client.post("/messages", json=payload)
        except httpx.ConnectError as e:
            raise ProviderError(f"Can't reach api.anthropic.com: {e}") from e
        except httpx.TimeoutException as e:
            raise ProviderError("Anthropic API request timed out.") from e

        if resp.status_code != 200:
            raise ProviderError(f"Anthropic API returned {resp.status_code}: {resp.text[:500]}")

        data = resp.json()
        text_parts: list[str] = []
        tool_calls: list[ToolCall] = []
        for block in data.get("content", []):
            if block.get("type") == "text":
                text_parts.append(block.get("text", ""))
            elif block.get("type") == "tool_use":
                tool_calls.append(ToolCall(id=block.get("id", ""), name=block.get("name", ""), arguments=block.get("input", {})))

        return ChatMessage(role="assistant", content="".join(text_parts), tool_calls=tool_calls)

    def close(self) -> None:
        self._client.close()


def _to_anthropic_message(m: ChatMessage) -> dict[str, Any]:
    if m.role == "tool":
        return {
            "role": "user",
            "content": [{"type": "tool_result", "tool_use_id": m.tool_call_id, "content": m.content}],
        }
    if m.role == "assistant" and m.tool_calls:
        blocks: list[dict[str, Any]] = []
        if m.content:
            blocks.append({"type": "text", "text": m.content})
        for tc in m.tool_calls:
            blocks.append({"type": "tool_use", "id": tc.id, "name": tc.name, "input": tc.arguments})
        return {"role": "assistant", "content": blocks}
    return {"role": m.role, "content": m.content}
