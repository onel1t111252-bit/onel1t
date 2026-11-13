"""Visible, consent-gated keyboard automation for the foreground Windows app.

No remote control, shell execution, arbitrary code, password entry, or background targeting.
Requires pyautogui; commands are explicitly reviewed in the JARVIS approval panel.
"""
from __future__ import annotations
import os
import re
import time

KEYS = {
    "скопіюй": ("ctrl", "c"), "копіюй": ("ctrl", "c"),
    "встав": ("ctrl", "v"), "виділи все": ("ctrl", "a"),
    "збережи": ("ctrl", "s"), "скасуй дію": ("ctrl", "z"),
    "повтори дію": ("ctrl", "y"), "знайди на сторінці": ("ctrl", "f"),
    "нова вкладка": ("ctrl", "t"), "закрий вкладку": ("ctrl", "w"),
    "наступна вкладка": ("ctrl", "tab"), "перемкни вікно": ("alt", "tab"),
    "натисни ентер": ("enter",), "натисни escape": ("esc",),
}
TYPE_PREFIX = re.compile(r"^(?:надрукуй|введи текст|напиши текст)[:\s]+(.+)$", re.S)
BLOCKED = re.compile(r"(?:парол|password|токен|token|секрет|secret|api.key|otp|2fa)", re.I)

def parse_ui(text: str):
    """Return (kind, payload, human-readable preview), or None."""
    q = " ".join(text.casefold().strip().split())
    if q in KEYS:
        return ("hotkey", "+".join(KEYS[q]), "Натиснути " + "+".join(KEYS[q]) + " в активному вікні")
    m = TYPE_PREFIX.fullmatch(text.strip())
    if m:
        value = m.group(1).strip()
        if not value or len(value) > 500 or BLOCKED.search(value):
            return None
        return ("type", value, "Ввести в активне вікно: " + value[:90])
    return None

def perform_ui(kind: str, payload: str) -> str:
    if os.name != "nt":
        return "Керування вікнами підтримується лише у Windows."
    try:
        import pyautogui as pg
    except ImportError:
        return "Потрібен модуль pyautogui: python -m pip install pyautogui"
    pg.FAILSAFE = True
    if kind == "hotkey":
        keys = tuple(payload.split("+"))
        if keys not in KEYS.values():
            raise ValueError("Hotkey not allowlisted")
    elif kind == "type":
        if not payload or len(payload) > 500 or BLOCKED.search(payload):
            raise ValueError("Text rejected")
    else:
        raise ValueError("Unsupported UI action")
    # Allow the owner to focus the intended window after pressing APPROVE.
    time.sleep(2)
    if kind == "hotkey":
        pg.hotkey(*keys, interval=0.08)
    else:
        # Unicode text uses the clipboard, with previous clipboard restored.
        # pyautogui.write() cannot reliably type Ukrainian letters.
        try:
            import tkinter as tk
            root = tk.Tk()
            root.withdraw()
            try:
                old = root.clipboard_get()
            except tk.TclError:
                old = None
            root.clipboard_clear()
            root.clipboard_append(payload)
            root.update()
            pg.hotkey("ctrl", "v")
            time.sleep(0.25)
            root.clipboard_clear()
            if old is not None:
                root.clipboard_append(old)
            root.update()
            root.destroy()
        except Exception:
            raise RuntimeError("Не вдалося вставити текст. Перевір буфер обміну.")
    return "Дію надіслано активному вікну. Перевір результат на екрані."
