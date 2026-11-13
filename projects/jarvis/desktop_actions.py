"""Restricted, user-visible desktop commands for JARVIS 4.2.

Never executes model-generated code, shell strings or remote commands.
System-changing actions require an explicit on-screen approval.
"""
from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
import json
from datetime import datetime
from pathlib import Path
from urllib.parse import quote_plus, urlsplit
import ctypes
import os
import re
import subprocess
import uuid
import webbrowser
from window_control import parse_ui, perform_ui


@dataclass(frozen=True)
class ActionPlan:
    kind: str
    target: str
    summary: str
    needs_approval: bool = False


APPROVAL_REQUIRED = {"note", "screenshot", "external_url", "installed_app", "user_file", "ui_hotkey", "ui_type"}

HELP_TEXT = (
    "Я можу відкрити блокнот, калькулятор, Paint, провідник, диспетчер задач, "
    "налаштування, папки Документи або Завантаження, YouTube, Google й GitHub; "
    "знайти інформацію в браузері, сказати час, змінити гучність, створити "
    "нотатку або зберегти скріншот після підтвердження. "
    "Можу знайти встановлену програму за назвою та запустити її після підтвердження. "
    "Також можу відкрити файл через діалог вибору та запустити Dota 2 через Steam. "
    "Системні та небезпечні дії не виконую без дозволу."
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
    "gmail": "https://mail.google.com", "пошту": "https://mail.google.com",
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


BLOCKED_APP_TERMS = (
    "powershell", "command prompt", "cmd", "terminal", "windows terminal",
    "registry editor", "regedit", "remote desktop", "ssh", "administrator",
    "task scheduler", "windows security", "windows defender", "services",
)

@lru_cache(maxsize=1)
def installed_start_apps() -> tuple[tuple[str, str], ...]:
    """Read user-visible Windows Start apps (no shell interpolation)."""
    if os.name != "nt":
        return ()
    cmd = ["powershell.exe", "-NoProfile", "-NonInteractive", "-Command",
           "[Console]::OutputEncoding=[System.Text.Encoding]::UTF8; Get-StartApps | Select-Object Name,AppID | ConvertTo-Json -Compress"]
    try:
        result = subprocess.run(cmd, text=True, encoding="utf-8", errors="replace", capture_output=True, timeout=12,
                                creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0),
                                check=False)
        if result.returncode:
            return ()
        data = json.loads(result.stdout.strip().lstrip("\ufeff") or "[]")
        if isinstance(data, dict):
            data = [data]
        output = []
        for item in data:
            name = str(item.get("Name", "")).strip()
            appid = str(item.get("AppID", "")).strip()
            if (name and appid and len(name) <= 140 and len(appid) <= 250
                    and "\n" not in appid and not any(x in name.casefold() for x in BLOCKED_APP_TERMS)):
                output.append((name, appid))
        return tuple(output)
    except (OSError, subprocess.TimeoutExpired, ValueError, TypeError):
        return ()


APP_NAME_ALIASES = {
    "дискорд": "discord", "телеграм": "telegram", "спотіфай": "spotify",
    "спотифай": "spotify", "ворд": "word", "ексель": "excel",
    "пауерпоінт": "powerpoint", "хром": "chrome", "хром браузер": "chrome",
    "файрфокс": "firefox", "оперу": "opera", "опера": "opera",
    "тіс": "teams", "тімс": "teams", "вс код": "visual studio code",
    "віжуал студіо код": "visual studio code",
}


def find_installed_app(query: str) -> tuple[str, str] | None:
    """Choose only one unambiguous exact Start-menu app match."""
    term = query.casefold().strip()
    term = APP_NAME_ALIASES.get(term, term)
    if not term or len(term) > 100 or any(x in term for x in BLOCKED_APP_TERMS):
        return None
    apps = installed_start_apps()
    exact = [(name, appid) for name, appid in apps if name.casefold() == term]
    if len(exact) == 1:
        return exact[0]
    matches = [(name, appid) for name, appid in apps if term in name.casefold()]
    return matches[0] if len(matches) == 1 else None


