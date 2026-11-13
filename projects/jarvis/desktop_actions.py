"""Restricted, user-visible desktop commands for JARVIS 3.0.

Never executes model-generated code, shell strings or remote commands.
System-changing actions require an explicit on-screen approval.
"""
from __future__ import annotations

from dataclasses import dataclass
from functools import lru_cache
import json
from datetime import datetime
from pathlib import Path
from urllib.parse import quote, quote_plus, urlsplit
import ctypes
import os
import re
import subprocess
import uuid
import webbrowser
from window_control import parse_ui, perform_ui
from spotify_control import spotify_connection, SpotifyError
from spotify_desktop import play_in_desktop, SpotifyDesktopError
from steam_control import (SteamError, find_installed_game, list_installed_games,
                           open_steam_first, launch_installed_game)


@dataclass(frozen=True)
class ActionPlan:
    kind: str
    target: str
    summary: str
    needs_approval: bool = False


APPROVAL_REQUIRED = {"note", "screenshot", "external_url", "installed_app", "user_file", "ui_hotkey", "ui_type", "ui_scroll", "ui_click", "ui_focus", "spotify_connect", "spotify_play", "spotify_pause", "spotify_resume", "spotify_next", "spotify_previous", "steam_open_first", "steam_game"}

# An explicit typed command or a wake-word-activated voice command is enough
# consent for these ordinary, visible, bounded actions. Preserve the existing
# approval metadata and safeguards inside run_action; never silently approve
# arbitrary UI typing, clicks, file writes, or external website URLs.
DIRECT_EXECUTION_KINDS = frozenset({
    "app", "folder", "website", "settings", "installed_app",
    "steam_open_first", "steam_game", "steam_list",
    "spotify_search", "spotify_play", "spotify_pause",
    "spotify_resume", "spotify_next", "spotify_previous",
    "say", "volume", "ui_windows", "youtube_search",
})


def can_execute_directly(action: ActionPlan | None) -> bool:
    return action is not None and action.kind in DIRECT_EXECUTION_KINDS


