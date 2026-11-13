"""Consent-first, foreground-only Windows UI controls.

No shell commands, scripts, off-screen coordinates or hidden remote control.
The JARVIS window must show and approve every sensitive action.
"""
from __future__ import annotations

import ctypes
from ctypes import wintypes
import os
import re
import time
from dataclasses import dataclass

KEYS: dict[str, tuple[str, ...]] = {
    "скопіюй": ("ctrl", "c"), "копіюй": ("ctrl", "c"),
    "встав": ("ctrl", "v"), "виділи все": ("ctrl", "a"),
    "збережи": ("ctrl", "s"), "скасуй дію": ("ctrl", "z"),
    "повтори дію": ("ctrl", "y"), "знайди на сторінці": ("ctrl", "f"),
    "нова вкладка": ("ctrl", "t"), "закрий вкладку": ("ctrl", "w"),
    "наступна вкладка": ("ctrl", "tab"),
    "попередня вкладка": ("ctrl", "shift", "tab"),
    "натисни ентер": ("enter",), "натисни escape": ("esc",),
}
SHOW_WINDOWS = {"покажи вікна", "список вікон", "покажи відкриті вікна", "які вікна відкриті"}
SCROLL = {"прокрути вниз": -3, "прокрути вгору": 3}
CLICK = {"клацни мишею", "натисни мишею", "клікни мишею"}
TYPE_PREFIX = re.compile(r"^(?:надрукуй|введи текст|напиши текст)[:\s]+(.+)$", re.I | re.S)
FOCUS_PREFIX = re.compile(r"^(?:перемкнись на|перейди до вікна|активуй вікно)\s+(.+)$", re.I)
BLOCKED = re.compile(r"(?:парол|password|токен|token|секрет|secret|api.?key|одноразов[ийі]|otp|2fa)", re.I)
PROTECTED_TITLES = (
    "user account control", "windows security", "безпека windows",
    "контроль облікових записів", "windows terminal", "powershell",
    "command prompt", "командний рядок", "cmd.exe", "registry editor",
    "remote desktop", "task scheduler", "administrator:",
)


@dataclass(frozen=True)
class WindowInfo:
    hwnd: int
    pid: int
    title: str


def parse_ui(text: str) -> tuple[str, str, str] | None:
    """Only literal owner-requested actions. Dictated text keeps its case."""
    raw = text.strip()
    normalized = " ".join(raw.casefold().split())
    if normalized in SHOW_WINDOWS:
        return "windows", "", "Показати назви відкритих вікон (локально)"
    if normalized in KEYS:
        keys = "+".join(KEYS[normalized])
        return "hotkey", keys, f"Натиснути {keys} в активному вікні"
    if normalized in SCROLL:
        return "scroll", str(SCROLL[normalized]), "Прокрутити активне вікно " + normalized.split()[-1]
    if normalized in CLICK:
        return "click", "cursor", "Один клік у поточній позиції курсора після підтвердження"
    match = FOCUS_PREFIX.fullmatch(raw)
    if match:
        title = match.group(1).strip()
        if 1 <= len(title) <= 90 and not BLOCKED.search(title):
            return "focus", title, "Активувати видиме вікно з назвою: " + title
        return None
    match = TYPE_PREFIX.fullmatch(raw)
    if match:
        value = match.group(1).strip()
        if 1 <= len(value) <= 500 and not BLOCKED.search(value):
            return "type", value, "Ввести в активне вікно: " + value[:90]
    return None


def _protected_title(title: str) -> bool:
    low = title.casefold()
    return ("jarvis" in low or "джарвіс" in low
            or any(x in low for x in PROTECTED_TITLES))


def _windows() -> list[WindowInfo]:
    """Read visible window titles only, never their contents."""
    if os.name != "nt":
        return []
    user32 = ctypes.windll.user32
    user32.GetWindowTextLengthW.argtypes = [wintypes.HWND]
    user32.GetWindowTextW.argtypes = [wintypes.HWND, wintypes.LPWSTR, ctypes.c_int]
    user32.IsWindowVisible.argtypes = [wintypes.HWND]
    user32.GetWindowThreadProcessId.argtypes = [wintypes.HWND, ctypes.POINTER(wintypes.DWORD)]
    items: list[WindowInfo] = []
    callback_t = ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)

    @callback_t
    def callback(hwnd: int, _lparam: int) -> bool:
        if not user32.IsWindowVisible(hwnd):
            return True
        n = user32.GetWindowTextLengthW(hwnd)
        if not (0 < n <= 512):
            return True
        buf = ctypes.create_unicode_buffer(n + 1)
        user32.GetWindowTextW(hwnd, buf, n + 1)
        title = buf.value.strip()
        if title and not _protected_title(title):
            pid = wintypes.DWORD()
            user32.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))
            items.append(WindowInfo(int(hwnd), int(pid.value), title))
        return True

    user32.EnumWindows(callback, 0)
    return items[:200]


def _active_window() -> WindowInfo:
    if os.name != "nt":
        raise RuntimeError("Керування вікнами працює лише у Windows.")
    ctypes.windll.user32.GetForegroundWindow.restype = wintypes.HWND
    hwnd = ctypes.windll.user32.GetForegroundWindow()
    matches = [w for w in _windows() if w.hwnd == hwnd]
    if not matches:
        raise RuntimeError("Активуй звичайне вікно програми, не JARVIS, термінал чи системний діалог.")
    return matches[0]