def plan_action(raw_text: str) -> ActionPlan | None:
    q = normalize(raw_text)
    # Spoken commands can include acknowledgments before the actual request.
    q = re.sub(r"^(?:(?:гаразд|окей|добре|ну|слухай)[,\s]+)+(?:а\s+)?", "", q)
    q = re.sub(r"\s*[,;]\s*", " ", q).strip()
    if not q:
        return None
    original_ui = re.sub(r"^(?:(?:джарвісе|джарвіс|джарвис|jarvis)[\\s,!:;.-]+)", "", raw_text.strip(), flags=re.I)
    original_ui = re.sub(r"^(?:(?:гаразд|окей|добре|ну|слухай)[,\\s]+)+(?:а\\s+)?", "", original_ui, flags=re.I)
    ui = parse_ui(original_ui)
    if ui:
        kind, payload, preview = ui
        return ActionPlan("ui_" + kind, payload, preview, True)
    # A Steam launch URI starts Steam automatically before opening Dota 2.
    steam = r"(?:стім|стим|steam)"
    dota = r"(?:доту(?: 2)?|дота(?: 2)?|dota(?: 2)?)"
    verb = r"(?:відкрий|відкрити|запусти|запустити|включи|увімкни|open|launch)"
    if (re.fullmatch(fr"{verb} {steam}\s+(?:і|та|а потім|потім)\s+{verb} {dota}", q)
            or re.fullmatch(fr"{verb} {steam}\s+а\s+потім\s+{verb} {dota}", q)
            or re.fullmatch(fr"{verb} {dota}(?: через {steam})?", q)):
        return ActionPlan("known_uri", "steam://run/570", "Запустити Dota 2 через Steam")
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
    if q in {"відкрий файл", "обери файл", "покажи файл", "відкрити файл"}:
        return ActionPlan("file_picker", "", "Вибрати файл на цьому комп’ютері")
    if q in {"зроби скріншот", "скріншот", "знімок екрана"}:
        return ActionPlan("screenshot", "", "Зберегти знімок екрана локально", True)
    m = re.fullmatch(r"(?:запиши|створи|збережи|зроби) (?:нотатк[уа]|замітку)[:\s]+(.+)", q, flags=re.S)
    if m:
        content = m.group(1).strip()[:1000]
        return ActionPlan("note", content, "Створити текстову нотатку: " + content[:90], True)
    m = re.fullmatch(r"(?:відкрий|відкрити|запусти|запустити|покажи|open) (.+)", q)
    if m:
        name = m.group(1).strip()
        if name in {"стім", "стим", "steam"}:
            return ActionPlan("known_uri", "steam://open/main", "Відкрити Steam")
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
        found = find_installed_app(name)
        if found:
            display, appid = found
            return ActionPlan("installed_app", appid, "Запустити встановлену програму: " + display, True)
        return ActionPlan("say", "Не знайшов такої програми в меню Пуск. Скажи точну назву з меню Пуск або «відкрий файл».", "Програму не знайдено")
    m = re.fullmatch(r"(?:знайди|пошукай|загугли|search) (.+)", q)
    if m:
        return ActionPlan("website", "https://www.google.com/search?q=" + quote_plus(m.group(1)), "Пошук у Google")
    if re.match(r"^(?:видали|видалити|очисти|очистити|вимкни комп|перезавантаж|запусти команду|виконай код|відправ|надішли файл)", q):
        return ActionPlan("say", "Цю дію не виконую автоматично заради безпеки комп'ютера.", "Обмежена дія")
    # An unknown desktop instruction is not a normal chat request; the AI
    # cannot run it, so offer a precise example instead of a misleading refusal.
    if re.search(r"\b(?:відкрий|відкрити|запусти|запустити|включи|увімкни|open|launch)\b", q):
        return ActionPlan("say", "Не розпізнав усієї команди. Скажи, наприклад: «Джарвіс, відкрий Steam і запусти Доту» або «відкрий блокнот».", "Уточнення команди")
    return None


def run_action(action: ActionPlan) -> str:
    """Call only after explicit approval for sensitive plans, on the local PC."""
    if action.kind in APPROVAL_REQUIRED and not action.needs_approval:
        raise ValueError("Approval metadata required")
    if action.kind == "say":
        return action.target
    if action.kind in {"ui_hotkey", "ui_type"}:
        return perform_ui(action.kind[3:], action.target)
    if action.kind == "file_picker":
        return "Обери файл у вікні вибору."
    if action.kind in {"website", "external_url"}:
        if action.kind == "external_url" and not safe_external_url(action.target):
            raise ValueError("Refused external URL")
        webbrowser.open(action.target)
        return "Відкриваю сторінку у браузері."
    if os.name != "nt":
        return "Керування системою доступне лише у Windows."
    if action.kind == "known_uri":
        allowed_steam_uris = {
            "steam://open/main": "Надсилаю Steam команду відкриття.",
            "steam://run/570": "Надсилаю Steam команду запуску Dota 2. Якщо гру не встановлено, Steam може запропонувати встановлення.",
        }
        if action.target not in allowed_steam_uris:
            raise ValueError("Unknown URI protocol")
        os.startfile(action.target)
        return allowed_steam_uris[action.target]
    if action.kind == "installed_app":
        matches = [(name, appid) for name, appid in installed_start_apps()
                   if appid == action.target]
        if len(matches) != 1:
            raise ValueError("Start-menu app not found or ambiguous")
        subprocess.Popen(["explorer.exe", "shell:AppsFolder\\" + action.target], shell=False)
        return "Запускаю: " + matches[0][0]
    if action.kind == "user_file":
        chosen = Path(action.target)
        denied = {".exe", ".msi", ".bat", ".cmd", ".ps1", ".vbs", ".js", ".reg",
                  ".scr", ".pif", ".hta", ".lnk", ".py", ".jar", ".wsf", ".url"}
        if not chosen.is_file() or chosen.suffix.lower() in denied:
            raise ValueError("File is not available or executable/script files are blocked")
        os.startfile(str(chosen))
        return "Відкриваю вибраний файл."
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