HELP_TEXT = (
    "Я можу відкрити блокнот, калькулятор, Paint, провідник, диспетчер задач, "
    "налаштування, папки Документи або Завантаження, YouTube, Google й GitHub; "
    "знайти відео на YouTube за темою однією командою, "
    "знайти інформацію в браузері, сказати час, змінити гучність, створити "
    "нотатку або зберегти скріншот після підтвердження. "
    "Можу знайти встановлену програму за назвою та запустити її без зайвого підтвердження. "
    "Також можу відкрити файл через діалог вибору, показати локально встановлені ігри Steam, "
    "вибрати перший збережений акаунт ПЕРЕД запуском Steam і запустити встановлену гру за назвою. "
    "Можу шукати пісні у Spotify, а після добровільного підключення офіційного Spotify API — "
    "відтворювати композиції, ставити на паузу й перемикати треки за наявності Spotify Premium. "
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


_YOUTUBE_NAME = r"(?:youtube|you\s*tube|ютуб(?:і|у|а|е)?|ютюб(?:і|у)?)"
_YOUTUBE_SEARCH_VERB = r"(?:знайди|знайти|пошукай|шукай|відшукай|покажи|search|find)"
_YOUTUBE_VIDEO_CUE = r"(?:відео|відеоролики?|ролики?|уроки?|відеоуроки?|туторіали?)"


def youtube_search_plan(q: str) -> ActionPlan | None:
    """Parse the ENTIRE Ukrainian YouTube request before generic app routing.

    Supports single and compound commands, including "відкрий ютуб і знайди
    відео по програмуванню". Never opens arbitrary links from recognized text:
    the search term is URL-encoded into YouTube's known HTTPS search page.
    """
    phrase = q.strip()
    # Sometimes speech recognition omits "і" or punctuation between verbs.
    opener = re.fullmatch(
        rf"(?:відкрий|відкрити|запусти|запустити|увімкни)\s+"
        rf"(?:сайт\s+)?{_YOUTUBE_NAME}\s+"
        rf"(?:(?:і|та|а потім|потім)\s+)?(.+)",
        phrase,
    )
    if opener:
        phrase = opener.group(1)

    # The user may start with "YouTube, знайди ...".
    platform_was_explicit = bool(opener)
    if re.match(rf"^{_YOUTUBE_NAME}\s+", phrase):
        platform_was_explicit = True
    phrase = re.sub(rf"^{_YOUTUBE_NAME}\s+", "", phrase)
    match = re.fullmatch(rf"{_YOUTUBE_SEARCH_VERB}\s+(.+)", phrase)
    if not match:
        return None
    detail = match.group(1).strip()
    detail = re.sub(r"^(?:мені|будь ласка)\s+", "", detail)
    has_youtube = bool(re.search(rf"(?<!\w){_YOUTUBE_NAME}\b", detail))
    has_video = bool(re.search(rf"(?<!\w){_YOUTUBE_VIDEO_CUE}\b", detail))
    if not (platform_was_explicit or has_youtube or has_video):
        return None  # Ordinary web search remains Google search.

    # Accept "знайди відео на ютубі по ..." and "знайди на ютубі
    # відео про ..." without dropping the actual requested topic.
    platform_prefix = rf"^(?:(?:в|у|на|через)\s+)?{_YOUTUBE_NAME}\s+"
    video_prefix = rf"^{_YOUTUBE_VIDEO_CUE}\s+"
    for _ in range(3):
        previous = detail
        detail = re.sub(platform_prefix, "", detail)
        detail = re.sub(video_prefix, "", detail)
        detail = re.sub(r"^(?:мені|будь ласка)\s+", "", detail)
        if detail == previous:
            break
    detail = re.sub(
        rf"\s+(?:(?:в|у|на|через)\s+)?{_YOUTUBE_NAME}$", "", detail)
    detail = re.sub(r"^(?:про|по|з|із|за|на тему|щодо)\s+", "", detail)
    detail = re.sub(r"\s+будь ласка$", "", detail)
    detail = detail.strip(" !?.,:;«»\"'")
    if not 2 <= len(detail) <= 160 or detail in {
        "відео", "урок", "уроки", "ютуб", "ютубі", "youtube", "пошук",
    }:
        return None
    return ActionPlan(
        "youtube_search", detail,
        "Знайти відео на YouTube за запитом: " + detail,
    )


def spotify_music_plan(q: str) -> ActionPlan | None:
    """Fast, deterministic Ukrainian music routing; never send music to Ollama.

    Spotify searches open its official search page without requiring Developer API.
    Automatic playback is a separate, approval-gated command.
    """
    platform = r"(?:spotify|спотіфай|спотифай|спотефай|спотіфаї|спотифаї)"
    m = re.fullmatch(
        r"(знайди|пошукай|шукай|відшукай|search|увімкни|включи|відтвори|програй|постав|запусти|play)\s+(.+)",
        q, flags=re.I)
    if not m:
        return None
    verb, text = m.group(1), m.group(2).strip()
    if q in {"постав музику на паузу", "зупини музику", "продовж музику"}:
        return None  # Explicit playback transport commands handle these.
    text = re.sub(r"^(?:мені|будь ласка)\s+", "", text)
    original = text
    explicit = bool(re.search(rf"\b{platform}\b", text, flags=re.I))
    named_song = bool(re.search(r"^(?:пісню|трек|композицію)\b", text))
    text = re.sub(rf"^(?:(?:в|у|на|через)\s+)?{platform}\s+", "", text, flags=re.I)
    text = re.sub(r"^(?:пісню|трек|композицію|музику)\s+", "", text)
    # STT often puts the platform AFTER "пісню": "увімкни пісню
    # в Spotify Numb". Strip that second position as well.
    text = re.sub(rf"^(?:(?:в|у|на|через)\s+)?{platform}\s+", "", text, flags=re.I)
    text = re.sub(rf"\s+(?:(?:в|у|на|через)\s+)?{platform}$", "", text, flags=re.I)
    text = re.sub(r"^(?:пісню|трек|композицію|музику)\s+", "", text)
    text = re.sub(r"\s+будь ласка$", "", text)
    text = text.strip(" !?.,:;«»\"'")
    blocked = {"", "звук", "гучність", "музику", "пісню", "трек",
               "spotify", "спотіфай", "спотифай",
               "доту", "доту 2", "дота", "дота 2", "комп", "комп'ютер",
               "браузер", "калькулятор", "мікрофон"}
    if (not 1 <= len(text) <= 120 or text in blocked or
            re.match(r"^(?:гру|програму|застосунок|додаток)\b", original)):
        return None
    searching = verb in {"знайди", "пошукай", "шукай", "відшукай", "search"}
    if searching:
        if not explicit and not named_song:
            return None  # Keep generic Google search.
        return ActionPlan("spotify_search", text, "Швидко знайти у Spotify: " + text)
    if verb in {"запусти"} and not (explicit or named_song):
        return None  # Steam, games and installed apps take priority.
    return ActionPlan("spotify_play", text,
                      "Знайти й відтворити у Spotify: " + text
                      + " (якщо підключений API; інакше відкрити пошук)", True)


def plan_action(raw_text: str) -> ActionPlan | None:
    q = normalize(raw_text)
    # Spoken commands can include acknowledgments before the actual request.
    q = re.sub(r"^(?:(?:гаразд|окей|добре|ну|слухай)[,\s]+)+(?:а\s+)?", "", q)
    q = re.sub(r"\s*[,;]\s*", " ", q).strip()
    if not q:
        return None
    original_ui = re.sub(r"^(?:(?:джарвісе|джарвіс|джарвис|jarvis)[\s,!:;.-]+)", "", raw_text.strip(), flags=re.I)
    original_ui = re.sub(r"^(?:(?:гаразд|окей|добре|ну|слухай)[,\s]+)+(?:а\s+)?", "", original_ui, flags=re.I)
    ui = parse_ui(original_ui)
    if ui:
        kind, payload, preview = ui
        return ActionPlan("ui_" + kind, payload, preview, kind != "windows")
    # Match complete spoken YouTube searches BEFORE a generic app-open or
    # compound-command splitter can treat "відкрий ютуб" as the whole request.
    youtube = youtube_search_plan(q)
    if youtube:
        return youtube
    # A Steam launch URI starts Steam automatically before opening Dota 2.
    # Google STT sometimes turns "стім" into "стіні" or drops "і" between
    # "відкрий Steam" and "запусти Dota 2". Only normalize in Steam-specific
    # contexts: never reinterpret an arbitrary unrecognized app as a game.
    steam = r"(?:стім|стим|steam|стіні|стіни|стіне|стин)"
    dota = r"(?:доту(?:\s+2)?|дота(?:\s+2)?|dota\s*2?|доту два|дота два)"
    verb = r"(?:відкрий|відкрити|запусти|запустити|включи|увімкни|open|launch)"
    if (re.fullmatch(fr"{verb} {steam}\s+(?:і|та|а потім|потім)\s+{verb} {dota}", q)
            or re.fullmatch(fr"{verb} {steam}\s+а\s+потім\s+{verb} {dota}", q)
            or re.fullmatch(fr"{verb} {dota}(?: через {steam})?", q)):
        return ActionPlan("steam_game", "Dota 2",
                          "Запустити Dota 2 у вже активному Steam-акаунті або налаштувати перший збережений, якщо Steam закритий", True)
    combo_game = re.fullmatch(
        fr"{verb}\s+{steam}\s+(?:і|та|потім|а потім)\s+"
        r"(?:запусти|запустити|відкрий|увімкни|включи)\s+(?:гру\s+)?(.+)", q)
    if combo_game:
        title = combo_game.group(1).strip()
        if 1 <= len(title) <= 170:
            return ActionPlan("steam_game", title,
                              "Запустити Steam-гру в активному акаунті або першому збереженому, якщо Steam закритий: " + title, True)
    # Spoken two-part Steam requests may have NO conjunction (as in the
    # real Google recognition "відкрий стіні запусти Dota 2"). Treat the
    # combined command as one owner-approved game launch, not as an app title.
    spoken_game = re.fullmatch(
        fr"{verb}\s+{steam}\s+(?:(?:і|та|а потім|потім)\s+)?"
        fr"{verb}\s+(?:гру\s+)?(.+)", q
    )
    if spoken_game:
        title = spoken_game.group(1).strip()
        if re.fullmatch(dota, title):
            title = "Dota 2"
        if 1 <= len(title) <= 170:
            return ActionPlan("steam_game", title,
                              "Запустити встановлену Steam-гру через активний Steam-акаунт або перший збережений: " + title
                              + " (у вже активному акаунті або після налаштування першого)", True)
    # Direct voice variants of the Dota title must not fall through to the
    # Spotify music planner, installed apps or general AI.
    standalone_dota = re.fullmatch(fr"{verb}\s+(?:гру\s+)?({dota})(?:\s+через\s+{steam})?", q)
    if standalone_dota:
        return ActionPlan("steam_game", "Dota 2",
                          "Запустити встановлену гру Dota 2 у Steam", True)
    if q in {"покажи ігри steam", "покажи ігри стім", "список ігор steam",
             "мої ігри steam", "мої ігри стім", "бібліотека steam",
             "бібліотека стім", "покажи встановлені ігри", "покажи бібліотеку steam"}:
        return ActionPlan("steam_list", "", "Показати локально встановлені ігри Steam")
    if q in {"вибери перший акаунт steam", "вибери перший акаунт стім",
             "відкрий steam і вибери перший акаунт",
             "відкрий стім і вибери перший акаунт", "вибери перший акаунт",
             "запусти steam з першим акаунтом", "запусти стім з першим акаунтом"}:
        return ActionPlan("steam_open_first", "",
                          "Запустити Steam з першим ЗБЕРЕЖЕНИМ акаунтом (Steam має бути закритий)", True)
    fast_music = spotify_music_plan(q)
    if fast_music:
        return fast_music
    game_request = re.fullmatch(
        r"(?:запусти|запустити|відкрий|відкрити|увімкни|включи)\s+"
        r"(гру\s+)?(.+?)(?:\s+(?:у|в|через)\s+(steam|стім|стим))?", q)
    if game_request:
        explicit_game = bool(game_request.group(1) or game_request.group(3))
        candidate = game_request.group(2).strip()
        if candidate not in {"steam", "стім", "стим", "spotify", "спотіфай", "спотифай"}:
            if explicit_game:
                return ActionPlan("steam_game", candidate,
                                  "Запустити Steam-гру в активному акаунті або першому збереженому, якщо Steam закритий: " + candidate, True)
            if os.name == "nt":
                try:
                    game = find_installed_game(candidate)
                except SteamError:
                    pass
                else:
                    return ActionPlan("steam_game", game.title,
                                      "Запустити встановлену Steam-гру через активний Steam-акаунт або перший збережений: " + game.title, True)
    # Spotify playback is an explicit, owner-approved action, not a shell command.
    spotify_actions = {
        "пауза spotify": "pause", "пауза спотіфай": "pause",
        "постав музику на паузу": "pause", "зупини музику": "pause",
        "наступна пісня": "next", "наступний трек": "next",
        "наступна пісня spotify": "next", "наступний трек spotify": "next",
        "попередня пісня": "previous", "попередній трек": "previous",
        "продовж музику": "resume", "продовж spotify": "resume",
        "віднови музику": "resume",
    }
    if q in spotify_actions:
        op = spotify_actions[q]
        return ActionPlan("spotify_" + op, "", "Spotify: " + {
            "pause": "пауза", "resume": "продовжити", "next": "наступний трек",
            "previous": "попередній трек"}[op], True)
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
        if name in {"стім", "стим", "steam", "стіні", "стіни", "стіне", "стин"}:
            return ActionPlan("steam_open_first", "",
                              "Вибрати перший збережений акаунт і відкрити Steam", True)
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
    if re.match(r"^(?:надрукуй|напиши текст|введи текст|перемкнись|активуй вікно|перейди до вікна|прокрути|клацни|клікни|натисни)\b", q):
        return ActionPlan("say", "Таку дію не підтримую або вона заборонена. Скажи «допомога» для прикладів.", "Непідтримувана дія")
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
    if action.kind in {"ui_hotkey", "ui_type", "ui_scroll", "ui_click", "ui_focus", "ui_windows"}:
        return perform_ui(action.kind[3:], action.target)
    if action.kind == "steam_list":
        return list_installed_games()
    if action.kind == "steam_open_first":
        return open_steam_first()
    if action.kind == "steam_game":
        return launch_installed_game(action.target)
    if action.kind == "spotify_connect":
        return spotify_connection.connect(action.target)
    if action.kind == "spotify_play":
        # Play music in the user's Windows Spotify application. Never replace
        # this PLAY request with Google/Spotify web search.
        api_reason = None
        if spotify_connection.connected:
            try:
                return spotify_connection.play_track(action.target)
            except SpotifyError as exc:
                # API account may lack Premium or its current device might be
                # a PHONE. Try the visible local Spotify desktop UI instead.
                api_reason = str(exc)
        try:
            return play_in_desktop(action.target)
        except SpotifyDesktopError as exc:
            message = "Не вдалося відтворити пісню у встановленому Spotify: " + str(exc)
            if api_reason:
                message += " Також Spotify API повідомив: " + api_reason
            message += " Пошук у браузері замість відтворення не відкривав."
            raise SpotifyError(message) from exc
    if action.kind in {"spotify_pause", "spotify_resume", "spotify_next", "spotify_previous"}:
        return spotify_connection.player_command(action.kind[len("spotify_"):])
    if action.kind == "spotify_search":
        url = "https://open.spotify.com/search/" + quote(action.target, safe="")
        webbrowser.open(url)
        return "Відкриваю пошук Spotify для «" + action.target + "». Обери композицію в плеєрі."
    if action.kind == "youtube_search":
        term = action.target.strip()
        if not 2 <= len(term) <= 160:
            raise ValueError("Некоректний запит пошуку YouTube.")
        url = "https://www.youtube.com/results?search_query=" + quote_plus(term)
        webbrowser.open(url)
        return ("Відкриваю результати пошуку YouTube за темою «" + term
                + "». Вибери потрібне відео зі списку.")
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
