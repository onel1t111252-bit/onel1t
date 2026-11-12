# ONEL1T / JARVIS 4.1 — Windows Voice Assistant

A futuristic desktop assistant that uses **local Ollama AI**, Ukrainian voice input, and owner-approved Windows automation. It is a **prototype**, not a remote administration tool and not an unrestricted desktop agent.

![JARVIS interface concept](cover.svg)

## Download only this project

**[Download JARVIS 4.1 ZIP](https://github.com/onel1t111252-bit/onel1t/raw/refs/heads/main/projects/jarvis/JARVIS_4_1_Windows11.zip)**

The ZIP includes only the assistant source code and setup files. It does not contain Ollama model weights, secrets, or credentials.

## Features

- Polished dark HUD, animated reactor, chat, status tiles, quick actions, voice selection and confirmation panel.
- Local AI: Ollama custom model named `jarvis` (based on Qwen3 Instruct); no remote AI API key.
- Ukrainian voice recognition: push-to-talk or **opt-in HANDS-FREE** (say “Джарвіс, відкрий блокнот”).
- Ukrainian male voice Ostap / female Polina with **edge-tts and pygame**, or explicitly selected Windows SAPI. No silent female/English voice fallback.
- Launch allowlisted apps such as Notepad, Calculator, Paint, File Explorer, Task Manager; **Steam** through its registered URI scheme.
- **Open other locally installed apps by name** through the user's Windows Start menu, **with approval** and without admin access. Example: “відкрий Spotify” (if installed). If several apps match, use the full Start-menu name.
- Open common personal folders, select a document using a file picker, open known websites, search, adjust volume.
- User-approved file opening, notes and screenshots. Script/executable files are not opened by the document picker.
- Ask permission before launching an unfamiliar Start-menu app or opening external sites and before any file-writing action.

## Installation (Windows 11, Python 3.12)

1. Install Python 3.12 from https://python.org and Ollama from https://ollama.com/download.
2. Download and extract `JARVIS_4_1_Windows11.zip`.
3. If you already created a local Ollama model named `jarvis`, **skip** `INSTALL_AI.bat`. Otherwise run it once (downloads Qwen3 Instruct, approximately 2.5 GB).
4. Run `INSTALL_VOICE.bat` once to install microphone + voice dependencies.
5. Run `START_JARVIS.bat`.
6. Click **CHECK AI** and **TEST VOICE**. Default voice is **OSTAP ♂**. If there is no sound, check the displayed diagnostic; online neural voice requires internet.
7. HANDS-FREE starts **OFF** each time. To enable it, click the button and accept the online microphone privacy notice. Then use the wake phrase without pressing the mic button.

### Example commands

- `Джарвіс, відкрий Steam`
- `Джарвіс, відкрий блокнот`
- `Джарвіс, відкрий Spotify` (finds an installed application, shows confirmation)
- `Джарвіс, відкрий файл` (user selects a file and approves)
- `Джарвіс, відкрий документи`
- `Джарвіс, знайди навчальні матеріали Python`
- `Джарвіс, збільш гучність`
- `Джарвіс, зроби скріншот` (asks permission)
- `Джарвіс, створи нотатку купити молоко` (asks permission)

## Work computers, privacy and scope

JARVIS only runs on the **computer where a user opens it** and within that user's Windows permissions. It cannot secretly access coworkers' PCs or obtain additional privileges. Respect your organization's software and data policy; do not install or run it on managed computers without authorization.

- Speech input uses Google's online transcription service and sends microphone audio during push-to-talk or enabled hands-free mode. HANDS-FREE is **off by default**.
- Ukrainian neural voice uses Microsoft's online speech service and sends the **text of spoken replies** to it. Selecting `WINDOWS` uses a local voice, subject to installed language voices.
- Ollama chats go to `127.0.0.1:11434` on the computer. Conversations are held in memory during the session (not automatically saved).
- Confirmed screenshots, notes and selected files remain local. Files and app shortcuts are never uploaded by the app.
- Arbitrary commands, privileged actions, file deletion, unsupervised browser clicking and remote control are intentionally **not supported**.

## Development and tests

```powershell
python -m unittest discover -p "test_*.py" -v
python jarvis.py
```

Source modules: `jarvis.py` (UI and Ollama), `desktop_actions.py` (local command planning and approvals), `voice_engine.py` (Ukrainian speech).

## License

MIT. UI is an original JARVIS-inspired fan design; this repository is not affiliated with Marvel or other rights holders.
