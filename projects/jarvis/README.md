# ONEL1T / JARVIS 4.0

**[⬇ Download only JARVIS 4.0 for Windows 11 (ZIP)](https://github.com/onel1t111252-bit/onel1t/raw/refs/heads/main/projects/jarvis/JARVIS_4_Windows11.zip)**


A voice-powered Windows 11 desktop assistant with a neon command-center UI, local Ollama AI, Ukrainian speech recognition and explicit approval for sensitive computer actions.

## Features

- Modern dark blue/cyan tkinter desktop interface and animated reactor core.
- Locally-run model named `jarvis` through Ollama (default `http://127.0.0.1:11434`).
- Optional hands-free mode: “Джарвіс, відкрий блокнот”, or “Джарвіс” followed by a command.
- Replies spoken aloud by default with Ostap/Polina neural Ukrainian voice (online Microsoft service), with optional Windows SAPI fallback.
- Opens allowlisted applications (Notepad, Calculator, Paint, File Explorer, Task Manager) and known websites (YouTube, Google, GitHub, Wikipedia).
- Opens known Windows folders and settings; adjusts system volume; searches the web.
- With visible approval: creates local notes, saves screenshots, or opens an unfamiliar HTTPS website.
- Local session chat memory; no administrative privileges, remote access, credential retrieval or arbitrary shell execution.

## Start on Windows 11

1. Install Python 3.12 and Ollama. Start Ollama.
2. Confirm your local model with `ollama list`. It should contain `jarvis`. If you have another model, change `JARVIS_MODEL` in `START_JARVIS.bat`.
3. Extract `JARVIS_4_Windows11.zip` to its own folder.
4. Run `INSTALL_VOICE.bat` once (needs internet for downloading packages).
5. Double-click `START_JARVIS.bat`.
6. Press **CHECK AI**. Test **▶ TEST** to hear a voice, then activate **HANDS-FREE** once. It remains OFF by default on each start.
7. Say “Джарвіс, відкрий блокнот”, “Джарвіс, зроби голосніше”, or “Джарвіс, котра година”.
8. Try “Джарвіс, створити нотатку...” or “Джарвіс, зроби скріншот”; an on-screen confirmation is required.

The AI can discuss general tasks, but computer operations must match an explicit allowlist. There is **no unrestricted access to your machine**, even when the model suggests a command.

## Privacy and consent

- Ollama chat prompts go only to the local host by default.
- **Google online speech recognition** receives audio sampled while you use push-to-talk or enable hands-free mode. Hands-free listens in the foreground while active, and does not silently start after reboot/reopening the app.
- **Microsoft online neural voice** receives the assistant's reply text when Ostap/Polina is selected. Select **VOICE: WINDOWS** for the local SAPI fallback; suitable Ukrainian voices may need Windows language packs.
- Screenshots and notes, when explicitly confirmed, are saved locally inside the user's Pictures/Documents folders, not sent to the assistant developer.
- Voice replies pause recognition while playing to reduce self-triggering. Recognition and TTS depend on network conditions and may be imperfect.
- Application settings are stored in `settings.json` in the same folder. Errors are stored in local `jarvis.log`. Neither is committed by `.gitignore`.

## For developers

```powershell
python -m unittest discover -p "test_*.py"
python jarvis.py
```

Design: `desktop_actions.py` holds the restricted action router; `voice_engine.py` handles optional speech; `jarvis.py` owns the GUI, mic, local AI calls, and approval UI.

**Roadmap:** offline Ukrainian ASR, configurable explicitly approved app shortcuts, packaging into a signed installer, richer automation with consent-bound permissions, Windows UI automation with preview mode.

## License

See `LICENSE`. JARVIS-inspired fan project; not affiliated with Marvel or any movie studio. The UI/branding are original.