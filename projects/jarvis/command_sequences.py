"""Conservative Ukrainian sequence splitting; never executes LLM-produced plans."""
from __future__ import annotations
import re

_VERBS = r"(?:відкрий|відкрити|запусти|запустити|надрукуй|введи|напиши|зроби|створи|покажи|перемкнись|прокрути|клацни|клікни|натисни|збережи|закрий)"
_SEPARATOR = re.compile(r"(?:\s*[,;]\s*|\s+)(?:(?:а\s+)?потім|і|та)\s+(?=" + _VERBS + r"\b)", re.I)
_WAKE = re.compile(r"^(?:джарвісе|джарвіс|джарвис|jarvis)\b[\s,!:;.-]*", re.I)
_FILLER = re.compile(r"^(?:(?:гаразд|окей|добре|ну|слухай)[,\s]+)+(?:а\s+)?", re.I)


def split_sequence(text: str) -> list[str] | None:
    """None: one command; []: invalid; 2-4 explicit segments: candidate sequence."""
    q = _WAKE.sub("", text.strip())
    q = _FILLER.sub("", q)
    parts = [p.strip(" ,;") for p in _SEPARATOR.split(q)]
    if len(parts) < 2:
        return None
    if len(parts) > 4 or any(not part or len(part) > 550 for part in parts):
        return []
    # Dictation is terminal, so user prose cannot accidentally become a tool call.
    if any(re.match(r"^(?:надрукуй|введи текст|напиши текст)\b", p, re.I)
           for p in parts[:-1]):
        return []
    return parts
