"""Ukrainian JARVIS TTS with truthful voice selection and clear error reporting.

Ostap / Polina use an online Microsoft speech service via edge-tts.
Microsoft receives the text being spoken. Windows voice is separate and offline.
"""
from __future__ import annotations

import asyncio
from dataclasses import dataclass
import logging
import os
from pathlib import Path
import subprocess
import tempfile
import time

VOICE_PROFILES = ("uk-UA-OstapNeural", "uk-UA-PolinaNeural", "windows")
VOICE_LABELS = {"uk-UA-OstapNeural": "OSTAP ♂", "uk-UA-PolinaNeural": "POLINA ♀", "windows": "WINDOWS"}


@dataclass(frozen=True)
class SpeechResult:
    ok: bool
    detail: str = ""


def _windows_sapi(text: str) -> SpeechResult:
    if os.name != "nt":
        return SpeechResult(False, "Windows SAPI доступний лише на Windows.")
    script = (
        "Add-Type -AssemblyName System.Speech; "
        "$s = New-Object System.Speech.Synthesis.SpeechSynthesizer; "
        "$s.Volume=90; $s.Speak([Console]::In.ReadToEnd()); $s.Dispose()"
    )
    try:
        run = subprocess.run(
            ["powershell.exe", "-NoProfile", "-NonInteractive", "-Command", script],
            input=text, text=True, encoding="utf-8", capture_output=True,
            timeout=120, check=False,
            creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
        )
        if run.returncode:
            return SpeechResult(False, "Голос Windows недоступний. Перевір мовні пакети Windows.")
        return SpeechResult(True)
    except (OSError, subprocess.TimeoutExpired):
        logging.warning("Windows SAPI failed", exc_info=True)
        return SpeechResult(False, "Помилка голосу Windows.")


def speak(text: str, voice: str = "uk-UA-OstapNeural") -> SpeechResult:
    """Synthesize then play full text. Call only on the background audio thread."""
    if not text.strip():
        return SpeechResult(True)
    text = text.strip()[:3200]
    if voice == "windows":
        return _windows_sapi(text)
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
            await edge_tts.Communicate(text, voice=voice, rate="-7%", pitch="-18Hz").save(str(filename))

        asyncio.run(generate())
        if not filename.is_file() or filename.stat().st_size < 128:
            return SpeechResult(False, "Сервіс голосу не повернув аудіо.")
        pygame.mixer.init()
        pygame.mixer.music.load(str(filename))
        pygame.mixer.music.play()
        while pygame.mixer.music.get_busy():
            time.sleep(.08)
        pygame.mixer.music.unload()
        pygame.mixer.quit()
        return SpeechResult(True)
    except Exception:
        logging.warning("Neural voice failed", exc_info=True)
        return SpeechResult(False, "Не вдалося відтворити голос Остапа. Перевір інтернет і встановлення голосових бібліотек. Голос Windows автоматично не підміняється.")
    finally:
        if filename is not None:
            try:
                filename.unlink(missing_ok=True)
            except OSError:
                logging.warning("Could not remove temporary TTS file")
