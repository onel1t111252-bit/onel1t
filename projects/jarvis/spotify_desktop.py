"""Best-effort music playback in the installed Spotify Windows desktop app.

No Spotify API credentials are needed for this local route. We focus ONLY a
visible window owned by the real Spotify.exe process before sending any keys.
Nothing is sent to an unrelated foreground window; browser search is not used.
The app must be installed and signed in. Ctrl+K quick search and Enter to play
the top suggestion are supported by Spotify's official desktop interface, but
its UI and results can vary, so playback is not claimed as verified.
"""
from __future__ import annotations

import asyncio
import ctypes
from ctypes import wintypes
from dataclasses import dataclass
import re
import ntpath
import os
import time


@dataclass(frozen=True)
class SpotifyPlayback:
    title: str
    artist: str
    playing: bool


def _track_matches(request: str, playing: SpotifyPlayback) -> bool:
    """Only confirm when all meaningful user words occur in title + artist."""
    required = re.findall(r"[^\W_]+", request.casefold())
    actual = " ".join(re.findall(
        r"[^\W_]+", (playing.title + " " + playing.artist).casefold()))
    tokens = set(actual.split())
    return bool(required) and all(word in tokens for word in required)


async def _read_spotify_playback_async() -> SpotifyPlayback | None:
    """Read Windows media session, never Spotify tokens/credentials."""
    from winsdk.windows.media.control import (
        GlobalSystemMediaTransportControlsSessionManager as Manager,
        GlobalSystemMediaTransportControlsSessionPlaybackStatus as Status,
    )
    manager = await Manager.request_async()
    sessions = manager.get_sessions() or []
    for session in sessions:
        source = str(session.source_app_user_model_id).casefold()
        if "spotify" not in source:
            continue
        props = await session.try_get_media_properties_async()
        info = session.get_playback_info()
        if props is None or info is None:
            continue
        title = str(props.title or "").strip()
        artist = str(props.artist or "").strip()
        if title:
            return SpotifyPlayback(
                title, artist, info.playback_status == Status.PLAYING)
    return None


def _read_spotify_playback() -> SpotifyPlayback | None:
    """Spotify state via optional WinRT projection; None means unverified."""
    if os.name != "nt":
        return None
    try:
        return asyncio.run(asyncio.wait_for(_read_spotify_playback_async(), timeout=3))
    except (ImportError, OSError, RuntimeError, ValueError, TimeoutError):
        return None
    except Exception:
        # Some Spotify builds do not expose media properties to Windows.
        return None


def _playback_feedback(query: str, playback: SpotifyPlayback | None) -> str:
    if playback is None:
        return ("Spotify отримав команду, але Windows не надав інформації "
                "про поточний трек. Не можу підтвердити відтворення. "
                "Перевір список результатів у вікні Spotify.")
    shown = "«" + playback.title + "» — " + playback.artist
    if not _track_matches(query, playback):
        return ("Spotify зараз показує " + shown + ", але це не відповідає "
                "запиту «" + query + "». JARVIS не підтверджує запуск "
                "неправильної пісні. Вибери потрібний трек у Spotify.")
    if not playback.playing:
        return ("Spotify знайшов " + shown + ", але відтворення НЕ активне. "
                "Натисни Play у Spotify або перевір обмеження акаунта.")
    return "Підтверджено у Windows: Spotify відтворює " + shown + "."


class SpotifyDesktopError(RuntimeError):
    """User-facing reason native Spotify desktop control did not succeed."""


def validate_query(title: str) -> str:
    text = title.strip()
    if (not 2 <= len(text) <= 120 or any(ord(c) < 32 or ord(c) == 127 for c in text)):
        raise SpotifyDesktopError("Назва пісні некоректна. Скажи назву й виконавця.")
    return text


