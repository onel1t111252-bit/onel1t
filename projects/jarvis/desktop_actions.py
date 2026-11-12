"""Restricted, user-visible desktop commands for JARVIS 4.0.

Never executes model-generated code, shell strings or remote commands.
System-changing actions require an explicit on-screen approval.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from urllib.parse import quote_plus, urlsplit
import ctypes
import os
import re
import subprocess
import uuid
import webbrowser


@dataclass(frozen=True)
class ActionPlan:
    kind: str
    target: str
    summary: str
    needs_approval: bool = False


APPROVAL_REQUIRED = {"note", "screenshot", "external_url"}

HELP_TEXT = (
    "Я можу відкрити блокнот, калькулятор, Paint, провідник, диспетчер задач, "
    "налаштування, папки Документи або Завантаження, YouTube, Google й GitHub; "
    "знайти інформацію в браузері, сказати час, змінити гучність, створити "
    "нотатку або зберегти скріншот після підтвердження. "
    "Дії за межами дозволеного списку не виконую."
)

APPS = {
    "блокнот": "notepad.exe", "notepad": "notepad.exe",
    "калькулятор": "calc.exe", "calculator": "calc.exe",
    "paint": "mspaint.exe", "пейнт": "mspaint.exe",
    "провідник": "explorer.exe", "explorer": "explorer.exe",
    "диспетчер задач": "taskmgr.exe", "task manager": "taskmgr.exe",
}

FOLDERS = {
    "робочий стіл": "Desktop", "стільницю": "Desktop",
    "документи": "Documents", "documents": "Documents",
    "завантаження": "Downloads", "downloads": "Downloads",
    "зображення": "Pictures", "pictures": "Pictures",
    "музику": "Music", "music": "Music",
}

WEBSITES = {
    "ютуб": "https://www.youtube.com", "youtube": "https://www.youtube.com",
    "google": "https://www.google.com", "гугл": "https://www.google.com",
    "браузер": "https://www.google.com", "github": "https://github.com",
    "гітхаб": "https://github.com", "вікіпедію": "https://uk.wikipedia.org",
}


def normalize(text: str) -> str:
    value = re.sub(r"\s+", " ", text.casefold().strip())
    return re.sub(r"^(?:(?:джарвісе|джарвіс|джарвис|jarvis)[\s,!:;.-]+)", "", value).strip(" !?.")


def safe_external_url(value: str) -> str | None:
    """Accept only plain HTTPS domains without credentials, ports or local hosts."""
    value = value.strip()
    if not value or any(x in value for x in ("@", "\\", " ", "#")):
        return None
    if not re.match(r"^https?://", value, flags=re.I):
        value = "https://" + value
    try:
        parts = urlsplit(value)
        port = parts.port
    except ValueError:
        return None
    host = parts.hostname or ""
    if (parts.scheme != "https" or parts.username or parts.password
            or port is not None or host == "localhost"
            or not re.fullmatch(r"[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,24}", host)
            or ".." in host):
        return None
    return value


def plan_action(raw_text: str) -> ActionPlan | None:
    q = normalize(raw_text)
    if not q:
        return None
    if q in {"допомога", "команди", "help", "що ти вмієш"}:
        return ActionPlan("say", HELP_TEXT, "Список можливостей")
    if q in {"привіт", "вітаю", "hello", "hi"}:
        return ActionPlan("say", "Вітаю! Джарвіс на зв'язку.", "Привітання")
    if q in {"як тебе звати", "хто ти"}:
        return ActionPlan("say", "Я Джарвіс, персональний ШІ-помічник для Windows 11.", "Представлення")
    if q in {"котра година", "скільки часу", "яка година"}:
        return ActionPlan("say", "Зараз " + datetime.now().strftime("%H:%M") + ".", "Поточний час")
    if q in {"яка дата", "яке сьогодні число"}:
        return ActionPlan("say", "Сьогодні " + datetime.now().strftime("%d.%m.%Y") + ".", "Дата")
    if q in {"зроби голосніше", "збільш гучність", "голосніше"}:
        return ActionPlan("volume", "up", "Підвищити гучність")
    if q in {"зроби тихіше", "зменш гучність", "тихіше"}:
        return ActionPlan("volume", "down", "Зменшити гучність")
    if q in {"вимкни звук", "вимкнути звук", "увімкни звук"}:
        return ActionPlan("volume", "mute", "Перемкнути звук")
    if q in {"зроби скріншот", "скріншот", "знімок екрана"}:
        return ActionPlan("screenshot", "", "Зберегти знімок екрана локально", True)
    m = re.fullmatch(r"(?:запиши|створи|збережи|зроби) (?:нотатк[уа]|замітку)[:\s]+(.+)", q, flags=re.S)
    if m:
        content = m.group(1).strip()[:1000]
        return ActionPlan("note", content, "Створити текстову нотатку: " + content[:90], True)
    m = re.fullmatch(r"(?:відкрий|відкрити|запусти|запустити|покажи|open) (.+)", q)
    if m:
        name = m.group(1).strip()
        if name in APPS:
            return ActionPlan("app", APPS[name], "Відкрити: " + name)
        if name in FOLDERS:
            return ActionPlan("folder", FOLDERS[name], "Відкрити папку: " + name)
        if name in WEBSITES:
            return ActionPlan("website", WEBSITES[name], "Відкрити: " + name)
        if name in {"параметри", "налаштування", "settings"}:
            return ActionPlan("settings", "ms-settings:", "Відкрити налаштування Windows")
        if name.startswith("сайт ") or name.startswith("website "):
            url = safe_external_url(name.split(" ", 1)[1])
            if url:
                return ActionPlan("external_url", url, "Відкрити зовнішній сайт: " + url, True)
        return ActionPlan("say", "Цю програму я поки не вмію відкривати. Скажи «допомога».", "Невідома команда")
    m = re.fullmatch(r"(?:знайди|пошукай|загугли|search) (.+)", q)
    if m:
        return ActionPlan("website", "https://www.google.com/search?q=" + quote_plus(m.group(1)), "Пошук у Google")
    if re.match(r"^(?:видали|видалити|очисти|очистити|вимкни комп|перезавантаж|запусти команду|виконай код|відправ|надішли файл)", q):
        return ActionPlan("say", "Цю дію не виконую автоматично заради безпеки комп'ютера.", "Обмежена дія")
    return None


def run_action(action: ActionPlan) -> str:
    """Call only after explicit approval for sensitive plans, on the local PC."""
    if action.kind in APPROVAL_REQUIRED and not action.needs_approval:
        raise ValueError("Approval metadata required")
    if action.kind == "say":
        return action.target
    if action.kind in {"website", "external_url"}:
        if action.kind == "external_url" and not safe_external_url(action.target):
            raise ValueError("Refused external URL")
        webbrowser.open(action.target)
        return "Відкриваю сторінку у браузері."
    if os.name != "nt":
        return "Керування системою доступне лише у Windows."
    if action.kind == "app":
        if action.target not in APPS.values():
            raise ValueError("App is not allowlisted")
        subprocess.Popen([action.target], shell=False)
        return "Відкриваю програму."
    if action.kind == "folder":
        if action.target not in FOLDERS.values():
            raise ValueError("Folder is not allowlisted")
        folder = Path.home() / action.target
        if folder.exists():
            os.startfile(str(folder))
            return "Відкриваю папку."
        return "Цю папку не знайдено у профілі Windows."
    if action.kind == "settings":
        os.startfile("ms-settings:")
        return "Відкриваю налаштування Windows."
    if action.kind == "volume":
        keys = {"up": 0xAF, "down": 0xAE, "mute": 0xAD}
        if action.target not in keys:
            raise ValueError("Unsupported volume command")
        key = keys[action.target]
        for _ in range(3 if action.target != "mute" else 1):
            ctypes.windll.user32.keybd_event(key, 0, 0, 0)
            ctypes.windll.user32.keybd_event(key, 0, 0x0002, 0)
        return "Гучність змінено."
    if action.kind == "note":
        path = Path.home() / "Documents" / "JARVIS Notes"
        path.mkdir(parents=True, exist_ok=True)
        filename = f"note_{datetime.now():%Y%m%d_%H%M%S}_{uuid.uuid4().hex[:5]}.txt"
        dest = path / filename
        with dest.open("x", encoding="utf-8") as f:
            f.write(action.target + "\n")
        return "Нотатку збережено в Документи / JARVIS Notes."
    if action.kind == "screenshot":
        from PIL import ImageGrab
        path = Path.home() / "Pictures" / "JARVIS Screenshots"
        path.mkdir(parents=True, exist_ok=True)
        dest = path / f"screen_{datetime.now():%Y%m%d_%H%M%S}_{uuid.uuid4().hex[:5]}.png"
        ImageGrab.grab(all_screens=True).save(dest)
        return "Скріншот збережено в Зображення / JARVIS Screenshots."
    raise ValueError("Unrecognized plan kind")
