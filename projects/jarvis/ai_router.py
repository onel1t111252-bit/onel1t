"""Optional local Ollama INTENT extraction for natural-language JARVIS commands.

Never execute model output as code, shell, URLs, paths, hotkeys or arbitrary
Windows actions. The model may ONLY suggest from a narrow set of allowlisted
actions, and every output is independently validated against the user's own
phrase. Deterministic command routes always take precedence.
"""
from __future__ import annotations
import json
import re
from urllib import error, request

from desktop_actions import ActionPlan

# Action hint detection is intentionally narrow and fast: normal questions
# never trigger an extra model call before conversational chat.
_ACTION_WORDS = re.compile(
    r"\b(?:увімкни|включи|запусти|програй|відтвори|постав|пошукай|"
    r"знайди|покажи|відкрий|хочу|можеш|допоможи|пошукати|послухати|"
    r"передивитися|подивитися|play|find|search|open|put|"
    r"listen|watch)\b", re.I)
_SPOTIFY_WORD = re.compile(r"\b(?:spotify|спотіфай|спотифай|спотефай)\b", re.I)
_YOUTUBE_WORD = re.compile(r"\b(?:youtube|ютуб|ютубі|ютюб|ютубу)\b", re.I)
_MUSIC_WORD = re.compile(r"\b(?:пісню|пісня|трек|композицію|музику|song|track)\b", re.I)
_VIDEO_WORD = re.compile(r"\b(?:відео|урок|уроки|відеоурок|відеоуроки|video|videos)\b", re.I)
_PLAY_WORD = re.compile(r"\b(?:увімкни|включи|запусти|програй|відтвори|постав|"
                        r"послухати|слухати|play|listen)\b", re.I)
_SEARCH_WORD = re.compile(r"\b(?:знайди|пошукай|пошукати|покажи|пошук|search|find|"
                          r"подивитися|watch|хочу)\b", re.I)
_UNSAFE_COMMAND = re.compile(
    r"\b(?:пароль|password|секрет|api.?key|token|токен|видали|"
    r"очисти|format|форматуй|купити|оплати|переказ|"
    r"гроші|адмін|powershell|cmd|terminal|shell|"
    r"натисни|клацни|введи|надрукуй|зміни файл)\b", re.I)

_SCHEMA = {
    "type": "object", "additionalProperties": False,
    "properties": {
        "intent": {"type": "string", "enum": ["none", "spotify_play", "youtube_search"]},
        "target": {"type": "string"},
    },
    "required": ["intent", "target"],
}
_SYSTEM = (
    "You interpret natural Ukrainian and English voice commands for a personal "
    "desktop assistant. Return ONLY JSON matching schema. Choose spotify_play "
    "only for an EXPLICIT user request to play a named song in Spotify, or a "
    "named song with music wording. Choose youtube_search only for an EXPLICIT "
    "request to find videos on YouTube or on a video topic. Otherwise none. "
    "TARGET MUST BE AN EXACT CONTIGUOUS SUBSTRING of the user's ORIGINAL "
    "utterance, preserving the title/spelling. NEVER fix misheard foreign "
    "names, invent a track, add a performer, substitute words or URLs. "
    "Reject administrative tasks, files, app controls, finances, passwords, "
    "web URLs, ambiguous/short titles (under 4 characters) and ordinary questions. "
    "If uncertain choose none. You do not execute anything."
)


def _words(text: str) -> set[str]:
    return set(re.findall(r"[^\W_]+", text.casefold()))


def validate_suggestion(user_text: str, answer: object) -> ActionPlan | None:
    """Enforce exact target and explicit intent independently of the model."""
    if not isinstance(answer, dict) or set(answer) != {"intent", "target"}:
        return None
    kind = answer["intent"]
    target = answer["target"]
    if not isinstance(target, str) or kind not in {"spotify_play", "youtube_search"}:
        return None
    target = target.strip(" \t\n.,!?«»\"'")
    if not 4 <= len(target) <= 120 or "\n" in target or "\r" in target:
        return None
    source = user_text.casefold()
    if target.casefold() not in source:
        return None
    if _UNSAFE_COMMAND.search(user_text):
        return None
    if target.casefold() in {"spotify", "youtube", "пісню", "трек", "відео", "song", "music", "video"}:
        return None
    if kind == "spotify_play":
        if not _PLAY_WORD.search(user_text) or not (
                _SPOTIFY_WORD.search(user_text) or _MUSIC_WORD.search(user_text)):
            return None
        return ActionPlan(kind, target, "Відтворити пісню у Spotify: " + target, True)
    if kind == "youtube_search":
        if not (_SEARCH_WORD.search(user_text)
                and (_YOUTUBE_WORD.search(user_text) or _VIDEO_WORD.search(user_text))):
            return None
        return ActionPlan(kind, target, "Знайти відео на YouTube: " + target)
    return None


def should_infer(text: str) -> bool:
    return (4 <= len(text.strip()) <= 280 and bool(_ACTION_WORDS.search(text))
            and not _UNSAFE_COMMAND.search(text)
            and bool(_SPOTIFY_WORD.search(text) or _YOUTUBE_WORD.search(text)
                     or _MUSIC_WORD.search(text) or _VIDEO_WORD.search(text)))


def suggest_action(text: str, model: str, api_url: str = "http://127.0.0.1:11434",
                   timeout: float = 16) -> ActionPlan | None:
    """Safe opt-in parsing; fail closed on absent local model or invalid output.

    The text is sent ONLY to the configured localhost Ollama server, never
    to a third-party cloud language model from this function.
    """
    if not should_infer(text):
        return None
    if not isinstance(model, str) or not 1 <= len(model) <= 90:
        return None
    packet = {
        "model": model,
        "messages": [
            {"role": "system", "content": _SYSTEM},
            {"role": "user", "content": text[:280]},
        ],
        "format": _SCHEMA,
        "stream": False,
        "think": False,
        "keep_alive": "10m",
        "options": {"temperature": 0, "num_predict": 100, "num_ctx": 2048},
    }
    req = request.Request(
        api_url.rstrip("/") + "/api/chat",
        data=json.dumps(packet, ensure_ascii=False).encode("utf-8"),
        headers={"Content-Type": "application/json"}, method="POST")
    try:
        with request.urlopen(req, timeout=timeout) as response:
            body = response.read(12_000)
        output = json.loads(body)
        suggestion = json.loads(output["message"]["content"])
        return validate_suggestion(text, suggestion)
    except (OSError, ValueError, KeyError, TypeError, error.HTTPError):
        return None
