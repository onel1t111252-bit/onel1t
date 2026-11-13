"""Owner-authorized Spotify voice commands via the official Spotify Web API.

No password, client secret, browser-cookie scraping, or hidden session control.
PKCE tokens live in process memory only and are discarded when JARVIS closes.
Spotify API access requires a personal developer Client ID and (for playback)
Spotify Premium. This file does not store user listening history.
"""
from __future__ import annotations

import base64
import hashlib
from http.server import BaseHTTPRequestHandler, HTTPServer
import hmac
import json
import re
import secrets
import threading
import time
from urllib import request, parse, error
import webbrowser

AUTH_BASE = "https://accounts.spotify.com"
API_BASE = "https://api.spotify.com/v1"
REDIRECT = "http://127.0.0.1:8765/callback"
SCOPES = "user-modify-playback-state user-read-playback-state"
CLIENT_ID_PATTERN = re.compile(r"^[0-9a-fA-F]{32}$")
TRACK_URI_PATTERN = re.compile(r"^spotify:track:[A-Za-z0-9]{22}$")


class SpotifyError(RuntimeError):
    """A user-readable Spotify error without leaking authorization codes or tokens."""


def valid_client_id(value: str) -> bool:
    return bool(CLIENT_ID_PATTERN.fullmatch(value.strip()))


def pkce_pair() -> tuple[str, str]:
    verifier = secrets.token_urlsafe(64)
    challenge = base64.urlsafe_b64encode(
        hashlib.sha256(verifier.encode("ascii")).digest()).decode("ascii").rstrip("=")
    return verifier, challenge


def find_track(data: dict) -> tuple[str, str]:
    """Pick top Spotify result only, never manufacture track URIs."""
    try:
        tracks = data["tracks"]["items"]
        if not isinstance(tracks, list):
            raise ValueError("bad list")
        for item in tracks:
            uri = item.get("uri", "")
            if not TRACK_URI_PATTERN.fullmatch(uri):
                continue
            name = str(item.get("name") or "").strip()[:120]
            artists = ", ".join(str(a.get("name", "")) for a in item.get("artists", [])[:3])[:160]
            if name and artists:
                return uri, f"{name} — {artists}"
    except (TypeError, ValueError, KeyError, AttributeError) as exc:
        raise SpotifyError("Spotify повернув некоректну відповідь пошуку.") from exc
    raise SpotifyError("У Spotify не вдалося знайти таку композицію.")


