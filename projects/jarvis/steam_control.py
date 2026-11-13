"""Safe Steam library discovery and first-saved-account startup for Windows.

Read-only game discovery uses Steam's installed ACF/VDF manifests.
A one-time user-approved Steam launch can choose the FIRST SAVED account
as listed in loginusers.vdf, only while Steam is fully closed.
Never asks for credentials, touches Steam Guard, or closes a running game.
No game EXEs are launched: Steam receives only steam://run/<verified AppID>.
"""
from __future__ import annotations

import csv
from dataclasses import dataclass
from pathlib import Path
import os
import re
import shutil
import subprocess
import tempfile


class SteamError(RuntimeError):
    pass


@dataclass(frozen=True)
class _Scalar:
    value: str
    start: int
    end: int


@dataclass(frozen=True)
class SteamGame:
    appid: str
    title: str
    library: str


_TOKEN = re.compile(r'"(?:\\.|[^"\\])*"|//[^\r\n]*|[{}]|[^\s{}"]+', re.S)


def _tokens(text: str) -> list[tuple[str, int, int]]:
    result = []
    for match in _TOKEN.finditer(text):
        raw = match.group()
        if raw.startswith("//"):
            continue
        if raw.startswith('"'):
            value = re.sub(r'\\(["\\])', r'\1', raw[1:-1])
        else:
            value = raw
        result.append((value, match.start(), match.end()))
        if len(result) > 100_000:
            raise SteamError("Steam VDF містить надто багато записів.")
    return result


def parse_vdf(text: str) -> dict:
    """Read Source/Valve KeyValues with spans, preserving exact original bytes."""
    parts = _tokens(text)
    index = 0

    def pairs(in_block: bool, depth: int) -> dict:
        nonlocal index
        if depth > 24:
            raise SteamError("Steam VDF має надто глибоку структуру.")
        result = {}
        while index < len(parts):
            key, _, _ = parts[index]
            index += 1
            if key == "}":
                if not in_block:
                    raise SteamError("Некоректний Steam VDF.")
                return result
            if key == "{":
                raise SteamError("Некоректний Steam VDF.")
            if index >= len(parts):
                raise SteamError("Обрізаний Steam VDF.")
            value, start, end = parts[index]
            index += 1
            if value == "{":
                result[key] = pairs(True, depth + 1)
            elif value == "}":
                raise SteamError("Некоректне завершення Steam VDF.")
            else:
                result[key] = _Scalar(value, start, end)
        if in_block:
            raise SteamError("Steam VDF має незакриту секцію.")
        return result

    data = pairs(False, 0)
    if index != len(parts):
        raise SteamError("Steam VDF має зайві дані.")
    return data


def _entry(node: dict, key: str):
    return next((v for k, v in node.items() if k.casefold() == key.casefold()), None)


def _value(node: dict, key: str, fallback: str = "") -> str:
    scalar = _entry(node, key)
    return scalar.value if isinstance(scalar, _Scalar) else fallback


def _read_vdf(path: Path, max_bytes: int = 4_000_000) -> dict:
    try:
        if path.stat().st_size > max_bytes:
            raise SteamError("Файл Steam завеликий для безпечного читання.")
        return parse_vdf(path.read_text(encoding="utf-8-sig"))
    except (OSError, UnicodeError) as exc:
        raise SteamError("Не вдалося прочитати налаштування Steam.") from exc


def first_saved_account(text: str) -> tuple[str, str, str]:
    """Return the FIRST file entry, not an assumption about visual picker order."""
    root = _entry(parse_vdf(text), "users")
    if not isinstance(root, dict) or not root:
        raise SteamError("Steam не має збережених акаунтів. Увійди в Steam вручну.")
    steam_id, details = next(iter(root.items()))
    if not (steam_id.isdecimal() and isinstance(details, dict)):
        raise SteamError("Список акаунтів Steam пошкоджено.")
    name = _value(details, "AccountName").strip()
    if not name or len(name) > 100 or any(c in name for c in "\r\n\x00"):
        raise SteamError("Steam не зберіг коректне ім'я першого акаунта.")
    if _value(details, "RememberPassword") != "1":
        raise SteamError("Перший збережений акаунт потребує ручного входу через Steam.")
    return steam_id, name, _value(details, "PersonaName")[:100]


