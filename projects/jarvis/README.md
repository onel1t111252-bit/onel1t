# ONEL1T JARVIS 4.3 — Windows 11 Desktop Assistant

An owner-controlled voice assistant with local Ollama, Ukrainian voice input, a sci-fi HUD and **visible, approval-gated** control of Windows programs. This is a prototype: **not a fully autonomous agent**, not an administrator and not a remote-control service.

![JARVIS HUD concept](cover.svg)

## 📦 Download JARVIS 4.3

**[Download standalone JARVIS 4.3 ZIP](https://github.com/onel1t111252-bit/onel1t/raw/refs/heads/main/projects/jarvis/JARVIS_4_3_Windows11.zip)**

The archive contains the assistant, modules, setup scripts and tests. It does **not** include a Python runtime, Ollama weights, Steam, credentials or private user data.

## Quick start — Windows 11 / Python 3.12

1. Install [Python 3.12](https://www.python.org/) and [Ollama](https://ollama.com/download).
2. Download and extract the **4.3 ZIP** to a normal user folder.
3. Run **INSTALL_AI.bat** only if your local Ollama model \`jarvis\` does not already exist (downloads model data).
4. Run **INSTALL_VOICE.bat** to install speech, UI and audio dependencies.
5. Run **START_JARVIS.bat**.
6. Choose **CHECK AI** and **TEST VOICE**. If voice is unavailable, JARVIS shows a diagnostic.
7. Voice activation **HANDS-FREE is OFF by default**. You may enable it manually after seeing the online microphone notice, or use the microphone button.

Without Ollama, the local AI chat is unavailable, but the fixed command parser still supports defined actions.

## Supported commands

| Example Ukrainian command | Result |
| --- | --- |
| \`Джарвіс, відкрий Steam\` | Open Steam through its registered URI |
| \`Гаразд, а відкрий Steam і запусти Доту\` | Send the fixed \`steam://run/570\` link for Dota 2 |
| \`Джарвіс, відкрий Discord\` | Look up an installed Start-menu app; request approval |
| \`покажи відкриті вікна\` | Show up to 15 visible window titles locally |
| \`перемкнись на Блокнот\` | Request approval, activate the uniquely matching visible window |
| \`надрукуй Привіт, Україно!\` | Request approval; type Unicode without using the clipboard |
| \`скопіюй\`, \`встав\`, \`виділи все\` | Request approval; standard foreground shortcuts |
| \`нова вкладка\`, \`збережи\` | Request approval; foreground shortcut |
| \`прокрути вниз\`, \`прокрути вгору\` | Request approval; foreground scrolling |
| \`клацни мишею\` | Request approval; **one** click at the cursor's current position |
| \`відкрий блокнот, потім надрукуй Привіт\` | Preview and approve the **two steps separately** |
| \`зроби скріншот\`, \`створи нотатку ...\` | Request approval before saving locally |

Multi-step parsing is conservative: at most **4 explicit steps**. Text entry may only be the last step. Commands that are not explicitly supported never become free-form system commands. The preexisting Steam+Dota combination remains a single fixed URI action.

## Permissions and UI control

- JARVIS operates only on the **local, logged-in Windows desktop** within the user's existing permissions.
- An approval panel shows the exact action. Every **typing, mouse, keyboard, window-focus and multi-step** action requires a click on **CONFIRM**. Each step requires a fresh click.
- After approving typing, clicking or shortcuts, there is a **2.5 second delay** to focus the intended app. JARVIS will not send keys to its own window, protected system dialogs or known terminal windows.
- **STOP PLAN** cancels unstarted steps; it **cannot guarantee interruption** of an action already running. PyAutoGUI's upper-left-screen-corner fail-safe is enabled.
- The click command uses the current cursor only. There is no invisible targeting, coordinate scripting, arbitrary shell, code execution, remote desktop access, admin escalation or autonomous file deletion.
- Windows may deny focus switching; report and switch manually. Some apps block simulated input; an action being sent is **not proof** that the app performed it.
- Local \`actions.log\` records timestamps, action **types** and success/error, **not dictated text**.

**Do not use this preview for passwords, payments, private messages, privileged tasks or on managed computers without permission.** Voice recognition can misunderstand words; review the confirmation panel before clicking.

## Voice and privacy

- **Input:** push-to-talk or explicitly enabled hands-free uses Google online speech recognition (\`uk-UA\`), transmitting the recorded fragment to Google.
- **Output:** default **JARVIS DEEP** is an adjusted Ukrainian \`uk-UA-OstapNeural\` male voice via Microsoft's online speech service. Text spoken by this service is sent to Microsoft.
- Optional **Windows SAPI** mode only uses an installed **Ukrainian male** SAPI voice. If none exists, it reports that fact and **does not silently switch to English or a female voice**.
- Local AI requests go to Ollama on \`127.0.0.1:11434\`. There is no always-on remote administrator and no hidden listening mode.
- JARVIS does not send typed text or window listings to online TTS in 4.3; commands spoken into the microphone are still processed by the selected speech input provider.
- Clicking the voice toggle disables reply audio. Hands-free resets to **OFF** on every program start.

## Tests and limitations

From the extracted folder:

\`\`\`powershell
python -m unittest discover -p "test_*.py" -v
python -m py_compile jarvis.py desktop_actions.py window_control.py command_sequences.py voice_engine.py
\`\`\`

These tests exercise command parsing, consent metadata, URI restriction, window command parsing and scenario splitting. **They cannot validate the Windows mouse, microphone, Steam/Dota launch or voice sound** without a Windows PC with the relevant apps installed. Check Windows behavior manually before trusting automation.

## Modules

- \`jarvis.py\`: HUD, chat, voice input, confirmations, step queue, action log.
- \`desktop_actions.py\`: fixed command router, safe Windows shortcuts/Steam URIs.
- \`window_control.py\`: enumerates titled windows, foreground mouse/keyboard, Unicode typing.
- \`command_sequences.py\`: conservative Ukrainian multi-command parser.
- \`voice_engine.py\`: diagnostic-first Ukrainian TTS.
- \`test_*.py\`: automated parsing and permission tests.

## License

MIT. Independent fan-inspired interface, not affiliated with Marvel, Steam, Valve or other rights holders.
