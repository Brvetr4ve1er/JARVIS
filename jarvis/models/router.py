from __future__ import annotations

from jarvis.config import Config
from jarvis.models.base import ChatMessage, NotConfiguredError, Provider, ToolSpec
from jarvis.models.cloud_provider import AnthropicProvider, OpenAIProvider
from jarvis.models.local_provider import LocalProvider


class ModelRouter:
    """Dispatches chat calls to whichever provider is active. `local` is
    always available (it's just an HTTP client — whether anything answers
    depends on you running llama-server/vLLM). Cloud providers register
    themselves only when their API key is present; switching to an
    unconfigured one fails loudly and tells you exactly what env var to set.
    """

    def __init__(self, config: Config):
        self.config = config
        self._providers: dict[str, Provider] = {
            "local": LocalProvider(config.local_base_url, config.local_model, config.local_api_key)
        }
        self._lazy_factories = {
            "anthropic": lambda: AnthropicProvider(config.anthropic_api_key, config.anthropic_model),
            "openai": lambda: OpenAIProvider(config.openai_api_key, config.openai_model),
        }
        self.active_name = config.default_provider if config.default_provider in self.available() else "local"

    def available(self) -> list[str]:
        names = list(self._providers.keys())
        if self.config.anthropic_api_key:
            names.append("anthropic")
        if self.config.openai_api_key:
            names.append("openai")
        return names

    def switch(self, name: str) -> None:
        if name not in self.available():
            configured = ", ".join(self.available())
            raise NotConfiguredError(
                f"Provider '{name}' isn't available. Configured: {configured}. "
                f"Set the matching API key in .env to enable it."
            )
        self.active_name = name

    def _get_provider(self, name: str) -> Provider:
        if name in self._providers:
            return self._providers[name]
        if name in self._lazy_factories:
            provider = self._lazy_factories[name]()
            self._providers[name] = provider
            return provider
        raise NotConfiguredError(f"Unknown provider '{name}'.")

    def chat(self, messages: list[ChatMessage], tools: list[ToolSpec] | None = None) -> ChatMessage:
        provider = self._get_provider(self.active_name)
        return provider.chat(messages, tools)

    def summarize(self, text: str) -> str:
        """Used by memory consolidation — plain-text summary, no tools."""
        prompt = (
            "Summarize the following conversation excerpt into a short, dense paragraph "
            "of facts and decisions worth remembering long-term. Keep names, numbers, and "
            "commitments; drop small talk. No preamble, just the summary.\n\n" + text
        )
        reply = self.chat([ChatMessage(role="user", content=prompt)])
        return reply.content.strip() or text[:500]