def update_first_account_preference(text: str) -> tuple[str, str, bool]:
    """Set MostRecent on the first remembered account; retain all other data."""
    steam_id, name, _ = first_saved_account(text)
    users = _entry(parse_vdf(text), "users")
    changes = []
    for sid, account in users.items():
        if not isinstance(account, dict):
            raise SteamError("Некоректний запис акаунта Steam.")
        recent = _entry(account, "MostRecent")
        if not isinstance(recent, _Scalar) or recent.value not in ("0", "1"):
            raise SteamError("Не можу безпечно змінити вибір акаунта Steam.")
        expected = "1" if sid == steam_id else "0"
        if recent.value != expected:
            changes.append((recent.start, recent.end, '"' + expected + '"'))
    changed = bool(changes)
    for start, end, replacement in sorted(changes, reverse=True):
        text = text[:start] + replacement + text[end:]
    return text, name, changed


def steam_root() -> Path:
    if os.name != "nt":
        raise SteamError("Керування Steam підтримується лише у Windows.")
    candidates: list[Path] = []
    try:
        import winreg
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Software\Valve\Steam") as key:
            for name in ("SteamPath", "SteamExe"):
                try:
                    value, _ = winreg.QueryValueEx(key, name)
                    p = Path(str(value))
                    candidates.append(p.parent if p.name.lower() == "steam.exe" else p)
                except OSError:
                    pass
    except OSError:
        pass
    candidates.append(Path(os.environ.get("ProgramFiles(x86)", r"C:\Program Files (x86)")) / "Steam")
    candidates.append(Path(os.environ.get("ProgramFiles", r"C:\Program Files")) / "Steam")
    for path in candidates:
        if path.is_dir() and (path / "steam.exe").is_file():
            return path
    raise SteamError("Steam не знайдено. Спершу встанови Steam та увійди у свій акаунт.")


def steam_running() -> bool:
    """Fail closed on Windows tasklist errors, to avoid editing a live client."""
    if os.name != "nt":
        raise SteamError("Ця функція працює тільки у Windows.")
    try:
        result = subprocess.run(
            ["tasklist.exe", "/FI", "IMAGENAME eq steam.exe", "/FO", "CSV", "/NH"],
            capture_output=True, text=True, encoding="utf-8", errors="replace",
            timeout=8, check=False,
            creationflags=getattr(subprocess, "CREATE_NO_WINDOW", 0))
    except (OSError, subprocess.TimeoutExpired) as exc:
        raise SteamError("Не можу підтвердити, що Steam закритий.") from exc
    if result.returncode:
        raise SteamError("Не можу перевірити запущені процеси Steam.")
    return any(row and row[0].strip().casefold() == "steam.exe"
               for row in csv.reader(result.stdout.splitlines()))


def _set_login_registry(account: str) -> None:
    import winreg
    with winreg.CreateKey(winreg.HKEY_CURRENT_USER, r"Software\Valve\Steam") as key:
        winreg.SetValueEx(key, "AutoLoginUser", 0, winreg.REG_SZ, account)


def _get_login_registry() -> str | None:
    import winreg
    try:
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Software\Valve\Steam") as key:
            return str(winreg.QueryValueEx(key, "AutoLoginUser")[0])
    except FileNotFoundError:
        return None


def _restore_login_registry(previous: str | None) -> None:
    import winreg
    with winreg.CreateKey(winreg.HKEY_CURRENT_USER, r"Software\Valve\Steam") as key:
        if previous is None:
            try:
                winreg.DeleteValue(key, "AutoLoginUser")
            except FileNotFoundError:
                pass
        else:
            winreg.SetValueEx(key, "AutoLoginUser", 0, winreg.REG_SZ, previous)


