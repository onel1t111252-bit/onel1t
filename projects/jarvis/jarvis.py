"""ONEL1T JARVIS 3.0 — consent-first Windows desktop assistant.

Local Ollama chat; online microphone recognition and optional online voice.
No arbitrary OS command execution. No remote control. No admin privileges.
"""
from __future__ import annotations

import json
import logging
import math
import os
from pathlib import Path
import queue
import re
import threading
import time
import tkinter as tk
from tkinter import scrolledtext, messagebox, filedialog, simpledialog
from urllib import request, error

from desktop_actions import ActionPlan, plan_action, run_action, can_execute_directly
from command_sequences import split_sequence
from voice_engine import speak, clamp_volume, VOICE_PROFILES, VOICE_LABELS
from assistant_persona import (style_action_reply, concise_speech, cinematic_quick_reply,
                               normalize_spoken, extract_wake_command)
from spotify_control import spotify_connection, valid_client_id

ROOT_DIR = Path(__file__).resolve().parent
SETTINGS_PATH = ROOT_DIR / "settings.json"
API_URL = "http://127.0.0.1:11434"
MODEL = os.getenv("JARVIS_MODEL", "jarvis")

BG = "#050811"
SIDEBAR = "#0a1422"
PANEL = "#0b1928"
PANEL_2 = "#142c42"
INPUT = "#14263c"
CYAN = "#27ecfc"
BLUE = "#4b86f2"
WHITE = "#effaff"
MUTED = "#8ba8bb"
GREEN = "#62edb7"
AMBER = "#ffce79"
FONT = "Segoe UI"
MONO = "Consolas"

SYSTEM_PROMPT = (
    "Ти JARVIS — україномовний ШІ-помічник на комп'ютері Windows. "
    "Відповідай українською природно, чітко й лаконічно. "
    "Говори в стилі стриманого, тактовного помічника: звертайся «сер», "
    "на короткі доручення відповідай «Так, сер» або «Є, сер», "
    "але не повторюй це механічно в кожному реченні. Без зайвого пафосу. "
    "Не стверджуй, що відкрив програму, змінив файл або виконав команду, "
    "якщо це не зробив модуль команд. Не видавай інструкцій для доступу "
    "до чужих комп'ютерів без дозволу. Якщо функція недоступна, скажи про це. "
    "Команди Windows обробляються окремим модулем, тому не стверджуй, "
    "що JARVIS взагалі не має доступу до програм на комп\u0027ютері. "
    "Відповідай унікальними, короткими, корисними фразами. Не цитуй репліки з фільмів. "
    "Ніколи не вдавай доступу до обладнання, програм чи результатів, яких реально не перевіряв. "
    "Можеш відповідати на запитання та допомагати користувачу з навчанням."
)

NEUTRAL_PROMPT = (
    "Ти локальний україномовний асистент Windows. Відповідай українською "
    "чітко й доброзичливо, без звертання «сер» і без кінематографічного стилю. "
    "Не приписуй собі дій у Windows, яких не виконав модуль команд. "
    "Не виконуй команди у відповідях: Windows контролюється окремими діями. "
    "Не проси паролі, приватні ключі або коди доступу."
)

logging.basicConfig(filename=ROOT_DIR / "jarvis.log", encoding="utf-8",
                    format="%(asctime)s %(levelname)s %(message)s", level=logging.WARNING)


def get_settings() -> dict:
    try:
        data = json.loads(SETTINGS_PATH.read_text(encoding="utf-8"))
        return data if isinstance(data, dict) else {}
    except (ValueError, OSError):
        return {}


def ollama_status() -> tuple[bool, str]:
    try:
        with request.urlopen(API_URL + "/api/tags", timeout=4) as stream:
            models = json.loads(stream.read().decode("utf-8")).get("models", [])
        names = [x.get("name", "") for x in models]
        if MODEL in names or MODEL + ":latest" in names:
            return True, "AI ONLINE / " + MODEL
        return False, "MODEL NOT FOUND / " + MODEL
    except (OSError, ValueError):
        return False, "OLLAMA OFFLINE"


def ollama_chat(text: str, history: list[dict[str, str]], cinematic: bool = True) -> tuple[str, list[dict[str, str]]]:
    system_prompt = SYSTEM_PROMPT if cinematic else NEUTRAL_PROMPT
    conversation = [{"role": "system", "content": system_prompt}] + history[-10:]
    conversation.append({"role": "user", "content": text})
    packet = {"model": MODEL, "messages": conversation, "stream": False,
              "think": False, "options": {"temperature": 0.55, "num_predict": 340}}
    payload = json.dumps(packet, ensure_ascii=False).encode("utf-8")
    req = request.Request(API_URL + "/api/chat", data=payload,
                          headers={"Content-Type": "application/json"}, method="POST")
    try:
        with request.urlopen(req, timeout=180) as stream:
            data = json.loads(stream.read().decode("utf-8"))
        answer = (data.get("message", {}).get("content") or "").strip()
        if not answer:
            return "Модель не повернула відповіді.", history
        next_history = (history + [{"role": "user", "content": text},
                                   {"role": "assistant", "content": answer}])[-10:]
        return answer, next_history
    except error.HTTPError as exc:
        return ("Модель не знайдено. Перевір команду ollama list."
                if exc.code == 404 else f"Помилка Ollama: HTTP {exc.code}."), history
    except (OSError, ValueError):
        return "Не вдалося з'єднатися з Ollama. Переконайся, що вона запущена.", history


