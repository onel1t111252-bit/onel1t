"""Concise Ukrainian 'sir' acknowledgements without false completion claims."""
from __future__ import annotations


def style_action_reply(reply: str, action_kind: str, success: bool) -> str:
    """Only decorate real tool results. Ollama responses use a separate persona prompt."""
    if not action_kind or not reply.strip():
        return reply
    if reply.lstrip().casefold().startswith(("так, сер", "є, сер", "перепрошую, сер")):
        return reply
    if not success:
        return "Перепрошую, сер. " + reply
    if action_kind == "say" or action_kind == "ui_windows":
        return "Так, сер. " + reply
    return "Є, сер. " + reply
