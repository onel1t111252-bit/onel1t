# ONEL1T / JARVIS 3.0

A personal Windows 11 desktop assistant built with Python and local Ollama. The GUI and commands are in Ukrainian.

## What works

- Dark desktop UI, text chat and session-only conversation context.
- Local AI chat through Ollama and the existing custom model named jarvis.
- Allowlisted Windows commands: Notepad, Calculator, File Explorer, Paint, Settings.
- Open Google, YouTube, GitHub, and search the web.
- Push-to-talk Ukrainian recognition with SpeechRecognition + Google.
- Optional opt-in continuous wake phrase "Джарвіс" (OFF by default).
- Optional voice synthesis through Windows SAPI (quality depends on installed Windows voices).

## Requirements

- Windows 11, Python 3.12, Ollama, and a locally installed model called jarvis.
- The microphone feature needs Internet and a functioning mic.
- No API key is required for local Ollama.

## Setup on Windows 11

1. Install Python 3.12 and Ollama.
2. Run in CMD: ollama list
3. If your custom model is named jarvis, keep that name. Otherwise set JARVIS_MODEL in START_JARVIS.bat.
4. Double-click INSTALL_VOICE.bat to install optional microphone dependencies.
5. Double-click START_JARVIS.bat.
6. Click CHECK AI, then try: Привіт, Джарвісе! and Джарвіс, відкрий блокнот.

To run from a terminal, use: python jarvis.py
To run checks, use: python -m unittest test_commands.py

## Voice privacy

AI requests go to local Ollama at 127.0.0.1:11434.
SpeechRecognition.recognize_google sends microphone recordings to Google's online recognition service. Enabling WAKE WORD means it continuously listens and processes speech through that service until turned OFF. Push-to-talk is the recommended default. No audio files or conversation transcripts are saved by this app; a temporary in-memory chat context is maintained only while the window is open. Technical errors may be logged to jarvis.log.

## Security design

Computer actions use a fixed allowlist and never execute arbitrary shell commands from chat or generated AI text. The AI cannot read files, send messages, or run code autonomously.

## Limitations / roadmap

Prototype, not a production assistant. Voice activation is not offline, text-to-speech depends on Windows voices, and response speed depends on laptop hardware. Future ideas: local offline Ukrainian ASR, customizable shortcuts, wake-word detection without cloud, signed releases.

## Project

- Portfolio: https://onel1t111252-bit.github.io/onel1t/projects/jarvis/
- Source: https://github.com/onel1t111252-bit/onel1t/tree/main/projects/jarvis

MIT-style use: educational personal portfolio source; see LICENSE file.