def active_steam_user() -> int | None:
    """Read Steam's current account ID; never guess the active account from order."""
    if os.name != "nt":
        return None
    try:
        import winreg
        with winreg.OpenKey(winreg.HKEY_CURRENT_USER,
                            r"Software\Valve\Steam\ActiveProcess") as key:
            account_id = int(winreg.QueryValueEx(key, "ActiveUser")[0])
            return account_id if account_id > 0 else None
    except (OSError, ValueError, TypeError):
        return None


def choose_first_account(steam_dir: Path | None = None) -> str:
    """User-approved step. Do not stop Steam, games, or alter credentials."""
    if os.name != "nt":
        raise SteamError("Вибір акаунта Steam працює лише у Windows.")
    directory = steam_dir or steam_root()
    if steam_running():
        config_path = directory / "config" / "loginusers.vdf"
        try:
            first_id, _, _ = first_saved_account(
                config_path.read_text(encoding="utf-8-sig"))
        except (OSError, UnicodeError) as exc:
            raise SteamError("Steam працює, але список збережених акаунтів недоступний.") from exc
        current_id = active_steam_user()
        if current_id is not None and current_id == int(first_id) & 0xFFFFFFFF:
            return "Перший збережений акаунт Steam уже активний."
        raise SteamError("Steam уже працює під іншим акаунтом або стан входу невідомий. "
                         "Заверши ігри й закрий Steam вручну, щоб вибрати перший акаунт.")
    config = directory / "config" / "loginusers.vdf"
    try:
        if config.stat().st_size > 2_000_000:
            raise SteamError("Список акаунтів Steam завеликий.")
        original = config.read_text(encoding="utf-8-sig")
    except (OSError, UnicodeError) as exc:
        raise SteamError("Немає доступного списку збережених акаунтів Steam.") from exc
    updated, account, changed = update_first_account_preference(original)
    old_login = _get_login_registry()
    if not changed and old_login == account:
        return "Налаштовано перший збережений акаунт Steam."
    # Preserve a local original before modifying any Steam preference.
    backup = config.with_name("loginusers.vdf.jarvis-backup")
    if changed:
        try:
            if not backup.exists():
                shutil.copy2(config, backup)
        except OSError as exc:
            raise SteamError("Не вдалося зробити резервну копію налаштувань Steam.") from exc
    temp_path = None
    swapped = False
    registry_changed = False
    try:
        if changed:
            with tempfile.NamedTemporaryFile("w", encoding="utf-8", newline="", dir=config.parent,
                                             prefix="jarvis-steam-", suffix=".tmp",
                                             delete=False) as output:
                temp_path = Path(output.name)
                output.write(updated)
            os.chmod(temp_path, config.stat().st_mode)
            if steam_running():
                raise SteamError("Steam запустився під час підготовки. Зміни скасовано.")
            os.replace(temp_path, config)
            swapped = True
            temp_path = None
        registry_changed = True  # Also restore if Windows writes then reports an error.
        _set_login_registry(account)
    except Exception as exc:
        if swapped:
            try:
                with tempfile.NamedTemporaryFile("w", encoding="utf-8", newline="",
                                                 dir=config.parent, prefix="jarvis-restore-",
                                                 delete=False) as restore:
                    restore_path = Path(restore.name)
                    restore.write(original)
                os.replace(restore_path, config)
            except OSError:
                pass
        if registry_changed:
            try:
                _restore_login_registry(old_login)
            except OSError:
                pass
        if isinstance(exc, SteamError):
            raise
        raise SteamError("Не вдалося налаштувати перший акаунт Steam. Перевір Steam вручну.") from exc
    finally:
        if temp_path is not None:
            temp_path.unlink(missing_ok=True)
    return "Налаштовано автоматичний вхід у перший збережений акаунт Steam."


def open_steam_first() -> str:
    if os.name != "nt":
        raise SteamError("Steam доступний лише у Windows.")
    try:
        chosen = choose_first_account()
    except SteamError as exc:
        # Steam is still launchable when there are no remembered accounts.
        # Do not hide errors about Steam already running under a different user.
        if not any(part in str(exc) for part in (
                "не має збережених акаунтів", "Немає доступного списку",
                "потребує ручного входу")):
            raise
        os.startfile("steam://open/main")
        return "Steam відкривається, але перший акаунт не можна вибрати автоматично. " \
               "Увійди вручну й увімкни запам'ятовування входу."
    os.startfile("steam://open/main")
    return "Є, сер. " + chosen + " Надсилаю команду відкриття Steam. " \
           "Якщо Steam просить пароль або Steam Guard, увійди особисто."


