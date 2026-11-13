"""Presentation-only status values derived from real JARVIS application state.

Never infer microphone listening, an active AI connection, or functional audio
solely from the existence of a button or an installed dependency.
"""
from __future__ import annotations


def hud_statuses(ai_online: bool | None, voice_on: bool, voice_volume: int,
                 handsfree: bool, mic_listening: bool) -> dict[str, str]:
    if ai_online is True:
        intelligence = "AI CONNECTED"
    elif ai_online is False:
        intelligence = "AI OFFLINE"
    else:
        intelligence = "AI CHECKING"

    if mic_listening:
        microphone = "LISTENING"
    elif handsfree:
        microphone = "WAKE MODE ON"
    else:
        microphone = "MIC OFF"

    level = max(0, min(100, int(voice_volume)))
    if not voice_on:
        voice = "VOICE OFF"
    elif level == 0:
        voice = "VOICE MUTED"
    else:
        voice = f"VOICE {level}%"

    return {"INTELLIGENCE": intelligence,
            "MICROPHONE": microphone,
            "SPEECH": voice}
