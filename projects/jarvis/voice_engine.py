"""Ukrainian voice synthesis; neural speech online, Windows SAPI fallback offline.

Ostap/Polina neural voices send text to Microsoft's online speech service.
"""
from __future__ import annotations

import logging
import os
import shutil
import subprocess
import sys
from pathlib import Path

VOICE_PROFILES = ("uk-UA-OstapNeural", "uk-UA-PolinaNeural", "windows")
VOICE_LABELS = {"uk-UA-OstapNeural": "OSTAP", "uk-UA-PolinaNeural": "POLINA", "windows": "WINDOWS"}


def speak(text: str, profile: str = "uk-UA-OstapNeural") -> bool:
    if not text.strip() or os.name != "nt":
        return False
    text = text.strip()[:2400]
    if profile != "windows":
        exe = shutil.which("edge-playback")
        if not exe:
            alt = Path(sys.executable).parent / "Scripts" / "edge-playback.exe"
            exe = str(alt) if alt.is_file() else None
        if exe:
            try:
                process = subprocess.run(
                    [exe, "--voice", profile, "--rate=-4%", "--pitch=-12Hz", "--text", text],
                    stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, text=True,
                    timeout=130, check=False,
                    creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
                if process.returncode == 0:
                    return True
                logging.warning("Online speech returned %d", process.returncode)
            except (OSError, subprocess.TimeoutExpired):
                logging.warning("Online voice unavailable", exc_info=True)
    script = (
        "Add-Type -AssemblyName System.Speech; "
        "$v=New-Object System.Speech.Synthesis.SpeechSynthesizer; "
        "$v.Volume=88; $v.Speak([Console]::In.ReadToEnd()); $v.Dispose()"
    )
    try:
        result = subprocess.run(
            ["powershell.exe", "-NoProfile", "-NonInteractive", "-Command", script],
            input=text, text=True, encoding="utf-8", capture_output=True,
            check=False, timeout=100,
            creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
        return result.returncode == 0
    except (OSError, subprocess.TimeoutExpired):
        logging.warning("Windows SAPI unavailable", exc_info=True)
        return False
