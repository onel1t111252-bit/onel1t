"""Ukrainian AI assistant speech: fast free cinematic tone and opt-in studio voice.

These are original assistant voice profiles, NOT an imitation of a movie actor.
Edge neural profiles send spoken text to Microsoft. Optional studio mode sends it
to the OpenAI Audio API and requires your own paid API key via environment variable.
Neither voice mode activates the microphone. Keys/audio are never saved to disk
(other than a temporary audio playback file deleted after every utterance).
"""
from __future__ import annotations

import asyncio
from collections import OrderedDict
from dataclasses import dataclass
import json
import logging
import math
import os
from pathlib import Path
import subprocess
import tempfile
import time
from urllib import request, error

VOICE_PROFILES = (
    "jarvis-cinematic", "jarvis-deep",
    "uk-UA-OstapNeural", "uk-UA-PolinaNeural",
    "studio-onyx", "windows",
)
VOICE_LABELS = {
    "jarvis-cinematic": "JARVIS CINEMATIC ♂",
    "jarvis-deep": "JARVIS DEEP ♂",
    "uk-UA-OstapNeural": "OSTAP ♂",
    "uk-UA-PolinaNeural": "POLINA ♀",
    "studio-onyx": "STUDIO ♂ / API",
    "windows": "WINDOWS",
}
# Original cinematic assistant: measured pace, mild lowering, not a distorted voice.
# Prior -32Hz pitch made the free Ukrainian male voice artificially heavy.
EDGE_TUNING = {
    "jarvis-cinematic": ("uk-UA-OstapNeural", "-3%", "-12Hz"),
    "jarvis-deep": ("uk-UA-OstapNeural", "-7%", "-19Hz"),
    "uk-UA-OstapNeural": ("uk-UA-OstapNeural", "+0%", "+0Hz"),
    "uk-UA-PolinaNeural": ("uk-UA-PolinaNeural", "+0%", "+0Hz"),
}
STUDIO_VOICE = "onyx"
STUDIO_MODEL = "gpt-4o-mini-tts"  # Deprecated upstream; provider says 2027-01-06 shutdown.
STUDIO_INSTRUCTIONS = (
    "Speak entirely in natural, fluent Ukrainian, with clear native Ukrainian "
    "pronunciation. Sound like an ORIGINAL futuristic computer assistant: calm, "
    "confident, composed, resonant lower masculine register, gentle warmth, "
    "careful diction, conversational rhythm. Avoid robotic monotony, exaggerated "
    "bass and theatrical imitation. Do not imitate any real person or film actor."
)
# Only cache known, impersonal short acknowledgments in process memory.
COMMON_ACKNOWLEDGMENTS = frozenset({
    "Є, сер.", "Так, сер.", "Виконую, сер.",
    "Є, сер. Команду Spotify надіслано; перевір результат у плеєрі.",
    "Є, сер. Команду відкриття Steam надіслано.",
    "Є, сер. Надсилаю команду відкриття.",
})
_SHORT_AUDIO_CACHE: OrderedDict[tuple[str, str], bytes] = OrderedDict()
_CACHE_ITEMS = 12


@dataclass(frozen=True)
class SpeechResult:
    ok: bool
    detail: str = ""


def clamp_volume(value: object) -> int:
    try:
        number = float(value)
    except (TypeError, ValueError, OverflowError):
        return 80
    if not math.isfinite(number):
        return 80
    return max(0, min(100, int(round(number))))