def _spotify_window() -> int | None:
    """Locate the visible Spotify.exe desktop window, never by title alone."""
    if os.name != "nt":
        return None
    user32 = ctypes.windll.user32
    kernel32 = ctypes.windll.kernel32
    CALLBACK = ctypes.WINFUNCTYPE(wintypes.BOOL, wintypes.HWND, wintypes.LPARAM)
    user32.EnumWindows.argtypes = (CALLBACK, wintypes.LPARAM)
    user32.EnumWindows.restype = wintypes.BOOL
    user32.IsWindowVisible.argtypes = (wintypes.HWND,)
    user32.IsWindowVisible.restype = wintypes.BOOL
    user32.GetWindowTextLengthW.argtypes = (wintypes.HWND,)
    user32.GetWindowTextLengthW.restype = ctypes.c_int
    user32.GetWindowThreadProcessId.argtypes = (wintypes.HWND, ctypes.POINTER(wintypes.DWORD))
    user32.GetWindowThreadProcessId.restype = wintypes.DWORD
    kernel32.OpenProcess.argtypes = (wintypes.DWORD, wintypes.BOOL, wintypes.DWORD)
    kernel32.OpenProcess.restype = wintypes.HANDLE
    kernel32.QueryFullProcessImageNameW.argtypes = (
        wintypes.HANDLE, wintypes.DWORD, wintypes.LPWSTR,
        ctypes.POINTER(wintypes.DWORD))
    kernel32.QueryFullProcessImageNameW.restype = wintypes.BOOL
    kernel32.CloseHandle.argtypes = (wintypes.HANDLE,)
    kernel32.CloseHandle.restype = wintypes.BOOL

    found: list[int] = []

    def inspect(hwnd: int, _param: int) -> bool:
        if not user32.IsWindowVisible(hwnd) or user32.GetWindowTextLengthW(hwnd) < 1:
            return True
        pid = wintypes.DWORD()
        user32.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))
        if not pid.value:
            return True
        process = kernel32.OpenProcess(0x1000, False, pid.value)  # QUERY_LIMITED_INFORMATION
        if not process:
            return True
        try:
            buf = ctypes.create_unicode_buffer(32768)
            count = wintypes.DWORD(len(buf))
            if kernel32.QueryFullProcessImageNameW(process, 0, buf, ctypes.byref(count)):
                if ntpath.basename(buf.value).casefold() == "spotify.exe":
                    found.append(int(hwnd))
                    return False
        finally:
            kernel32.CloseHandle(process)
        return True

    fn = CALLBACK(inspect)
    user32.EnumWindows(fn, 0)
    return found[0] if found else None


def _open_and_focus_spotify() -> int:
    if os.name != "nt":
        raise SpotifyDesktopError("Керування настільним Spotify працює лише у Windows.")
    hwnd = _spotify_window()
    if hwnd is None:
        try:
            # The registered spotify: scheme starts the INSTALLED app, not a web
            # search URL. We still verify the resulting process before typing.
            os.startfile("spotify:")
        except OSError as exc:
            raise SpotifyDesktopError(
                "Не знайшов встановлений Spotify. Запусти його через меню «Пуск».") from exc
        deadline = time.monotonic() + 7
        while time.monotonic() < deadline:
            time.sleep(.35)
            hwnd = _spotify_window()
            if hwnd is not None:
                break
    if hwnd is None:
        raise SpotifyDesktopError(
            "Не бачу вікна встановленого Spotify. Відкрий програму, "
            "увійди в акаунт і повтори команду.")
    user32 = ctypes.windll.user32
    user32.ShowWindow.argtypes = (wintypes.HWND, ctypes.c_int)
    user32.SetForegroundWindow.argtypes = (wintypes.HWND,)
    user32.GetForegroundWindow.restype = wintypes.HWND
    user32.ShowWindow(hwnd, 9)  # SW_RESTORE
    user32.SetForegroundWindow(hwnd)
    time.sleep(.2)
    if user32.GetForegroundWindow() != hwnd:
        raise SpotifyDesktopError(
            "Windows не дозволив активувати Spotify. Натисни на вікно Spotify "
            "і повтори команду. В інші вікна текст не вводив.")
    return hwnd


def _still_focused(hwnd: int) -> bool:
    return bool(os.name == "nt" and
                ctypes.windll.user32.GetForegroundWindow() == hwnd and
                _spotify_window() == hwnd)


