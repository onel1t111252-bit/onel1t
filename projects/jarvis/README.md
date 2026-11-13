# ONEL1T JARVIS 3.0 — Windows 11 Desktop Assistant

An owner-controlled Ukrainian voice assistant with local Ollama AI, a resizable sci-fi HUD, **one-command launch for ordinary apps and games**, and separate permission prompts for sensitive Windows automation. It is a prototype, not an administrator, an unrestricted autonomous agent, or remote-control software.

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

## HANDS-FREE and zero-click commands

**No more extra CONFIRM button for ordinary commands.** Saying "Джарвіс, відкрий Steam", "Джарвіс, запусти Доту", "відкрий блокнот", Spotify playback/pause or typing an ordinary app-launch command sends the requested action directly. Explicit owner commands are still required; JARVIS doesn't invent system actions from Ollama conversation.

**Sensitive actions still ask permission** in a native yes/no dialog: text typing, clicks, hotkeys, window switching, screenshots, private file opening, external/untrusted URLs, and notes. This prevents accidental changes from a misheard microphone command. Steam Guard, app account sign-in and Spotify OAuth consent remain separate, official login steps.

**HANDS-FREE:** click "HANDS-FREE: OFF", review the microphone/privacy prompt, then say **"Джарвіс, котра година"** or **"Джарвіс, відкрий Steam"**. The microphone listens for the JARVIS wake word and processes the following command without touching a button. You can also say **"Джарвіс"**, pause, and give a command within approximately 12 seconds. The system ignores phrases that do not contain a recognized wake word, and it pauses listening while JARVIS speaks or processes a command to reduce feedback.

**If HANDS-FREE cannot hear you:** turn it OFF first, then **right-click the HANDS-FREE button** to list Windows input devices; choose the microphone or headset (0 selects the Windows default). Turn HANDS-FREE back ON. This selection is stored locally in \`settings.json\`. In Windows 11, also check Settings → Privacy & security → Microphone → allow microphone access for desktop apps. Run \`INSTALL_VOICE.bat\` in the newly extracted ZIP to install/reinstall audio dependencies. A temporary Google SpeechRecognition connection error no longer switches hands-free OFF immediately, and silence doesn't reset the microphone calibration.

**Privacy and limitations:** Hands-free requires an explicit on/off click and sends recorded speech fragments to Google's online speech recognition service while enabled; it is not an offline wake-word engine. Turning it OFF or closing JARVIS stops further listening, although an ongoing brief recognition request may finish. Internet connection and a Windows-compatible microphone are required. Automated tests cannot guarantee that your particular PC microphone works; test on your computer with "Джарвіс, котра година".

## One-sentence YouTube video search (Ukrainian voice)

JARVIS now understands a **complete search request**, without splitting it
into just "open YouTube" and ignoring the actual topic. Examples:
- \`Джарвіс, знайди відео на ютубі по програмуванню\`
- \`Джарвіс, відкрий YouTube і знайди відео про Python\`
- \`Відкрий ютуб, потім пошукай уроки програмування\`
- \`Покажи відео про кібербезпеку\`

These commands immediately open the **YouTube search results page** in your
default browser, with the **full topic** URL-encoded. They do not just open
YouTube's homepage and do not auto-play an arbitrary video. You choose which
result to watch. The feature works without Ollama, a YouTube API key or an
additional CONFIRM button.

The online microphone recognizer now allows a longer natural phrase (up to
16 seconds in HANDS-FREE), with approximately 1.4 seconds for short speaking
pauses. It cannot guarantee that Google SpeechRecognition never cuts a phrase.
If a command is still cut, check the **YOU 🎤** transcript in the chat and try
speaking the complete request with a short pause. Both typed and voice
commands use the same YouTube routing, so typing the complete request helps
distinguish speech recognition issues from command parsing issues.

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
| `відкрий Steam і запусти Cyberpunk 2077` | Match an **installed game**; if Steam is already signed in, use its verified current account; if closed, try to configure the first saved account and send a Steam AppID launch URI |
| `запусти гру Portal 2` | Find exact/unique installed title and launch through `steam://run/<AppID>` |
| `запусти Доту`, `відкрий стіні запусти Dota 2` | Match an installed Dota 2 entry; voice recognition tolerates the common misheard `стіні` and a missing conjunction |
| `покажи ігри Steam` | Read local game manifests, showing up to 50 installed titles |
| `вибери перший акаунт` | Configure first saved account, then open Steam (only after confirmation) |

