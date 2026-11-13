# ONEL1T JARVIS 3.0 — Windows 11 Desktop Assistant

An owner-controlled Ukrainian voice assistant with local Ollama AI, a resizable sci-fi HUD, and visible, **approval-gated** Windows automation. It is a prototype, not an administrator, an unrestricted autonomous agent, or remote-control software.

![JARVIS HUD concept](cover.svg)

## Download only JARVIS

**[Download JARVIS 3.0 for Windows 11 (ZIP)](https://github.com/onel1t111252-bit/onel1t/raw/refs/heads/main/projects/jarvis/JARVIS_3_0_Windows11.zip)**

The archive contains Python sources, the Ollama Modelfile, installation scripts, dependencies and tests. It does not include Python, installed Ollama models, Steam, private files or credentials.

## Install (Windows 11 / Python 3.12)

1. Install Python 3.12 and [Ollama](https://ollama.com/download).
2. Download and extract the ZIP. Start JARVIS from that extracted folder.
3. If Ollama does not already contain a model called `jarvis`, run `INSTALL_AI.bat`. It may download a large Qwen model. Existing models are not overwritten.
4. Run `INSTALL_VOICE.bat` once to install audio and foreground UI dependencies.
5. Run `START_JARVIS.bat`, click **CHECK AI**, then **TEST VOICE**.
6. JARVIS opens as a **normal, resizable window**, not fullscreen. Use **WINDOW: COMPACT / LARGE** to change its preset size; resizing by dragging a window edge is also supported.

Your old settings from a previous extracted folder are not copied automatically; you can change volume and window size in the app. If AI chat is unavailable, the fixed, explicitly defined local commands still work.

## More natural Ukrainian replies — «Так, сер»

The assistant uses a courteous, calm Ukrainian persona in its local Ollama prompt. Short command acknowledgements use **«Так, сер»**, **«Є, сер»** and, if execution fails, **«Перепрошую, сер»**. No text claims an app opened or a game started unless JARVIS has actually invoked the corresponding action; sending a Steam launch URI does **not** prove the game started.

The new default is **JARVIS CINEMATIC** (original Ukrainian male Ostap with milder tuning). Existing installations on the old over-pitched JARVIS DEEP profile migrate to this voice once. It is not a recording or imitation of a film actor.

## Cinematic JARVIS mode (original, not a film voice clone)

**JARVIS MODE: ON** is the default. The app now has a visible mode switch (**ON/OFF**) that persists in `settings.json`. It enables:

- Calm Ukrainian `сер`-style conversations via the local Ollama system prompt, plus safe deterministic replies to `Джарвіс, ти тут?`, `дякую`, `доброго ранку` and similar short phrases.
- Short, truthful spoken acknowledgments for known Windows commands. The screen still shows the detailed result; speech never falsely claims Steam completed a game launch.
- A brief spoken startup greeting when voice is enabled, volume is above 0, and JARVIS MODE is ON. This sends a fixed greeting text to the selected online voice service when using an online voice; it does not turn on the microphone.
- The rotating reactor changes indicators between **STANDBY**, **LISTENING**, **SPEAKING** and **PROCESSING**. These labels reflect actual local program state, not a hardware scan.
- `статус системи` or `статус джарвіса`: reports the last observed Ollama status and local mic/voice settings without claiming to inspect all Windows hardware.

Turning **JARVIS MODE: OFF** switches AI replies to a neutral Ukrainian persona. It also clears the in-memory chat context to avoid mixing conversational styles.

The voice is an original assistant-style Ukrainian neural voice with a lowered pitch. **It is not the exact copyrighted dialogue or the actor's voice from the films.** Exact sounding and prosody remain subject to the installed Windows audio devices and the online TTS service.

For privacy, dictated input, private file paths and foreground window titles are not read aloud by online TTS for UI-control actions. When a sensitive action fails, TTS uses a generic error announcement; details appear on screen.

## Voice quality upgrade and optional studio voice

The **VOICE** button cycles through distinct supported profiles; select the profile and press **TEST VOICE** to compare them. All voices are original AI-generated speech, **not an impersonation of the actor or the copyrighted movie audio**.

- **JARVIS CINEMATIC ♂ (default, free):** Ukrainian male Microsoft Ostap with milder `−12Hz` pitch and `−3%` speaking rate. This avoids the very unnatural previous `−32Hz` deepening.
- **JARVIS DEEP ♂ (free):** a slightly deeper version at `−19Hz`, `−7%`, also improved from the old setting.
- **OSTAP / POLINA (free):** unmodified Ukrainian Microsoft neural voices to compare natural pronunciation.
- **STUDIO ♂ / API (optional, paid):** experimental original cinematic masculine delivery using OpenAI's audio synthesis API (model `gpt-4o-mini-tts`, voice `onyx`, with instructions to speak natural Ukrainian). This requires a **separate paid OpenAI API account** and an `OPENAI_API_KEY` environment variable; ChatGPT Plus alone does not provide API credits. The user opts in by selecting STUDIO. Audio quality and Ukrainian pronunciation are not guaranteed to match expectations. The API model is currently scheduled to retire on January 6, 2027, so STUDIO is a temporary option that may need migration.
- **WINDOWS:** local SAPI, only when a suitable male Ukrainian Windows voice is installed.

**Privacy:** The free voices transmit the selected spoken text to Microsoft; STUDIO transmits it to OpenAI, which may charge according to usage. JARVIS does not write your API key to settings or logs. Use Windows user environment variables or a terminal session to supply it; **never share an API key, commit it to GitHub, or paste it into JARVIS chat**. Short, generic acknowledgments are cached in memory during the current run, reducing repeat synthesis latency. Dictated/private text is never cached.

Network speech may still pause due to the provider. It is limited to a roughly 14-second synthesis timeout in free mode; a local Windows SAPI voice works offline when available.

## Separate voice volume control

The **VOICE VOLUME** slider (0–100%) changes the playback volume of the **assistant's voice only**. It does **not** modify overall Windows speaker volume, music, Steam, games or other apps. The setting is stored locally in `settings.json` and reloaded on next launch. It takes effect for the **next spoken reply**, including the **TEST VOICE** button.

The slider applies to online Microsoft Ukrainian voice synthesis (played with pygame) and to the optional local Windows SAPI mode. If an approved Ukrainian male SAPI voice is not installed, JARVIS reports an error rather than silently switching to English or a different gender.

## Sample commands

| Spoken or typed command | Action |
| --- | --- |
| `Джарвіс, відкрий Steam і запусти Доту` | Uses fixed `steam://run/570` URI |
| `відкрий Discord` | Finds a Start-menu program, asks approval |
| `покажи відкриті вікна` | Shows visible window titles locally |
| `перемкнись на Блокнот` | Requests permission before focusing a visible window |
| `надрукуй Привіт, Україно!` | Requests permission before Unicode typing |
| `скопіюй`, `встав`, `виділи все`, `збережи` | Safe foreground keyboard shortcuts after approval |
| `прокрути вниз`, `клацни мишею` | Scroll / one click at current cursor after approval |
| `відкрий блокнот, потім надрукуй Привіт` | Up to four explicit steps, each approved separately |

## 🎮 Steam: first saved account + installed games (Windows 11)

JARVIS supports owner-approved Steam account selection and game launching without passwords or Steam Guard bypass.

| What you say | What JARVIS actually does |
| --- | --- |
| `Джарвіс, відкрий Steam` | **Always attempt to open Steam**. If Steam is closed and it is possible, first configure the **first saved account**; when selection fails, Steam still opens for manual account choice |
| `відкрий Steam і запусти Cyberpunk 2077` | Look up that *installed game* in local Steam libraries, set first saved account and send a Steam AppID launch URI |
| `запусти гру Portal 2` | Find exact/unique installed title and launch through `steam://run/<AppID>` |
| `запусти Доту` | Use installed Dota 2 entry with the same checks |
| `покажи ігри Steam` | Read local game manifests, showing up to 50 installed titles |
| `вибери перший акаунт` | Configure first saved account, then open Steam (only after confirmation) |

**Important account behavior:** "First" means the **first stored entry in `Steam/config/loginusers.vdf`**. Steam's visible account-picker order can differ. The tool reads an existing remembered-login setting and requires `RememberPassword=1`; it neither reads nor requests a Steam password or Steam Guard code. If Steam is closed, it changes **`MostRecent` in `loginusers.vdf`** and the current user's **`HKCU\Software\Valve\Steam\AutoLoginUser`** preference, then asks Steam to open normally. Before changing the file it saves an owner-local backup named `loginusers.vdf.jarvis-backup`. No account data is sent to an online service.

**Fix for Steam not opening due to account selection:** JARVIS now **separates opening Steam from selecting an account**. If the account file, Windows registry, or active-account check cannot be used, the program still sends `steam://open/main`; if the protocol is unregistered, it falls back to the installed `steam.exe`. It reports the account-selection problem on screen instead of pretending a login succeeded. If Steam presents the account chooser, select the account yourself; JARVIS never enters passwords or bypasses Steam Guard. One-time sign-in setup is not guaranteed to suppress the Steam client's chooser.

**Games remain guarded:** If account selection fails when launching a game, JARVIS opens Steam but deliberately **does not start the game under an unverified account**. Select the correct account and repeat the game command. This preserves the prior rule not to launch a game on an unrelated saved account.

**To install this fix:** download the **current ZIP** again, extract to a new folder (or replace the app's Python source files while JARVIS is closed) and relaunch `START_JARVIS.bat`. The previously extracted folder does not update itself.

**If Steam is running:** JARVIS checks Steam's locally reported `ActiveUser`. It sends a game launch request only if the active account matches the first saved account. It does **not** close Steam, log out a user, interrupt a running game or silently start the game under the wrong account. If Steam's current account cannot be verified, the action stops and tells you to close Steam manually and retry.

**Limitations:** Steam must be installed on Windows, the first account must already have a remembered login, and the requested game must appear as **installed** in the detected Steam library manifests. Games that are purchased but **not installed** cannot be launched this way. Steam can still display its own account chooser, login, Steam Guard or game-license dialog; complete those in Steam yourself. If you enabled "Ask which account to use each time Steam starts", disable that option in Steam settings to allow remembered auto-login. JARVIS only confirms that the `steam://` launch request was sent, not that the game successfully started. Steam account ownership and age restrictions remain in effect.

**Why approval is required:** Selecting an account changes local sign-in preferences; starting an app/game is a visible local action. Every `steam_open_first` and `steam_game` action shows its purpose in JARVIS and needs an explicit **CONFIRM**. There is no automated password entry, credentials storage, Steam Guard workaround or game-file execution.

## 🎵 Spotify — fast search and opt-in playback

**Search is immediate and does NOT need Spotify Developer API, Premium, or Ollama**:
- Say `Джарвіс, знайди пісню Numb в Spotify`, `знайди в Spotify Numb`, or `знайди пісню Numb`, or click **♫ FIND SONG** in the sidebar.
- JARVIS opens the official Spotify search result in your browser immediately. You choose the result if the account is not connected.
- Say `Джарвіс, увімкни Linkin Park Numb`: when no authorized API session is connected, JARVIS **falls back to Spotify search** instead of silently waiting or claiming playback. When connected, it requests playback on your active device; if that fails, it opens search and shows the reason.
- Manual search does not require an approval prompt; playback and login still do.
- The optional official API requests now have **six-second per-request timeouts**, avoiding the prior up-to-20-second waits per call. Network speed still affects real latency.



JARVIS now understands these commands:

| Command | Result |
| --- | --- |
| `Джарвіс, відкрий Spotify` | Open Spotify, if discoverable in the Windows Start menu |
| `Джарвіс, увімкни Linkin Park Numb` | Request playback **if connected**, otherwise quickly open Spotify search |
| `відтвори пісню Numb в Spotify` | Same explicit, owner-approved Spotify music command |
| `знайди в Spotify Numb` | Immediately open Spotify search (no API, no Ollama, no confirmation required) |
| `наступна пісня`, `попередній трек` | Spotify next/previous media control |
| `постав музику на паузу`, `продовж музику` | Spotify pause/resume media control |

To control playback, you must **personally connect your Spotify account** through its official browser consent screen. JARVIS cannot log into your account for you and does not ask for your password.

**Spotify setup (at home):**

1. You need an eligible Spotify account with **Spotify Premium** for playback, and a Spotify Developer app with a public **Client ID**. Spotify development-mode access has additional account and user limits as of February 2026; follow Spotify's eligibility rules. Never share a Client Secret.
2. In your Spotify Developer Dashboard, add the redirect URI **`http://127.0.0.1:8765/callback`** exactly.
3. Open Spotify on your PC and **activate playback on the device you want to control** (you may need to manually play something first). JARVIS deliberately does not transfer playback to another person's device.
4. Click **♫ CONNECT SPOTIFY** in JARVIS, enter your **public Client ID**, review the on-screen approval, then grant the two Spotify permissions in the official Spotify browser page.
5. Now try the voice command `Джарвіс, увімкни Numb`. Review the command in JARVIS and press CONFIRM.
6. Spotify may accept playback commands asynchronously; JARVIS reports **"command sent"**, not that the audio definitely started.

**Privacy:** OAuth uses authorization-code **PKCE**, a fixed **127.0.0.1** loopback callback and a random anti-forgery state. The temporary access/refresh tokens exist **only in JARVIS process memory** and disappear when it closes. Only the **public Client ID** is saved in local `settings.json`. There is no Client Secret, embedded Spotify password, credential harvesting or hidden API connection. You must reconnect when starting a fresh JARVIS process. Search queries go to Spotify only after action approval; player searches through Spotify API are not sent to the assistant AI model for autonomous use. The local detailed result may include the track title; spoken online replies use a generic confirmation instead.

**Limitations:** Playback depends on Spotify account eligibility, Premium, API quotas and an active supported Spotify Connect device. The top catalog result can be an alternate version/remaster, so verify the track in Spotify. A spoken song command cannot guarantee that Spotify started playback. When login/Premium is unavailable, both the search request and a play request fall back to the Spotify search page (manual song selection).

**Official Spotify references:** https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow , https://developer.spotify.com/documentation/web-api/reference/start-a-users-playback , https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide

## Safety, privacy and limitations

- JARVIS runs **locally**, only under your signed-in Windows user permissions. It cannot bypass system privilege prompts.
- HANDS-FREE is **off by default**. If enabled, microphone audio is sent to Google's online speech recognizer. Press-to-talk also uses online recognition.
- The default neural voice sends the spoken **text** to Microsoft's online voice service. The `windows` voice profile uses a local Windows voice if an Ukrainian male SAPI voice is installed.
- Ollama AI chat runs on `127.0.0.1:11434`.
- Dictated text and window titles are **not** sent to speech synthesis for UI-typing/window-list actions. Action logs record action type and success/error, not typed text.
- Every foreground click, typing, key, window switch or multi-step operation requires visible approval. **STOP PLAN** cancels pending steps but cannot reliably interrupt an action already executing.
- Password entry, unreviewed scripts, remote access, unrestricted shell execution and system-privilege escalation are deliberately unsupported.
- Avoid payments, password fields, private chats and computers managed by an employer without permission.

## Tests

Run from the extracted folder:

```powershell
python -m py_compile jarvis.py desktop_actions.py window_control.py command_sequences.py assistant_persona.py voice_engine.py spotify_control.py steam_control.py
python -m unittest discover -p "test_*.py" -v
```

The repository contains a GitHub Actions workflow testing Python syntax and pure logic on Windows and Ubuntu. **CI does not verify live microphone recognition, actual voice sound, Tk visual layout on a physical screen, Windows foreground mouse/keyboard, or Steam/Dota installation.** Test those locally when you have access to your PC.

## Source overview

- `jarvis.py` — UI, local chat, settings, actions and approval flow
- `voice_engine.py` — Ukrainian speech, 0–100% playback level
- `assistant_persona.py` — concise Ukrainian sir-style action acknowledgements
- `desktop_actions.py`, `window_control.py` — allowlisted local desktop actions
- `command_sequences.py` — fixed multi-command splitter
- `spotify_control.py` — optional user-authorized Spotify PKCE session and playback API
- `steam_control.py` — local Steam manifests, first-saved-account preference and URI-only game launch
- `Modelfile` — initial Ollama assistant persona
- `test_*.py` — command, permission, voice level and persona tests

## License

MIT. Independent fan-inspired interface; not affiliated with Marvel, Valve or other rights holders.