def _type_unicode(text: str) -> None:
    """Type UTF-16 via SendInput; no clipboard, shell or keyboard-layout guess."""
    if os.name != "nt":
        raise SpotifyDesktopError("Введення назви підтримується лише у Windows.")

    class MOUSEINPUT(ctypes.Structure):
        _fields_ = [("dx", wintypes.LONG), ("dy", wintypes.LONG),
                    ("mouseData", wintypes.DWORD), ("dwFlags", wintypes.DWORD),
                    ("time", wintypes.DWORD), ("dwExtraInfo", wintypes.WPARAM)]

    class KEYBDINPUT(ctypes.Structure):
        _fields_ = [("wVk", wintypes.WORD), ("wScan", wintypes.WORD),
                    ("dwFlags", wintypes.DWORD), ("time", wintypes.DWORD),
                    ("dwExtraInfo", wintypes.WPARAM)]

    class HARDWAREINPUT(ctypes.Structure):
        _fields_ = [("uMsg", wintypes.DWORD), ("wParamL", wintypes.WORD),
                    ("wParamH", wintypes.WORD)]

    class INPUT_UNION(ctypes.Union):
        _fields_ = [("mi", MOUSEINPUT), ("ki", KEYBDINPUT),
                    ("hi", HARDWAREINPUT)]

    class INPUT(ctypes.Structure):
        _fields_ = [("type", wintypes.DWORD), ("data", INPUT_UNION)]

    send_input = ctypes.windll.user32.SendInput
    send_input.argtypes = (wintypes.UINT, ctypes.POINTER(INPUT), ctypes.c_int)
    send_input.restype = wintypes.UINT

    raw = text.encode("utf-16-le")
    for i in range(0, len(raw), 2):
        code = int.from_bytes(raw[i:i + 2], "little")
        if code < 32:
            raise SpotifyDesktopError("Некоректний символ у назві треку.")
        keys = (INPUT(1, INPUT_UNION(ki=KEYBDINPUT(0, code, 0x0004, 0, 0))),
                INPUT(1, INPUT_UNION(ki=KEYBDINPUT(0, code, 0x0004 | 0x0002, 0, 0))))
        events = (INPUT * 2)(*keys)
        if send_input(2, events, ctypes.sizeof(INPUT)) != 2:
            raise SpotifyDesktopError("Windows не приймає введення тексту в Spotify.")


def spotify_desktop_status() -> str:
    """Read-only diagnosis of locally installed Spotify and Windows media."""
    if os.name != "nt":
        return "Діагностика Spotify доступна лише у Windows."
    if _spotify_window() is None:
        return ("Не знайшов відкрите вікно Spotify.exe. "
                "Відкрий встановлений Spotify через меню «Пуск» "
                "і ввійди у власний акаунт.")
    state = _read_spotify_playback()
    if state is None:
        return ("Вікно Spotify.exe знайдено, але Windows не показує "
                "поточну композицію. Відкрий Spotify і вручну ввімкни "
                "будь-яку пісню, щоб перевірити медіасесію. "
                "Повтори команду «статус Spotify».")
    return ("Вікно Spotify.exe знайдено. У медіасистемі Windows: «"
            + state.title + "» — " + state.artist
            + (". ВІДТВОРЮЄТЬСЯ." if state.playing else
               ". Відтворення призупинено."))


def play_in_desktop(title: str) -> str:
    """Focus user's Spotify app and play quick-search top suggestion.

    If Spotify changes its UI, the command may open a suggestion or not play.
    It never claims verified playback and never sends keystrokes to the browser.
    """
    query = validate_query(title)
    hwnd = _open_and_focus_spotify()
    try:
        import pyautogui
    except ImportError as exc:
        raise SpotifyDesktopError(
            "Не встановлено pyautogui. Запусти INSTALL_VOICE.bat.") from exc

    if not _still_focused(hwnd):
        raise SpotifyDesktopError("Spotify втратив фокус. Нічого не вводив.")
    # Official Spotify desktop quick search. This route works without Web API,
    # but user's Spotify session and playback rights still apply.
    pyautogui.hotkey("ctrl", "k")
    time.sleep(.25)
    if not _still_focused(hwnd):
        raise SpotifyDesktopError("Фокус перейшов з Spotify. Введення зупинено.")
    pyautogui.hotkey("ctrl", "a")
    _type_unicode(query)
    # Quick Search suggestions require explicit keyboard selection:
    # Enter alone can merely submit the query or open the search page.
    time.sleep(1.9)
    if not _still_focused(hwnd):
        raise SpotifyDesktopError("Spotify втратив фокус до вибору треку.")
    pyautogui.press("down")
    if not _still_focused(hwnd):
        raise SpotifyDesktopError("Після вибору результату Spotify втратив фокус.")
    pyautogui.press("enter")
    time.sleep(.75)
    # Verify what actually plays instead of asserting success after keypress.
    result = _read_spotify_playback()
    for _ in range(2):
        if result is not None and result.playing and _track_matches(query, result):
            break
        time.sleep(.8)
        updated = _read_spotify_playback()
        if updated is not None:
            result = updated
    feedback = _playback_feedback(query, result)
    if result is None or not result.playing or not _track_matches(query, result):
        raise SpotifyDesktopError(feedback)
    return feedback
