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
        return ("Надіслав запит «" + query + "» у встановлений Spotify "
                "і вибір результату через клавіатуру. Windows не надає "
                "інформації про відтворення в цьому Spotify, тому результат "
                "НЕ ПІДТВЕРДЖЕНО, але це не означає, що дія не виконана. "
                "Перевір, що показує програма Spotify.")
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
        return ("Spotify.exe відкритий. Windows не надає назву композиції "
                "цього плеєра — це НЕ доводить, що музика не грає. "
                "Перевір плеєр у самому Spotify; для діагностики "
                "відтвори композицію вручну та повтори «статус Spotify».")
    return ("Вікно Spotify.exe знайдено. У медіасистемі Windows: «"
            + state.title + "» — " + state.artist
            + (". ВІДТВОРЮЄТЬСЯ." if state.playing else
               ". Відтворення призупинено."))


async def _try_media_session_play_async() -> bool:
    """Prefer idempotent WinRT PLAY, not a toggle that could pause a song."""
    from winsdk.windows.media.control import (
        GlobalSystemMediaTransportControlsSessionManager as Manager,
    )
    manager = await Manager.request_async()
    for session in manager.get_sessions() or []:
        source = str(session.source_app_user_model_id).casefold()
        if "spotify" in source:
            return bool(await session.try_play_async())
    return False


def _try_media_session_play() -> bool:
    if os.name != "nt":
        return False
    try:
        return asyncio.run(asyncio.wait_for(_try_media_session_play_async(), timeout=3))
    except Exception:
        # Missing WinRT media session is common and not itself a playback error.
        return False


def _send_spotify_play_command(hwnd: int) -> bool:
    """Request MEDIA_PLAY from the verified Spotify app, never Play/Pause.

    WM_APPCOMMAND with APPCOMMAND_MEDIA_PLAY (46) is an idempotent playback
    request. Windows/Spotify may ignore it; false is only dispatch failure.
    """
    if os.name != "nt":
        return False
    user32 = ctypes.windll.user32
    result = ctypes.c_size_t()
    fn = user32.SendMessageTimeoutW
    fn.restype = wintypes.LPARAM
    fn.argtypes = (
        wintypes.HWND, wintypes.UINT, wintypes.WPARAM, wintypes.LPARAM,
        wintypes.UINT, wintypes.UINT, ctypes.POINTER(ctypes.c_size_t),
    )
    # WM_APPCOMMAND=0x0319, APPCOMMAND_MEDIA_PLAY=46, SMTO_ABORTIFHUNG=2.
    return bool(fn(hwnd, 0x0319, hwnd, 46 << 16, 0x0002, 900, ctypes.byref(result)))


def play_current_in_desktop() -> str:
    """Play/resume the current Spotify track; never search 'поточний трек'."""
    hwnd = _open_and_focus_spotify()
    state = _read_spotify_playback()
    if state is not None and state.playing:
        return ("Spotify вже відтворює «" + state.title + "» — "
                + state.artist + ". Нічого не перемикав.")
    sent = _try_media_session_play()
    if not sent and _still_focused(hwnd):
        sent = _send_spotify_play_command(hwnd)
    if not sent:
        raise SpotifyDesktopError(
            "Не вдалося надіслати Spotify команду Play. "
            "Натисни Play у відкритому Spotify. Пошук нової пісні не запускав.")
    updated = _read_spotify_playback()
    if updated is None:
        return ("Надіслав команду Play у встановлений Spotify без пошуку "
                "нової пісні. Windows не надає даних про поточний трек, "
                "тому перевірити запуск не можу.")
    if updated.playing:
        return ("Spotify відтворює «" + updated.title + "» — "
                + updated.artist + ".")
    return ("Надіслав Play у Spotify, але Windows поки показує паузу. "
            "Можливо, потрібен вибір треку вручну в Spotify.")