class JarvisApp:
    def __init__(self, root: tk.Tk):
        self.root = root
        self.queue: queue.Queue[tuple[str, object]] = queue.Queue()
        self.audio_queue: queue.Queue[str] = queue.Queue()
        self.mic_lock = threading.Lock()
        self.handsfree = threading.Event()
        self.speaking = threading.Event()
        self.mic_listening = threading.Event()
        self.handoff_pending = threading.Event()
        self.mic_index = None
        self.mic_energy_threshold = 350.0
        self.mic_calibrated = False
        self.mic_error_streak = 0
        self.last_mic_warning = 0.0
        self.handsfree_thread = None
        self.handsfree_generation = 0
        self.alive = True
        self.busy = False
        self.pending: ActionPlan | None = None
        self.steps: list[ActionPlan] = []
        self.step_index = 0
        self.followup_until = 0.0
        self.history: list[dict[str, str]] = []
        self.settings = get_settings()
        mic = self.settings.get("microphone_index")
        self.mic_index = mic if type(mic) is int and 0 <= mic < 128 else None
        self.voice_on = bool(self.settings.get("voice_on", True))
        self.spotify_client_id = str(self.settings.get("spotify_client_id", "")).strip()
        if self.spotify_client_id and not valid_client_id(self.spotify_client_id):
            self.spotify_client_id = ""
        self.cinematic_mode = bool(self.settings.get("cinematic_mode", True))
        self.voice_volume = clamp_volume(self.settings.get("voice_volume", 80))
        self.window_mode = self.settings.get("window_mode", "compact")
        if self.window_mode not in {"compact", "wide"}:
            self.window_mode = "compact"
        self.voice_profile = self.settings.get("voice_profile", VOICE_PROFILES[0])
        # One-time upgrade of the old, heavily pitched default.
        if (self.voice_profile in {"jarvis-deep", "uk-UA-PolinaNeural"}
                and not self.settings.get("voice_upgrade_v4", False)):
            self.voice_profile = "jarvis-cinematic"
        if self.voice_profile not in VOICE_PROFILES:
            self.voice_profile = VOICE_PROFILES[0]
        self.reactor_tick = 0
        self._setup_window()
        self._build_ui()
        self.post("JARVIS", "Так, сер. Системи готові. Скажи «Джарвіс, відкрий Steam і запусти Доту», "
                  "«Джарвіс, відкрий Spotify» або запитай мене про щось. "
                  "Звичайні команди працюють без CONFIRM. "
                  "Вибір мікрофона: правий клік на HANDS-FREE.", "ai")
        self.root.after(80, self.pump)
        self.root.after(150, self.check_ai)
        self.root.after(100, self.animate_reactor)
        threading.Thread(target=self.audio_worker, daemon=True).start()
        if self.cinematic_mode and self.voice_on and self.voice_volume > 0:
            self.enqueue_speech("До ваших послуг, сер. Джарвіс готовий до роботи.")

    def _setup_window(self):
        self.root.title("ONEL1T | JARVIS 3.0")
        self.root.configure(bg=BG)
        self.root.resizable(True, True)
        self.root.attributes("-fullscreen", False)
        self._apply_window_size()
        self.root.protocol("WM_DELETE_WINDOW", self.close)

    def _apply_window_size(self):
        """Launch in an ordinary resizable window, never forced fullscreen."""
        self.root.state("normal")
        screen_w = self.root.winfo_screenwidth()
        screen_h = self.root.winfo_screenheight()
        desired_w, desired_h = (1120, 800) if self.window_mode == "wide" else (960, 700)
        width = min(desired_w, max(720, screen_w - 80))
        height = min(desired_h, max(550, screen_h - 110))
        self.root.minsize(min(width, 810), min(height, 560))
        x = max(0, (screen_w - width) // 2)
        y = max(0, (screen_h - height) // 3)
        self.root.geometry(f"{width}x{height}+{x}+{y}")

    def toggle_window_mode(self):
        self.window_mode = "wide" if self.window_mode == "compact" else "compact"
        self._apply_window_size()
        self.window_btn.configure(text=("◫  WINDOW: LARGE" if self.window_mode == "wide"
                                        else "◫  WINDOW: COMPACT"))
        self.save_settings()

    def _label(self, parent, text, size=11, color=WHITE, weight="normal", mono=False, **kwargs):
        font = MONO if mono else FONT
        return tk.Label(parent, text=text, bg=parent.cget("bg"), fg=color,
                        font=(font, size, weight), **kwargs)

    def _button(self, parent, text, command, bg=PANEL_2, fg=WHITE, pad=(12, 8)):
        button = tk.Button(parent, text=text, command=command, bg=bg, fg=fg,
                           activebackground="#205171", activeforeground=WHITE,
                           relief="flat", bd=0, cursor="hand2",
                           font=(FONT, 10, "bold"), padx=pad[0], pady=pad[1])
        button.bind("<Enter>", lambda _e: button.configure(bg="#1d4866") if button.winfo_exists() else None)
        button.bind("<Leave>", lambda _e: button.configure(bg=bg) if button.winfo_exists() else None)
        return button

    def _build_ui(self):
        header = tk.Frame(self.root, bg=BG, height=72)
        header.pack(fill="x", padx=26, pady=(18, 10))
        self._label(header, "◆  ONEL1T", size=17, color=CYAN, weight="bold").pack(side="left")
        self._label(header, "    /    JARVIS 3.0    /    PERSONAL COMMAND CENTER", size=10, color=MUTED, mono=True).pack(side="left")
        self.header_status = self._label(header, "●  STARTING", size=10, color=GREEN, mono=True)
        self.header_status.pack(side="right")

        full = tk.Frame(self.root, bg=BG)
        full.pack(fill="both", expand=True, padx=24, pady=(0, 16))
        side = tk.Frame(full, bg=SIDEBAR, width=284)
        side.pack(side="left", fill="y", padx=(0, 14))
        side.pack_propagate(False)
        panel = tk.Frame(full, bg=PANEL)
        panel.pack(side="left", fill="both", expand=True)

        tk.Frame(side, bg=CYAN, height=3).pack(fill="x")
        self._label(side, "◈  VOICE-OPERATED SYSTEM", size=9, color=CYAN, mono=True).pack(pady=(19, 1))
        self.orb = tk.Canvas(side, height=176, width=254, bg=SIDEBAR, highlightthickness=0)
        self.orb.pack(pady=(0, 4))
        self.orb.create_text(127, 87, text="J", font=(FONT, 46, "bold"), fill=CYAN, tags="center")
        self._label(side, "J A R V I S   //   CORE", size=13, weight="bold").pack(pady=(0, 4))
        self.ai_state = self._label(side, "CHECKING OLLAMA...", size=9, color=MUTED, mono=True)
        self.ai_state.pack(pady=(0, 12))
        self._label(side, "VOICE CONTROL • LOCAL AI", color=GREEN, size=8, mono=True).pack(pady=(0, 4))
        self.reactor_status = self._label(side, "◉  CORE: STANDBY", color=CYAN, size=9, mono=True)
        self.reactor_status.pack(pady=(0, 12))

        self._label(side, "QUICK COMMANDS", size=10, color=MUTED, mono=True).pack(anchor="w", padx=19, pady=(0, 7))
        for title, cmd in [
            ("▣  NOTEPAD", "відкрий блокнот"),
            ("◉  STEAM", "відкрий стім"),
            ("▶  DOTA 2", "відкрий стім і запусти доту"),
            ("▤  WINDOWS", "покажи відкриті вікна"),
            ("▧  CHOOSE FILE", "відкрий файл"),
            ("?  COMMANDS", "допомога"),
        ]:
            self._button(side, title, lambda cmd=cmd: self.submit(cmd), bg=PANEL, pad=(11, 6)).pack(
                fill="x", padx=16, pady=3)

        self._button(side, "♫  FIND SONG", self.search_spotify, bg=PANEL).pack(
            fill="x", padx=16, pady=3)
        self._label(side, "SAFE ACTIONS  /  CONSENT FIRST", size=8, color=MUTED, mono=True,
                    wraplength=232, justify="left").pack(side="bottom", padx=18, pady=17)

        top = tk.Frame(panel, bg=PANEL)
        top.pack(fill="x", padx=22, pady=(24, 8))
        self._label(top, "NEURAL COMMAND INTERFACE", size=15, weight="bold").pack(side="left")
        self._button(top, "↻  CHECK AI", self.check_ai, bg=PANEL_2).pack(side="right")
        self.window_btn = self._button(top, "◫  WINDOW: " + ("LARGE" if self.window_mode == "wide" else "COMPACT"),
                                      self.toggle_window_mode, bg=PANEL_2)
        self.window_btn.pack(side="right", padx=(0, 8))

        self._label(panel, "AI ASSISTANT  /  UKRAINIAN VOICE  /  LOCAL WINDOWS CONTROL", size=9,
                    color=MUTED, mono=True).pack(anchor="w", padx=22, pady=(0, 11))

        telemetry = tk.Frame(panel, bg=PANEL)
        telemetry.pack(fill="x", padx=22, pady=(0, 14))
        for title, value, color in [
            ("INTELLIGENCE", "OLLAMA LOCAL", CYAN),
            ("CONTROL", "OWNER APPROVAL", GREEN),
            ("VOICE LINK", "UKRAINIAN TTS", BLUE),
        ]:
            card = tk.Frame(telemetry, bg="#12283b", highlightbackground="#255168", highlightthickness=1)
            card.pack(side="left", fill="x", expand=True, padx=(0, 8))
            self._label(card, title, size=8, mono=True, color=MUTED).pack(anchor="w", padx=13, pady=(10, 1))
            self._label(card, value, size=10, weight="bold", mono=True, color=color).pack(anchor="w", padx=13, pady=(0, 10))
        bar = tk.Frame(panel, bg=PANEL)
        bar.pack(fill="x", padx=22, pady=(0, 6))
        self.handsfree_btn = self._button(bar, "🎙  HANDS-FREE: OFF", self.toggle_handsfree, bg=PANEL_2)
        self.handsfree_btn.pack(side="left", padx=(0, 7))
        self.handsfree_btn.bind("<Button-3>", lambda _event: self.choose_microphone())
        self.voice_btn = self._button(bar, "🔊  VOICE: ON", self.toggle_voice, bg=PANEL_2)
        self.voice_btn.pack(side="left", padx=(0, 7))
        self.voice_select = self._button(bar, "VOICE: JARVIS DEEP", self.cycle_voice, bg=PANEL_2)
        self.voice_select.pack(side="left", padx=(0, 7))
        controls = tk.Frame(panel, bg=PANEL)
        controls.pack(fill="x", padx=22, pady=(0, 8))
        self._button(controls, "▶  TEST VOICE", self.test_voice, bg=PANEL_2).pack(side="left")
        self._button(controls, "■  STOP PLAN", self.stop_plan, bg="#4e3046").pack(side="left", padx=(8, 0))
        self.spotify_btn = self._button(controls, "♫  CONNECT SPOTIFY", self.connect_spotify, bg=PANEL_2)
        self.spotify_btn.pack(side="left", padx=(8, 0))
        self.persona_btn = self._button(controls, "◈  JARVIS MODE: " + ("ON" if self.cinematic_mode else "OFF"),
                                        self.toggle_persona, bg="#15566c")
        self.persona_btn.pack(side="right")
        self.refresh_voice_buttons()

        volume_bar = tk.Frame(panel, bg=PANEL)
        volume_bar.pack(fill="x", padx=22, pady=(0, 10))
        self.volume_label = self._label(volume_bar, f"VOICE VOLUME  /  {self.voice_volume}%",
                                        size=9, color=CYAN, mono=True)
        self.volume_label.pack(side="left")
        self.volume_slider = tk.Scale(
            volume_bar, from_=0, to=100, resolution=5,
            orient="horizontal", length=250, showvalue=False,
            bg=PANEL, fg=CYAN, troughcolor=INPUT, activebackground=CYAN,
            highlightthickness=0, bd=0,
            variable=tk.IntVar(value=self.voice_volume), command=self.set_voice_volume)
        self.volume_slider.pack(side="left", fill="x", expand=True, padx=(14, 12))
        self._label(volume_bar, "VOICE ONLY", size=8, color=MUTED, mono=True).pack(side="right")

        flow = tk.Frame(panel, bg="#12283b", highlightbackground="#255168", highlightthickness=1)
        flow.pack(fill="x", padx=22, pady=(0, 10))
        self.flow_label = self._label(flow, "◈  AUTOMATION QUEUE  /  IDLE", size=9, mono=True, color=CYAN)
        self.flow_label.pack(anchor="w", padx=14, pady=6)

        conversation = tk.Frame(panel, bg=PANEL)
        conversation.pack(fill="both", expand=True, padx=20, pady=(0, 12))
        self.chat = scrolledtext.ScrolledText(conversation, bg="#081622", fg=WHITE,
                                              selectbackground="#225477", insertbackground=CYAN,
                                              wrap="word", font=(FONT, 11), relief="flat", bd=0, height=9,
                                              padx=15, pady=15, state="disabled", spacing3=8)
        self.chat.pack(fill="both", expand=True)
        self.chat.tag_config("speaker_ai", foreground=CYAN, font=(MONO, 10, "bold"))
        self.chat.tag_config("speaker_user", foreground=GREEN, font=(MONO, 10, "bold"))
        self.chat.tag_config("speaker_sys", foreground=AMBER, font=(MONO, 10, "bold"))
        self.chat.tag_config("body", foreground=WHITE)
        self.chat.tag_config("muted", foreground=MUTED)

        compose = tk.Frame(panel, bg=PANEL)
        compose.pack(fill="x", padx=20, pady=(0, 8))
        self.input = tk.Entry(compose, bg=INPUT, fg=WHITE, insertbackground=CYAN,
                              relief="flat", font=(FONT, 11), bd=0)
        self.input.pack(side="left", fill="x", expand=True, ipady=13, ipadx=12)
        self.input.bind("<Return>", lambda _: self.send())
        self._button(compose, "SEND ↗", self.send, bg=CYAN, fg=BG, pad=(16, 12)).pack(side="left", padx=(8, 0))
        self._button(compose, "🎤", self.push_to_talk, bg=PANEL_2, pad=(13, 12)).pack(side="left", padx=(8, 0))

        bottom = tk.Frame(panel, bg=PANEL)
        bottom.pack(fill="x", padx=22, pady=(0, 16))
        self.status = self._label(bottom, "●  READY", size=9, color=GREEN, mono=True)
        self.status.pack(side="left")
        self._label(bottom, "RIGHT-CLICK HANDS-FREE FOR MIC  /  SAFE ACTIONS AUTO", size=8,
                    color=MUTED, mono=True).pack(side="right")
        self.input.focus_set()

    def animate_reactor(self):
        if not self.alive:
            return
        self.orb.delete("rings")
        x, y = 127, 87
        self.reactor_tick += 1
        phase = self.reactor_tick * 0.065
        listening = self.mic_listening.is_set()
        speaking = self.speaking.is_set()
        glow = GREEN if listening else AMBER if speaking else CYAN
        pulse = (math.sin(phase * 1.6) + 1.0) / 2.0
        self.reactor_status.configure(
            text="◉  CORE: LISTENING" if listening else
                 "◉  CORE: SPEAKING" if speaking else
                 "◉  CORE: PROCESSING" if self.busy else
                 "◉  CORE: STANDBY", fg=glow)
        for radius, line in [(72, 1), (57, 2), (44, 2), (32, 1)]:
            self.orb.create_oval(x-radius, y-radius, x+radius, y+radius,
                                 outline="#184158" if radius >= 70 else glow if radius <= 44 else BLUE,
                                 width=line, tags="rings")
        self.orb.create_arc(x-67, y-67, x+67, y+67,
                             start=(math.degrees(phase) % 360), extent=74,
                             outline=glow, width=5, style="arc", tags="rings")
        self.orb.create_arc(x-50, y-50, x+50, y+50,
                             start=(-math.degrees(phase) % 360), extent=100,
                             outline=GREEN if self.handsfree.is_set() else glow,
                             width=3, style="arc", tags="rings")
        for mark in range(12):
            angle = phase / 8 + mark * math.tau / 12
            inner, outer = 78, 80 + (2 if mark % 3 == 0 else 0)
            self.orb.create_line(x + math.cos(angle) * inner,
                                 y + math.sin(angle) * inner,
                                 x + math.cos(angle) * outer,
                                 y + math.sin(angle) * outer,
                                 fill=glow if mark < 3 or pulse > 0.85 else "#23556e",
                                 width=2, tags="rings")
        self.orb.tag_lower("rings", "center")
        self.root.after(75, self.animate_reactor)

    def post(self, speaker, text, category="ai"):
        self.chat.configure(state="normal")
        style = {"ai": "speaker_ai", "user": "speaker_user", "sys": "speaker_sys"}.get(category, "speaker_sys")
        self.chat.insert("end", f"{speaker.upper()}  /  {time.strftime('%H:%M')}\n", style)
        self.chat.insert("end", text + "\n\n", "body" if category != "sys" else "muted")
        self.chat.configure(state="disabled")
        self.chat.see("end")

    def save_settings(self):
        try:
            SETTINGS_PATH.write_text(json.dumps({"voice_on": self.voice_on,
                                                "voice_profile": self.voice_profile,
                                                 "voice_upgrade_v4": True,
                                                "voice_volume": self.voice_volume,
                                                "window_mode": self.window_mode,
                                                "cinematic_mode": self.cinematic_mode,
                                                "spotify_client_id": self.spotify_client_id,
                                                "microphone_index": self.mic_index},
                                               ensure_ascii=False, indent=2), encoding="utf-8")
        except OSError:
            logging.warning("Could not save preferences")

    def set_voice_volume(self, value):
        self.voice_volume = clamp_volume(value)
        self.volume_label.configure(text=f"VOICE VOLUME  /  {self.voice_volume}%")
        self.save_settings()

    def toggle_persona(self):
        self.cinematic_mode = not self.cinematic_mode
        self.history.clear()  # Don't leak prior persona wording across modes.
        self.persona_btn.configure(text="◈  JARVIS MODE: " +
                                   ("ON" if self.cinematic_mode else "OFF"))
        self.save_settings()
        self.post("SYSTEM",
                  "Кінематографічний режим активовано. Так, сер." if self.cinematic_mode
                  else "Звичайний режим відповідей активовано.", "sys")

    def refresh_voice_buttons(self):
        self.voice_btn.configure(text="🔊  VOICE: ON" if self.voice_on else "🔇  VOICE: OFF")
        self.voice_select.configure(text="VOICE: " + VOICE_LABELS[self.voice_profile])

    def toggle_voice(self):
        self.voice_on = not self.voice_on
        self.refresh_voice_buttons()
        self.save_settings()

    def cycle_voice(self):
        idx = VOICE_PROFILES.index(self.voice_profile)
        self.voice_profile = VOICE_PROFILES[(idx + 1) % len(VOICE_PROFILES)]
        service = ("Локальний Windows SAPI: потрібен український чоловічий голос."
                   if self.voice_profile == "windows" else
                   "STUDIO: потрібен власний платний OpenAI API-ключ (OPENAI_API_KEY)."
                   if self.voice_profile == "studio-onyx" else
                   "Український голос Microsoft: потрібен інтернет; текст надсилається Microsoft.")
        self.post("SYSTEM", "Обрано голос: " + VOICE_LABELS[self.voice_profile]
                  + ". " + service, "sys")
        self.refresh_voice_buttons()
        self.save_settings()

    def enqueue_speech(self, text):
        if self.voice_on and text:
            self.speaking.set()
            self.audio_queue.put(text)

    def test_voice(self):
        if not self.voice_on:
            self.post("SYSTEM", "Увімкни VOICE: ON для перевірки озвучення.", "sys")
            return
        if self.voice_volume == 0:
            self.post("SYSTEM", "Гучність голосу 0%. Пересунь повзунок праворуч.", "sys")
            return
        self.enqueue_speech("Так, сер. Усі системи готові. Чекаю ваших команд.")

    def search_spotify(self):
        """Search official Spotify immediately, without AI or API login."""
        if self.busy or self.pending:
            return
        title = simpledialog.askstring(
            "JARVIS • Швидкий пошук Spotify",
            "Назва пісні або виконавець:", parent=self.root)
        if title and title.strip():
            self.submit("знайди пісню " + title.strip()[:120] + " в Spotify")

    def connect_spotify(self):
        """Owner-initiated OAuth: client ID is public, tokens are never saved."""
        if self.busy or self.pending:
            return
        current = self.spotify_client_id if valid_client_id(self.spotify_client_id) else ""
        client_id = simpledialog.askstring(
            "JARVIS • Підключення Spotify",
            "Укажи Spotify Client ID з власного Spotify Developer Dashboard "
            "(32 символи, НЕ Client Secret).\n\n"
            "У налаштуваннях Spotify app додай Redirect URI:\n"
            "http://127.0.0.1:8765/callback\n\n"
            "Для керування відтворенням потрібні Spotify Premium та дозвіл у браузері.",
            initialvalue=current, parent=self.root)
        if client_id is None:
            return
        client_id = client_id.strip()
        if not valid_client_id(client_id):
            messagebox.showerror("Spotify", "Некоректний Client ID. Не вставляй Client Secret.",
                                 parent=self.root)
            return
        self.spotify_client_id = client_id  # Public ID only; the OAuth token remains in RAM.
        self.save_settings()
        # User clicked CONNECT SPOTIFY and will grant permissions in Spotify's
        # official browser consent screen. No redundant JARVIS CONFIRM button.
        self.start_answer("", ActionPlan(
            "spotify_connect", client_id,
            "Підключити Spotify з OAuth PKCE", True))

    def _refresh_spotify_button(self):
        if self.spotify_btn.winfo_exists():
            text = "♫  SPOTIFY: CONNECTED" if spotify_connection.connected else "♫  CONNECT SPOTIFY"
            if self.spotify_btn.cget("text") != text:
                self.spotify_btn.configure(text=text)

    def report_system(self):
        """Report app settings only. Do not falsely claim a hardware health scan."""
        ai = self.ai_state.cget("text")
        microphone = "УВІМКНЕНО" if self.handsfree.is_set() else "ВИМКНЕНО"
        voice = VOICE_LABELS[self.voice_profile] if self.voice_on else "ВИМКНЕНО"
        answer = (f"Так, сер. Звіт JARVIS: останній стан Ollama — {ai}; "
                  f"мікрофон без рук — {microphone}; голос — {voice}; "
                  f"гучність голосу — {self.voice_volume}%; "
                  f"режим — {'JARVIS' if self.cinematic_mode else 'ЗВИЧАЙНИЙ'}. "
                  "Це стан програми, не перевірка обладнання Windows.")
        self.post("JARVIS", answer, "ai")
        self.enqueue_speech("Так, сер. Параметри Джарвіса перевірено. "
                            "Докладний звіт на екрані.")

    def check_ai(self):
        self.ai_state.configure(text="CHECKING AI ...", fg=MUTED)
        threading.Thread(target=lambda: self.queue.put(("ai_status", ollama_status())), daemon=True).start()

    def send(self):
        if self.busy or self.pending:
            return
        value = self.input.get().strip()
        if value:
            self.input.delete(0, "end")
            self.submit(value)

    def submit(self, text, via_voice=False):
        if not text or self.busy or self.pending:
            return
        self.post("YOU 🎤" if via_voice else "YOU", text, "user")
        quick = cinematic_quick_reply(text) if self.cinematic_mode else None
        if quick is not None:
            self.finish(quick)
            return
        normalized = normalize_spoken(text)
        normalized = re.sub(r"^(?:джарвісе|джарвіс|джарвис|jarvis)\s+", "", normalized)
        if normalized in {"статус системи", "стан системи", "статус джарвіса",
                          "звіт системи", "перевір системи"}:
            self.report_system()
            return
        route = plan_action(text)
        segments = split_sequence(text)
        # Preserve a single fixed Steam URI for the established Steam+Dota phrase.
        if segments is not None and not (route and route.kind in {"known_uri", "steam_game"}):
            if not segments:
                self.finish("Сценарій відхилено: не більше 4 кроків; введення тексту має бути останнім кроком.")
                return
            actions = [plan_action(piece) for piece in segments]
            if any(a is None or a.kind in {"say", "file_picker"} for a in actions):
                self.finish("Не всі кроки підтримуються. Жодної дії не виконано. Спробуй прості команди.")
                return
            self.steps = actions
            self.step_index = 0
            self.post("SYSTEM", "Сценарій з " + str(len(actions))
                      + " кроків: звичайні дії виконуються без CONFIRM; "
                        "для введення тексту або кліків запитаю окремий дозвіл.", "sys")
            self.show_next_step()
            return
        if route and route.kind == "file_picker":
            selected = filedialog.askopenfilename(
                parent=self.root, title="Вибери файл, який JARVIS може відкрити")
            if not selected:
                self.finish("Вибір файлу скасовано.")
                return
            route = ActionPlan("user_file", selected,
                               "Відкрити вибраний файл: " + Path(selected).name, True)
        if route:
            self.dispatch_action(route)
        else:
            self.start_answer(text, None)

    def dispatch_action(self, action: ActionPlan):
        """One explicit command is enough for harmless bounded actions.

        Sensitive actions still need a separate yes/no prompt, but never
        create a blocking CONFIRM button in the conversation layout.
        """
        if action.needs_approval and not can_execute_directly(action):
            self.pending = action
            self.set_status("●  ACTION PERMISSION", AMBER)
            try:
                allowed = messagebox.askyesno(
                    "JARVIS • Дозвіл на дію",
                    action.summary
                    + "\n\nЦя дія змінює активне вікно, вводить текст або "
                      "працює з локальним файлом. Дозволити?",
                    parent=self.root)
            finally:
                self.pending = None
            if not allowed:
                self.steps.clear()
                self.step_index = 0
                self.flow_label.configure(text="◈  AUTOMATION QUEUE  /  STOPPED")
                self.post("SYSTEM", "Дію скасовано. Наступні кроки не виконуються.", "sys")
                self.set_status("●  READY", GREEN)
                return
        self.start_answer("", action)

    def show_next_step(self):
        if not self.steps or self.step_index >= len(self.steps):
            self.steps.clear()
            self.flow_label.configure(text="◈  AUTOMATION QUEUE  /  IDLE")
            return
        index = self.step_index + 1
        current = self.steps[self.step_index]
        self.flow_label.configure(text=f"◈  AUTOMATION QUEUE  /  STEP {index} OF {len(self.steps)}")
        self.dispatch_action(current)

    def stop_plan(self):
        if not self.steps and not self.pending:
            self.post("SYSTEM", "Активного сценарію немає.", "sys")
            return
        self.steps.clear()
        self.step_index = 0
        self.pending = None
        self.flow_label.configure(text="◈  AUTOMATION QUEUE  /  STOPPED")
        self.post("SYSTEM", "Чергу скасовано. Уже запущену дію неможливо гарантовано зупинити.", "sys")
        if not self.busy:
            self.set_status("●  READY", GREEN)

    def start_answer(self, text, action: ActionPlan | None):
        self.busy = True
        self.set_status("♫  SPOTIFY / SEARCHING" if action and action.kind.startswith("spotify_")
                        else "●  PROCESSING", CYAN)
        threading.Thread(target=self.answer_worker, args=(text, action), daemon=True).start()

    def answer_worker(self, text, action):
        success = True
        try:
            if action:
                reply = run_action(action)
            else:
                reply, self.history = ollama_chat(text, self.history, self.cinematic_mode)
        except (ValueError, RuntimeError) as exc:
            success = False
            reply = "Дія не виконана: " + str(exc)
        except Exception:
            success = False
            logging.exception("Cannot process request")
            reply = "Сталася помилка. Перевір файл jarvis.log у папці програми."
        if action:
            try:
                with (ROOT_DIR / "actions.log").open("a", encoding="utf-8") as log:
                    log.write(f"{time.strftime('%Y-%m-%d %H:%M:%S')}  {action.kind}  {'OK' if success else 'ERROR'}\n")
            except OSError:
                logging.warning("Cannot append local action log")
        self.queue.put(("answer", (reply, success, action.kind if action else "")))

    def finish(self, text, success=True, action_kind=""):
        text = style_action_reply(text, action_kind, success, self.cinematic_mode)
        self.post("JARVIS", text, "ai")
        # Speak only a concise acknowledgment; keep private details on-screen.
        voice_line = concise_speech(text, action_kind, success, self.cinematic_mode)
        if voice_line:
            self.enqueue_speech(voice_line)
        self.busy = False
        if self.steps:
            if success:
                self.step_index += 1
                if self.step_index < len(self.steps):
                    self.show_next_step()
                    return
                self.post("SYSTEM", "Усі кроки сценарію виконано.", "sys")
            else:
                self.post("SYSTEM", "Сценарій зупинено після невдалого кроку.", "sys")
            self.steps.clear()
            self.step_index = 0
            self.flow_label.configure(text="◈  AUTOMATION QUEUE  /  IDLE")
        self.set_status("●  SPEAKING" if self.speaking.is_set() else "●  READY",
                        CYAN if self.speaking.is_set() else GREEN)

    def set_status(self, value, color=GREEN):
        self.status.configure(text=value, fg=color)
        self.header_status.configure(text=value, fg=color)

    def choose_microphone(self):
        """Optional local mic selector. Right-click the HANDS-FREE button."""
        if self.handsfree.is_set() or self.mic_lock.locked():
            self.post("SYSTEM", "Спочатку вимкни HANDS-FREE, щоб змінити мікрофон.", "sys")
            return
        try:
            import speech_recognition as sr
            devices = sr.Microphone.list_microphone_names()
        except (ImportError, OSError, AttributeError) as exc:
            self.post("SYSTEM", "Не можу показати мікрофони (" + type(exc).__name__
                      + "). Запусти INSTALL_VOICE.bat і перевір мікрофон Windows.", "sys")
            return
        preview = ["0 — мікрофон Windows за замовчуванням"]
        preview += [f"{i + 1} — {name[:65]}" for i, name in enumerate(devices[:20])]
        selection = simpledialog.askinteger(
            "JARVIS • Вибір мікрофона",
            "Введи номер пристрою для розпізнавання голосу:\n\n"
            + "\n".join(preview)
            + "\n\nЗазвичай потрібен саме мікрофон або гарнітура, не динамік.",
            minvalue=0, maxvalue=min(20, len(devices)),
            parent=self.root)
        if selection is None:
            return
        self.mic_index = None if selection == 0 else selection - 1
        self.mic_calibrated = False
        self.mic_energy_threshold = 350.0
        self.mic_error_streak = 0
        self.save_settings()
        label = preview[selection]
        self.post("SYSTEM", "Мікрофон обрано: " + label
                  + ". Увімкни HANDS-FREE та скажи «Джарвіс, котра година».", "sys")

    def toggle_handsfree(self):
        if self.handsfree.is_set():
            self.handsfree_generation += 1
            self.handsfree.clear()
            self.handoff_pending.clear()
            self.followup_until = 0
            self.handsfree_btn.configure(text="🎙  HANDS-FREE: OFF", bg=PANEL_2)
            self.post("SYSTEM", "Прослуховування вимкнено.", "sys")
            return
        ok = messagebox.askyesno(
            "Увімкнути мікрофон?",
            "HANDS-FREE постійно прослуховує мікрофон після ввімкнення. "
            "Розпізнавання надсилає фрагменти звуку онлайн-сервісу Google. "
            "Режим вимикається кнопкою HANDS-FREE OFF або закриттям програми. "
            "Дозволити?",
            parent=self.root)
        if not ok:
            return
        self.handsfree_generation += 1
        generation = self.handsfree_generation
        self.handsfree.set()
        self.mic_error_streak = 0
        self.followup_until = 0
        self.handsfree_btn.configure(text="🎙  HANDS-FREE: ON", bg="#145570")
        self.post("SYSTEM", "HANDS-FREE увімкнено. Скажи «Джарвіс, котра година». "
                  "Якщо не чує — правий клік на HANDS-FREE дозволяє вибрати мікрофон "
                  "(спочатку вимкни режим).", "sys")
        # Always attach a new listener to this activation. A prior listener
        # might still be exiting, so its stale generation must not win a race.
        self.handsfree_thread = threading.Thread(
            target=self.handsfree_worker, args=(generation,),
            name="jarvis-microphone", daemon=True)
        self.handsfree_thread.start()

    def push_to_talk(self):
        if self.handsfree.is_set():
            # The old implementation called toggle_handsfree() here and
            # unexpectedly switched continuous listening OFF.
            self.post("SYSTEM", "HANDS-FREE уже ввімкнений. Скажи команду зі словом "
                      "«Джарвіс» без натискання кнопки 🎤.", "sys")
            return
        if self.busy or self.pending or self.mic_lock.locked() or self.speaking.is_set():
            return
        threading.Thread(target=self.listen_once, args=(False,), daemon=True).start()

    def handsfree_worker(self, generation: int):
        while (self.alive and self.handsfree.is_set()
               and generation == self.handsfree_generation):
            if (self.busy or self.pending or self.speaking.is_set()
                    or self.mic_lock.locked() or self.handoff_pending.is_set()):
                threading.Event().wait(.20)
                continue
            self.listen_once(True, session_id=generation)
        self.queue.put(("wake_off", generation))

    def _mic_notice(self, message: str, minimum_interval: float = 15.0):
        now = time.monotonic()
        if now - self.last_mic_warning >= minimum_interval:
            self.last_mic_warning = now
            self.queue.put(("hint", message))

    def listen_once(self, with_wake_word: bool, session_id: int | None = None):
        if not self.mic_lock.acquire(blocking=False):
            return
        try:
            import speech_recognition as sr
            recognizer = sr.Recognizer()
            recognizer.dynamic_energy_threshold = True
            recognizer.energy_threshold = self.mic_energy_threshold
            self.mic_listening.set()
            self.queue.put(("mic_status", "●  LISTENING"))
            with sr.Microphone(device_index=self.mic_index) as microphone:
                # Calibrate once per selected mic, not at the start of every
                # phrase where someone may already be speaking.
                if not self.mic_calibrated:
                    recognizer.adjust_for_ambient_noise(microphone, duration=.65)
                    self.mic_calibrated = True
                    self.queue.put(("hint", "Мікрофон готовий. Скажи «Джарвіс, "
                                    "котра година»."))
                try:
                    audio = recognizer.listen(
                        microphone, timeout=6 if with_wake_word else 7,
                        phrase_time_limit=9 if with_wake_word else 12)
                finally:
                    # Even on silence/timeout, preserve the updated automatic
                    # threshold across recognition attempts.
                    self.mic_energy_threshold = recognizer.energy_threshold
            if with_wake_word and (not self.handsfree.is_set()
                                   or (session_id is not None and
                                       session_id != self.handsfree_generation)):
                return
            self.queue.put(("mic_status", "●  RECOGNIZING"))
            spoken = recognizer.recognize_google(audio, language="uk-UA").strip()
            self.mic_error_streak = 0
            if not spoken:
                return
            if with_wake_word:
                if time.monotonic() <= self.followup_until:
                    self.followup_until = 0
                    self.handoff_pending.set()
                    self.queue.put(("heard", spoken))
                else:
                    command = extract_wake_command(spoken)
                    if command is None:
                        # Ignore ambient speech not addressed to JARVIS.
                        return
                    if command:
                        self.handoff_pending.set()
                        self.queue.put(("heard", command))
                    else:
                        self.followup_until = time.monotonic() + 12
                        self.queue.put(("hint", "Почув «Джарвіс». Слухаю команду "
                                        "протягом 12 секунд..."))
            else:
                self.queue.put(("heard", spoken))
        except ImportError:
            self.handsfree.clear()
            self.queue.put(("hint", "Голосовий ввід не встановлений. Запусти "
                            "INSTALL_VOICE.bat і перезапусти JARVIS."))
        except Exception as exc:
            reason = type(exc).__name__
            if reason in {"WaitTimeoutError", "UnknownValueError"}:
                return  # Silence or unrecognized background audio is normal.
            if reason == "RequestError":
                # Previously this disabled HANDS-FREE forever on a single
                # temporary Google STT/network error. Retry instead.
                self._mic_notice("Google Speech не відповідає. HANDS-FREE "
                                 "залишається увімкненим і спробує ще раз.")
                threading.Event().wait(2.0)
            elif reason in {"OSError", "AssertionError", "AttributeError"}:
                self.mic_error_streak += 1
                self.mic_calibrated = False
                if self.mic_error_streak >= 3:
                    self.handsfree.clear()
                    self.queue.put(("hint", "Не вдалося відкрити мікрофон 3 рази. "
                                    "Перевір дозволи мікрофона Windows; "
                                    "правим кліком на HANDS-FREE обери пристрій."))
                else:
                    self._mic_notice("Мікрофон тимчасово недоступний (" + reason
                                     + "). Повторюю спробу...", 5.0)
                    threading.Event().wait(1.2)
            else:
                logging.warning("Voice input failed: %s", reason)
                self._mic_notice("Розпізнавання голосу: " + reason
                                 + ". Перевір мікрофон і мережу.")
                threading.Event().wait(.5)
        finally:
            self.mic_listening.clear()
            self.mic_lock.release()
            self.queue.put(("mic_status", "●  READY"))

    def audio_worker(self):
        while self.alive:
            phrase = self.audio_queue.get()
            if not self.alive:
                break
            self.speaking.set()
            self.queue.put(("mic_status", "●  SPEAKING"))
            try:
                result = speak(phrase, self.voice_profile, self.voice_volume)
                if not result.ok:
                    self.queue.put(("hint", "ГОЛОС: " + result.detail))
            finally:
                threading.Event().wait(.12)
                if self.audio_queue.empty():
                    self.speaking.clear()
                self.queue.put(("mic_status", "●  READY"))

    def pump(self):
        try:
            while True:
                kind, data = self.queue.get_nowait()
                if kind == "answer":
                    message, success, action_kind = data
                    self.finish(str(message), success=success, action_kind=action_kind)
                elif kind == "ai_status":
                    online, label = data
                    self.ai_state.configure(text=label, fg=GREEN if online else AMBER)
                elif kind == "heard":
                    try:
                        if not self.busy and not self.pending:
                            self.submit(str(data), via_voice=True)
                    finally:
                        self.handoff_pending.clear()
                elif kind == "hint":
                    self.post("SYSTEM", str(data), "sys")
                elif kind == "mic_status" and not self.busy:
                    self.set_status(str(data), CYAN if data != "●  READY" else GREEN)
                elif (kind == "wake_off" and not self.handsfree.is_set()
                      and data == self.handsfree_generation):
                    self.handsfree_btn.configure(text="🎙  HANDS-FREE: OFF", bg=PANEL_2)
        except queue.Empty:
            pass
        if self.alive:
            self._refresh_spotify_button()
            self.root.after(90, self.pump)

    def close(self):
        self.alive = False
        self.handsfree_generation += 1
        self.handsfree.clear()
        self.handoff_pending.clear()
        self.save_settings()
        self.root.destroy()


if __name__ == "__main__":
    root = tk.Tk()
    JarvisApp(root)
    root.mainloop()
