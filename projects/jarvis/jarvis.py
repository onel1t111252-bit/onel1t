"""ONEL1T JARVIS 3.0 - local desktop assistant for Windows 11.

Ollama handles chat locally. SpeechRecognition's Google recognizer needs internet
and sends recorded speech to Google (including during optional wake mode).
Only allowlisted commands can open applications or websites.
"""
from __future__ import annotations

import datetime as dt
import json
import logging
import os
from pathlib import Path
import queue
import re
import subprocess
import threading
import tkinter as tk
from tkinter import scrolledtext
import urllib.error
import urllib.parse
import urllib.request
import webbrowser

from voice_engine import speak, VOICE_PROFILES, LABELS

APP_DIR = Path(__file__).resolve().parent
SETTINGS_PATH = APP_DIR / "settings.json"
MODEL = os.getenv("JARVIS_MODEL", "jarvis")
API = "http://127.0.0.1:11434"
BG, PANEL, FIELD = "#070d18", "#111d2e", "#1b2b3b"
CYAN, TEXT, MUTED, GREEN = "#23d3fc", "#e5f5ff", "#91aabe", "#64efb0"
PROMPT = (
    "Тебе звати Джарвіс. Ти персональний ШІ-помічник для Windows 11. "
    "Завжди відповідай природною українською мовою, стисло й коректно. "
    "Не вигадуй, що виконав дію на комп'ютері. "
    "Не проси паролі й не стверджуй, що маєш необмежений доступ до системи."
)
logging.basicConfig(filename=APP_DIR / "jarvis.log", level=logging.WARNING,
                    format="%(asctime)s %(levelname)s %(message)s",
                    encoding="utf-8")


def check_model() -> tuple[bool, str]:
    try:
        with urllib.request.urlopen(API + "/api/tags", timeout=4) as response:
            items = json.loads(response.read().decode("utf-8")).get("models", [])
        names = [x.get("name", "") for x in items]
        if MODEL in names or MODEL + ":latest" in names:
            return True, "AI ONLINE · " + MODEL
        return False, "MODEL MISSING · " + MODEL
    except (OSError, ValueError):
        return False, "OLLAMA OFFLINE"


def extract_wake_command(text: str) -> str | None:
    """Return the command after wake word, empty string for wake-only, or None."""
    found = re.search(r"(?:джарвіс|джарвис|jarvis)\b[\s,!:;.-]*(.*)", text, re.I)
    return found.group(1).strip() if found else None


