# JARVIS — Installation and Setup for Windows 11

[Українська](README.md) · **English**

A Ukrainian-language desktop assistant with voice commands, local AI through Ollama, YouTube, Spotify, Steam and supported Windows actions.

**[Download the latest Jarvis.zip](https://github.com/onel1t111252-bit/onel1t/raw/refs/heads/main/projects/jarvis/Jarvis.zip)** · [Project page](https://onel1t111252-bit.github.io/onel1t/projects/jarvis/)

This is the English setup guide. The current speech configuration uses Ukrainian; the command examples below remain in Ukrainian so you can use them as written. Translating this guide does not switch the app's speech recognition or command language to English.

## 1. Install Python and Ollama

**Python 3.12, 64-bit.** Open the [official Python 3.12.10 page](https://www.python.org/downloads/release/python-31210/), scroll to **Files** and choose **Windows installer (64-bit)**. During installation, enable **Add python.exe to PATH** and **Python Launcher**, if offered.

JARVIS startup scripts use `py -3.12` when Python Launcher is installed. Having only a different Python version is not enough. Open a new PowerShell window and check:

```powershell
py -3.12 --version
```

Expected output: `Python 3.12.x`. If this already works, you do not need to reinstall Python.

**Ollama.** Install [Ollama for Windows](https://ollama.com/download/windows), start it, then check in a new PowerShell window:

```powershell
ollama list
```

An empty list after a fresh installation is normal: you will download the AI model below. Ollama is needed for AI conversations; predefined commands can work without it.

You also need a microphone, headphones or speakers, and an internet connection to install components. Models are downloaded separately from the ZIP and require additional disk space.

## 2. Download and extract JARVIS

1. Download **Jarvis.zip** using the link above.
2. Right-click the archive and select **Extract all**.
3. Choose a permanent location, such as a `Jarvis` folder in Documents.
4. Open the extracted folder. It should contain `jarvis.py`, `requirements.txt` and the `.bat` scripts.

**Do not run JARVIS from inside the ZIP.** Run all the following scripts from the extracted folder.

## 3. Run the installers in this order

Double-click each script and wait for it to finish before starting the next one.

| Order | File | Purpose |
| --- | --- | --- |
| 1 | `INSTALL_VOICE.bat` | Installs core dependencies for microphone input, spoken replies, Spotify controls and YouTube search through yt-dlp. |
| 2 | `INSTALL_AI.bat` | Downloads `qwen3.5:4b` through Ollama for AI conversations. Requires internet access and several GB of free space. |
| 3 | `INSTALL_SPEECH.bat` | Installs local Whisper small speech recognition and downloads a model of approximately 500 MB. Recommended for voice commands; Google Speech is used without it. |
| 4 | `START_JARVIS.bat` | Starts JARVIS after installation. |

**Installation successful / Installation complete / installed** indicates that the corresponding step has finished. If you see **failed**, save the error text or take a screenshot: that component was not installed successfully.

Whisper is stored in `models/whisper-small` and is used automatically after restarting JARVIS. Keep this folder. It runs on the CPU; initial model loading and transcription may take longer on less powerful computers.

**Optional:** `UPGRADE_AI_9B.bat` installs the larger `qwen3.5:9b` AI model, which needs more resources. It is not required for the first launch. This script does not change microphone recognition, which is handled by Whisper or Google.

## 4. Check the first launch and microphone

1. Run `START_JARVIS.bat`.
2. Under **INTELLIGENCE**, select **AI: QWEN3.5:4B** if another model is shown, then click **CHECK AI**. Ollama must be running and the model must be installed. The model selection button does not download models.
3. Click **TEST VOICE**. If necessary, check the Windows audio output device and JARVIS's **VOICE VOLUME** setting.
4. Type `відкрий блокнот` (open Notepad). This checks command execution independently of the microphone.
5. Enable **HANDS-FREE** and read the microphone notice. Stay quiet during calibration and wait for **«Мікрофон готовий»** (Microphone ready).
6. Say **«Джарвіс, котра година?»** (Jarvis, what time is it?).

To select a microphone: turn HANDS-FREE off, **right-click its button**, choose an input device, then turn the mode on again. In the device list, `0` means the Windows default microphone.

In Windows, check **Settings → Privacy & security → Microphone**, including access for desktop apps.

Start voice commands with **«Джарвіс»**. Alternatively, say the wake word, wait for the response and give your command within approximately 12 seconds. Avoid pauses longer than 1.8 seconds within a sentence. JARVIS temporarily stops listening for new commands while speaking or executing an action.

## 5. Example commands

Use the Ukrainian phrases in the first column. The second column explains what each command does in English.

| Command | Result |
| --- | --- |
| `Джарвіс, увімкни відео в ютубі опенінг токійського` | Opens the first YouTube video found for the requested opening theme. If the browser blocks autoplay, press Play. |
| `Джарвіс, знайди відео на ютубі про Python` | Opens YouTube search results for videos about Python, for manual selection. |
| `Джарвіс, увімкни пісню Numb Linkin Park у Spotify` | Requests playback in the installed Spotify app. The desktop route plays the already highlighted first Quick Search result. |
| `Джарвіс, знайди пісню Numb у Spotify` | Opens Spotify search in a browser. This is a separate search command. |
| `Джарвіс, статус Spotify` | Shows available information about the Spotify app and playback. |
| `Джарвіс, відкрий Steam і запусти Доту` | Launches the installed Dota game through Steam. |

**Spotify:** install the desktop app, sign in and check that you can play music manually. **CONNECT API (OPTIONAL)** is not required for normal desktop control. Do not switch the active window while JARVIS is entering the search query. Track availability and playback depend on Spotify. Missing Windows playback information does not prove that music is not playing.

**Steam:** install Steam and the game, then sign in. If Steam is running, JARVIS uses the active account. If it is closed, JARVIS attempts to select the first saved account. Enter your password or Steam Guard code yourself if requested.

## 6. Update without losing settings

1. Close JARVIS.
2. Back up your folder, or at least `settings.json` and `models/`.
3. Download the latest **Jarvis.zip**, extract it and copy its files into your existing JARVIS folder, **replacing the program files**.
4. Keep `settings.json` and `models/` in place. Your personal settings and downloaded Whisper model are not included in the ZIP.
5. Run `INSTALL_VOICE.bat` to install any new dependencies.
6. If Whisper is not installed or its installation failed, run `INSTALL_SPEECH.bat`. If it already works, you do not need to reinstall it.
7. Run `START_JARVIS.bat` from the updated folder. Check that an old shortcut is not pointing to another copy.

You do not need to reinstall Python, Ollama or an already installed AI model after every update. If you move JARVIS to a new folder, also move `settings.json` and `models/`.

## Troubleshooting

| Problem | What to check |
| --- | --- |
| `No suitable Python runtime found` | Check `py -3.12 --version` and install Python 3.12. |
| `No module named ...` | Run `INSTALL_VOICE.bat`. For Whisper dependencies, run `INSTALL_SPEECH.bat`. |
| AI conversations do not work | Start Ollama, check `ollama list`, run `INSTALL_AI.bat`, select QWEN3.5:4B and click CHECK AI. |
| The microphone is not heard | Check Windows permissions, select the input device by right-clicking HANDS-FREE and wait for calibration. |
| A song title is transcribed incorrectly | Check the **YOU 🎤** transcript, reduce background music and include the artist. Install Whisper and restart. Compare by typing the same command. |
| Whisper is too slow | To return to Google: close JARVIS, rename `models/whisper-small`, then restart. |
| YouTube cannot find a video | Check your internet connection and run INSTALL_VOICE.bat. To update yt-dlp, run `py -3.12 -m pip install --upgrade yt-dlp`. |
| Spotify does not play the requested track | Check manual playback, include the song title and artist, and use `статус Spotify`. |
| Nothing changes after updating | Check the folder containing the START_JARVIS.bat you run and the target of any old shortcut. |

For diagnosis, useful details include a screenshot of **YOU 🎤 + JARVIS's reply**, the installer error text and `jarvis.log` from the program folder. Speech accuracy depends on your microphone, pronunciation and background noise.

## Local and online components

- **Ollama:** AI conversations and interpretation of supported requests use the local server at `127.0.0.1:11434`.
- **Whisper:** once installed, the model processes audio locally in memory without saving recordings to disk. If the model is missing or an error occurs, **Google Speech** is used and receives audio fragments. A notice appears if Whisper fails.
- **Spoken replies:** default voices send text to Microsoft. WINDOWS uses an installed local Ukrainian voice when available; optional STUDIO uses a separately configured paid API.
- **YouTube and Spotify:** search and playback require internet access. YouTube videos are not downloaded to disk.
- You switch **HANDS-FREE** on and off yourself. Ordinary explicit commands run without another confirmation button; sensitive actions, such as typing or clicking, may require approval.

## Additional features

- **VOICE / TEST VOICE / VOICE VOLUME** control spoken replies, not microphone recognition.
- **JARVIS MODE** changes the reply style; **WINDOW: COMPACT / LARGE** changes the window size.
- `перевір цей email на фішинг` checks a selected local `.eml` file for basic phishing indicators without opening attachments. It does not guarantee that an email is safe.
- `перевір безпеку локальної мережі` runs passive Windows network diagnostics, not a vulnerability scan of all devices.
- `задеплой ONEL1T` publishes tracked changes from the supported local Git checkout after review and confirmation.

Source code and tests are available in this folder. Automated tests do not replace checking your microphone and desktop apps on your own PC.

MIT license. An independent educational project, not affiliated with Marvel, Valve or Spotify.
