"""Ukrainian JARVIS TTS with truthful voice selection and clear error reporting.

Ostap / Polina use an online Microsoft speech service via edge-tts.
Microsoft receives the text being spoken. Windows voice is separate and offline.
"""
from __future__ import annotations

import asyncio
from dataclasses import dataclass
import logging
import math
import os
from pathlib import Path
import subprocess
import tempfile
import time

# A lowered-pitch male Ukrainian voice: similar sci-fi mood, not a film-actor imitation.
VOICE_PROFILES = ("jarvis-deep", "uk-UA-OstapNeural", "uk-UA-PolinaNeural", "windows")
VOICE_LABELS = {"jarvis-deep": "JARVIS DEEP", "uk-UA-OstapNeural": "OSTAP ♂", "uk-UA-PolinaNeural": "POLINA ♀", "windows": "WINDOWS"}


@dataclass(frozen=True)
class SpeechResult:
    ok: bool
    detail: str = ""


def clamp_volume(value: object) -> int:
    """Validate 0-100 percent from settings and UI without trusting corrupted values."""
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
            creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
        )
        if run.returncode == 3:
            return SpeechResult(False, "У Windows немає українського чоловічого SAPI-голосу. Голос іншою мовою не використано; обери JARVIS DEEP.")
        if run.returncode:
            return SpeechResult(False, "Голос Windows недоступний. Перевір мовні пакети Windows.")
        return SpeechResult(True)
    except (OSError, subprocess.TimeoutExpired):
        logging.warning("Windows SAPI failed", exc_info=True)
        return SpeechResult(False, "Помилка голосу Windows.")


def speak(text: str, voice: str = "uk-UA-OstapNeural", volume: int = 80) -> SpeechResult:
    """Synthesize then play full text. Call only on the background audio thread."""
    if not text.strip():
        return SpeechResult(True)
    text = text.strip()[:3200]
    volume = clamp_volume(volume)
    if volume == 0:
        return SpeechResult(True, "Гучність голосу 0%.")
    if voice == "windows":
        return _windows_sapi(text, volume)
    if voice not in VOICE_PROFILES:
        return SpeechResult(False, "Невідомий профіль голосу.")
    try:
        import edge_tts
        import pygame
    except ImportError:
        return SpeechResult(False, "Не встановлені edge-tts або pygame. Запусти INSTALL_VOICE.bat.")

    filename = None
    try:
        with tempfile.NamedTemporaryFile(prefix="jarvis_speech_", suffix=".mp3", delete=False) as f:
            filename = Path(f.name)

        async def generate() -> None:
            voice_name = "uk-UA-OstapNeural" if voice == "jarvis-deep" else voice
            rate = "-11%" if voice == "jarvis-deep" else "-7%"
            pitch = "-32Hz" if voice == "jarvis-deep" else "-18Hz"
            await edge_tts.Communicate(text, voice=voice_name, rate=rate, pitch=pitch).save(str(filename))

        asyncio.run(generate())
        if not filename.is_file() or filename.stat().st_size < 128:
            return SpeechResult(False, "Сервіс голосу не повернув аудіо.")
        pygame.mixer.init()
        try:
            pygame.mixer.music.load(str(filename))
            pygame.mixer.music.set_volume(volume / 100.0)
            pygame.mixer.music.play()
            while pygame.mixer.music.get_busy():
                time.sleep(.08)
            return SpeechResult(True)
        finally:
            pygame.mixer.music.stop()
            pygame.mixer.music.unload()
            pygame.mixer.quit()
    except Exception:
        logging.warning("Neural voice failed", exc_info=True)
        return SpeechResult(False, "Не вдалося відтворити голос Остапа. Перевір інтернет і встановлення голосових бібліотек. Голос Windows автоматично не підміняється.")
    finally:
        if filename is not None:
            try:
                filename.unlink(missing_ok=True)
            except OSError:
                logging.warning("Could not remove temporary TTS file")