def _steam_libraries(directory: Path) -> list[Path]:
    root = directory / "steamapps"
    libraries = [root]
    config = root / "libraryfolders.vdf"
    if config.is_file():
        try:
            folders = _entry(_read_vdf(config), "libraryfolders")
            if isinstance(folders, dict):
                for key, item in folders.items():
                    if not key.isdecimal():
                        continue
                    path = _value(item, "path") if isinstance(item, dict) else (
                        item.value if isinstance(item, _Scalar) else "")
                    if path:
                        other = Path(path) / "steamapps"
                        if other.is_dir() and other not in libraries:
                            libraries.append(other)
        except SteamError:
            pass
    return libraries[:32]


def installed_games(steam_dir: Path | None = None) -> list[SteamGame]:
    directory = steam_dir or steam_root()
    found = {}
    for library in _steam_libraries(directory):
        try:
            manifests = list(library.glob("appmanifest_*.acf"))[:2000]
        except OSError:
            continue
        for manifest in manifests:
            try:
                appstate = _entry(_read_vdf(manifest, 512_000), "AppState")
                if not isinstance(appstate, dict):
                    continue
                appid = _value(appstate, "appid")
                title = _value(appstate, "name").strip()
                folder = _value(appstate, "installdir")
                flags = int(_value(appstate, "StateFlags", "0"))
                if (not appid.isdecimal() or len(appid) > 12 or not title
                        or len(title) > 170 or not folder or not flags & 4):
                    continue
                if not (library / "common" / folder).is_dir():
                    continue
                found[appid] = SteamGame(appid, title, str(library))
            except (SteamError, ValueError, OSError):
                continue
    return sorted(found.values(), key=lambda x: x.title.casefold())


def find_installed_game(title: str, games: list[SteamGame] | None = None) -> SteamGame:
    if not title or len(title) > 170:
        raise SteamError("Назву гри не розпізнано.")
    options = games if games is not None else installed_games()
    def normalized(s: str) -> str:
        return " ".join(re.findall(r"[^\W_]+", s.casefold(), flags=re.UNICODE))
    query = normalized(title)
    if not query:
        raise SteamError("Назву гри не розпізнано.")
    exact = [g for g in options if normalized(g.title) == query]
    if len(exact) == 1:
        return exact[0]
    nearby = [g for g in options if len(query) >= 3 and query in normalized(g.title)]
    if len(nearby) == 1:
        return nearby[0]
    if len(exact) > 1 or len(nearby) > 1:
        raise SteamError("Знайдено декілька схожих ігор. Назви гру точніше.")
    raise SteamError("Не знайшов установленої гри «" + title[:80] + "» "
                     "в локальних бібліотеках Steam. Скажи «покажи ігри Steam».")


def list_installed_games() -> str:
    games = installed_games()
    if not games:
        return "Встановлених ігор Steam не знайдено. Відкрий бібліотеку Steam вручну."
    titles = "\n".join("• " + game.title for game in games[:50])
    extra = f"\n...та ще {len(games) - 50} ігор" if len(games) > 50 else ""
    return f"Знайдено {len(games)} установлених ігор Steam:\n{titles}{extra}"


def launch_installed_game(title: str) -> str:
    if os.name != "nt":
        raise SteamError("Запуск Steam доступний лише у Windows.")
    game = find_installed_game(title)
    chosen = choose_first_account()
    os.startfile("steam://run/" + game.appid)
    return (chosen + " Команду запуску «" + game.title + "» надіслано у Steam. "
            "Якщо Steam покаже вхід або Steam Guard, заверши авторизацію особисто. "
            "Надсилання команди не гарантує, що гра вже запущена.")
