"""Original cinematic Ukrainian assistant tone; no film dialogue or voice cloning.

The speech reply never asserts that a game or third-party app finished launching.
Do not speak private text dictated into another app or enumerated window titles.
"""
from __future__ import annotations
import re

WAKE_RESPONSES = {
    "джарвіс": "Слухаю вас, сер.",
    "джарвісе": "Слухаю вас, сер.",
    "джарвис": "Слухаю вас, сер.",
    "jarvis": "Слухаю вас, сер.",
}
QUICK_RESPONSES = {
    "ти тут": "Завжди на зв'язку, сер. Чим можу допомогти?",
    "ти на зв'язку": "Так, сер. Слухаю.",
    "ти мене чуєш": "Ваше повідомлення отримано, сер.",
    "джарвіс ти тут": "Так, сер. Слухаю вас.",
    "джарвіс ти на зв'язку": "Так, сер. Чекаю на команду.",
    "доброго ранку": "Доброго ранку, сер. До ваших послуг.",
    "добрий вечір": "Добрий вечір, сер. Системи готові до роботи.",
    "дякую": "Завжди до ваших послуг, сер.",
    "спасибі": "До ваших послуг, сер.",
}
_PREFIXES = ("так, сер", "є, сер", "перепрошую, сер", "слухаю вас, сер")


_WAKE_WORD_RE = re.compile(
    r"(?<!\w)(?:джарвісе|джарвіса|джарвіс|джарвис|джарвіз|"
    r"джервіс|джарвез|жарвіс|jarvis)\b[\s,!:;.\-]*", re.I
)


def extract_wake_command(text: str) -> str | None:
    """Extract wake-word command from Ukrainian STT without guessing action.

    None: no wake word recognized. Empty string: wake word spoken alone,
    so the assistant should listen for one short follow-up.
    """
    match = _WAKE_WORD_RE.search(text.strip())
    return text.strip()[match.end():].strip() if match else None


def normalize_spoken(text: str) -> str:
    """Normalize lightweight phrases only; never rewrite dictated text."""
    return re.sub(r"[\s,;.!?]+", " ", text.casefold()).strip()


def cinematic_quick_reply(text: str) -> str | None:
    key = normalize_spoken(text)
    result = QUICK_RESPONSES.get(key)
    if result:
        return result
    return WAKE_RESPONSES.get(key)


def style_action_reply(reply: str, action_kind: str, success: bool,
                       cinematic: bool = True) -> str:
    """Style an executed action result for display without changing its meaning."""
    if not cinematic or not action_kind or not reply.strip():
        return reply
    if reply.lstrip().casefold().startswith(_PREFIXES):
        return reply
    if not success:
        return "Перепрошую, сер. " + reply
    if action_kind in {"say", "ui_windows"}:
        return "Так, сер. " + reply
    return "Є, сер. " + reply


def concise_speech(reply: str, action_kind: str, success: bool,
                   cinematic: bool = True) -> str:
    """Limit speech sent to the online TTS; keep detailed result on-screen."""
    if not action_kind:
        return reply
    sensitive = action_kind in {"ui_windows", "ui_type", "ui_focus", "user_file", "note", "screenshot", "spotify_play", "spotify_search", "spotify_connect", "steam_game", "steam_list"}
    if not success:
        return ("Перепрошую, сер. Команду не виконано; деталі на екрані."
                if cinematic else "Команду не виконано. Деталі на екрані.")
    if action_kind == "youtube_search":
        # Do not send a private voice-dictated search term to the online TTS.
        return "Є, сер. Відкриваю пошук відео на YouTube." if cinematic else ""
    if sensitive:
        # Window titles, typed text, file names and their contents stay off online TTS.
        return "Є, сер." if cinematic else ""
    if not cinematic:
        return reply
    if action_kind.startswith("spotify_"):
        return "Є, сер. Команду Spotify надіслано; перевір результат у плеєрі."
    if action_kind == "steam_open_first":
        return "Є, сер. Команду відкриття Steam надіслано."
    if action_kind == "known_uri":
        return "Є, сер. Команду Steam надіслано."
    if action_kind in {"app", "installed_app", "folder", "settings"}:
        return "Є, сер. Надсилаю команду відкриття."
    if action_kind in {"volume", "ui_hotkey", "ui_scroll", "ui_click"}:
        return "Виконую, сер."
    if action_kind == "website" or action_kind == "external_url":
        return "Є, сер. Відкриваю сторінку."
    return reply