def _ui_player_state(hwnd: int, request: str, *, try_play: bool = False) -> str:
    """Inspect Spotify's *own* bottom media button via Windows UI Automation.

    Returns 'playing', 'played', 'paused', or 'unknown'. Never click by hard
    coded screen coordinates, on the search results or an unrelated window.
    UI Automation is best-effort; the installed Spotify UI can change.
    """
    if os.name != "nt" or not _still_focused(hwnd):
        return "unknown"
    try:
        from pywinauto import Desktop
        window = Desktop(backend="uia").window(handle=hwnd)
        frame = window.rectangle()
        height = frame.bottom - frame.top
        width = frame.right - frame.left
        if height < 300 or width < 400:
            return "unknown"
        buttons = []
        for control in window.descendants(control_type="Button"):
            title = (control.window_text() or control.element_info.name or "").strip().casefold()
            if title not in {"play", "pause", "відтворити", "пауза",
                             "призупинити", "play current track",
                             "pause current track", "відтворити трек",
                             "призупинити трек"}:
                continue
            rect = control.rectangle()
            center_x = (rect.left + rect.right) / 2
            center_y = (rect.top + rect.bottom) / 2
            # The global player transport button lives at the bottom center,
            # not in search results, track cards or a sidebar.
            if (frame.top + .78 * height < center_y < frame.bottom
                    and frame.left + .32 * width < center_x <
                    frame.left + .82 * width):
                buttons.append((center_y, control, title))
        if not buttons:
            return "unknown"
        _, control, label = max(buttons, key=lambda item: item[0])
        playing = label.startswith("pause") or label in {"пауза", "призупинити", "призупинити трек"}
        if not playing and not try_play:
            return "paused"

        # Require the visible current track to resemble the user's request.
        # This prevents resuming an unrelated old song if search navigation
        # did not select the requested track.
        current_titles = []
        for element in window.descendants(control_type="Text"):
            rect = element.rectangle()
            x = (rect.left + rect.right) / 2
            y = (rect.top + rect.bottom) / 2
            if (y > frame.top + .79 * height
                    and x < frame.left + .68 * width):
                title = (element.window_text() or element.element_info.name or "").strip()
                if title and len(title) <= 160:
                    current_titles.append(title)
        requested = re.findall(r"[^\W_]+", request.casefold())
        visible = re.findall(r"[^\W_]+", " ".join(current_titles).casefold())
        if not requested or not visible:
            return "unknown" if playing else "paused"
        # Tolerate "Jan" vs "Jane!" transcription, but do not relax artist
        # names or long/full titles. Ambiguous requests remain best-effort.
        def word_match(word: str) -> bool:
            return any(word == token or
                       (len(word) >= 3 and len(token) <= len(word) + 2
                        and token.startswith(word))
                       for token in visible)
        if not all(word_match(word) for word in requested):
            return "unknown" if playing else "paused"
        if playing:
            return "playing"
        if not _still_focused(hwnd):
            return "unknown"
        try:
            control.invoke()
        except (AttributeError, RuntimeError):
            control.click_input()
        time.sleep(.30)
        return "played"
    except Exception:
        # Spotify may not expose accessible player controls in all releases.
        # Never turn a UIA failure into a claim of successful playback.
        return "unknown"


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
    # Spotify Quick Search supports Shift+Enter to PLAY just the selected
    # suggestion. Regular Enter can navigate to an album, leaving playback
    # paused (as seen in the user's actual screenshot).
    pyautogui.hotkey("shift", "enter")
    time.sleep(.85)
    if not _still_focused(hwnd):
        raise SpotifyDesktopError("Spotify втратив фокус після вибору треку.")
    # Verify first via Windows media. Some Spotify builds expose no session.
    result = _read_spotify_playback()
    if result is None:
        # When Windows has no media session, inspect the Spotify app's bottom
        # Play/Pause button. Only press Play if the visible current track
        # resembles the request: never resume an unrelated previous song.
        ui_state = _ui_player_state(hwnd, query, try_play=True)
        if ui_state == "played":
            return ("У встановленому Spotify знайшов відповідний трек "
                    "та натиснув Play. Windows не передає даних про звук, "
                    "тому перевір відтворення в Spotify.")
        if ui_state == "playing":
            return ("Установлений Spotify показує стан відтворення "
                    "після пошуку «" + query + "». "
                    "Windows не надає даних для незалежної перевірки.")
        return (_playback_feedback(query, None) + " "
                "Якщо Spotify показує кнопку ▶, пошук знайшов трек, "
                "але відтворення не підтверджене.")
    for _ in range(2):
        if result.playing and _track_matches(query, result):
            break
        time.sleep(.8)
        updated = _read_spotify_playback()
        if updated is not None:
            result = updated
    feedback = _playback_feedback(query, result)
    if not result.playing or not _track_matches(query, result):
        raise SpotifyDesktopError(feedback)
    return feedback
