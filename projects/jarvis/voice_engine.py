"""Speech output for Windows JARVIS.

Preferred: edge-tts / edge-playback, with natural Ukrainian neural voices.
Fallback: local Windows SAPI when online service is unavailable.

Edge TTS sends spoken text to Microsoft's online speech service.
"""
import logging
import os
from pathlib import Path
import shutil
import subprocess
import sys

VOICE_PROFILES = ("uk-UA-OstapNeural", "uk-UA-PolinaNeural", "windows")
LABELS = {
    "uk-UA-OstapNeural": "OSTAP",
    "uk-UA-PolinaNeural": "POLINA",
    "windows": "WINDOWS",
}


def speak(text: str, profile: str = "uk-UA-OstapNeural") -> bool:
    """Synthesize & play audio synchronously, on a worker thread only."""
    if not text.strip() or os.name != "nt":
        return False
    text = text.strip()[:1500]

    if profile != "windows":
        exe = shutil.which("edge-playback")
        if not exe:
            candidate = Path(sys.executable).parent / "Scripts" / "edge-playback.exe"
            if candidate.is_file():
                exe = str(candidate)
        if exe:
            try:
                result = subprocess.run(
                    [exe, "--voice", profile, "--rate=-6%", "--pitch=-10Hz",
                     "--text", text],
                    stdout=subprocess.DEVNULL, stderr=subprocess.PIPE,
                    text=True, timeout=120, check=False,
                    creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
                )
                if result.returncode == 0:
                    return True
                logging.warning("Edge voice failure: exit %s", result.returncode)
            except Exception:
                logging.warning("Edge voice unavailable", exc_info=True)

    # Offline fallback uses whatever voices are installed in Windows.
    script = (
        "Add-Type -AssemblyName System.Speech; "
        "$s=New-Object System.Speech.Synthesis.SpeechSynthesizer; "
        "$s.Volume=90; "
        "$s.Speak([Console]::In.ReadToEnd()); $s.Dispose()"
    )
    try:
        result = subprocess.run(
            ["powershell.exe", "-NoProfile", "-NonInteractive", "-Command", script],
            input=text, text=True, encoding="utf-8", capture_output=True,
            timeout=90, check=False,
            creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
        )
        return result.returncode == 0
    except Exception:
        logging.warning("Windows speech unavailable", exc_info=True)
        return False
