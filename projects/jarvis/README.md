# ONEL1T / JARVIS 4.2 — Windows Voice Assistant

A futuristic desktop assistant that uses **local Ollama AI**, Ukrainian voice input, and owner-approved Windows automation. It is a **prototype**, not a remote administration tool and not an unrestricted desktop agent.

![JARVIS interface concept](cover.svg)

## Download only this project

**[Download JARVIS 4.2 ZIP](https://github.com/onel1t111252-bit/onel1t/raw/refs/heads/main/projects/jarvis/JARVIS_4_2_Windows11.zip)**

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
2. Download and extract `JARVIS_4_2_Windows11.zip`.
3. If you already created a local Ollama model named `jarvis`, **skip** `INSTALL_AI.bat`. Otherwise run it once (downloads Qwen3 Instruct, approximately 2.5 GB).
4. Run `INSTALL_VOICE.bat` once to install microphone + voice dependencies.
5. Run `START_JARVIS.bat`.
6. Click **CHECK AI** and **TEST VOICE**. Default voice is **JARVIS DEEP** (a lowered-pitch Ostap voice). If there is no sound, check the displayed diagnostic; online neural voice requires internet.
7. HANDS-FREE starts **OFF** each time. To enable it, click the button and accept the online microphone privacy notice. Then use the wake phrase without pressing the mic button.

### Example commands

- `Джарвіс, відкрий Steam`
- `Гаразд, а відкрий Steam, а потім запусти Dota 2`
- `Джарвіс, відкрий Steam і запусти Доту`
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

## Verification limits

Automated tests cover command parsing, fixed Steam URIs, safety checks and voice configuration; they do **not** verify microphone recognition, online speech quality or real game launching on a Windows computer. Use the **TEST VOICE** button and the Steam/Dota quick action locally. No exact film voice reproduction is claimed.

## Development and tests

```powershell
python -m unittest discover -p "test_*.py" -v
python jarvis.py
```

Source modules: `jarvis.py` (UI and Ollama), `desktop_actions.py` (local command planning and approvals), `voice_engine.py` (Ukrainian speech).

## License

MIT. UI is an original JARVIS-inspired fan design; this repository is not affiliated with Marvel or other rights holders.

## Що виправлено у 4.2

- Розуміє «гаразд а відкрий стім і запусти доту» та «запусти доту».
- Dota 2 запускається через фіксоване Steam URI `steam://run/570`.
- Невідомі команди Windows не відправляються в чат ШІ.
- Голос `JARVIS DEEP` — український Ostap з нижчим тоном, не копія голосу актора.

## Experimental foreground control (4.3 preview)

JARVIS can now request permission for a limited set of **foreground-window keyboard actions**. This is not unrestricted access to every app: controls depend on the active window, application permissions, and keyboard shortcuts. Each action requires clicking **APPROVE**; after approval, there is a two-second delay to focus the intended window.

Examples: `скопіюй`, `встав`, `виділи все`, `збережи`, `скасуй дію`, `нова вкладка`, `перемкни вікно`, `надрукуй Привіт, Україно!`.

Install dependencies with `python -m pip install -r requirements.txt`. Unicode typing temporarily uses the local clipboard and attempts to restore its previous text content. **Do not use this for passwords or other sensitive information**. Clipboard content may be exposed to the focused application or clipboard history. Actions are sent only to the currently focused application, not to a background target. JARVIS cannot verify that a target application accepted an action. Do not enable this feature on a managed work computer without permission.

This preview intentionally does **not** provide arbitrary shell commands, clicking arbitrary coordinates, credential entry, remote access, file deletion, or privileged operations. It has not been verified on a real Windows desktop; run `python -m unittest discover -p "test_*.py" -v` and test manually.