def _windows_sapi(text: str, volume: int = 80) -> SpeechResult:
    if os.name != "nt":
        return SpeechResult(False, "Windows SAPI доступний лише на Windows.")
    volume = clamp_volume(volume)
    script = (
        "Add-Type -AssemblyName System.Speech; "
        "$s = New-Object System.Speech.Synthesis.SpeechSynthesizer; "
        "$v = $s.GetInstalledVoices() | Where-Object { $_.Enabled -and "
        "$_.VoiceInfo.Culture.Name -eq 'uk-UA' -and "
        "$_.VoiceInfo.Gender -eq [System.Speech.Synthesis.VoiceGender]::Male } | Select-Object -First 1; "
        "if (-not $v) { [Console]::Error.WriteLine('UKRAINIAN_MALE_MISSING'); exit 3 }; "
        "$s.SelectVoice($v.VoiceInfo.Name); "
        f"$s.Volume={volume}; $s.Speak([Console]::In.ReadToEnd()); $s.Dispose()"
    )
    try:
        run = subprocess.run(
            ["powershell.exe", "-NoProfile", "-NonInteractive", "-Command", script],
            input=text, text=True, encoding="utf-8", capture_output=True,
            timeout=120, check=False,
            creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
        if run.returncode == 3:
            return SpeechResult(
                False, "У Windows немає українського чоловічого SAPI-голосу. "
                       "Обери JARVIS CINEMATIC.")
        if run.returncode:
            return SpeechResult(False, "Голос Windows недоступний. Перевір мовні пакети Windows.")
        return SpeechResult(True)
    except (OSError, subprocess.TimeoutExpired):
        logging.warning("Windows SAPI failed", exc_info=True)
        return SpeechResult(False, "Помилка голосу Windows.")


def _edge_generate(text: str, voice: str, path: Path) -> None:
    import edge_tts
    voice_name, rate, pitch = EDGE_TUNING[voice]

    async def generate() -> None:
        await edge_tts.Communicate(text, voice=voice_name, rate=rate, pitch=pitch).save(str(path))

    # Failed Microsoft synthesis must not stall spoken commands indefinitely.
    asyncio.run(asyncio.wait_for(generate(), timeout=14.0))


def _studio_generate(text: str, path: Path) -> None:
    key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not key:
        raise ValueError(
            "STUDIO потребує окремого платного OpenAI API-ключа у змінній "
            "OPENAI_API_KEY. Він не потрібен для безкоштовного JARVIS CINEMATIC.")
    payload = json.dumps({
        "model": STUDIO_MODEL,
        "voice": STUDIO_VOICE,
        "input": text,
        "instructions": STUDIO_INSTRUCTIONS,
        "response_format": "mp3",
        "speed": 1.0,
    }, ensure_ascii=False).encode("utf-8")
    req = request.Request(
        "https://api.openai.com/v1/audio/speech", data=payload,
        headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with request.urlopen(req, timeout=25) as response:
            data = response.read(12 * 1024 * 1024 + 1)
            if len(data) > 12 * 1024 * 1024:
                raise ValueError("Сервіс голосу повернув завелике аудіо.")
            path.write_bytes(data)
    except error.HTTPError as exc:
        # Never include authorization headers, response bodies or secrets.
        raise ValueError(
            "STUDIO API: HTTP " + str(exc.code)
            + ". Перевір API-ключ, оплату й доступність моделі.") from exc


def _cache_get(voice: str, text: str) -> bytes | None:
    if text not in COMMON_ACKNOWLEDGMENTS:
        return None
    key = (voice, text)
    cached = _SHORT_AUDIO_CACHE.get(key)
    if cached is not None:
        _SHORT_AUDIO_CACHE.move_to_end(key)
    return cached


def _cache_put(voice: str, text: str, audio: bytes) -> None:
    if text not in COMMON_ACKNOWLEDGMENTS or len(audio) > 200_000:
        return
    key = (voice, text)
    _SHORT_AUDIO_CACHE[key] = audio
    _SHORT_AUDIO_CACHE.move_to_end(key)
    while len(_SHORT_AUDIO_CACHE) > _CACHE_ITEMS:
        _SHORT_AUDIO_CACHE.popitem(last=False)


def speak(text: str, voice: str = "jarvis-cinematic", volume: int = 80) -> SpeechResult:
    """Synthesise/play on the audio worker; UI thread stays responsive."""
    if not text.strip():
        return SpeechResult(True)
    text = text.strip()[:3200]
    volume = clamp_volume(volume)
    if voice not in VOICE_PROFILES:
        return SpeechResult(False, "Невідомий профіль голосу.")
    if volume == 0:
        return SpeechResult(True, "Гучність голосу 0%.")
    if voice == "windows":
        return _windows_sapi(text, volume)
    try:
        import pygame
    except ImportError:
        return SpeechResult(False, "Не встановлено pygame. Запусти INSTALL_VOICE.bat.")

    if voice == "studio-onyx" and not os.environ.get("OPENAI_API_KEY", "").strip():
        return SpeechResult(False, "STUDIO потребує власного платного OpenAI API-ключа "
                            "в OPENAI_API_KEY. Для безкоштовного голосу обери JARVIS CINEMATIC.")
    if voice != "studio-onyx":
        try:
            import edge_tts  # noqa: F401
        except ImportError:
            return SpeechResult(False, "Не встановлено edge-tts. Запусти INSTALL_VOICE.bat.")

    filename = None
    try:
        with tempfile.NamedTemporaryFile(prefix="jarvis_speech_", suffix=".mp3", delete=False) as f:
            filename = Path(f.name)
        cached = _cache_get(voice, text)
        if cached is not None:
            filename.write_bytes(cached)
        elif voice == "studio-onyx":
            _studio_generate(text, filename)
        else:
            _edge_generate(text, voice, filename)

        if not filename.is_file() or filename.stat().st_size < 128:
            return SpeechResult(False, "Сервіс голосу не повернув аудіо.")
        if cached is None:
            _cache_put(voice, text, filename.read_bytes())
        if pygame.mixer.get_init() is None:
            pygame.mixer.init()
        try:
            pygame.mixer.music.load(str(filename))
            pygame.mixer.music.set_volume(volume / 100.0)
            pygame.mixer.music.play()
            while pygame.mixer.music.get_busy():
                time.sleep(.04)
            return SpeechResult(True)
        finally:
            pygame.mixer.music.stop()
            pygame.mixer.music.unload()
            # Reuse the initialized mixer across messages for faster responses.
    except asyncio.TimeoutError:
        return SpeechResult(False, "Голосовий сервіс не відповів за 14 секунд. Перевір інтернет.")
    except ValueError as exc:
        return SpeechResult(False, str(exc))
    except Exception:
        logging.warning("Neural voice failed", exc_info=True)
        return SpeechResult(
            False, "Не вдалося озвучити відповідь. Перевір інтернет, "
                   "аудіопристрій і бібліотеки. Профіль голосу сам не змінюється.")
    finally:
        if filename is not None:
            try:
                filename.unlink(missing_ok=True)
            except OSError:
                logging.warning("Could not remove temporary TTS file")