**Important account behavior:** "First" means the **first stored entry in `Steam/config/loginusers.vdf`**. Steam's visible account-picker order can differ. The tool reads an existing remembered-login setting and requires `RememberPassword=1`; it neither reads nor requests a Steam password or Steam Guard code. If Steam is closed, it changes **`MostRecent` in `loginusers.vdf`** and the current user's **`HKCU\Software\Valve\Steam\AutoLoginUser`** preference, then asks Steam to open normally. Before changing the file it saves an owner-local backup named `loginusers.vdf.jarvis-backup`. No account data is sent to an online service.

**Fix for Steam not opening due to account selection:** JARVIS now **separates opening Steam from selecting an account**. If the account file, Windows registry, or active-account check cannot be used, the program still sends `steam://open/main`; if the protocol is unregistered, it falls back to the installed `steam.exe`. It reports the account-selection problem on screen instead of pretending a login succeeded. If Steam presents the account chooser, select the account yourself; JARVIS never enters passwords or bypasses Steam Guard. One-time sign-in setup is not guaranteed to suppress the Steam client's chooser.

**Games remain guarded:** If the currently logged-in Steam account cannot be verified (for example, while the Steam account picker is displayed), JARVIS opens Steam but does **not start the game on an unverified account**. Select the correct account, finish signing in, and repeat the game command. When an existing session can be verified against locally saved accounts, JARVIS uses that active session rather than incorrectly requiring the first entry in `loginusers.vdf`.