class SpotifyConnection:
    def __init__(self):
        self._lock = threading.RLock()
        self._client_id = ""
        self._access_token = ""
        self._refresh_token = ""
        self._expires_at = 0.0

    @property
    def connected(self) -> bool:
        with self._lock:
            return bool(self._access_token or self._refresh_token)

    def disconnect(self):
        with self._lock:
            self._client_id = ""
            self._access_token = ""
            self._refresh_token = ""
            self._expires_at = 0.0

    @staticmethod
    def _token_post(payload: dict[str, str]) -> dict:
        data = parse.urlencode(payload).encode("utf-8")
        req = request.Request(AUTH_BASE + "/api/token", data=data,
                              headers={"Content-Type": "application/x-www-form-urlencoded"},
                              method="POST")
        try:
            with request.urlopen(req, timeout=20) as response:
                return json.loads(response.read(16384).decode("utf-8"))
        except error.HTTPError as exc:
            raise SpotifyError("Spotify відмовив у підключенні. Перевір Client ID та redirect URI.") from exc
        except (OSError, ValueError) as exc:
            raise SpotifyError("Не вдалося з'єднатися зі Spotify.") from exc

    def _set_tokens(self, result: dict):
        if not isinstance(result, dict) or not isinstance(result.get("access_token"), str):
            raise SpotifyError("Spotify не повернув токен доступу.")
        with self._lock:
            self._access_token = result["access_token"]
            self._refresh_token = result.get("refresh_token") or self._refresh_token
            self._expires_at = time.monotonic() + max(10, int(result.get("expires_in", 3600))) - 20

    def connect(self, client_id: str, *, timeout: int = 100) -> str:
        client_id = client_id.strip()
        if not valid_client_id(client_id):
            raise SpotifyError("Введи коректний Spotify Client ID (32 символи).")
        verifier, challenge = pkce_pair()
        state = secrets.token_urlsafe(30)
        result: dict[str, str] = {}

        class Callback(BaseHTTPRequestHandler):
            def log_message(self, _format, *_args):
                return  # OAuth codes never enter console / log files.

            def do_GET(self):
                parsed = parse.urlsplit(self.path)
                if parsed.path != "/callback":
                    self.send_error(404)
                    return
                query = parse.parse_qs(parsed.query)
                received = (query.get("state") or [""])[0]
                if not hmac.compare_digest(received, state):
                    self.send_error(403, "Invalid state")
                    return
                if "error" in query:
                    result["error"] = "Користувач не надав доступ до Spotify."
                else:
                    code = (query.get("code") or [""])[0]
                    if not code or len(code) > 4096:
                        result["error"] = "Spotify не повернув код авторизації."
                    else:
                        result["code"] = code
                body = ("<html lang='uk'><meta charset='utf-8'><title>JARVIS Spotify</title>"
                        "<body><h1>Spotify: завершено</h1>Можна повернутися до JARVIS.</body></html>").encode()
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Security-Policy", "default-src 'none'; style-src 'none'")
                self.send_header("Content-Length", str(len(body)))
                self.end_headers()
                self.wfile.write(body)

        try:
            server = HTTPServer(("127.0.0.1", 8765), Callback)
        except OSError as exc:
            raise SpotifyError("Порт 8765 зайнятий. Закрий іншу програму, що його використовує.") from exc
        try:
            params = parse.urlencode({
                "response_type": "code",
                "client_id": client_id,
                "redirect_uri": REDIRECT,
                "scope": SCOPES,
                "state": state,
                "code_challenge_method": "S256",
                "code_challenge": challenge,
            })
            if not webbrowser.open(AUTH_BASE + "/authorize?" + params):
                raise SpotifyError("Не вдалося відкрити браузер для Spotify.")
            server.timeout = 1
            deadline = time.monotonic() + timeout
            while not result and time.monotonic() < deadline:
                server.handle_request()
            if not result:
                raise SpotifyError("Час підключення Spotify вичерпано. Спробуй знову.")
        finally:
            server.server_close()
        if "error" in result:
            raise SpotifyError(result["error"])
        tokens = self._token_post({
            "grant_type": "authorization_code",
            "code": result["code"],
            "redirect_uri": REDIRECT,
            "client_id": client_id,
            "code_verifier": verifier,
        })
        self._client_id = client_id
        self._set_tokens(tokens)
        return "Spotify підключено з твого дозволу. Тепер можна шукати композиції та керувати активним плеєром."

    def _fresh_access_token(self) -> str:
        with self._lock:
            if self._access_token and self._expires_at > time.monotonic() + 10:
                return self._access_token
            if not (self._client_id and self._refresh_token):
                raise SpotifyError("Spotify не підключений. Натисни CONNECT SPOTIFY.")
            tokens = self._token_post({
                "grant_type": "refresh_token",
                "refresh_token": self._refresh_token,
                "client_id": self._client_id,
            })
            self._set_tokens(tokens)
            return self._access_token

    def _api(self, method: str, path: str, payload: dict | None = None, *, timeout: float = 6.0) -> dict:
        if not path.startswith("/") or "://" in path:
            raise ValueError("Spotify endpoint must be local API path")
        raw = None if payload is None else json.dumps(payload, ensure_ascii=False).encode("utf-8")
        headers = {"Authorization": "Bearer " + self._fresh_access_token()}
        if raw is not None:
            headers["Content-Type"] = "application/json"
        req = request.Request(API_BASE + path, data=raw, method=method, headers=headers)
        try:
            with request.urlopen(req, timeout=timeout) as response:
                body = response.read(512 * 1024)
                return json.loads(body.decode("utf-8")) if body else {}
        except error.HTTPError as exc:
            if exc.code == 401:
                raise SpotifyError("Доступ Spotify завершився. Підключи Spotify повторно.") from exc
            if exc.code == 403:
                raise SpotifyError("Spotify не дозволив дію. Перевір Premium, дозволи застосунку та доступні пристрої.") from exc
            if exc.code == 404:
                raise SpotifyError("Spotify не бачить активного плеєра. Відкрий Spotify і почни відтворення вручну.") from exc
            if exc.code == 429:
                delay = str(exc.headers.get("Retry-After", "декілька"))
                raise SpotifyError(f"Spotify обмежив запити. Повтори приблизно через {delay} секунд.") from exc
            raise SpotifyError("Spotify повернув помилку HTTP " + str(exc.code) + ".") from exc
        except (OSError, ValueError) as exc:
            raise SpotifyError("Помилка зв'язку або відповіді Spotify.") from exc

    def _active_device(self) -> str:
        devices = self._api("GET", "/me/player/devices").get("devices", [])
        if not isinstance(devices, list):
            raise SpotifyError("Spotify не повернув список пристроїв.")
        for item in devices:
            if (isinstance(item, dict) and item.get("is_active") and
                    not item.get("is_restricted") and isinstance(item.get("id"), str) and item["id"]):
                return item["id"]
        raise SpotifyError("Немає активного плеєра Spotify. Відкрий Spotify, увімкни щось вручну та повтори.")

    def _active_desktop_device(self) -> str:
        """Avoid playing a requested PC song on the user's phone or speaker.

        Only a currently active, unrestricted Spotify Connect COMPUTER is
        eligible. An inactive desktop can instead be driven locally by the
        foreground-verified Spotify GUI fallback in desktop_actions.
        """
        devices = self._api("GET", "/me/player/devices").get("devices", [])
        if not isinstance(devices, list):
            raise SpotifyError("Spotify не повернув список пристроїв.")
        computers = [
            d for d in devices
            if isinstance(d, dict)
            and d.get("is_active") and not d.get("is_restricted")
            and str(d.get("type", "")).casefold() == "computer"
            and isinstance(d.get("id"), str) and d["id"]
        ]
        if len(computers) == 1:
            return computers[0]["id"]
        raise SpotifyError(
            "Немає однозначного активного комп'ютера Spotify. "
            "Відкрий встановлений Spotify, щоб JARVIS міг запустити "
            "пісню локально без перемикання на чужий пристрій.")

    def play_track(self, title: str) -> str:
        query = title.strip()
        if not (1 <= len(query) <= 120):
            raise SpotifyError("Назва композиції має містити від 1 до 120 символів.")
        params = parse.urlencode({"q": query, "type": "track", "limit": 5})
        # Most searches return immediately; network calls are bounded to avoid
        # waiting a minute when Spotify is offline or throttled.
        found = self._api("GET", "/search?" + params)
        track_uri, display = find_track(found)
        device_id = self._active_desktop_device()
        self._api("PUT", "/me/player/play?device_id=" + parse.quote(device_id, safe=""),
                  {"uris": [track_uri]})
        return "Spotify отримав команду відтворення: " + display + ". Перевір плеєр."

    def player_command(self, action: str) -> str:
        operations = {
            "pause": ("PUT", "/me/player/pause", "Spotify отримав команду паузи."),
            "resume": ("PUT", "/me/player/play", "Spotify отримав команду продовження."),
            "next": ("POST", "/me/player/next", "Spotify отримав команду наступного треку."),
            "previous": ("POST", "/me/player/previous", "Spotify отримав команду попереднього треку."),
        }
        if action not in operations:
            raise ValueError("Unsupported Spotify command")
        device = self._active_device()
        method, path, message = operations[action]
        self._api(method, path + "?device_id=" + parse.quote(device, safe=""))
        return message


spotify_connection = SpotifyConnection()
