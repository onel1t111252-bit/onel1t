# ONEL1T / JARVIS 3.1 — Hands-Free Voice Assistant

**[⬇ Download JARVIS 3.1 for Windows 11 (ZIP)](https://github.com/onel1t111252-bit/onel1t/raw/refs/heads/main/projects/jarvis/JARVIS_3_Windows11.zip)**

Standalone archive (only JARVIS, not the complete ONEL1T repository).

## Features

- Local Ollama AI model `jarvis` answers in Ukrainian.
- **HANDS-FREE** wake word "Джарвіс", with follow-up utterance support.
  - "Джарвіс, відкрий блокнот" in one utterance.
  - "Джарвіс" then "Відкрий блокнот" in the next utterance.
- Speaks every assistant reply by default: natural Ukrainian voice **Ostap** through edge-tts.
- A voice button cycles through **Ostap / Polina / Windows SAPI fallback**.
- A **TEST VOICE** button helps verify speech output before voice commands.
- Mic pauses while the assistant speaks, to prevent feedback/self-triggering.
- Preferences saved in local `settings.json`: voice enabled, selected voice and opt-in hands-free mode.
- Allowlisted Windows actions only (Notepad, Calculator, Explorer, Paint, Settings, selected sites, web searches).
- Short chat context kept in memory during the current session.

## Install — Windows 11

1. Python 3.12 installed; Ollama running.
2. Check model: `ollama list` — you should see `jarvis`. If not, create your own custom model or change `JARVIS_MODEL` in `START_JARVIS.bat`.
3. Extract this ZIP. Run `INSTALL_VOICE.bat` once. Internet required.
4. Run `START_JARVIS.bat`.
5. Click **CHECK AI**, then **TEST VOICE**. Adjust system volume if you can't hear speech.
6. Click **HANDS-FREE: OFF** **once** to activate it. Say:
   - "Джарвіс, котра година"
   - "Джарвіс" (pause) "Відкрий YouTube"
7. Hands-free is saved for next launch. Switch it OFF at any time; this stops listening after the active microphone request ends.
8. Click **VOICE: OSTAP** to cycle to Polina or Windows built-in speech; click **VOICE: ON** to disable or re-enable sound.

## Privacy / limitations

- Ollama chat requests use local `http://127.0.0.1:11434`.
- **Speech recognition is NOT local.** Google receives speech recordings for transcription, including background spoken audio while hands-free mode is enabled. It is **off by default** until you turn it on once.
- **Neural voice is NOT local.** Microsoft's online speech service receives text of replies when Ostap or Polina is selected. Choose Windows SAPI for offline voice output, but quality of Ukrainian speech depends on Windows voice packs.
- This is a prototype. Wake activation is cloud-recognized and not a separate low-power offline detector; latency is dependent on network and hardware. No automatic file access, shell command execution or system administration.
- Error messages are written to `jarvis.log` (local, gitignored). No audio recordings are saved by the app.

## Tests

`python -m unittest test_commands.py`

## Source

https://github.com/onel1t111252-bit/onel1t/tree/main/projects/jarvis

## Attribution

Educational JARVIS-inspired UI concept. Not affiliated with any movie studio.