**To install this fix:** download the **current ZIP** again, extract to a new folder (or replace the app's Python source files while JARVIS is closed) and relaunch `START_JARVIS.bat`. The previously extracted folder does not update itself.

**If Steam is running:** JARVIS checks the locally reported Steam `ActiveUser` and matches it to a **saved signed-in account**, regardless of its position in `loginusers.vdf`. It shows which account would be used. A voice request to launch a game then uses that **already logged-in account**; it never logs out, closes a game or silently changes the Steam account. If Steam is still showing its account chooser or its active account is unknown, finish signing in yourself and retry. **If Steam is closed:** JARVIS keeps its prior best-effort first-saved-account preference logic before requesting a launch. Steam may still ask who is playing.

**To prevent Steam asking for an account every launch:** open Steam yourself once, choose the account you want, enable **Remember me / Запам'ятати вхід** if offered, then open **Steam → Settings → Interface** and turn **OFF** **Ask which account to use each time Steam starts** (English setting name; Ukrainian localization may differ). The client normally reuses the last signed-in account; this **does not guarantee choosing the first visible tile automatically**. JARVIS deliberately does not click arbitrary positions in the account chooser, input passwords or bypass Steam Guard.

**Limitations:** Steam must be installed on Windows, the first account must already have a remembered login, and the requested game must appear as **installed** in the detected Steam library manifests. Games that are purchased but **not installed** cannot be launched this way. Steam can still display its own account chooser, login, Steam Guard or game-license dialog; complete those in Steam yourself. If you enabled "Ask which account to use each time Steam starts", disable that option in Steam settings to allow remembered auto-login. JARVIS only confirms that the `steam://` launch request was sent, not that the game successfully started. Steam account ownership and age restrictions remain in effect.

**Why approval is required:** Selecting an account changes local sign-in preferences; starting an app/game is a visible local action. Every `steam_open_first` and `steam_game` action shows its purpose in JARVIS and needs an explicit **CONFIRM**. There is no automated password entry, credentials storage, Steam Guard workaround or game-file execution.

## Spotify fix: missing Windows playback data ≠ song failed

**Do not treat an absent Windows Media Session as a Spotify playback failure.**
A user may have the installed Spotify application open and playing while
Windows returns no track metadata. After the desktop search shortcut is sent,
JARVIS now reports **UNVERIFIED** instead of a false "action failed" error in
that case, without launching a web browser. Verified wrong tracks or a
confirmed paused state still produce a clear warning; no action claims a
correct song played unless the platform actually reports it.

**"Відтвори поточний трек" and "продовж відтворення"** now mean "resume the
already selected Spotify song", not a search for a song called "поточний
трек". The native command first tries an existing Spotify Windows Media
Session's idempotent PLAY operation. If that interface is unavailable, it
sends Windows \`WM_APPCOMMAND / APPCOMMAND_MEDIA_PLAY\` to the verified Spotify
desktop window (an explicit Play request, not the Space Play/Pause toggle).
If Spotify does not support that command, manual playback may still be
required. On-screen text distinguishes sending Play from verified audio.

**Diagnosing the reported example:** say
\`Джарвіс, увімкни пісню Jingle Bells Spotify\`, then view the **Spotify
desktop window**, not just JARVIS's transcript. If Quick Search shows
suggestions but nothing plays, capture the Spotify window with the track
list visible; version-specific selection may need a different control.
If music is already playing, but **SPOTIFY STATUS** says Windows has no
media data, that is a Windows telemetry limitation, not proof the command
failed. For precise selection of a particular "Jingle Bells" recording,
include the artist's name — Spotify has multiple versions.

## Spotify playback verification fix (November 2026)

The previous desktop Spotify code opened Quick Search (\`Ctrl+K\`), typed a
song, and pressed \`Enter\` **without selecting a suggestion**. Depending on
the Spotify build this can navigate to a search page instead of playing.

The new route waits for the suggestions, explicitly uses \`Down\` to select
a suggestion and then \`Enter\` to request playback. It also checks the
**Windows Media Session** via \`winsdk\` to see whether Spotify is **actually
playing the requested song**, comparing the song title **and** artist words.
If the result is wrong or playback is paused, JARVIS reports a failure.
If Windows media information is **unavailable**, JARVIS reports
**UNVERIFIED** rather than failing or claiming the song is playing. JARVIS cannot guarantee the correct
suggestion exists in every Spotify version; for exact playback when supported,
the authorized Spotify Web API remains an option. API search itself now
rejects catalog results that do not contain all requested title/artist words.

**Install:** close JARVIS, extract the newly published ZIP and **run
\`INSTALL_VOICE.bat\` again**. The requirements install \`winsdk\` on Windows
with Python 3.12 so the track/status verification can function. Open the
Spotify desktop app and sign in. The Windows media session may not be
available on all Spotify installations. No audio recording, credentials,
browser cookies or private data is collected by this verification.

**Diagnose:** press **♫ SPOTIFY STATUS** in JARVIS, or say
\`Джарвіс, статус Spotify\`. This read-only command tells you whether the
installed Spotify.exe window is detected and, if Windows exposes it,
the current song and whether playback is running. If Spotify is detected
but no media info is visible, manually play one song in the desktop app
and check STATUS again. When reporting a problem, send the JARVIS status
message and a screenshot of the Spotify window without exposing account
credentials; that will distinguish a Spotify window/focus problem from a
search-result or account/playback problem.

## 🎵 Spotify: play songs in the INSTALLED Windows app

**The key difference: "увімкни/включи/відтвори пісню" is a PLAY command, not a web search.**
For example:
- \`Джарвіс, увімкни пісню Numb в Spotify\`
- \`Джарвіс, включи пісню в Спотіфай Numb\`
- \`Джарвіс, увімкни Linkin Park Numb\`
- Click **♫ PLAY IN SPOTIFY** and enter the song/artist.

JARVIS first tries an already authorized, **active desktop Computer** through the optional Spotify Web API. If the API is not connected, is unavailable or refuses playback, it uses the **installed Spotify.exe Windows app** directly. It identifies the real Spotify process/window (not a web browser), brings it to the foreground, opens Spotify's native Quick Search with **Ctrl+K**, types the title (Ukrainian/Unicode supported, no clipboard), waits for suggestions, explicitly presses **Down** to select one, then **Enter**. It verifies the reported track/status through Windows media sessions when available. This is a best-effort playback request: Spotify's interface, account state, network and result order may change. JARVIS now checks the Windows media session and refuses to report verified success when the track cannot be confirmed. JARVIS reports the attempt rather than claiming it definitely played.

**This desktop route requires no Spotify Developer app, Client ID, Premium API access or Ollama.** It requires Windows, the installed Spotify app and a signed-in Spotify account whose playback is available. It may work with Spotify Free subject to Spotify's own playback restrictions. If the app is not open, JARVIS tries the registered \`spotify:\` Windows protocol, then verifies a genuine Spotify.exe window before sending **any keys**. If Windows refuses to bring Spotify to the foreground or the app isn't installed, JARVIS explains the issue; it **does not open Google or browser search as a hidden fallback**.

**"Знайди пісню ... у Spotify" remains a separate explicit SEARCH command**. It opens a normal Spotify browser search for manual selection. If you specifically want audio playback in the installed app, say **"увімкни"** or **"включи"** rather than "знайди".

| Command | JARVIS behavior |
| --- | --- |
| \`відкрий Spotify\` | Launch installed app if discoverable in Windows Start menu |
| \`увімкни пісню Numb у Spotify\` | Try to play the first matching track in installed Spotify (NO Google/browser fallback) |
| \`відкрий Spotify і увімкни Numb\` | Open Spotify then play via optional API or the local Quick Search |
| \`знайди пісню Numb у Spotify\` | Explicit browser search only, no automatic playback |
| \`постав музику на паузу\`, \`наступна пісня\` | Spotify Web API controls when an authorized active player is connected |

**Optional Spotify API (Premium/Developer account):** The button **♫ CONNECT API (OPTIONAL)** still offers the official Spotify OAuth PKCE flow, for those who want more precise track catalog matching and player controls. It needs a valid *public* Spotify Developer Client ID, the exact \`http://127.0.0.1:8765/callback\` redirect URI configured on the user's app, an eligible Spotify account, Premium for API playback, and permission on the official Spotify authorization page. API tokens remain in JARVIS process memory only; the public Client ID is saved in local settings. Spotify's API integration currently targets only an **active Computer device** and never silently redirects requested computer playback to a phone or speaker.

**Privacy and safety:** The local native route does not scrape Spotify credentials, touch stored passwords, inspect browser cookies or expose your system clipboard. It only types a validated, short song query into the verified Spotify application after your explicit play command, and stops if focus changes. No guarantee of auto-start: if JARVIS says the desktop request was sent but no music plays, check the Spotify window, which account is signed in and whether the top search result is selectable.

**Official reference:** https://support.spotify.com/us/article/keyboard-shortcuts/ (Ctrl+K Quick Search). Spotify staff have confirmed pressing Enter on a Quick Search suggestion initiates playback, though desktop releases can vary. API playback requirements: https://developer.spotify.com/documentation/web-api/reference/start-a-users-playback

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
- `spotify_desktop.py` — safe, best-effort Windows Spotify desktop Quick Search and playback without an API
- `steam_control.py` — local Steam manifests, first-saved-account preference and URI-only game launch
- `Modelfile` — initial Ollama assistant persona
- `test_*.py` — command, permission, voice level and persona tests

## License

MIT. Independent fan-inspired interface; not affiliated with Marvel, Valve or other rights holders.