def _write_unicode(text: str) -> None:
    """Unicode SendInput, no clipboard contents read or overwritten."""
    if os.name != "nt":
        raise RuntimeError("Windows only")

    class KEYBDINPUT(ctypes.Structure):
        _fields_ = [("wVk", wintypes.WORD), ("wScan", wintypes.WORD),
                    ("dwFlags", wintypes.DWORD), ("time", wintypes.DWORD),
                    ("dwExtraInfo", ctypes.c_size_t)]

    class MOUSEINPUT(ctypes.Structure):
        _fields_ = [("dx", wintypes.LONG), ("dy", wintypes.LONG),
                    ("mouseData", wintypes.DWORD), ("dwFlags", wintypes.DWORD),
                    ("time", wintypes.DWORD), ("dwExtraInfo", ctypes.c_size_t)]

    class HARDWAREINPUT(ctypes.Structure):
        _fields_ = [("uMsg", wintypes.DWORD), ("wParamL", wintypes.WORD),
                    ("wParamH", wintypes.WORD)]

    class INPUTUNION(ctypes.Union):
        _fields_ = [("ki", KEYBDINPUT), ("mi", MOUSEINPUT), ("hi", HARDWAREINPUT)]

    class INPUT(ctypes.Structure):
        _fields_ = [("type", wintypes.DWORD), ("value", INPUTUNION)]

    send_input = ctypes.windll.user32.SendInput
    send_input.argtypes = (wintypes.UINT, ctypes.POINTER(INPUT), ctypes.c_int)
    send_input.restype = wintypes.UINT
    units = text.encode("utf-16-le")
    for index in range(0, len(units), 2):
        scan = int.from_bytes(units[index:index + 2], "little")
        events = (INPUT * 2)(
            INPUT(1, INPUTUNION(ki=KEYBDINPUT(0, scan, 0x0004, 0, 0))),
            INPUT(1, INPUTUNION(ki=KEYBDINPUT(0, scan, 0x0006, 0, 0))),
        )
        if send_input(2, events, ctypes.sizeof(INPUT)) != 2:
            raise RuntimeError("Windows не прийняла введення Unicode.")


def perform_ui(kind: str, payload: str, *, delay: float = 2.5) -> str:
    """One visible previously approved action; not an autonomous computer agent."""
    if kind == "windows":
        if payload:
            raise ValueError("Invalid windows payload")
        if os.name != "nt":
            return "Список вікон доступний лише у Windows."
        titles = [w.title for w in _windows()][:15]
        return ("Відкриті вікна:\n" + "\n".join("• " + x for x in titles)
                if titles else "Видимих вікон не знайдено.")
    if os.name != "nt":
        return "Керування вікнами доступне лише у Windows."
    if kind == "focus":
        if not payload or len(payload) > 90 or BLOCKED.search(payload):
            raise ValueError("Invalid window name")
        windows = _windows()
        matches = [w for w in windows if w.title.casefold() == payload.casefold()]
        if not matches:
            matches = [w for w in windows if payload.casefold() in w.title.casefold()]
        if len(matches) != 1:
            return "Вікно не знайдено або назва неоднозначна. Скажи точнішу назву через «покажи вікна»."
        win = matches[0]
        user32 = ctypes.windll.user32
        user32.GetForegroundWindow.restype = wintypes.HWND
        user32.SetForegroundWindow.argtypes = [wintypes.HWND]
        user32.ShowWindow.argtypes = [wintypes.HWND, ctypes.c_int]
        user32.ShowWindow(win.hwnd, 9)
        user32.SetForegroundWindow(win.hwnd)
        time.sleep(0.15)
        if user32.GetForegroundWindow() != win.hwnd:
            return "Windows не дозволила активувати вікно. Перемкнись у нього вручну."
        return "Активовано вікно: " + win.title
    if kind not in {"hotkey", "type", "scroll", "click"}:
        raise ValueError("Unsupported UI kind")
    if kind == "hotkey" and tuple(payload.split("+")) not in KEYS.values():
        raise ValueError("Hotkey not allowlisted")
    if kind == "type" and (not 1 <= len(payload) <= 500 or BLOCKED.search(payload)):
        raise ValueError("Unsafe or oversized text")
    if kind == "scroll" and payload not in {"3", "-3"}:
        raise ValueError("Invalid scroll")
    if kind == "click" and payload != "cursor":
        raise ValueError("Only click at current cursor is supported")
    try:
        import pyautogui as pg
    except ImportError:
        return "Не встановлено PyAutoGUI. Запусти INSTALL_VOICE.bat."
    pg.FAILSAFE = True
    time.sleep(delay)  # User focuses the intended program after pressing CONFIRM.
    before = _active_window()
    if kind == "hotkey":
        pg.hotkey(*payload.split("+"), interval=0.08)
    elif kind == "scroll":
        pg.scroll(int(payload))
    elif kind == "click":
        pg.click()
    else:
        _write_unicode(payload)
    after = _active_window()
    if after.hwnd != before.hwnd:
        return "Дію відправлено, але фокус вікна змінився. Перевір результат вручну."
    return "Дію відправлено у вікно «" + before.title + "». Перевір результат на екрані."