def load_settings() -> dict:
    try:
        return json.loads(SETTINGS_PATH.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return {}


def resolve_command(raw: str) -> tuple[str, str] | None:
    """Pure allowlist router. No arbitrary shell command execution."""
    q = re.sub(r"\s+", " ", raw.casefold().strip())
    q = re.sub(r"^(?:джарвіс|джарвис|jarvis)[,!: ]*", "", q).strip(" ?!.")
    if q in {"привіт", "вітаю", "hello", "hi"}:
        return "say", "Вітаю! Джарвіс на зв'язку."
    if q in {"допомога", "команди", "help", "що ти вмієш"}:
        return "say", ("Можу відповісти на запитання, відкрити блокнот, калькулятор, "
                       "провідник, Paint, налаштування, YouTube, Google, GitHub "
                       "або виконати пошук. Скажи «котра година».")
    if q in {"хто ти", "як тебе звати"}:
        return "say", "Я Джарвіс — твій персональний ШІ-асистент."
    if q in {"котра година", "яка година", "скільки часу"}:
        return "say", "Зараз " + dt.datetime.now().strftime("%H:%M") + "."
    if q in {"яка дата", "який сьогодні день", "яке сьогодні число"}:
        return "say", "Сьогодні " + dt.datetime.now().strftime("%d.%m.%Y") + "."
    m = re.fullmatch(r"(?:відкрий|відкрити|запусти|запустити|open)\s+(.+)", q)
    if m:
        target = m.group(1).strip(" ?!.")
        urls = {"ютуб": "https://youtube.com", "youtube": "https://youtube.com",
                "гугл": "https://google.com", "google": "https://google.com",
                "браузер": "https://google.com", "гітхаб": "https://github.com",
                "github": "https://github.com"}
        programs = {"блокнот": "notepad.exe", "notepad": "notepad.exe",
                    "калькулятор": "calc.exe", "calculator": "calc.exe",
                    "провідник": "explorer.exe", "explorer": "explorer.exe",
                    "paint": "mspaint.exe", "пейнт": "mspaint.exe"}
        if target in urls:
            return "url", urls[target]
        if target in programs:
            return "app", programs[target]
        if target in {"параметри", "налаштування", "settings"}:
            return "settings", "ms-settings:"
        return "say", "Поки що ця команда не підтримується. Скажи «допомога»."
    m = re.fullmatch(r"(?:знайди|загугли|пошукай|search)\s+(.+)", q)
    if m:
        return "url", "https://www.google.com/search?q=" + urllib.parse.quote_plus(m.group(1))
    return None


def execute_command(command: tuple[str, str]) -> str:
    action, value = command
    if action == "say":
        return value
    if action == "url":
        webbrowser.open(value)
        return "Відкриваю сторінку у браузері."
    if os.name != "nt":
        return "Ця дія доступна тільки у Windows."
    if action == "app":
        subprocess.Popen([value], shell=False)
        return "Запускаю програму."
    if action == "settings":
        os.startfile(value)
        return "Відкриваю параметри Windows."
    return "Команда не підтримується."


def chat_with_ollama(user_text: str, history: list[dict[str, str]]) -> str:
    messages = [{"role": "system", "content": PROMPT}] + history[-10:]
    messages.append({"role": "user", "content": user_text})
    body = {"model": MODEL, "messages": messages, "stream": False,
            "think": False, "options": {"temperature": 0.55, "num_predict": 300}}
    request = urllib.request.Request(
        API + "/api/chat", data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(request, timeout=150) as response:
            data = json.loads(response.read().decode("utf-8"))
        answer = (data.get("message", {}).get("content") or "").strip()
        if answer:
            history.extend([{"role": "user", "content": user_text},
                            {"role": "assistant", "content": answer}])
            del history[:-10]
            return answer
        return "Модель не повернула текстової відповіді."
    except urllib.error.HTTPError as exc:
        if exc.code == 404:
            return "Модель не знайдена. Перевір командою: ollama list."
        return "Помилка Ollama HTTP " + str(exc.code)
    except (OSError, ValueError):
        return "Не можу підключитися до Ollama. Перевір, чи вона запущена."


class JarvisApp:
    def __init__(self, root: tk.Tk) -> None:
        self.root = root
        self.events: queue.Queue[tuple[str, str]] = queue.Queue()
        self.speech_queue: queue.Queue[str] = queue.Queue()
        self.mic_lock = threading.Lock()
        self.wake_enabled = threading.Event()
        self.speaking = threading.Event()
        self.awaiting_command = False
        self.settings = load_settings()
        self.running = True
        self.busy = False
        self.voice_on = bool(self.settings.get("voice_on", True))
        self.voice_profile = self.settings.get("voice_profile", VOICE_PROFILES[0])
        if self.voice_profile not in VOICE_PROFILES:
            self.voice_profile = VOICE_PROFILES[0]
        self.history: list[dict[str, str]] = []
        root.title("ONEL1T | JARVIS 3.1")
        root.geometry("980x730")
        root.minsize(740, 590)
        root.configure(bg=BG)
        root.protocol("WM_DELETE_WINDOW", self.close)

        frame = tk.Frame(root, bg=BG)
        frame.pack(fill="x", padx=30, pady=(23, 7))
        tk.Label(frame, text="◈  ONEL1T  /  JARVIS 3.1", bg=BG, fg=CYAN,
                 font=("Segoe UI", 22, "bold")).pack(anchor="w")
        tk.Label(frame, text="PERSONAL AI SYSTEM  •  WINDOWS 11  •  УКРАЇНСЬКА",
                 bg=BG, fg=MUTED, font=("Consolas", 10)).pack(anchor="w", pady=(5, 0))

        top = tk.Frame(root, bg=BG)
        top.pack(fill="x", padx=30, pady=(8, 10))
        self.orb = tk.Canvas(top, width=108, height=108, bg=BG, highlightthickness=0)
        self.orb.pack(side="left", padx=(0, 18))
        self.orb.create_oval(9, 9, 99, 99, outline="#173956", width=3)
        self.orb.create_oval(17, 17, 91, 91, outline=CYAN, width=2)
        self.orb.create_oval(27, 27, 81, 81, fill="#123348", outline="#247999")
        self.orb.create_text(54, 54, text="J", fill=CYAN,
                             font=("Segoe UI", 27, "bold"))
        side = tk.Frame(top, bg=BG)
        side.pack(side="left", fill="x", expand=True)
        self.model_label = tk.Label(side, text="CHECKING AI…", bg=BG, fg=MUTED,
                                    font=("Consolas", 12, "bold"))
        self.model_label.pack(anchor="w")
        tk.Label(side, text="Local inference: Ollama • AI replies stay on your device",
                 bg=BG, fg=MUTED, font=("Segoe UI", 10)).pack(anchor="w", pady=(5, 0))
        tk.Button(top, text="↻  CHECK AI", command=self.check_ai,
                  bg=FIELD, fg=TEXT, relief="flat", padx=16, pady=10,
                  font=("Segoe UI", 10), cursor="hand2").pack(side="right")

        self.chat = scrolledtext.ScrolledText(
            root, bg=PANEL, fg=TEXT, insertbackground=CYAN, wrap="word",
            font=("Segoe UI", 11), padx=16, pady=14, relief="flat",
            borderwidth=0, state="disabled")
        self.chat.pack(fill="both", expand=True, padx=30, pady=(7, 12))
        self.chat.tag_configure("ai", foreground=CYAN, spacing1=6)
        self.chat.tag_configure("human", foreground=TEXT, spacing1=6)
        self.chat.tag_configure("hint", foreground=MUTED, spacing1=6)

        line = tk.Frame(root, bg=BG)
        line.pack(fill="x", padx=30)
        self.input = tk.Entry(line, bg=FIELD, fg=TEXT, insertbackground=CYAN,
                              relief="flat", font=("Segoe UI", 12))
        self.input.pack(side="left", fill="x", expand=True, ipady=12, ipadx=12)
        self.input.bind("<Return>", lambda _event: self.send())
        self.button(line, "SEND", self.send, CYAN, BG)
        self.button(line, "🎤  TALK", self.push_to_talk, FIELD, TEXT)

        controls = tk.Frame(root, bg=BG)
        controls.pack(fill="x", padx=30, pady=(11, 4))
        self.wake_button = self.button(controls, "🎙 HANDS-FREE: OFF", self.toggle_wake,
                                       FIELD, TEXT, side="left")
        self.tts_button = self.button(controls, "🔊 VOICE: ON" if self.voice_on else "🔇 VOICE: OFF",
                                      self.toggle_tts, FIELD, TEXT, side="left")
        self.profile_button = self.button(
            controls, "VOICE: " + LABELS[self.voice_profile],
            self.cycle_voice, FIELD, TEXT, side="left")
        self.button(controls, "TEST VOICE", self.test_voice, FIELD, TEXT, side="left")
        self.status = tk.Label(controls, text="● READY", bg=BG, fg=GREEN,
                               font=("Consolas", 10))
        self.status.pack(side="right")
        tk.Label(root, text=("PRIVACY • Google handles voice recognition online, including wake mode. "
                            "Microsoft handles neural speech text online. Turn HANDS-FREE OFF to stop listening."),
                 fg=MUTED, bg=BG, font=("Segoe UI", 9),
                 wraplength=920).pack(pady=(5, 16), padx=24)

        self.append("JARVIS", "Готовий до роботи. Натисни HANDS-FREE один раз, "
                    "а далі кажи «Джарвіс, відкрий блокнот» без кнопки.", "ai")
        self.input.focus_set()
        root.after(80, self.pump)
        root.after(150, self.check_ai)
        threading.Thread(target=self.speech_worker, daemon=True).start()
        if self.settings.get("wake_on", False):
            root.after(700, self.toggle_wake)

    def save_settings(self) -> None:
        payload = {
            "voice_on": self.voice_on,
            "voice_profile": self.voice_profile,
            "wake_on": self.wake_enabled.is_set(),
        }
        try:
            SETTINGS_PATH.write_text(json.dumps(payload, ensure_ascii=False, indent=2),
                                     encoding="utf-8")
        except OSError:
            logging.warning("Could not save local preferences")

    def cycle_voice(self) -> None:
        idx = VOICE_PROFILES.index(self.voice_profile)
        self.voice_profile = VOICE_PROFILES[(idx + 1) % len(VOICE_PROFILES)]
        self.profile_button.configure(text="VOICE: " + LABELS[self.voice_profile])
        self.save_settings()

    def test_voice(self) -> None:
        if self.voice_on:
            self.speaking.set()
            self.speech_queue.put("Вітаю! Я Джарвіс. Голосові системи активовано.")
        else:
            self.append("ПІДКАЗКА", "Увімкни VOICE: ON для тестування.", "hint")

    def button(self, parent, title, action, bg, fg, side="left"):
        widget = tk.Button(parent, text=title, command=action, bg=bg, fg=fg,
                           relief="flat", padx=13, pady=10, cursor="hand2",
                           font=("Segoe UI", 9, "bold"))
        widget.pack(side=side, padx=(8, 0))
        return widget

    def append(self, sender: str, message: str, tag: str) -> None:
        self.chat.configure(state="normal")
        self.chat.insert("end", sender + ": " + message + "\n\n", tag)
        self.chat.configure(state="disabled")
        self.chat.see("end")

    def check_ai(self) -> None:
        self.model_label.configure(text="CHECKING AI…", fg=MUTED)
        def worker():
            ok, msg = check_model()
            self.events.put(("model", ("1" if ok else "0") + msg))
        threading.Thread(target=worker, daemon=True).start()

    def send(self) -> None:
        if self.busy:
            return
        text = self.input.get().strip()
        if text:
            self.input.delete(0, "end")
            self.submit(text, False)

    def submit(self, text: str, from_mic: bool) -> None:
        if self.busy:
            return
        self.busy = True
        self.append("ТИ 🎤" if from_mic else "ТИ", text, "human")
        self.status.configure(text="● PROCESSING", fg=CYAN)
        threading.Thread(target=self.answer_worker, args=(text,), daemon=True).start()

    def answer_worker(self, text: str) -> None:
        try:
            local = resolve_command(text)
            answer = execute_command(local) if local is not None else chat_with_ollama(text, self.history)
        except Exception:
            logging.exception("Could not process request")
            answer = "Сталася помилка. Дивись jarvis.log."
        self.events.put(("answer", answer))
        self.events.put(("ready", ""))

    def toggle_tts(self) -> None:
        self.voice_on = not self.voice_on
        self.tts_button.configure(text="🔊 VOICE: ON" if self.voice_on else "🔇 VOICE: OFF")
        self.save_settings()

    def push_to_talk(self) -> None:
        if self.busy or self.speaking.is_set() or self.mic_lock.locked():
            return
        if self.wake_enabled.is_set():
            self.toggle_wake()
        threading.Thread(target=self.listen_once, args=(False,), daemon=True).start()

    def listen_once(self, wake: bool) -> None:
        if not self.mic_lock.acquire(blocking=False):
            return
        try:
            import speech_recognition as sr
            self.events.put(("status", "● LISTENING"))
            recognizer = sr.Recognizer()
            with sr.Microphone() as mic:
                recognizer.adjust_for_ambient_noise(mic, duration=0.4)
                audio = recognizer.listen(mic, timeout=4 if wake else 7,
                                          phrase_time_limit=8 if wake else 12)
            # recognize_google sends a speech sample to Google's online service.
            text = recognizer.recognize_google(audio, language="uk-UA").strip()
            if wake:
                command = extract_wake_command(text)
                if command is None:
                    return
                if command:
                    self.events.put(("heard", command))
                else:
                    self.awaiting_command = True
                    self.events.put(("hint", "Слухаю наступну команду…"))
            else:
                self.events.put(("heard", text))
        except ImportError:
            self.events.put(("hint", "Встанови голосові бібліотеки через INSTALL_VOICE.bat."))
            self.wake_enabled.clear()
            self.save_settings()
        except Exception as exc:
            name = type(exc).__name__
            if name not in {"WaitTimeoutError", "UnknownValueError"}:
                logging.warning("Voice input issue: %s", name)
                self.events.put(("hint", "Помилка мікрофона/мережі: " + name))
                if wake and name in {"OSError", "RequestError"}:
                    self.wake_enabled.clear()
                    self.save_settings()
            elif not wake:
                self.events.put(("hint", "Не почув або не розібрав голос. Спробуй ще раз."))
        finally:
            self.mic_lock.release()
            self.events.put(("status", "● READY"))

    def toggle_wake(self) -> None:
        if self.wake_enabled.is_set():
            self.wake_enabled.clear()
            self.awaiting_command = False
            self.wake_button.configure(text="🎙 HANDS-FREE: OFF", bg=FIELD)
            self.append("СИСТЕМА", "Прослуховування мікрофона вимкнено.", "hint")
        else:
            self.wake_enabled.set()
            self.wake_button.configure(text="🎙 HANDS-FREE: ON", bg="#174b64")
            self.append("СИСТЕМА",
                        "Голосова активація працює: скажи «Джарвіс, котра година» "
                        "або «Джарвіс», а потім окремо команду. "
                        "Аудіо розпізнає онлайн-сервіс Google.", "hint")
            threading.Thread(target=self.wake_worker, daemon=True).start()
        self.save_settings()

    def wake_worker(self) -> None:
        while self.running and self.wake_enabled.is_set():
            if self.busy or self.speaking.is_set() or self.mic_lock.locked():
                threading.Event().wait(0.2)
                continue
            followed_up = self.awaiting_command
            self.awaiting_command = False
            self.listen_once(not followed_up)
        self.events.put(("wake_off", ""))

    def speech_worker(self) -> None:
        while self.running:
            phrase = self.speech_queue.get()
            if not phrase or not self.running:
                continue
            self.speaking.set()
            self.events.put(("status", "● SPEAKING"))
            worked = speak(phrase, self.voice_profile)
            if not worked:
                self.events.put(("hint", "Не вдалося відтворити голос. "
                                 "Запусти INSTALL_VOICE.bat або вибери WINDOWS."))
            # Delay avoids microphone hearing speaker echo at the end of the reply.
            threading.Event().wait(0.5)
            if self.speech_queue.empty():
                self.speaking.clear()
            self.events.put(("status", "● READY"))

    def pump(self) -> None:
        try:
            while True:
                kind, value = self.events.get_nowait()
                if kind == "answer":
                    self.append("JARVIS", value, "ai")
                    if self.voice_on:
                        self.speaking.set()
                        self.speech_queue.put(value)
                elif kind == "ready":
                    self.busy = False
                    self.status.configure(text="● READY", fg=GREEN)
                elif kind == "heard":
                    if not self.busy:
                        self.submit(value, True)
                elif kind == "hint":
                    self.append("ПІДКАЗКА", value, "hint")
                elif kind == "status" and not self.busy:
                    self.status.configure(text=value, fg=CYAN if "LISTENING" in value else GREEN)
                elif kind == "model":
                    self.model_label.configure(text=value[1:], fg=GREEN if value[0] == "1" else MUTED)
                elif kind == "wake_off" and not self.wake_enabled.is_set():
                    self.wake_button.configure(text="🎙 HANDS-FREE: OFF", bg=FIELD)
        except queue.Empty:
            pass
        if self.running:
            self.root.after(90, self.pump)

    def close(self) -> None:
        self.running = False
        self.wake_enabled.clear()
        self.root.destroy()


if __name__ == "__main__":
    window = tk.Tk()
    JarvisApp(window)
    window.mainloop()
